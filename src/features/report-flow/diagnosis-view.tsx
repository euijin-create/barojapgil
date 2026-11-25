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
          <StatusBadge tone="blue">AI 1차 분석</StatusBadge>
          <StatusBadge tone={needsMoreReview ? "orange" : "mint"}>
            {needsMoreReview ? "추가 확인 필요" : "신고 검토 가능"}
          </StatusBadge>
        </div>

        <p className="mt-7 text-sm font-semibold text-[#bcd0e0]">
          AI가 예상한 위반 유형
        </p>
        <h1 className="mt-2 text-[29px] font-extrabold leading-[1.28] tracking-[-0.05em]">
          {displayViolationType(selectedCandidate.type)}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#d4e2ec]">
          원본 자료와 아래 정보를 직접 확인해주세요.
        </p>

        <div className="mt-6 rounded-xl border border-white/15 bg-white/8 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#bcd0e0]">
                AI 분류 참고값
              </p>
            </div>
            <strong className="text-3xl font-extrabold">{confidence}%</strong>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
            role="meter"
            aria-label="AI 분류 참고값"
            aria-valuenow={confidence}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#68d4b8]"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#bcd0e0]">
            위반 확률이나 검증된 AI 정확도를 의미하지 않습니다.
          </p>
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
        <div className="flex items-center justify-between gap-3 border-b border-[#e6edf3] py-4">
          <h2 id="ai-facts-title" className="text-lg font-extrabold text-[var(--navy)]">
            신고 핵심정보
          </h2>
          <StatusBadge tone="blue">수정 가능</StatusBadge>
        </div>
        <AnalysisFact
          label="예상 위반 유형"
          value={displayViolationType(selectedCandidate.type)}
        />
        <AnalysisFact label="차량번호 후보" value={selectedCandidate.plate} />
        <AnalysisFact label="촬영 시각" value={occurredAt} />
        <AnalysisFact label="발생 장소" value={selectedCandidate.location} />
      </section>

      <p className="text-center text-xs font-semibold leading-5 text-[#667f96]">
        AI 참고 분석이며 최종 판단은 관계기관이 수행합니다.
      </p>

      <PrimaryButton
        href="/diagnosis?step=review"
        fullWidth
      >
        예상 유형 수정·확인하기
      </PrimaryButton>
    </div>
  );
}
