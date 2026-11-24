import "server-only";

export const TAAS_HOTSPOT_ENDPOINT =
  "https://apis.data.go.kr/B552061/frequentzoneLgrViolt/getRestFrequentzoneLgrViolt";

// Keep the live-verified MVP data year explicit: the upstream rejects or returns
// empty data for unsupported years, so it must not be derived from the current
// date. Update this constant only after a small live-data probe.
export const TAAS_HOTSPOT_DATA_YEAR = 2025;
export const TAAS_SEOUL_SIDO_CODE = "11";
export const TAAS_HOTSPOT_PAGE_SIZE = 100;
export const TAAS_HOTSPOT_CONCURRENCY = 3;
export const TAAS_HOTSPOT_BATCH_DELAY_MS = 275;
export const TAAS_HOTSPOT_CACHE_TTL_SECONDS = 12 * 60 * 60;
export const TAAS_HOTSPOT_PARTIAL_CACHE_TTL_SECONDS = 5 * 60;

export const TAAS_HOTSPOT_REQUEST_TIMEOUT_MS = 12_000;
export const TAAS_HOTSPOT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
export const TAAS_HOTSPOT_MAX_PAGES_PER_DISTRICT = 20;

export const TAAS_SEOUL_WGS84_BOUNDS = {
  minLatitude: 37.4,
  maxLatitude: 37.8,
  minLongitude: 126.7,
  maxLongitude: 127.3,
} as const;
