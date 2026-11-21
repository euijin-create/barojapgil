import "server-only";

import { XMLParser } from "fast-xml-parser";
import { SeoulIncidentError } from "./seoul-incident-error";

export interface SeoulIncidentRow {
  id: string;
  occurredDate: string | null;
  occurredTime: string | null;
  expectedClearDate: string | null;
  expectedClearTime: string | null;
  typeCode: string | null;
  detailTypeCode: string | null;
  linkId: string | null;
  grs80TmX: number;
  grs80TmY: number;
  description: string;
}

export interface ParsedSeoulIncidentResponse {
  rows: SeoulIncidentRow[];
  totalCount: number;
  isEmpty: boolean;
}

type XmlRecord = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: true,
  transformTagName: (tagName) => tagName.toUpperCase(),
});

function asRecord(value: unknown): XmlRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as XmlRecord)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asFiniteNumber(value: unknown): number {
  const normalized = asString(value);
  if (normalized === null) return Number.NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function normalizeDescription(value: unknown) {
  const description = asString(value);
  if (!description) return "세부 내용이 제공되지 않았습니다.";

  return description
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function findResult(value: unknown): XmlRecord | null {
  const record = asRecord(value);
  if (!record) return null;

  const direct = asRecord(record.RESULT);
  if (direct) return direct;

  for (const child of Object.values(record)) {
    const found = findResult(child);
    if (found) return found;
  }

  return null;
}

function normalizeRows(value: unknown): XmlRecord[] {
  if (Array.isArray(value)) {
    return value.map(asRecord).filter((row): row is XmlRecord => row !== null);
  }

  const row = asRecord(value);
  return row ? [row] : [];
}

function parseRow(row: XmlRecord): SeoulIncidentRow | null {
  const id = asString(row.ACC_ID);
  if (!id) return null;

  return {
    id,
    occurredDate: asString(row.OCCR_DATE),
    occurredTime: asString(row.OCCR_TIME),
    expectedClearDate: asString(row.EXP_CLR_DATE),
    expectedClearTime: asString(row.EXP_CLR_TIME),
    typeCode: asString(row.ACC_TYPE),
    detailTypeCode: asString(row.ACC_DTYPE),
    linkId: asString(row.LINK_ID),
    grs80TmX: asFiniteNumber(row.GRS80TM_X),
    grs80TmY: asFiniteNumber(row.GRS80TM_Y),
    description: normalizeDescription(row.ACC_INFO),
  };
}

export function parseSeoulIncidentXml(
  xml: string,
): ParsedSeoulIncidentResponse {
  let document: unknown;
  try {
    document = parser.parse(xml);
  } catch (cause) {
    throw new SeoulIncidentError(
      "INVALID_UPSTREAM_RESPONSE",
      "서울 돌발정보 XML을 해석할 수 없습니다.",
      { cause },
    );
  }

  const documentRecord = asRecord(document);
  const root = asRecord(documentRecord?.ACCINFO) ?? documentRecord;
  const result = findResult(root);
  const resultCode = asString(result?.CODE);

  if (!resultCode) {
    throw new SeoulIncidentError(
      "INVALID_UPSTREAM_RESPONSE",
      "서울 돌발정보 응답 코드가 없습니다.",
    );
  }

  if (resultCode === "INFO-200") {
    return { rows: [], totalCount: 0, isEmpty: true };
  }

  if (resultCode === "INFO-100") {
    throw new SeoulIncidentError(
      "UPSTREAM_AUTHENTICATION_FAILED",
      "서울 Open API 인증에 실패했습니다.",
      { upstreamCode: resultCode },
    );
  }

  if (resultCode !== "INFO-000") {
    throw new SeoulIncidentError(
      resultCode.startsWith("ERROR-5") || resultCode.startsWith("ERROR-6")
        ? "UPSTREAM_UNAVAILABLE"
        : "INVALID_UPSTREAM_RESPONSE",
      "서울 Open API가 오류를 반환했습니다.",
      { upstreamCode: resultCode },
    );
  }

  if (!root) {
    throw new SeoulIncidentError(
      "INVALID_UPSTREAM_RESPONSE",
      "서울 돌발정보 응답 본문이 없습니다.",
    );
  }

  const rows = normalizeRows(root.ROW)
    .map(parseRow)
    .filter((row): row is SeoulIncidentRow => row !== null);
  const parsedTotalCount = asFiniteNumber(root.LIST_TOTAL_COUNT);
  const totalCount = Number.isFinite(parsedTotalCount)
    ? Math.max(0, Math.trunc(parsedTotalCount))
    : rows.length;

  return { rows, totalCount, isEmpty: rows.length === 0 };
}
