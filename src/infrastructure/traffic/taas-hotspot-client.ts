import "server-only";

import type {
  AccidentHotspot,
  AccidentHotspotsResponse,
  AccidentHotspotWarning,
  AccidentHotspotWarningCode,
} from "@/contracts/accident-hotspots";
import {
  TAAS_HOTSPOT_BATCH_DELAY_MS,
  TAAS_HOTSPOT_CACHE_TTL_SECONDS,
  TAAS_HOTSPOT_CONCURRENCY,
  TAAS_HOTSPOT_DATA_YEAR,
  TAAS_HOTSPOT_ENDPOINT,
  TAAS_HOTSPOT_MAX_PAGES_PER_DISTRICT,
  TAAS_HOTSPOT_MAX_RESPONSE_BYTES,
  TAAS_HOTSPOT_PAGE_SIZE,
  TAAS_HOTSPOT_PARTIAL_CACHE_TTL_SECONDS,
  TAAS_HOTSPOT_REQUEST_TIMEOUT_MS,
  TAAS_SEOUL_SIDO_CODE,
} from "./taas-hotspot-config";
import { TaasHotspotError } from "./taas-hotspot-error";
import {
  normalizeTaasHotspotRow,
  parseTaasHotspotPage,
  type TaasHotspotRowIssueCode,
} from "./taas-hotspot-parser";
import {
  SEOUL_DISTRICTS,
  type SeoulDistrict,
} from "./taas-seoul-districts";

interface DistrictSuccess {
  ok: true;
  district: SeoulDistrict;
  hotspots: AccidentHotspot[];
  warnings: AccidentHotspotWarning[];
}

interface DistrictFailure {
  ok: false;
  district: SeoulDistrict;
  error: TaasHotspotError;
}

type DistrictResult = DistrictSuccess | DistrictFailure;

interface AccidentHotspotCacheEntry {
  value: AccidentHotspotsResponse;
  expiresAt: number;
}

// A warm server instance should never repeat the 25-district aggregation for
// concurrent browser requests. Only resolved results enter the TTL cache;
// rejected requests are cleared in finally and can be retried immediately.
let aggregateCache: AccidentHotspotCacheEntry | null = null;
let aggregateInFlight: Promise<AccidentHotspotsResponse> | null = null;

const WARNING_MESSAGE: Readonly<Record<AccidentHotspotWarningCode, string>> = {
  DISTRICT_UNAVAILABLE: "해당 자치구 데이터를 불러오지 못했습니다.",
  INVALID_ROW: "일부 항목을 해석할 수 없어 제외했습니다.",
  INVALID_COORDINATE: "서울 범위를 벗어난 좌표를 제외했습니다.",
  INVALID_POLYGON: "일부 영역 정보를 표시할 수 없어 중심점만 사용합니다.",
};

function createRequestUrl(
  apiKey: string,
  district: SeoulDistrict,
  pageNo: number,
) {
  const url = new URL(TAAS_HOTSPOT_ENDPOINT);
  const searchParams = new URLSearchParams({
    ServiceKey: apiKey,
    searchYearCd: String(TAAS_HOTSPOT_DATA_YEAR),
    siDo: TAAS_SEOUL_SIDO_CODE,
    guGun: district.guGunCode,
    type: "json",
    numOfRows: String(TAAS_HOTSPOT_PAGE_SIZE),
    pageNo: String(pageNo),
  });

  // The environment value is the general key. URLSearchParams performs the
  // only encoding pass; never pre-encode or log this URL.
  url.search = searchParams.toString();
  return url;
}

async function readResponseBody(response: Response, district: SeoulDistrict) {
  const contentLength = Number(response.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > TAAS_HOTSPOT_MAX_RESPONSE_BYTES
  ) {
    throw new TaasHotspotError(
      "INVALID_UPSTREAM_RESPONSE",
      "TAAS 사고다발지역 응답 크기가 허용 범위를 초과했습니다.",
      { district: district.name },
    );
  }

  const serializedResponse = await response.text();
  if (
    Buffer.byteLength(serializedResponse, "utf8") >
    TAAS_HOTSPOT_MAX_RESPONSE_BYTES
  ) {
    throw new TaasHotspotError(
      "INVALID_UPSTREAM_RESPONSE",
      "TAAS 사고다발지역 응답 크기가 허용 범위를 초과했습니다.",
      { district: district.name },
    );
  }

  return serializedResponse;
}

async function fetchPage(
  apiKey: string,
  district: SeoulDistrict,
  pageNo: number,
) {
  let response: Response;
  try {
    response = await fetch(createRequestUrl(apiKey, district, pageNo), {
      cache: "no-store",
      signal: AbortSignal.timeout(TAAS_HOTSPOT_REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new TaasHotspotError(
      "UPSTREAM_UNAVAILABLE",
      "TAAS Open API에 연결할 수 없습니다.",
      { district: district.name, cause },
    );
  }

  if (!response.ok) {
    const code =
      response.status === 401 || response.status === 403
        ? "UPSTREAM_AUTHENTICATION_FAILED"
        : response.status === 429
          ? "UPSTREAM_RATE_LIMITED"
          : "UPSTREAM_UNAVAILABLE";
    throw new TaasHotspotError(
      code,
      "TAAS Open API가 정상 응답하지 않았습니다.",
      { district: district.name, upstreamCode: String(response.status) },
    );
  }

  return parseTaasHotspotPage(await readResponseBody(response, district));
}

function createWarnings(
  district: SeoulDistrict,
  issueCounts: ReadonlyMap<TaasHotspotRowIssueCode, number>,
) {
  return Array.from(issueCounts, ([code, count]): AccidentHotspotWarning => ({
    code,
    district: district.name,
    count,
    message: `${district.name}: ${WARNING_MESSAGE[code]}`,
  }));
}

async function fetchDistrict(
  apiKey: string,
  district: SeoulDistrict,
): Promise<DistrictSuccess> {
  const hotspots: AccidentHotspot[] = [];
  const seenIds = new Set<string>();
  const issueCounts = new Map<TaasHotspotRowIssueCode, number>();
  let pageNo = 1;
  let totalPages = 1;

  do {
    const page = await fetchPage(apiKey, district, pageNo);
    if (pageNo === 1) {
      totalPages = Math.max(
        1,
        Math.ceil(page.totalCount / TAAS_HOTSPOT_PAGE_SIZE),
      );
      if (totalPages > TAAS_HOTSPOT_MAX_PAGES_PER_DISTRICT) {
        throw new TaasHotspotError(
          "INVALID_UPSTREAM_RESPONSE",
          "TAAS 사고다발지역 페이지 수가 허용 범위를 초과했습니다.",
          { district: district.name },
        );
      }
    }

    for (const row of page.rows) {
      const normalized = normalizeTaasHotspotRow(
        row,
        district,
        TAAS_HOTSPOT_DATA_YEAR,
      );
      for (const issue of normalized.issues) {
        issueCounts.set(issue.code, (issueCounts.get(issue.code) ?? 0) + 1);
      }

      if (
        normalized.hotspot &&
        !seenIds.has(normalized.hotspot.id)
      ) {
        seenIds.add(normalized.hotspot.id);
        hotspots.push(normalized.hotspot);
      }
    }

    pageNo += 1;
  } while (pageNo <= totalPages);

  return {
    ok: true,
    district,
    hotspots,
    warnings: createWarnings(district, issueCounts),
  };
}

async function fetchDistrictSafely(
  apiKey: string,
  district: SeoulDistrict,
): Promise<DistrictResult> {
  try {
    return await fetchDistrict(apiKey, district);
  } catch (error) {
    return {
      ok: false,
      district,
      error:
        error instanceof TaasHotspotError
          ? error
          : new TaasHotspotError(
              "UPSTREAM_UNAVAILABLE",
              "TAAS 자치구 데이터를 불러오지 못했습니다.",
              { district: district.name, cause: error },
            ),
    };
  }
}

function isFatalProviderError(error: TaasHotspotError) {
  return (
    error.code === "UPSTREAM_AUTHENTICATION_FAILED" ||
    error.code === "UPSTREAM_RATE_LIMITED"
  );
}

function waitForNextBatch() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, TAAS_HOTSPOT_BATCH_DELAY_MS);
  });
}

async function loadSeoulAccidentHotspots(): Promise<AccidentHotspotsResponse> {
  const apiKey = process.env.TAAS_API_KEY?.trim();
  if (!apiKey) {
    throw new TaasHotspotError(
      "SERVICE_NOT_CONFIGURED",
      "TAAS Open API 서버 설정이 없습니다.",
    );
  }

  const districtResults: DistrictResult[] = [];

  // Small batches cap upstream concurrency at three and let a global auth or
  // quota failure stop the next batch without issuing all 25 requests.
  for (
    let startIndex = 0;
    startIndex < SEOUL_DISTRICTS.length;
    startIndex += TAAS_HOTSPOT_CONCURRENCY
  ) {
    const batch = SEOUL_DISTRICTS.slice(
      startIndex,
      startIndex + TAAS_HOTSPOT_CONCURRENCY,
    );
    const batchResults = await Promise.all(
      batch.map((district) => fetchDistrictSafely(apiKey, district)),
    );
    districtResults.push(...batchResults);

    const fatalFailure = batchResults.find(
      (result): result is DistrictFailure =>
        !result.ok && isFatalProviderError(result.error),
    );
    if (fatalFailure) throw fatalFailure.error;

    const hasNextBatch =
      startIndex + TAAS_HOTSPOT_CONCURRENCY < SEOUL_DISTRICTS.length;
    if (hasNextBatch) await waitForNextBatch();
  }

  const successfulDistricts = districtResults.filter(
    (result): result is DistrictSuccess => result.ok,
  );
  const failedDistricts = districtResults.filter(
    (result): result is DistrictFailure => !result.ok,
  );

  for (const result of failedDistricts) {
    console.warn("[taas-hotspots] district unavailable", {
      district: result.district.name,
      code: result.error.code,
      upstreamCode: result.error.upstreamCode,
    });
  }

  if (successfulDistricts.length === 0 && failedDistricts.length > 0) {
    const firstError = failedDistricts[0]?.error;
    throw (
      firstError ??
      new TaasHotspotError(
        "UPSTREAM_UNAVAILABLE",
        "TAAS 서울 사고다발지역 데이터를 불러오지 못했습니다.",
      )
    );
  }

  const warnings: AccidentHotspotWarning[] = successfulDistricts.flatMap(
    (result) => result.warnings,
  );
  warnings.push(
    ...failedDistricts.map(
      ({ district }): AccidentHotspotWarning => ({
        code: "DISTRICT_UNAVAILABLE",
        district: district.name,
        count: 1,
        message: `${district.name}: ${WARNING_MESSAGE.DISTRICT_UNAVAILABLE}`,
      }),
    ),
  );

  const hotspots: AccidentHotspot[] = [];
  const seenIds = new Set<string>();
  for (const result of successfulDistricts) {
    for (const hotspot of result.hotspots) {
      if (seenIds.has(hotspot.id)) continue;
      seenIds.add(hotspot.id);
      hotspots.push(hotspot);
    }
  }

  return {
    dataYear: TAAS_HOTSPOT_DATA_YEAR,
    fetchedAt: new Date().toISOString(),
    source: "KOROAD_TAAS",
    hotspots,
    warnings,
  };
}

function getAggregateCacheTtlMilliseconds(result: AccidentHotspotsResponse) {
  const hasUnavailableDistrict = result.warnings.some(
    (warning) => warning.code === "DISTRICT_UNAVAILABLE",
  );
  const ttlSeconds = hasUnavailableDistrict
    ? TAAS_HOTSPOT_PARTIAL_CACHE_TTL_SECONDS
    : TAAS_HOTSPOT_CACHE_TTL_SECONDS;
  return ttlSeconds * 1_000;
}

export function getSeoulAccidentHotspots(): Promise<AccidentHotspotsResponse> {
  const now = Date.now();
  if (aggregateCache && aggregateCache.expiresAt > now) {
    return Promise.resolve(aggregateCache.value);
  }
  aggregateCache = null;

  if (aggregateInFlight) return aggregateInFlight;

  const request = loadSeoulAccidentHotspots()
    .then((result) => {
      aggregateCache = {
        value: result,
        expiresAt: Date.now() + getAggregateCacheTtlMilliseconds(result),
      };
      return result;
    })
    .finally(() => {
      if (aggregateInFlight === request) aggregateInFlight = null;
    });

  aggregateInFlight = request;
  return request;
}
