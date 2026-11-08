"use client";

import {
  InfoCard,
  PrimaryButton,
  StatusBadge,
} from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels } from "@/lib/demo-data";

const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

function confidencePercent(value: number) {
  const normalized = value <= 1 ? value * 100 : value;
  return Math.round(Math.max(0, Math.min(100, normalized)));
}

function displayViolationType(type: keyof typeof violationLabels) {
  return type === "unknown" ? "판단 어려움" : `${violationLabels[type]} 의심`;
}

function AnalysisFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#e6edf3] py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-[var(--ink-muted)]">
          {label}
        </span>
        <span className="max-w-[64%] text-right text-sm font-extrabold leading-6 text-[var(--navy)]">
          {value || "확인 필요"}
        </span>
      </div>
      <p className="mt-1 text-right text-[11px] font-semibold text-[#7f96ab]">
        AI 추출 정보 · 직접 확인 필요
      </p>
    </div>
  );
}

export default function DiagnosisView() {
  const { selectedCandidate, imageAnalysisResult, analysisIsDemo } = useDemo();
  const confidence = confidencePercent(selectedCandidate.confidence);
  const needsMoreReview =
    selectedCandidate.type === "unknown" ||
    confidence < 70 ||
    imageAnalysisResult?.needsTemporalEvidence === true;
  const occurredAt =
    selectedCandidate.occurredAt.trim().replace("T", " ") || "확인 필요";

  return (
    <div className="page-container space-y-6 pb-10 pt-4">
      <section className="overflow-hidden rounded-2xl bg-[var(--navy)] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge tone="blue">AI 증거 진단</StatusBadge>
          <StatusBadge tone={needsMoreReview ? "orange" : "mint"}>
            {needsMoreReview ? "추가 확인 필요" : "신고 검토 가능"}
          </StatusBadge>
        </div>

        <h1 className="mt-7 text-[29px] font-extrabold leading-[1.28] tracking-[-0.05em]">
          신고에 필요한 정보를
          <br />
          확인했어요.
        </h1>

        <div className="mt-8 rounded-xl border border-white/15 bg-white/8 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#bcd0e0]">
                AI 분류 참고 신뢰도
              </p>
              <p className="mt-1 text-sm text-[#dce8f1]">
                법적 판단이나 신고 결과를 뜻하지 않아요.
              </p>
            </div>
            <strong className="text-3xl font-extrabold">{confidence}%</strong>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
            role="meter"
            aria-label="AI 분류 참고 신뢰도"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#68d4b8]"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </section>

      {analysisIsDemo !== false ? (
        <InfoCard tone="orange" title="체험용 예시 결과">
          {MOCK_ANALYSIS_NOTICE}
        </InfoCard>
      ) : null}

      {imageAnalysisResult?.needsTemporalEvidence ? (
        <InfoCard tone="orange" title="이동 과정 확인이 필요해요">
          사진 한 장에서는 차량의 이전·이후 움직임을 확인할 수 없습니다.
          영상이나 전후 장면을 추가로 확인해주세요.
        </InfoCard>
      ) : null}

      <section className="surface-card px-5 py-2" aria-labelledby="ai-facts-title">
        <div className="border-b border-[#e6edf3] py-4">
          <p className="text-xs font-extrabold tracking-[0.07em] text-[var(--primary)]">
            AI 참고 정보
          </p>
          <h2 id="ai-facts-title" className="mt-1 text-lg font-extrabold text-[var(--navy)]">
            신고 핵심정보
          </h2>
        </div>
        <AnalysisFact
          label="예상 위반 유형"
          value={displayViolationType(selectedCandidate.type)}
        />
        <AnalysisFact label="차량번호 후보" value={selectedCandidate.plate} />
        <AnalysisFact label="촬영 시각" value={occurredAt} />
        <AnalysisFact label="발생 장소" value={selectedCandidate.location} />
      </section>

      <InfoCard tone="blue" title="AI 참고 분석">
        AI가 제안한 차량번호, 시각, 장소와 예상 유형은 부정확할 수 있어요.
        다음 단계에서 실제 자료와 대조해 직접 선택하거나 수정해주세요. 최종
        위법 판단은 관계기관이 수행합니다.
      </InfoCard>

      <PrimaryButton
        href="/diagnosis?step=review"
        fullWidth
        trailingIcon={<span aria-hidden="true">→</span>}
      >
        예상 유형 수정·확인하기
      </PrimaryButton>
    </div>
  );
}
