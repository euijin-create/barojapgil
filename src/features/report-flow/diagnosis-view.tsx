"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels, type ViolationType } from "@/lib/demo-data";
import MediaPreview from "./media-preview";

const violationTypes: ViolationType[] = ["signal", "center", "cutin", "unknown"];
const analysisNotice = "AI 참고 분석이며 최종 판단은 관계기관이 수행합니다";

const reviewChecklist: Record<ViolationType, string[]> = {
  signal: ["적용 신호의 상태", "정지선과 교차로 진입 장면", "차량의 전후 이동 맥락"],
  center: ["중앙선의 종류와 위치", "선을 넘는 차량의 이동 장면", "주변 도로 상황과 예외 가능성"],
  cutin: ["차선 변경 전후의 이동", "주변 차량과의 간격", "방향지시등과 전후 맥락"],
  unknown: ["장면의 전후 맥락과 예상 유형"],
};

function AnalysisNotice() {
  return <p className="mt-3 text-xs leading-5 text-slate-500">{analysisNotice}</p>;
}

function EvidenceGroup({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "met" | "unclear" | "missing";
}) {
  const color = {
    met: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    unclear: "bg-amber-50 text-amber-700 ring-amber-100",
    missing: "bg-rose-50 text-rose-700 ring-rose-100",
  }[tone];

  return (
    <section className="surface-card p-5 sm:p-6" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${color}`}>
          {items.length}건
        </span>
      </div>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">이 단계에서 표시할 항목이 없습니다.</p>
      )}
      <AnalysisNotice />
    </section>
  );
}

function EditableFact({
  id,
  label,
  value,
  original,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  original: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-800">
          {label}
        </label>
        <span className="text-xs text-slate-500">
          {value === original ? "AI 제안 · 수정 가능" : "사용자 수정값"}
        </span>
      </div>
      <input
        id={id}
        type="text"
        className="form-input w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`${label} 확인 필요`}
      />
    </div>
  );
}

export default function DiagnosisView() {
  const {
    selectedCandidate,
    draft,
    updateDraft,
    mediaKind,
    previewUrl,
    analysisIsDemo,
  } = useDemo();
  const changedType = draft.violationType !== selectedCandidate.type;
  const evidence = changedType
    ? { met: [], unclear: reviewChecklist[draft.violationType], missing: [] }
    : selectedCandidate.evidence;
  const total = evidence.met.length + evidence.unclear.length + evidence.missing.length;
  const metPercent = total ? Math.round((evidence.met.length / total) * 100) : 0;
  const confidence = selectedCandidate.confidence <= 1
    ? Math.round(selectedCandidate.confidence * 100)
    : Math.round(selectedCandidate.confidence);
  const range = selectedCandidate.end
    ? `${selectedCandidate.start}~${selectedCandidate.end}`
    : selectedCandidate.start;

  return (
    <div className="page-container space-y-6 pt-6 pb-28 sm:pt-10">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className="rounded-full bg-teal-700 px-3 py-1 text-white">03</span>
        <span>장면 선택</span>
        <span aria-hidden="true">/</span>
        <span className="text-teal-700">증거 진단</span>
        <span aria-hidden="true">/</span>
        <span>신고 패키지</span>
      </div>

      <div>
        <p className="eyebrow">선택한 장면 자세히 보기</p>
        <h1 className="page-heading">증거를 함께 점검해요</h1>
        <p className="page-subtitle">
          AI가 정리한 정보와 부족한 장면을 확인하고, 잘못된 내용은 직접 고쳐 주세요.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <section className="surface-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-heading">선택한 핵심 장면</h2>
            <span className="badge">{range}</span>
          </div>
          <MediaPreview mediaKind={mediaKind} previewUrl={previewUrl} range={range} />
          <p className="text-xs leading-5 text-slate-500">
            {analysisIsDemo === false
              ? "업로드한 사진의 AI 참고 분석 결과입니다. 원본과 추출 정보를 직접 대조해 주세요."
              : "이 화면은 모의 분석 결과입니다. 미리보기는 선택한 원본 자료이며 별도의 핵심 구간 파일은 생성되지 않습니다."}
          </p>
          <Link href="/results" className="button-secondary inline-flex w-full items-center justify-center">
            다른 의심 장면 보기
          </Link>
        </section>

        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">AI 참고 분석</p>
              <h2 className="section-heading">예상 위반 유형</h2>
            </div>
            <span className="badge">수정 가능</span>
          </div>
          <div>
            <label htmlFor="diagnosis-type" className="mb-2 block text-sm font-bold text-slate-800">
              예상 위반 유형 선택
            </label>
            <select
              id="diagnosis-type"
              className="form-input w-full"
              value={draft.violationType}
              onChange={(event) =>
                updateDraft({ violationType: event.target.value as ViolationType })
              }
            >
              {violationTypes.map((type) => (
                <option key={type} value={type}>
                  {violationLabels[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-semibold text-slate-700">AI 분류 신뢰도</span>
              <span className="font-extrabold text-slate-900">
                {changedType ? "재평가 필요" : `${confidence}%`}
              </span>
            </div>
            {!changedType && (
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
                role="meter"
                aria-label="AI 분류 신뢰도"
                aria-valuenow={confidence}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-teal-600" style={{ width: `${confidence}%` }} />
              </div>
            )}
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {changedType
                ? `원래 AI 제안은 ${violationLabels[selectedCandidate.type]} (${confidence}%)입니다. 선택한 유형의 신뢰도는 재계산되지 않았습니다.`
                : "신뢰도는 AI 분류의 참고 수치이며 법적 판단이나 신고 결과를 뜻하지 않습니다."}
            </p>
          </div>
          <AnalysisNotice />
        </section>
      </div>

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <div>
          <p className="eyebrow">신고 핵심정보</p>
          <h2 className="section-heading">AI 제안을 직접 확인해 주세요</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <EditableFact
            id="diagnosis-plate"
            label="차량번호"
            value={draft.plate}
            original={selectedCandidate.plate}
            onChange={(plate) => updateDraft({ plate })}
          />
          <EditableFact
            id="diagnosis-time"
            label="발생 시각"
            value={draft.occurredAt}
            original={selectedCandidate.occurredAt}
            onChange={(occurredAt) => updateDraft({ occurredAt })}
          />
          <EditableFact
            id="diagnosis-location"
            label="장소"
            value={draft.location}
            original={selectedCandidate.location}
            onChange={(location) => updateDraft({ location })}
          />
        </div>
        <AnalysisNotice />
      </section>

      <section className="surface-card p-5 sm:p-6">
        <p className="eyebrow">AI 참고 분석</p>
        <h2 className="section-heading">장면을 살펴본 이유</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">{selectedCandidate.reasoning}</p>
        {changedType && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            예상 유형을 바꾸었으므로 이 근거가 현재 선택한 유형에 그대로 적용되지는 않습니다.
          </p>
        )}
        <AnalysisNotice />
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow">위반 유형별 증거 진단</p>
          <h2 className="section-heading">증거 점검 현황</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {changedType
              ? "유형이 변경되어 기존 증거 진단을 재사용하지 않습니다. 아래 확인 항목을 원본에서 살펴봐 주세요."
              : `AI가 ${total}개 확인 항목 중 ${evidence.met.length}개를 충족해 보이는 항목으로 분류했습니다.`}
          </p>
        </div>
        <div className="surface-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-800">
            <span>증거 충족도 참고</span>
            <span>{changedType ? "재점검 필요" : `${evidence.met.length}/${total}개 충족해 보임`}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${metPercent}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            체크리스트 점검 결과일 뿐 법적 증거 인정 여부나 신고 수리를 보장하지 않습니다.
          </p>
          <AnalysisNotice />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <EvidenceGroup title="충족된 증거" items={evidence.met} tone="met" />
          <EvidenceGroup title="불명확한 증거" items={evidence.unclear} tone="unclear" />
          <EvidenceGroup title="부족한 증거" items={evidence.missing} tone="missing" />
        </div>
      </section>

      <Link href="/package" className="button-primary flex w-full items-center justify-center text-center">
        신고 패키지 검토하기
      </Link>
    </div>
  );
}
