import "server-only";

import type {
  AccidentHotspot,
  AccidentHotspotCoordinate,
  AccidentHotspotViolationType,
  AccidentHotspotWarningCode,
} from "@/contracts/accident-hotspots";
import { TAAS_SEOUL_WGS84_BOUNDS } from "./taas-hotspot-config";
import { TaasHotspotError } from "./taas-hotspot-error";
import type { SeoulDistrict } from "./taas-seoul-districts";

type JsonRecord = Record<string, unknown>;

export interface ParsedTaasHotspotPage {
  rows: JsonRecord[];
  totalCount: number;
  pageNo: number;
}

export type TaasHotspotRowIssueCode = Exclude<
  AccidentHotspotWarningCode,
  "DISTRICT_UNAVAILABLE"
>;

export interface TaasHotspotRowIssue {
  code: TaasHotspotRowIssueCode;
}

export interface NormalizedTaasHotspotRow {
  hotspot: AccidentHotspot | null;
  issues: TaasHotspotRowIssue[];
}

const AUTHENTICATION_ERROR_NAMES = [
  "SERVICE_KEY_IS_NULL",
  "SERVICE_ACCESS_DENIED_ERROR",
  "SERVICE_KEY_IS_NOT_REGISTERED_ERROR",
  "DEADLINE_HAS_EXPIRED_ERROR",
  "TEMPORARILY_DISABLE_THE_SERVICEKEY_ERROR",
  "UNREGISTERED_IP_ERROR",
  "UNSIGNED_CALL_ERROR",
] as const;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function readField(record: JsonRecord | null, ...keys: string[]) {
  if (!record) return undefined;
  for (const key of keys) {
    if (key in record) return record[key];
  }
  return undefined;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asFiniteNumber(value: unknown): number {
  const normalized = asString(value);
  if (normalized === null) return Number.NaN;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function asNonNegativeInteger(value: unknown) {
  const parsed = asFiniteNumber(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

function normalizeResultCode(value: unknown) {
  const resultCode = asString(value);
  if (!resultCode) return null;
  return /^\d$/.test(resultCode) ? resultCode.padStart(2, "0") : resultCode;
}

function findKnownAuthenticationError(value: string) {
  const upperValue = value.toUpperCase();
  return (
    AUTHENTICATION_ERROR_NAMES.find((name) => upperValue.includes(name)) ??
    null
  );
}

function throwForUpstreamResult(resultCode: string, resultMessage: string) {
  const normalizedMessage = resultMessage.toUpperCase();
  const namedAuthenticationError = findKnownAuthenticationError(resultMessage);

  if (
    namedAuthenticationError ||
    ["20", "21", "30", "31", "32", "33"].includes(resultCode)
  ) {
    throw new TaasHotspotError(
      "UPSTREAM_AUTHENTICATION_FAILED",
      "TAAS Open API 인증에 실패했습니다.",
      { upstreamCode: namedAuthenticationError ?? resultCode },
    );
  }

  if (
    resultCode === "22" ||
    normalizedMessage.includes("LIMITED_NUMBER_OF_SERVICE_REQUESTS")
  ) {
    throw new TaasHotspotError(
      "UPSTREAM_RATE_LIMITED",
      "TAAS Open API 호출 한도를 초과했습니다.",
      { upstreamCode: resultCode },
    );
  }

  if (["01", "02", "04", "05", "99"].includes(resultCode)) {
    throw new TaasHotspotError(
      "UPSTREAM_UNAVAILABLE",
      "TAAS Open API가 정상 응답하지 않았습니다.",
      { upstreamCode: resultCode },
    );
  }

  throw new TaasHotspotError(
    "INVALID_UPSTREAM_RESPONSE",
    "TAAS Open API가 처리할 수 없는 응답을 반환했습니다.",
    { upstreamCode: resultCode },
  );
}

function normalizeRows(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.map(asRecord).filter((row): row is JsonRecord => row !== null);
  }

  const row = asRecord(value);
  return row ? [row] : [];
}

function isInsideSeoulBounds(latitude: number, longitude: number) {
  return (
    latitude >= TAAS_SEOUL_WGS84_BOUNDS.minLatitude &&
    latitude <= TAAS_SEOUL_WGS84_BOUNDS.maxLatitude &&
    longitude >= TAAS_SEOUL_WGS84_BOUNDS.minLongitude &&
    longitude <= TAAS_SEOUL_WGS84_BOUNDS.maxLongitude
  );
}

function decodeGeometry(value: unknown): JsonRecord | null {
  let decoded: unknown = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (typeof decoded !== "string") break;
    const serialized = decoded.trim();
    if (!serialized) return null;
    try {
      decoded = JSON.parse(serialized) as unknown;
    } catch {
      return null;
    }
  }

  return asRecord(decoded);
}

function parsePolygon(value: unknown): AccidentHotspotCoordinate[] | null {
  const geometry = decodeGeometry(value);
  const geometryType = asString(readField(geometry, "type", "TYPE"));
  const coordinates = readField(geometry, "coordinates", "COORDINATES");

  if (
    geometryType?.toUpperCase() !== "POLYGON" ||
    !Array.isArray(coordinates) ||
    !Array.isArray(coordinates[0])
  ) {
    return null;
  }

  const polygon: AccidentHotspotCoordinate[] = [];
  for (const pointValue of coordinates[0]) {
    if (!Array.isArray(pointValue) || pointValue.length < 2) return null;
    const longitude = asFiniteNumber(pointValue[0]);
    const latitude = asFiniteNumber(pointValue[1]);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !isInsideSeoulBounds(latitude, longitude)
    ) {
      return null;
    }
    polygon.push({ latitude, longitude });
  }

  return polygon.length >= 3 ? polygon : null;
}

function normalizeViolationType(value: unknown): AccidentHotspotViolationType {
  const rawId = asString(value);
  const normalizedId = rawId && /^\d+$/.test(rawId)
    ? rawId.padStart(2, "0")
    : rawId;

  if (normalizedId === "01") return "SIGNAL_VIOLATION";
  if (normalizedId === "02") return "CENTER_LINE_VIOLATION";
  return "GENERAL";
}

export function parseTaasHotspotPage(
  serializedResponse: string,
): ParsedTaasHotspotPage {
  const namedAuthenticationError = findKnownAuthenticationError(
    serializedResponse,
  );
  if (namedAuthenticationError) {
    throw new TaasHotspotError(
      "UPSTREAM_AUTHENTICATION_FAILED",
      "TAAS Open API 인증에 실패했습니다.",
      { upstreamCode: namedAuthenticationError },
    );
  }

  let document: unknown;
  try {
    document = JSON.parse(serializedResponse) as unknown;
  } catch (cause) {
    throw new TaasHotspotError(
      "INVALID_UPSTREAM_RESPONSE",
      "TAAS 사고다발지역 JSON을 해석할 수 없습니다.",
      { cause },
    );
  }

  const root = asRecord(document);
  const response = asRecord(readField(root, "response", "RESPONSE"));
  const header = asRecord(readField(response, "header", "HEADER"));
  const body =
    asRecord(readField(response, "body", "BODY")) ?? response ?? root;

  const resultCode = normalizeResultCode(
    readField(header, "resultCode", "RESULT_CODE") ??
      readField(root, "resultCode", "RESULT_CODE") ??
      readField(body, "resultCode", "RESULT_CODE"),
  );
  const resultMessage =
    asString(
      readField(header, "resultMsg", "resultMessage", "RESULT_MSG") ??
        readField(root, "resultMsg", "resultMessage", "RESULT_MSG") ??
        readField(body, "resultMsg", "resultMessage", "RESULT_MSG"),
    ) ?? "";

  if (!resultCode) {
    throw new TaasHotspotError(
      "INVALID_UPSTREAM_RESPONSE",
      "TAAS 사고다발지역 응답 코드가 없습니다.",
    );
  }

  if (resultCode === "03" || resultMessage.toUpperCase() === "NODATA_ERROR") {
    return { rows: [], totalCount: 0, pageNo: 1 };
  }

  if (resultCode !== "00") {
    throwForUpstreamResult(resultCode, resultMessage);
  }

  const items = readField(body, "items", "ITEMS");
  const itemsRecord = asRecord(items);
  const itemValue = itemsRecord
    ? readField(itemsRecord, "item", "ITEM")
    : items;
  const rows = normalizeRows(itemValue);
  const totalCountValue = asFiniteNumber(
    readField(body, "totalCount", "TOTAL_COUNT"),
  );
  const pageNoValue = asFiniteNumber(readField(body, "pageNo", "PAGE_NO"));
  const totalCount = Number.isFinite(totalCountValue)
    ? Math.max(0, Math.trunc(totalCountValue))
    : rows.length;
  const pageNo = Number.isFinite(pageNoValue)
    ? Math.max(1, Math.trunc(pageNoValue))
    : 1;

  if (totalCount > 0 && rows.length === 0) {
    throw new TaasHotspotError(
      "INVALID_UPSTREAM_RESPONSE",
      "TAAS 사고다발지역 응답 항목이 없습니다.",
    );
  }

  return { rows, totalCount, pageNo };
}

export function normalizeTaasHotspotRow(
  row: JsonRecord,
  district: SeoulDistrict,
  dataYear: number,
): NormalizedTaasHotspotRow {
  const issues: TaasHotspotRowIssue[] = [];
  const afosFid = asString(readField(row, "afos_fid", "AFOS_FID"));
  const spotCode = asString(readField(row, "spot_cd", "SPOT_CD"));
  const stableSourceId = afosFid ?? spotCode;

  if (!stableSourceId) {
    return { hotspot: null, issues: [{ code: "INVALID_ROW" }] };
  }

  const longitude = asFiniteNumber(readField(row, "lo_crd", "LO_CRD"));
  const latitude = asFiniteNumber(readField(row, "la_crd", "LA_CRD"));
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !isInsideSeoulBounds(latitude, longitude)
  ) {
    return { hotspot: null, issues: [{ code: "INVALID_COORDINATE" }] };
  }

  const rawGeometry = readField(row, "geom_json", "GEOM_JSON");
  const parsedPolygon = parsePolygon(rawGeometry);
  if (!parsedPolygon) issues.push({ code: "INVALID_POLYGON" });

  const rawAfosId = readField(row, "afos_id", "AFOS_ID");
  const violationType = normalizeViolationType(rawAfosId);
  const normalizedAfosId = asString(rawAfosId) ?? "unknown";
  const name =
    asString(readField(row, "spot_nm", "SPOT_NM")) ??
    `${district.name} 법규위반 사고다발지역`;

  return {
    hotspot: {
      id: `${dataYear}-${district.guGunCode}-${normalizedAfosId}-${stableSourceId}`,
      district: district.name,
      name,
      violationType,
      latitude,
      longitude,
      occurrenceCount: asNonNegativeInteger(
        readField(row, "occrrnc_cnt", "OCCRRNC_CNT"),
      ),
      casualtyCount: asNonNegativeInteger(
        readField(row, "caslt_cnt", "CASLT_CNT"),
      ),
      deathCount: asNonNegativeInteger(
        readField(row, "dth_dnv_cnt", "DTH_DNV_CNT"),
      ),
      seriousInjuryCount: asNonNegativeInteger(
        readField(row, "se_dnv_cnt", "SE_DNV_CNT"),
      ),
      minorInjuryCount: asNonNegativeInteger(
        readField(row, "sl_dnv_cnt", "SL_DNV_CNT"),
      ),
      reportedInjuryCount: asNonNegativeInteger(
        readField(row, "wnd_dnv_cnt", "WND_DNV_CNT"),
      ),
      polygon: parsedPolygon ?? [],
      dataYear,
      source: "KOROAD_TAAS",
    },
    issues,
  };
}
