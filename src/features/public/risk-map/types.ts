import type { ViolationType } from "@/lib/demo-data";

export type MapLayer =
  | "TRAFFIC"
  | "ACCIDENT_HOTSPOT"
  | "INCIDENT"
  | "BAROJAPGIL_REPORT";

export type MapLayerSelection = "ALL" | MapLayer;
export type MapDataStatus = "LIVE" | "OFFICIAL" | "COMING_SOON" | "DEMO";

export interface MapLayerDefinition {
  id: MapLayer;
  label: string;
  status: MapDataStatus;
  statusLabel: string;
  source: string;
  description: string;
}

export interface RiskMapCoordinate {
  latitude: number;
  longitude: number;
}

export interface DemoRiskAggregateArea {
  id: string;
  layer: "BAROJAPGIL_REPORT";
  dataStatus: "DEMO";
  name: string;
  regionLabel: string;
  center: RiskMapCoordinate;
  radiusMeters: number;
  primaryViolationType: Extract<
    ViolationType,
    "signal" | "center" | "cutin"
  >;
  reportCount: number;
}

export const MAP_LAYER_DEFINITIONS: readonly MapLayerDefinition[] = [
  {
    id: "TRAFFIC",
    label: "실시간 교통",
    status: "LIVE",
    statusLabel: "실제 데이터",
    source: "Kakao Maps",
    description: "Kakao의 실시간 교통 흐름을 보여줘요.",
  },
  {
    id: "ACCIDENT_HOTSPOT",
    label: "사고다발",
    status: "OFFICIAL",
    statusLabel: "공식 데이터",
    source: "한국도로교통공단 TAAS",
    description: "과거 사고 통계로 선정된 사고다발지역이에요.",
  },
  {
    id: "INCIDENT",
    label: "돌발상황",
    status: "LIVE",
    statusLabel: "실시간 데이터",
    source: "서울 TOPIS · 서울 열린데이터광장",
    description: "서울의 사고·공사·통제 정보를 실시간으로 보여줘요.",
  },
  {
    id: "BAROJAPGIL_REPORT",
    label: "바로잡길 신고",
    status: "DEMO",
    statusLabel: "DEMO",
    source: "향후 비식별 신고 집계 DB",
    description: "구역 단위 신고 집계 예시를 보여줘요.",
  },
] as const;

export function getMapLayerDefinition(layer: MapLayer) {
  return MAP_LAYER_DEFINITIONS.find((item) => item.id === layer);
}

export function selectionIncludesLayer(
  selection: MapLayerSelection,
  layer: MapLayer,
) {
  if (selection === "ALL") {
    return (
      layer === "TRAFFIC" ||
      layer === "ACCIDENT_HOTSPOT" ||
      layer === "INCIDENT" ||
      layer === "BAROJAPGIL_REPORT"
    );
  }

  return selection === layer;
}
