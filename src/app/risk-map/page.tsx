import RiskMapView from "@/features/public/risk-map-view";

export default function RiskMapPage() {
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ?? "";

  return (
    <div className="page-container pb-8">
      <header className="pt-3">
        <p className="eyebrow">ANONYMOUS SAFETY MAP</p>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.22] tracking-[-0.055em] text-[#12304a]">
          교통위험지도
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-[#6f879f]">
          실시간 교통정보와 교통안전 데이터를 한눈에 확인하세요.
        </p>
      </header>

      <RiskMapView kakaoMapKey={kakaoMapKey} />
    </div>
  );
}
