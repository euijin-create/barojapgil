import RiskMapView from "@/features/public/risk-map-view";

export default function RiskMapPage() {
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

  return (
    <div className="page-container pb-8">
      <header className="pt-3">
        <p className="eyebrow">교통안전 데이터</p>
        <h1 className="page-heading mt-3">
          교통위험지도
        </h1>
        <p className="page-subtitle mt-3">
          실시간 교통정보와 교통안전 데이터를 한눈에 확인하세요.
        </p>
      </header>

      <RiskMapView kakaoMapKey={kakaoMapKey} />
    </div>
  );
}
