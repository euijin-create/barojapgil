"use client";

import { useState } from "react";
import { InfoCard } from "@/components/ui/info-card";
import { SectionLabel } from "@/components/ui/section-label";
import { useDemo } from "@/features/demo/demo-context";
import { RISK_AREAS, violationLabels } from "@/lib/demo-data";

type Area = (typeof RISK_AREAS)[number];
type AreaType = Area["type"];
type Filter = "all" | AreaType;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "signal", label: "신호위반" },
  { value: "center", label: "중앙선 침범" },
  { value: "cutin", label: "위험 끼어들기" },
];

const levelClasses: Record<
  Area["level"],
  { zone: string; selected: string; badge: string }
> = {
  높음: {
    zone: "border-[#e88c78] bg-[#f5b3a3]/85 text-[#7f3425]",
    selected: "ring-[#df8068]/35",
    badge: "bg-[#fbece7] text-[#9e4c39]",
  },
  보통: {
    zone: "border-[#ebb868] bg-[#f7d28f]/90 text-[#765017]",
    selected: "ring-[#eab65e]/35",
    badge: "bg-[#fff3dd] text-[#92611b]",
  },
  낮음: {
    zone: "border-[#68bea6] bg-[#a9dfce]/90 text-[#236b57]",
    selected: "ring-[#67bca5]/35",
    badge: "bg-[#e7f5ef] text-[#327e68]",
  },
};

const privateDataItems = [
  "차량번호",
  "신고자 개인정보",
  "원본 사진·영상",
  "개별 신고자의 이동경로",
];

function MapArtwork() {
  return (
    <svg
      viewBox="0 0 376 340"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="376" height="340" fill="#edf4f8" />
      <path
        d="M-24 215C65 172 106 248 181 221C252 195 298 134 405 154"
        fill="none"
        stroke="#d5eaf7"
        strokeWidth="48"
      />
      <path
        d="M-24 215C65 172 106 248 181 221C252 195 298 134 405 154"
        fill="none"
        stroke="#c5e0f1"
        strokeWidth="2"
      />
      <path d="M35 10 111 350" stroke="#ffffff" strokeWidth="22" />
      <path d="M-10 91 386 282" stroke="#ffffff" strokeWidth="18" />
      <path d="M145 -10 279 350" stroke="#ffffff" strokeWidth="14" />
      <path d="M-20 302 393 65" stroke="#ffffff" strokeWidth="13" />
      <path d="M5 44 367 102" stroke="#dfe8ed" strokeWidth="5" />
      <path d="M2 274 359 315" stroke="#dfe8ed" strokeWidth="5" />
      <path d="M208 6 34 326" stroke="#dfe8ed" strokeWidth="4" />
      <path d="M306 0 370 340" stroke="#dfe8ed" strokeWidth="4" />
      <rect x="17" y="118" width="65" height="42" rx="14" fill="#dff1e7" />
      <rect x="269" y="247" width="76" height="54" rx="16" fill="#dff1e7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 3.5 19 6v5.2c0 4.4-2.9 7.7-7 9.3-4.1-1.6-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="m8.7 12 2.1 2.1 4.5-4.7" />
    </svg>
  );
}

export default function RiskMapView() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    RISK_AREAS[0]?.id ?? null,
  );
  const { riskConsent, setRiskConsent } = useDemo();

  const visibleAreas =
    filter === "all"
      ? RISK_AREAS
      : RISK_AREAS.filter((area) => area.type === filter);
  const selected =
    visibleAreas.find((area) => area.id === selectedId) ?? visibleAreas[0];

  function selectFilter(nextFilter: Filter) {
    const nextAreas =
      nextFilter === "all"
        ? RISK_AREAS
        : RISK_AREAS.filter((area) => area.type === nextFilter);

    setFilter(nextFilter);
    setSelectedId(nextAreas[0]?.id ?? null);
  }

  return (
    <div className="mt-8 space-y-7">
      <section aria-labelledby="risk-filter-heading">
        <h2 id="risk-filter-heading" className="sr-only">
          예상 위반 유형 필터
        </h2>
        <div
          className="grid grid-cols-2 gap-2"
          role="group"
          aria-label="예상 위반 유형 필터"
        >
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => selectFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`min-h-11 rounded-full border px-3 text-sm font-extrabold transition-colors ${
                filter === item.value
                  ? "border-[#2f80ed] bg-[#2f80ed] text-white"
                  : "border-[#dce7f1] bg-white text-[#607b94] hover:border-[#aacff5] hover:bg-[#f5faff]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="map-heading">
        <div className="overflow-hidden rounded-2xl border border-[#d5e3ec] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e3ebf1] px-4 py-3.5">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.06em] text-[#2f80ed]">
                AREA AGGREGATION
              </p>
              <h2
                id="map-heading"
                className="mt-1 text-[15px] font-extrabold text-[#12304a]"
              >
                비식별 집계 구역
              </h2>
            </div>
            <span className="rounded-full bg-[#edf6ff] px-3 py-1.5 text-[11px] font-extrabold text-[#2569bc]">
              DEMO
            </span>
          </div>

          <div
            className="relative h-[340px] overflow-hidden"
            aria-label="교통위반 의심 건수를 넓은 구역 단위로 표시한 데모 지도"
          >
            <MapArtwork />
            <div className="absolute left-3 top-3 rounded-lg border border-white bg-white/90 px-3 py-2 text-[11px] font-bold text-[#617b94]">
              개별 위치가 아닌 구역 단위예요
            </div>

            {visibleAreas.map((area) => {
              const isSelected = selected?.id === area.id;
              const levelStyle = levelClasses[area.level];

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setSelectedId(area.id)}
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                  aria-label={`${area.name}, ${violationLabels[area.type]} 의심 ${area.count}건의 데모 집계 구역`}
                  aria-pressed={isSelected}
                  className={`absolute z-10 flex h-16 w-[5.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[45%] border-2 text-center shadow-[0_3px_10px_rgba(18,48,74,0.08)] transition-transform hover:scale-105 ${levelStyle.zone} ${
                    isSelected
                      ? `scale-105 ring-4 ${levelStyle.selected}`
                      : ""
                  }`}
                >
                  <strong className="text-base leading-none">{area.count}건</strong>
                  <span className="mt-1 text-[10px] font-extrabold">집계 구역</span>
                </button>
              );
            })}

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-4 rounded-xl border border-white bg-white/90 px-3 py-2 text-[10px] font-bold text-[#617b94]">
              {(Object.keys(levelClasses) as Area["level"][]).map((level) => (
                <span key={level} className="flex items-center gap-1.5">
                  <i
                    className={`h-2.5 w-2.5 rounded-full border ${levelClasses[level].zone}`}
                    aria-hidden="true"
                  />
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-[#7890a8]">
          표시된 범위와 수치는 개별 신고 지점이 아닌 구역 단위의 데모 집계입니다.
        </p>
      </section>

      {selected ? (
        <article
          className="rounded-2xl border border-[#d5e8fb] bg-[#edf6ff] p-5"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SectionLabel>선택한 집계 구역</SectionLabel>
              <h2 className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-[#12304a]">
                {selected.name}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#6b839a]">
                {selected.region} · 정밀 위치 비공개
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${levelClasses[selected.level].badge}`}
            >
              참고 {selected.level}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white bg-white/80 p-3.5">
              <dt className="text-[11px] font-bold text-[#7890a8]">
                예상 유형
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-[#294a65]">
                {violationLabels[selected.type]} 의심
              </dd>
            </div>
            <div className="rounded-xl border border-white bg-white/80 p-3.5">
              <dt className="text-[11px] font-bold text-[#7890a8]">
                데모 집계
              </dt>
              <dd className="mt-1 text-sm font-extrabold text-[#294a65]">
                {selected.count}건
              </dd>
            </div>
          </dl>
        </article>
      ) : null}

      <section aria-labelledby="area-list-heading">
        <h2
          id="area-list-heading"
          className="text-lg font-extrabold tracking-[-0.035em] text-[#12304a]"
        >
          표시 중인 지역
        </h2>
        <div className="mt-3 space-y-2">
          {visibleAreas.map((area) => {
            const isSelected = selected?.id === area.id;

            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setSelectedId(area.id)}
                aria-pressed={isSelected}
                className={`flex min-h-[72px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-[#9fcaf5] bg-[#f3f9ff]"
                    : "border-[#dce7f1] bg-white hover:bg-[#f8fbfe]"
                }`}
              >
                <span className="min-w-0">
                  <strong className="block text-sm font-extrabold text-[#294a65]">
                    {area.name}
                  </strong>
                  <span className="mt-1 block text-xs text-[#7890a8]">
                    {violationLabels[area.type]} 의심
                  </span>
                </span>
                <span className="shrink-0 text-sm font-extrabold text-[#2f80ed]">
                  {area.count}건
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="rounded-2xl border border-[#ccecdf] bg-[#e7f8f3] p-5"
        aria-labelledby="privacy-heading"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#168f73]">
            <ShieldIcon />
          </span>
          <div className="min-w-0">
            <h2
              id="privacy-heading"
              className="text-base font-extrabold text-[#12304a]"
            >
              지도에 표시하지 않는 정보
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#5f7f77]">
              공개 화면에는 개인이나 개별 신고를 식별할 수 있는 정보를 사용하지 않아요.
            </p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-2">
          {privateDataItems.map((item) => (
            <li
              key={item}
              className="flex min-h-12 items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-xs font-bold leading-5 text-[#416b63]"
            >
              <span className="text-[#26b894]" aria-hidden="true">
                ×
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-2xl border border-[#dce7f1] bg-white p-5"
        aria-labelledby="risk-consent-heading"
      >
        <h2
          id="risk-consent-heading"
          className="text-base font-extrabold text-[#12304a]"
        >
          지도 데이터 제공 동의
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#617b94]">
          별도 동의를 선택한 자료만 향후 비식별 구역 통계에 반영할 수 있도록 설계했어요. 현재 데모에서는 어떤 자료도 전송하지 않습니다.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce7f1] bg-[#f7f9fb] p-4">
          <input
            type="checkbox"
            checked={riskConsent}
            onChange={(event) => setRiskConsent(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#2f80ed]"
          />
          <span className="text-sm font-bold leading-6 text-[#294a65]">
            내 신고 자료를 비식별 교통위험 집계에 제공하는 데 동의합니다{" "}
            <span className="font-normal text-[#7890a8]">(선택)</span>
          </span>
        </label>
      </section>

      <InfoCard tone="orange" title="데모 안내">
        지도 데이터는 데모용 예시입니다.
      </InfoCard>
    </div>
  );
}
