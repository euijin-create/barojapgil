import { SectionLabel } from "@/components/ui";
import { violationLabels } from "@/lib/demo-data";
import type { DemoRiskAggregateArea } from "./types";

interface RiskAreaDetailCardProps {
  area: DemoRiskAggregateArea;
  isTrafficVisible: boolean;
}

export function RiskAreaDetailCard({
  area,
  isTrafficVisible,
}: RiskAreaDetailCardProps) {
  return (
    <article
      className="rounded-2xl border border-[#cfe5f7] bg-[#edf6ff] p-5"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <SectionLabel>선택한 집계구역</SectionLabel>
          <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-[var(--navy)]">
            {area.name}
          </h2>
          <p className="mt-1 text-xs text-[#6b839a]">{area.regionLabel}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff4e4] px-2.5 py-1.5 text-[10px] font-extrabold text-[#a45e09]">
          DEMO
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/85 p-3.5">
          <dt className="text-[11px] font-bold text-[var(--ink-muted)]">
            바로잡길 신고
          </dt>
          <dd className="mt-1 text-base font-extrabold text-[var(--navy)]">
            {area.reportCount}건 <span className="text-[10px] text-[#a45e09]">DEMO</span>
          </dd>
        </div>
        <div className="rounded-xl bg-white/85 p-3.5">
          <dt className="text-[11px] font-bold text-[var(--ink-muted)]">
            주요 유형
          </dt>
          <dd className="mt-1 text-sm font-extrabold leading-5 text-[var(--navy)]">
            {violationLabels[area.primaryViolationType]} 의심
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-white/85 p-3.5">
          <dt className="text-[11px] font-bold text-[var(--ink-muted)]">
            실시간 교통
          </dt>
          <dd className="mt-1 text-sm font-extrabold text-[var(--navy)]">
            {isTrafficVisible
              ? "Kakao 지도에서 확인 중"
              : "레이어를 선택하면 확인할 수 있어요"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#607b94]">
        개별 차량번호·신고자·사진·영상·정확한 신고 위치는 표시하지 않습니다.
      </p>
    </article>
  );
}
