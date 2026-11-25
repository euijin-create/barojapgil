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
      className="rounded-2xl border border-[var(--line)] bg-white p-4"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-[#168f73]">
            선택한 집계구역
          </p>
          <h2 className="mt-1 break-keep text-lg font-extrabold tracking-[-0.03em] text-[var(--navy)]">
            {area.name}
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-[#6b839a]">
            바로잡길 비식별 신고 집계 · {area.regionLabel}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#fff4e4] px-2.5 py-1 text-xs font-extrabold text-[#a45e09]">
          DEMO
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#f7f9fb] p-3.5">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">
            바로잡길 신고
          </dt>
          <dd className="mt-1 text-lg font-extrabold text-[var(--navy)]">
            {area.reportCount}건
          </dd>
        </div>
        <div className="rounded-xl bg-[#f7f9fb] p-3.5">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">
            주요 유형
          </dt>
          <dd className="mt-1 text-sm font-extrabold leading-5 text-[var(--navy)]">
            {violationLabels[area.primaryViolationType]} 의심
          </dd>
        </div>
        <div className="col-span-2 rounded-xl bg-[#f7f9fb] p-3.5">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">
            실시간 교통
          </dt>
          <dd className="mt-1 text-sm font-extrabold text-[var(--navy)]">
            {isTrafficVisible
              ? "Kakao 지도에서 확인 중"
              : "레이어를 선택하면 확인할 수 있어요"}
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-xl bg-[#f0faf7] px-3.5 py-2.5 text-xs font-semibold leading-5 text-[#4d746b]">
        개별 차량번호·신고자·사진·영상·정확한 신고 위치는 표시하지 않습니다.
      </p>
    </article>
  );
}
