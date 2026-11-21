import "server-only";

import proj4 from "proj4";

const SEOUL_GRS80_TM = "EPSG:5181";
const WGS84 = "EPSG:4326";

// AccInfo의 공개 sample 좌표는 KGD2002 / Central Belt(EPSG:5181)이다.
// 중앙 경선 127도, GRS80 타원체, false easting 200,000m,
// false northing 500,000m 정의를 명시해 라이브러리 환경에 의존하지 않는다.
export const EPSG_5181_PROJ4_DEFINITION =
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";

export const SEOUL_WGS84_BOUNDS = {
  minLatitude: 37.4,
  maxLatitude: 37.8,
  minLongitude: 126.7,
  maxLongitude: 127.3,
} as const;

proj4.defs(SEOUL_GRS80_TM, EPSG_5181_PROJ4_DEFINITION);

export interface Wgs84Coordinate {
  latitude: number;
  longitude: number;
}

function isInsideSeoulBounds(latitude: number, longitude: number) {
  return (
    latitude >= SEOUL_WGS84_BOUNDS.minLatitude &&
    latitude <= SEOUL_WGS84_BOUNDS.maxLatitude &&
    longitude >= SEOUL_WGS84_BOUNDS.minLongitude &&
    longitude <= SEOUL_WGS84_BOUNDS.maxLongitude
  );
}

export function transformSeoulGrs80TmToWgs84(
  x: number,
  y: number,
): Wgs84Coordinate | null {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  try {
    const [longitude, latitude] = proj4(SEOUL_GRS80_TM, WGS84, [x, y]);
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !isInsideSeoulBounds(latitude, longitude)
    ) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
}
