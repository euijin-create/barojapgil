import RiskMapView from "@/features/public/risk-map-view";

export default function RiskMapPage() {
  return (
    <div className="page-container pb-8">
      <header className="pt-3">
        <p className="eyebrow">ANONYMOUS SAFETY MAP</p>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.22] tracking-[-0.055em] text-[#12304a]">
          교통위험지도
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-[#6f879f]">
          비식별화된 교통위반 데이터를 바탕으로
          <br />
          반복적으로 위험 상황이 발생하는 지역을 확인해요.
        </p>
      </header>

      <RiskMapView />
    </div>
  );
}
