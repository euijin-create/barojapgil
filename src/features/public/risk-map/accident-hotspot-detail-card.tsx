import type { AccidentHotspot } from "@/contracts/accident-hotspots";
import { SectionLabel } from "@/components/ui";

interface AccidentHotspotDetailCardProps {
  hotspot: AccidentHotspot;
}

const hotspotTypeLabel = {
  SIGNAL_VIOLATION: "신호위반 사고다발지역",
  CENTER_LINE_VIOLATION: "중앙선 침범 사고다발지역",
  GENERAL: "법규위반 사고다발지역",
} as const;

export function AccidentHotspotDetailCard({
  hotspot,
}: AccidentHotspotDetailCardProps) {
  return (
    <article
      className="rounded-2xl border border-[#efd8b4] bg-[#fff8ed] p-5"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel tone="orange">선택한 사고다발지역</SectionLabel>
          <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-[var(--navy)]">
            {hotspotTypeLabel[hotspot.violationType]}
          </h2>
          <p className="mt-1 text-xs font-semibold text-[#6b839a]">
            한국도로교통공단 TAAS · 공식 데이터
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-[#a45e09]">
          공식
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-white/90 p-3.5">
        <p className="text-xs font-bold text-[var(--ink-muted)]">
          {hotspot.district}
        </p>
        <p className="mt-1 break-words text-sm font-extrabold leading-6 text-[var(--navy)]">
          {hotspot.name}
        </p>
      </div>

      <dl className="mt-2 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/90 p-3">
          <dt className="text-[10px] font-bold text-[var(--ink-muted)]">
            사고 발생
          </dt>
          <dd className="mt-1 text-base font-extrabold text-[var(--navy)]">
            {hotspot.occurrenceCount}건
          </dd>
        </div>
        <div className="rounded-xl bg-white/90 p-3">
          <dt className="text-[10px] font-bold text-[var(--ink-muted)]">
            사상자
          </dt>
          <dd className="mt-1 text-base font-extrabold text-[var(--navy)]">
            {hotspot.casualtyCount}명
          </dd>
        </div>
        <div className="rounded-xl bg-white/90 p-3">
          <dt className="text-[10px] font-bold text-[var(--ink-muted)]">
            기준연도
          </dt>
          <dd className="mt-1 text-base font-extrabold text-[var(--navy)]">
            {hotspot.dataYear}
          </dd>
        </div>
      </dl>

      <details className="mt-2 rounded-xl bg-white/90 px-3.5 py-3 text-sm">
        <summary className="cursor-pointer font-extrabold text-[#526f88]">
          인명피해 자세히 보기
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--ink-muted)]">사망</dt>
            <dd className="font-extrabold text-[var(--navy)]">
              {hotspot.deathCount}명
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--ink-muted)]">중상</dt>
            <dd className="font-extrabold text-[var(--navy)]">
              {hotspot.seriousInjuryCount}명
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--ink-muted)]">경상</dt>
            <dd className="font-extrabold text-[var(--navy)]">
              {hotspot.minorInjuryCount}명
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--ink-muted)]">부상신고</dt>
            <dd className="font-extrabold text-[var(--navy)]">
              {hotspot.reportedInjuryCount}명
            </dd>
          </div>
        </dl>
      </details>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#7f6846]">
        과거 교통사고 통계를 기반으로 선정된 사고다발지역입니다.
      </p>
    </article>
  );
}
