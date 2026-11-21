import "server-only";

import type {
  TrafficIncident,
  TrafficIncidentKind,
  TrafficIncidentsResponse,
} from "@/contracts/traffic-incidents";
import { transformSeoulGrs80TmToWgs84 } from "./coordinate-transform";
import { SeoulIncidentError } from "./seoul-incident-error";
import {
  parseSeoulIncidentXml,
  type SeoulIncidentRow,
} from "./seoul-incident-parser";

const SEOUL_OPEN_API_BASE_URL = "http://openapi.seoul.go.kr:8088";
const ACC_INFO_START_INDEX = 1;
const ACC_INFO_END_INDEX = 300;
const CACHE_TTL_SECONDS = 180;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_XML_BYTES = 2 * 1024 * 1024;

interface CategoryDefinition {
  label: string;
  kind: TrafficIncidentKind;
}

// 공식 돌발 유형 코드에서 확인된 대표 코드만 이름을 부여한다.
// 알 수 없는 코드는 추측하지 않고 기타 돌발상황으로 정규화한다.
const CATEGORY_BY_CODE: Readonly<Record<string, CategoryDefinition>> = {
  A01: { label: "교통사고", kind: "ACCIDENT" },
  A02: { label: "차량고장", kind: "ACCIDENT" },
  A03: { label: "보행사고", kind: "ACCIDENT" },
  A04: { label: "도로공사", kind: "CONSTRUCTION" },
  A05: { label: "낙하물", kind: "OTHER" },
  A10: { label: "집회·행사", kind: "EVENT" },
};

function parseSeoulDateTime(
  dateValue: string | null,
  timeValue: string | null,
): string | null {
  const date = dateValue?.replace(/\D/g, "") ?? "";
  const rawTime = timeValue?.replace(/\D/g, "") ?? "";
  if (date.length !== 8 || (rawTime.length !== 4 && rawTime.length !== 6)) {
    return null;
  }

  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6));
  const day = Number(date.slice(6, 8));
  const hour = Number(rawTime.slice(0, 2));
  const minute = Number(rawTime.slice(2, 4));
  const second = rawTime.length === 6 ? Number(rawTime.slice(4, 6)) : 0;
  const validationDate = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second),
  );

  if (
    validationDate.getUTCFullYear() !== year ||
    validationDate.getUTCMonth() !== month - 1 ||
    validationDate.getUTCDate() !== day ||
    validationDate.getUTCHours() !== hour ||
    validationDate.getUTCMinutes() !== minute ||
    validationDate.getUTCSeconds() !== second
  ) {
    return null;
  }

  const paddedSecond = String(second).padStart(2, "0");
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${rawTime.slice(0, 2)}:${rawTime.slice(2, 4)}:${paddedSecond}+09:00`;
}

function normalizeRow(row: SeoulIncidentRow): TrafficIncident | null {
  const coordinate = transformSeoulGrs80TmToWgs84(
    row.grs80TmX,
    row.grs80TmY,
  );
  if (!coordinate) return null;

  const category = row.typeCode
    ? CATEGORY_BY_CODE[row.typeCode]
    : undefined;

  return {
    id: row.id,
    category: category?.label ?? "기타 돌발상황",
    categoryKind: category?.kind ?? "OTHER",
    detailCategory: row.detailTypeCode,
    occurredAt: parseSeoulDateTime(row.occurredDate, row.occurredTime),
    expectedClearAt: parseSeoulDateTime(
      row.expectedClearDate,
      row.expectedClearTime,
    ),
    description: row.description,
    linkId: row.linkId,
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    source: "SEOUL_TOPIS",
  };
}

function createRequestUrl(apiKey: string) {
  return `${SEOUL_OPEN_API_BASE_URL}/${encodeURIComponent(apiKey)}/xml/AccInfo/${ACC_INFO_START_INDEX}/${ACC_INFO_END_INDEX}/`;
}

export async function getSeoulTrafficIncidents(): Promise<TrafficIncidentsResponse> {
  const apiKey = process.env.SEOUL_OPEN_DATA_API_KEY?.trim();
  if (!apiKey) {
    throw new SeoulIncidentError(
      "SERVICE_NOT_CONFIGURED",
      "서울 Open API 서버 설정이 없습니다.",
    );
  }

  let response: Response;
  try {
    response = await fetch(createRequestUrl(apiKey), {
      cache: "force-cache",
      next: {
        revalidate: CACHE_TTL_SECONDS,
        tags: ["seoul-topis-incidents"],
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new SeoulIncidentError(
      "UPSTREAM_UNAVAILABLE",
      "서울 Open API에 연결할 수 없습니다.",
    );
  }

  if (!response.ok) {
    throw new SeoulIncidentError(
      "UPSTREAM_UNAVAILABLE",
      "서울 Open API가 정상 응답하지 않았습니다.",
    );
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_XML_BYTES) {
    throw new SeoulIncidentError(
      "INVALID_UPSTREAM_RESPONSE",
      "서울 돌발정보 응답 크기가 허용 범위를 초과했습니다.",
    );
  }

  const xml = await response.text();
  if (Buffer.byteLength(xml, "utf8") > MAX_XML_BYTES) {
    throw new SeoulIncidentError(
      "INVALID_UPSTREAM_RESPONSE",
      "서울 돌발정보 응답 크기가 허용 범위를 초과했습니다.",
    );
  }

  const parsed = parseSeoulIncidentXml(xml);
  const incidents: TrafficIncident[] = [];
  const seenIds = new Set<string>();
  let discardedCoordinateCount = 0;

  for (const row of parsed.rows) {
    if (seenIds.has(row.id)) continue;
    seenIds.add(row.id);

    const incident = normalizeRow(row);
    if (!incident) {
      discardedCoordinateCount += 1;
      continue;
    }
    incidents.push(incident);
  }

  if (discardedCoordinateCount > 0) {
    console.warn("[seoul-incidents] coordinates discarded", {
      count: discardedCoordinateCount,
    });
  }

  return {
    incidents,
    fetchedAt: new Date().toISOString(),
    source: "SEOUL_TOPIS",
  };
}
