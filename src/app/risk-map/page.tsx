import RiskMapView from "@/features/public/risk-map-view";

export default function RiskMapPage() {
  return (
    <div className="page-container space-y-6 pb-10">
      <div><p className="eyebrow">함께 보는 교통안전</p><h1 className="page-heading mt-1">교통위험지도</h1><p className="page-subtitle mt-2">지역 단위의 비식별 집계 예시를 살펴보세요.</p></div>
      <RiskMapView />
    </div>
  );
}
