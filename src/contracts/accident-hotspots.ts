export type AccidentHotspotViolationType =
  | "SIGNAL_VIOLATION"
  | "CENTER_LINE_VIOLATION"
  | "GENERAL";

export interface AccidentHotspotCoordinate {
  latitude: number;
  longitude: number;
}

export interface AccidentHotspot {
  id: string;
  district: string;
  name: string;
  violationType: AccidentHotspotViolationType;
  latitude: number;
  longitude: number;
  occurrenceCount: number;
  casualtyCount: number;
  deathCount: number;
  seriousInjuryCount: number;
  minorInjuryCount: number;
  reportedInjuryCount: number;
  polygon: AccidentHotspotCoordinate[];
  dataYear: number;
  source: "KOROAD_TAAS";
}

export type AccidentHotspotWarningCode =
  | "DISTRICT_UNAVAILABLE"
  | "INVALID_ROW"
  | "INVALID_COORDINATE"
  | "INVALID_POLYGON";

export interface AccidentHotspotWarning {
  code: AccidentHotspotWarningCode;
  district: string;
  count: number;
  message: string;
}

export interface AccidentHotspotsResponse {
  dataYear: number;
  fetchedAt: string;
  source: "KOROAD_TAAS";
  hotspots: AccidentHotspot[];
  warnings: AccidentHotspotWarning[];
}

export type AccidentHotspotsPublicErrorCode =
  | "SERVICE_CONFIGURATION_ERROR"
  | "ACCIDENT_HOTSPOTS_UNAVAILABLE"
  | "INVALID_UPSTREAM_RESPONSE"
  | "INTERNAL_SERVER_ERROR";

export interface AccidentHotspotsErrorResponse {
  error: {
    code: AccidentHotspotsPublicErrorCode;
    message: string;
  };
}
