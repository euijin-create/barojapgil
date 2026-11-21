export type TrafficIncidentKind =
  | "ACCIDENT"
  | "CONSTRUCTION"
  | "CONTROL"
  | "EVENT"
  | "OTHER";

export interface TrafficIncident {
  id: string;
  category: string;
  categoryKind: TrafficIncidentKind;
  detailCategory: string | null;
  occurredAt: string | null;
  expectedClearAt: string | null;
  description: string;
  linkId: string | null;
  latitude: number;
  longitude: number;
  source: "SEOUL_TOPIS";
}

export interface TrafficIncidentsResponse {
  incidents: TrafficIncident[];
  fetchedAt: string;
  source: "SEOUL_TOPIS";
}

export type TrafficIncidentsPublicErrorCode =
  | "SERVICE_CONFIGURATION_ERROR"
  | "TRAFFIC_INCIDENTS_UNAVAILABLE"
  | "INVALID_UPSTREAM_RESPONSE"
  | "INTERNAL_SERVER_ERROR";

export interface TrafficIncidentsErrorResponse {
  error: {
    code: TrafficIncidentsPublicErrorCode;
    message: string;
  };
}
