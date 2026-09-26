import Link from "next/link";
import RecentAnalyses from "@/features/public/recent-analyses";

const steps = [
  { number: "01", title: "의심 장면 찾기", description: "긴 영상 속 검토가 필요한 구간을 타임라인으로 한눈에 살펴보세요." },
  { number: "02", title: "증거와 정보 점검", description: "예상 위반 유형과 증거 상태를 확인하고 신고 정보를 직접 고치세요." },
  { number: "03", title: "안전하게 직접 신고", description: "자료를 정리한 뒤 안전한 시점에 안전신문고에서 직접 신고하세요." },
];

export default function HomePage() {
  return (
    <div className="page-container space-y-9 pb-10 sm:space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#113247] px-6 py-9 text-white shadow-[0_20px_60px_rgba(18,55,73,0.14)] sm:px-10 sm:py-12 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 py-2 pl-2 pr-4">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#55dbc6] text-[#103246]" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9 17l11-11" /></svg>
            </span>
            <span className="text-sm font-bold tracking-tight">바로잡길 · 교통안전 신고 준비 도우미</span>
          </div>
          <p className="mb-3 text-sm font-semibold text-[#9ee8db]">복잡한 신고 준비, 한 걸음씩</p>
          <h1 className="max-w-xl text-[2.25rem] font-bold leading-[1.22] tracking-[-0.045em] sm:text-5xl">놓치기 쉬운 장면도<br />차분하게 살펴보세요</h1>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#d2e5eb] sm:text-base">블랙박스 영상과 사진에서 위반 의심 장면을 찾고, 신고에 필요한 정보를 정리해 드립니다. AI 분석은 참고용이며 최종 확인과 신고는 직접 진행합니다.</p>
          <Link href="/upload" className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#55dbc6] px-6 text-base font-bold text-[#123448] shadow-lg shadow-black/10 transition hover:bg-[#78e8d8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto">신고 자료 분석하기 <span aria-hidden="true">→</span></Link>
          <p className="mt-4 text-xs leading-5 text-[#b2ced6]">기본 설정은 체험용 모의 분석입니다. 실제 AI 분석 사용 여부는 결과 화면에서 안내합니다.</p>
        </div>
        <div className="relative z-10 mt-10 hidden lg:block" aria-hidden="true">
          <div className="ml-auto max-w-sm rotate-3 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-[#c5e5e6]"><span>분석 흐름 미리보기</span><span>3단계</span></div>
            <div className="mt-5 rounded-2xl bg-white p-5 text-[#143b4b] shadow-xl">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#438879]">AI 참고 분석</span><span className="h-2 w-2 rounded-full bg-[#48c7ae]" /></div>
              <div className="mt-5 space-y-3"><div className="h-2 w-32 rounded-full bg-[#dce9e9]" /><div className="h-2 w-48 rounded-full bg-[#edf3f2]" /><div className="flex gap-1.5 pt-3"><span className="h-10 w-1/4 rounded-md bg-[#d0efe8]" /><span className="h-10 w-1/4 rounded-md bg-[#8edbc9]" /><span className="h-10 w-1/4 rounded-md bg-[#d7ecea]" /><span className="h-10 w-1/4 rounded-md bg-[#b2e5d9]" /></div></div>
              <div className="mt-5 rounded-xl bg-[#f0f8f6] px-4 py-3 text-xs font-semibold">의심 장면을 확인해 보세요</div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="space-y-4">
        <div><p className="eyebrow">이용 방법</p><h2 id="steps-heading" className="section-heading mt-1">신고 준비를 쉽게, 판단은 신중하게</h2></div>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => <article key={step.number} className="surface-card p-5 sm:p-6"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f5f0] text-sm font-extrabold text-[#25866e]">{step.number}</span><h3 className="mt-5 text-lg font-bold text-[#183747]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#647b83]">{step.description}</p></article>)}
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-3"><div><p className="eyebrow">내 기록</p><h2 id="recent-heading" className="section-heading mt-1">최근 분석 내역</h2></div><Link href="/reports" className="shrink-0 text-sm font-bold text-[#197e70] underline-offset-4 hover:underline">전체 보기 →</Link></div>
        <RecentAnalyses />
      </section>

      <section className="grid gap-5 overflow-hidden rounded-[1.75rem] border border-[#d9e9e4] bg-[#eaf5f1] p-6 sm:p-8 md:grid-cols-[1fr_0.8fr] md:items-center" aria-labelledby="risk-teaser-heading">
        <div><p className="eyebrow">우리 동네 교통안전</p><h2 id="risk-teaser-heading" className="section-heading mt-2">교통위험지도</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#5e7780]">개인정보 없이 지역 단위로 모은 교통위험 예시를 살펴보세요. 현재 지도와 수치는 체험용 데이터입니다.</p><Link href="/risk-map" className="button-secondary mt-6 inline-flex min-h-12 items-center justify-center gap-2 px-5">지도 살펴보기 <span aria-hidden="true">→</span></Link></div>
        <div className="relative hidden h-44 overflow-hidden rounded-2xl border border-white bg-[#f8fbf7] md:block" aria-hidden="true"><div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(#d4e8e3 1px, transparent 1px), linear-gradient(90deg, #d4e8e3 1px, transparent 1px)", backgroundSize: "28px 28px" }} /><div className="absolute left-[16%] top-[30%] h-9 w-9 rounded-full border-4 border-white bg-[#ef9b77] shadow-md" /><div className="absolute left-[55%] top-[14%] h-11 w-11 rounded-full border-4 border-white bg-[#f7c777] shadow-md" /><div className="absolute left-[70%] top-[59%] h-8 w-8 rounded-full border-4 border-white bg-[#53c5ab] shadow-md" /></div>
      </section>
    </div>
  );
}
