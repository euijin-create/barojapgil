import type { DemoRiskAggregateArea } from "./types";

// 실제 사건 좌표가 아닌 화면 체험용 합성 집계구역 중심점이다.
// 개별 신고 위치나 사용자의 이동 경로를 나타내지 않는다.
export const DEMO_RISK_AGGREGATE_AREAS: readonly DemoRiskAggregateArea[] = [
  {
    id: "demo-area-worldcup",
    layer: "BAROJAPGIL_REPORT",
    dataStatus: "DEMO",
    name: "마포구 월드컵로 일대",
    regionLabel: "서울 마포구 · 데모 집계구역 A",
    center: { latitude: 37.5683, longitude: 126.8974 },
    radiusMeters: 620,
    primaryViolationType: "signal",
    reportCount: 12,
  },
  {
    id: "demo-area-seongsu",
    layer: "BAROJAPGIL_REPORT",
    dataStatus: "DEMO",
    name: "성수대교 북단 일대",
    regionLabel: "서울 성동구 · 데모 집계구역 B",
    center: { latitude: 37.5447, longitude: 127.0355 },
    radiusMeters: 520,
    primaryViolationType: "cutin",
    reportCount: 8,
  },
  {
    id: "demo-area-yeouidaebang",
    layer: "BAROJAPGIL_REPORT",
    dataStatus: "DEMO",
    name: "영등포구 여의대방로 일대",
    regionLabel: "서울 영등포구 · 데모 집계구역 C",
    center: { latitude: 37.5168, longitude: 126.9177 },
    radiusMeters: 560,
    primaryViolationType: "center",
    reportCount: 5,
  },
  {
    id: "demo-area-yanghwa",
    layer: "BAROJAPGIL_REPORT",
    dataStatus: "DEMO",
    name: "마포구 양화로 일대",
    regionLabel: "서울 마포구 · 데모 집계구역 D",
    center: { latitude: 37.5565, longitude: 126.9226 },
    radiusMeters: 460,
    primaryViolationType: "signal",
    reportCount: 7,
  },
] as const;
