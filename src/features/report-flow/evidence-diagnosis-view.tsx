"use client";

import {
  InfoCard,
  PrimaryButton,
  SectionLabel,
  StatusBadge,
} from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels, type ViolationType } from "@/lib/demo-data";

const AI_DIAGNOSIS_NOTICE =
  "AI 참고 진단이며 실제 접수·처분 여부는 관계기관이 판단합니다.";
const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

type DiagnosisStatus = "clear" | "uncertain" | "missing";

interface DiagnosisItem {
  id: string;
  title: string;
  description: string;
  status: DiagnosisStatus;
}

const TYPE_GUIDANCE: Record<ViolationType, string> = {
  signal:
    "적용 신호 상태, 정지선·교차로 진입 장면, 대상 차량의 식별 연속성과 전후 맥락을 원본에서 확인해 주세요.",
  center:
    "중앙선의 종류와 위치, 선을 넘는 이동 장면, 대상 차량의 식별 연속성과 도로 상황을 원본에서 확인해 주세요.",
  cutin:
    "차선과 이동 경로, 전후 차량 간격, 급격한 진입 정황과 전후 맥락을 원본에서 확인해 주세요.",
  unknown:
    "예상 유형을 판단하기 어려운 상태입니다. 장면의 전후 맥락과 차량 움직임을 원본에서 다시 확인해 주세요.",
};

const STATUS_META: Record<
  DiagnosisStatus,
  {
    label: string;
    tone: "mint" | "orange" | "neutral";
    cardClassName: string;
    markClassName: string;
  }
> = {
  clear: {
    label: "✓ 충족",
    tone: "mint",
    cardClassName: "border-[#ccecdf] bg-[#f5fcf9]",
    markClassName: "bg-[var(--mint-soft)] text-[var(--mint-dark)]",
  },
  uncertain: {
    label: "△ 불명확",
    tone: "orange",
    cardClassName: "border-[#f3dfbd] bg-[#fffbf4]",
    markClassName: "bg-[var(--orange-soft)] text-[#a45e09]",
  },
  missing: {
    label: "× 부족",
    tone: "neutral",
    cardClassName: "border-[#e4dfe3] bg-[#fbf8fa]",
    markClassName: "bg-[#f5eaef] text-[#a34b67]",
  },
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function providerDiagnosisItems(
  result: NonNullable<ReturnType<typeof useDemo>["imageAnalysisResult"]>,
): DiagnosisItem[] {
  const items = result.evidenceItems.map((item, index) => ({
    id: `provider-${index}-${item.status}`,
    title: item.name,
    description: item.description,
    status:
      item.status === "CLEAR"
        ? ("clear" as const)
        : item.status === "UNCERTAIN"
          ? ("uncertain" as const)
          : ("missing" as const),
  }));
  const describedMissingEvidence = new Set(
    items
      .filter((item) => item.status === "missing")
      .map((item) => normalizeText(item.description)),
  );

  result.missingEvidence.forEach((description, index) => {
    if (describedMissingEvidence.has(normalizeText(description))) return;
    items.push({
      id: `provider-extra-missing-${index}`,
      title: `추가로 필요한 증거 ${index + 1}`,
      description,
      status: "missing",
    });
  });

  return items;
}

function demoDiagnosisItems(
  evidence: ReturnType<typeof useDemo>["selectedCandidate"]["evidence"],
): DiagnosisItem[] {
  return [
    ...evidence.met.map((description, index) => ({
      id: `demo-clear-${index}`,
      title: `확인된 예시 장면 ${index + 1}`,
      description,
      status: "clear" as const,
    })),
    ...evidence.unclear.map((description, index) => ({
      id: `demo-uncertain-${index}`,
      title: `추가 확인이 필요한 예시 장면 ${index + 1}`,
      description,
      status: "uncertain" as const,
    })),
    ...evidence.missing.map((description, index) => ({
      id: `demo-missing-${index}`,
      title: `부족한 예시 장면 ${index + 1}`,
      description,
      status: "missing" as const,
    })),
  ];
}

function EvidenceItemCard({ item }: { item: DiagnosisItem }) {
  const meta = STATUS_META[item.status];

  return (
    <li
      className={`rounded-2xl border p-4 ${meta.cardClassName}`}
      aria-label={`${meta.label}: ${item.title}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base font-extrabold ${meta.markClassName}`}
          aria-hidden="true"
        >
          {item.status === "clear" ? "✓" : item.status === "uncertain" ? "△" : "×"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold leading-6 text-[var(--navy)]">
              {item.title}
            </h3>
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#617b94]">
            {item.description}
          </p>
        </div>
      </div>
    </li>
  );
}

export function EvidenceDiagnosisView() {
  const {
    selectedCandidate,
    imageAnalysisResult,
    analysisIsDemo,
    mediaKind,
    draft,
  } = useDemo();
  const usesProviderResult =
    mediaKind === "image" && imageAnalysisResult !== null;
  const items = usesProviderResult
    ? providerDiagnosisItems(imageAnalysisResult)
    : demoDiagnosisItems(selectedCandidate.evidence);
  const counts = {
    clear: items.filter((item) => item.status === "clear").length,
    uncertain: items.filter((item) => item.status === "uncertain").length,
    missing: items.filter((item) => item.status === "missing").length,
  };
  const totalCount = items.length;
  const score = totalCount > 0
    ? Math.floor((counts.clear / totalCount) * 100)
    : 0;
  const overallStatus =
    totalCount === 0
      ? "진단 항목 확인 필요"
      : counts.missing > 0
        ? "증거 보강 필요"
        : counts.uncertain > 0
          ? "추가 확인 필요"
          : "확인된 항목 중심";
  const isDemoSource = analysisIsDemo !== false;
  const reviewType = draft.violationType;
  const changedType = reviewType !== selectedCandidate.type;

  return (
    <div className="page-container space-y-6 pb-10 pt-4">
      <section className="overflow-hidden rounded-2xl bg-[var(--navy)] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge tone="blue">AI 참고 진단</StatusBadge>
          <StatusBadge
            tone={counts.missing > 0 || totalCount === 0 ? "orange" : "mint"}
          >
            {overallStatus}
          </StatusBadge>
        </div>

        <SectionLabel className="mt-7 text-[#9fc9f7]">
          증거 점검 결과
        </SectionLabel>
        <h1 className="mt-2 text-[29px] font-extrabold leading-[1.28] tracking-[-0.05em]">
          신고 증거 충족도
        </h1>

        <div className="mt-7 rounded-xl border border-white/15 bg-white/8 p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#bcd0e0]">0~100 참고 점수</p>
              <p className="mt-1 text-sm font-semibold text-[#e1ebf3]">
                {violationLabels[reviewType]} 기준 확인 자료
              </p>
            </div>
            <strong className="text-4xl font-extrabold tabular-nums">
              {score}
              <span className="ml-1 text-base text-[#bcd0e0]">/100</span>
            </strong>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
            role="meter"
            aria-label="신고 증거 충족도 참고 점수"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#68d4b8] transition-[width] duration-500"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-[#c7d8e5]">
            {totalCount > 0
              ? `참고 점수 = 충족 ${counts.clear}개 ÷ 전체 진단 ${totalCount}개 × 100 (소수점 이하 내림). 불명확·부족 항목은 충족 점수에 포함하지 않았어요.`
              : "진단할 증거 항목이 없어 참고 점수는 0점으로 표시했어요."}
            {" "}AI가 화면 안에서 계산한 참고 점수이며 공식기관의 신고 가능
            여부를 뜻하지 않습니다.
          </p>
        </div>
      </section>

      <InfoCard tone="blue" title="판단 주체 안내">
        {AI_DIAGNOSIS_NOTICE}
      </InfoCard>

      {isDemoSource ? (
        <InfoCard tone="orange" title="데모 증거 진단">
          {MOCK_ANALYSIS_NOTICE}{" "}
          {usesProviderResult
            ? "구조화된 데모 응답의 증거 항목을 그대로 표시했어요."
            : "선택한 체험용 후보의 증거 문구를 상태별 항목으로 변환했어요."}
        </InfoCard>
      ) : null}

      {changedType ? (
        <InfoCard tone="orange" title="예상 유형을 변경했어요">
          현재 증거 항목은 원래 AI 제안에서 가져온 값이며, 변경한 유형에 맞춰
          재분석한 결과가 아니에요. 원본 자료와 아래 참고 관찰 항목을 다시
          확인해 주세요.
        </InfoCard>
      ) : null}

      <section className="surface-card p-5" aria-labelledby="evidence-summary-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.07em] text-[var(--primary)]">
              상태별 요약
            </p>
            <h2
              id="evidence-summary-title"
              className="mt-1 text-lg font-extrabold text-[var(--navy)]"
            >
              확인된 증거 항목
            </h2>
          </div>
          <StatusBadge tone="neutral">
            {usesProviderResult ? "구조화 AI 응답 기반" : "데모 변환"}
          </StatusBadge>
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-[var(--mint-soft)] p-3 text-center">
            <dt className="text-[11px] font-extrabold text-[var(--mint-dark)]">
              ✓ 충족
            </dt>
            <dd className="mt-1 text-xl font-extrabold text-[var(--navy)]">
              {counts.clear}
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--orange-soft)] p-3 text-center">
            <dt className="text-[11px] font-extrabold text-[#a45e09]">
              △ 불명확
            </dt>
            <dd className="mt-1 text-xl font-extrabold text-[var(--navy)]">
              {counts.uncertain}
            </dd>
          </div>
          <div className="rounded-xl bg-[#f5eaef] p-3 text-center">
            <dt className="text-[11px] font-extrabold text-[#a34b67]">
              × 부족
            </dt>
            <dd className="mt-1 text-xl font-extrabold text-[var(--navy)]">
              {counts.missing}
            </dd>
          </div>
        </dl>
      </section>

      <InfoCard
        tone="neutral"
        title={`${violationLabels[reviewType]} 참고 관찰 항목`}
      >
        {TYPE_GUIDANCE[reviewType]} 이 목록은 법적 요건의 확정 목록이 아니며,
        AI 응답에 없는 항목은 충족으로 추가하지 않았어요.
      </InfoCard>

      <section aria-labelledby="evidence-detail-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold tracking-[0.07em] text-[var(--primary)]">
              항목별 설명
            </p>
            <h2
              id="evidence-detail-title"
              className="mt-1 text-lg font-extrabold text-[var(--navy)]"
            >
              무엇이 보이고 부족한지 확인해요
            </h2>
          </div>
          <span className="text-xs font-bold text-[var(--ink-muted)]">
            총 {totalCount}개
          </span>
        </div>

        {items.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <EvidenceItemCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <InfoCard tone="orange" title="진단 항목이 없어요" className="mt-4">
            AI가 확인한 증거 항목이 없습니다. 원본 자료를 직접 살펴보고 필요한
            장면을 보강해 주세요.
          </InfoCard>
        )}
      </section>

      <p className="rounded-xl bg-[#f3f6f9] px-4 py-3 text-xs font-semibold leading-5 text-[#667f96]">
        {AI_DIAGNOSIS_NOTICE}
      </p>

      <PrimaryButton
        href="/package"
        fullWidth
        trailingIcon={<span aria-hidden="true">→</span>}
      >
        AI 신고서 만들기
      </PrimaryButton>
    </div>
  );
}

export default EvidenceDiagnosisView;
