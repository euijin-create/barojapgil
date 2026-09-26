"use client";

import { useState } from "react";
import { useDemo } from "@/features/demo/demo-context";
import { RISK_AREAS, violationLabels } from "@/lib/demo-data";

type AreaType = (typeof RISK_AREAS)[number]["type"];
type Filter = "all" | AreaType;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "signal", label: "신호위반" },
  { value: "center", label: "중앙선 침범" },
  { value: "cutin", label: "위험 끼어들기" },
];

const levelClasses: Record<(typeof RISK_AREAS)[number]["level"], { marker: string; badge: string }> = {
  높음: { marker: "bg-[#df8068]", badge: "bg-[#fbece7] text-[#9e4c39]" },
  보통: { marker: "bg-[#eab65e]", badge: "bg-[#fff3dd] text-[#92611b]" },
  낮음: { marker: "bg-[#67bca5]", badge: "bg-[#e7f5ef] text-[#327e68]" },
};

export default function RiskMapView() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(RISK_AREAS[0]?.id ?? null);
  const { riskConsent, setRiskConsent } = useDemo();
  const visibleAreas = filter === "all" ? RISK_AREAS : RISK_AREAS.filter((area) => area.type === filter);
  const selected = visibleAreas.find((area) => area.id === selectedId) ?? visibleAreas[0];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#d4e9e5] bg-[#eef8f5] p-4 text-sm leading-6 text-[#456d70]">
        <span className="font-bold text-[#187669]">체험용 안내</span> · 현재 지도는 실제 위치 데이터나 외부 지도 서비스를 사용하지 않습니다. 점과 수치는 가상의 지역 단위 집계 예시이며 개별 사건, 차량번호, 원본 영상은 표시하지 않습니다.
      </div>

      <section aria-labelledby="risk-filter-heading" className="space-y-3">
        <h2 id="risk-filter-heading" className="section-heading">유형별로 살펴보기</h2>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="예상 위반 유형 필터">
          {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-[#267f74] ${filter === item.value ? "border-[#1e806e] bg-[#1e806e] text-white" : "border-[#dce7e5] bg-white text-[#526f78] hover:border-[#8fcbb9]"}`}>{item.label}</button>)}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]" aria-label="지역별 집계 예시">
        <div className="surface-card overflow-hidden p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between px-1"><span className="text-sm font-bold text-[#264858]">가상 지역 분포</span><span className="text-xs text-[#789198]">실제 지도 아님</span></div>
          <div className="relative h-[22rem] overflow-hidden rounded-2xl border border-[#dfece7] bg-[#eef5ed] sm:h-[26rem]" aria-label="가상 교통위험 지역 표시">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(#d8e8e1 1px, transparent 1px), linear-gradient(90deg, #d8e8e1 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
            <div className="absolute -left-[20%] top-[49%] h-5 w-[140%] -rotate-[18deg] bg-white/85 shadow-sm" aria-hidden="true" />
            <div className="absolute left-[34%] -top-[18%] h-[140%] w-5 rotate-[27deg] bg-white/85 shadow-sm" aria-hidden="true" />
            <div className="absolute -left-[10%] top-[21%] h-3 w-[120%] rotate-[14deg] bg-white/70" aria-hidden="true" />
            <div className="absolute left-4 top-4 rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-[#5f7a80] shadow-sm">넓은 지역 단위 표시</div>
            {visibleAreas.map((area) => <button key={area.id} type="button" onClick={() => setSelectedId(area.id)} style={{ left: `${area.x}%`, top: `${area.y}%` }} aria-label={`${area.name}, ${violationLabels[area.type]} 의심 집계 예시 ${area.count}건`} aria-pressed={selected?.id === area.id} className={`absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white text-xs font-bold text-white shadow-[0_4px_15px_rgba(25,64,74,0.22)] transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174c65] ${levelClasses[area.level].marker} ${selected?.id === area.id ? "h-13 w-13 ring-4 ring-[#1e806e]/25" : "h-11 w-11"}`}>{area.count}</button>)}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-white/90 px-3 py-2 text-[11px] text-[#627e83]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#df8068]" />높음</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#eab65e]" />보통</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#67bca5]" />낮음</span><span className="ml-auto">모든 값은 가상 예시</span></div>
          </div>
        </div>
        <div className="space-y-3">
          {selected && <article className="surface-card p-5" aria-live="polite"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-bold text-[#1e806e]">선택한 지역</span><h2 className="mt-1 text-xl font-bold text-[#173c4e]">{selected.name}</h2></div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${levelClasses[selected.level].badge}`}>참고 수준 {selected.level}</span></div><p className="mt-2 text-sm text-[#6b8288]">{selected.region} · 정밀 위치 비공개</p><div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#f1f7f5] p-3"><span className="block text-xs text-[#6b8188]">예상 유형</span><strong className="mt-1 block text-sm text-[#234c57]">{violationLabels[selected.type]}</strong></div><div className="rounded-xl bg-[#f1f7f5] p-3"><span className="block text-xs text-[#6b8188]">가상 집계</span><strong className="mt-1 block text-sm text-[#234c57]">{selected.count}건</strong></div></div><p className="mt-4 text-xs leading-5 text-[#819197]">AI 참고 분석 형식을 보여 주는 체험용 데이터이며 실제 위험도나 위법 여부를 확정하지 않습니다.</p></article>}
          <div className="surface-card p-5"><h2 className="text-sm font-bold text-[#264858]">표시 중인 지역</h2><div className="mt-3 space-y-2">{visibleAreas.map((area) => <button key={area.id} type="button" onClick={() => setSelectedId(area.id)} className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${selected?.id === area.id ? "border-[#86c6b5] bg-[#f0f8f4]" : "border-[#e4eeeb] bg-white hover:bg-[#f7fbf9]"}`}><span className="min-w-0 truncate font-semibold text-[#365862]">{area.name}</span><span className="shrink-0 text-xs text-[#758b8e]">{violationLabels[area.type]} · {area.count}건</span></button>)}</div></div>
        </div>
      </section>

      <section className="surface-card p-5" aria-labelledby="risk-consent-heading"><h2 id="risk-consent-heading" className="text-base font-bold text-[#173c4e]">지도 데이터 제공 동의</h2><p className="mt-2 text-sm leading-6 text-[#607b80]">별도 동의를 선택한 경우에만 향후 비식별 집계에 반영할 수 있도록 설계했습니다. 이 체험판에서는 동의 상태만 화면에 표시하며 실제 자료를 전송하지 않습니다.</p><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1ece8] bg-[#f8fbf9] p-4"><input type="checkbox" checked={riskConsent} onChange={(event) => setRiskConsent(event.target.checked)} className="mt-1 h-4 w-4 accent-[#1e806e]" /><span className="text-sm font-semibold leading-6 text-[#31535d]">내 신고 자료를 비식별 교통위험 집계에 제공하는 데 동의합니다 <span className="font-normal text-[#708890]">(선택)</span></span></label><p className="mt-3 text-xs text-[#82949a]">언제든 체크를 해제할 수 있습니다. 현재는 새로고침 시 상태가 초기화됩니다.</p></section>
    </div>
  );
}
