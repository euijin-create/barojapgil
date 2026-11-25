"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  InfoCard,
  PrimaryButton,
  SectionLabel,
  StatusBadge,
} from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels } from "@/lib/demo-data";
import { MediaPreview } from "./media-preview";

const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

function parseOffset(offset: string) {
  const parts = offset.split(":").map(Number);
  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((part) => !Number.isFinite(part))
  ) {
    return null;
  }
  return parts.reduce((seconds, part) => seconds * 60 + part, 0);
}

function uniqueText(items: readonly string[]) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function ReasoningGroup({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "orange";
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={`rounded-xl px-4 py-3.5 ${
        tone === "orange" ? "bg-[var(--orange-soft)]" : "bg-[#f6f9fc]"
      }`}
    >
      <h3
        className={`text-sm font-extrabold ${
          tone === "orange" ? "text-[#7b4d11]" : "text-[var(--navy)]"
        }`}
      >
        {title}
      </h3>
      <ul
        className={`mt-2 space-y-1.5 text-sm leading-6 ${
          tone === "orange" ? "text-[#76501d]" : "text-[#56738e]"
        }`}
      >
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-current" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResultsScreen() {
  const {
    selectedFile,
    previewUrl,
    mediaKind,
    candidates,
    selectedCandidate,
    selectedCandidateId,
    selectCandidate,
    imageAnalysisResult,
    analysisIsDemo,
  } = useDemo();
  const videoRef = useRef<HTMLVideoElement>(null);

  function chooseCandidate(id: string, start: string) {
    selectCandidate(id);
    const seconds = parseOffset(start);
    const video = videoRef.current;
    if (
      video &&
      seconds !== null &&
      Number.isFinite(video.duration) &&
      seconds < video.duration
    ) {
      video.currentTime = seconds;
    }
  }

  const isPhoto = mediaKind === "image";
  const isDemoImageResult = isPhoto && analysisIsDemo !== false;
  const needsTemporalEvidence =
    isPhoto && imageAnalysisResult?.needsTemporalEvidence === true;
  const visibleWarnings =
    imageAnalysisResult?.warnings.filter(
      (warning) => !(analysisIsDemo && warning === MOCK_ANALYSIS_NOTICE),
    ) ?? [];
  const primaryReasoning = imageAnalysisResult
    ? uniqueText([
        imageAnalysisResult.summary,
        imageAnalysisResult.reasoningSummary,
      ])
    : uniqueText([selectedCandidate.reasoning]);
  const additionalChecks = imageAnalysisResult
    ? uniqueText(imageAnalysisResult.missingEvidence)
    : uniqueText([
        ...selectedCandidate.evidence.unclear,
        ...selectedCandidate.evidence.missing,
      ]);
  const analysisLimitations = imageAnalysisResult
    ? uniqueText(visibleWarnings)
    : mediaKind === "video"
      ? ["현재 영상 후보는 실제 AI 영상 판독 결과가 아닌 데모입니다."]
      : [];

  return (
    <div className="page-container space-y-6 pb-10 pt-4">
      <header>
        <SectionLabel>{isPhoto ? "AI 분석 결과" : "AI 장면 추천"}</SectionLabel>
        <h1 className="mt-3 whitespace-pre-line text-[30px] font-extrabold leading-[1.27] tracking-[-0.05em] text-[var(--navy)]">
          {isPhoto
            ? "AI가 자료에서 확인한\n내용이에요."
            : "AI가 찾은\n의심 장면이에요."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          {isPhoto
            ? "원본 사진과 비교하며 분석 내용을 확인해주세요."
            : `${candidates.length}개 후보 중 신고 준비에 사용할 장면을 선택해주세요.`}
        </p>
      </header>

      {isDemoImageResult ? (
        <InfoCard tone="orange" title="체험용 예시 결과" role="note">
          {MOCK_ANALYSIS_NOTICE}
        </InfoCard>
      ) : isPhoto ? (
        <InfoCard tone="blue" title="AI 참고 분석 결과" role="note">
          업로드한 사진을 바탕으로 정리했습니다. 부정확할 수 있으므로 원본과 모든 항목을 직접 대조해주세요.
        </InfoCard>
      ) : (
        <InfoCard tone="orange" title="데모 안내" role="note">
          <strong className="font-extrabold">현재 영상 장면 탐색은 데모 기능입니다.</strong>
          <span className="mt-1 block">
            아래 후보는 선택한 영상을 실제로 판독한 결과가 아닌 체험용 예시입니다.
          </span>
        </InfoCard>
      )}

      {needsTemporalEvidence ? (
        <InfoCard tone="orange" title="추가 영상 확인이 필요해요" role="note">
          사진만으로 이동 과정을 확인할 수 없어요. 전후 영상이 있다면 함께
          확인해주세요.
        </InfoCard>
      ) : null}

      {selectedCandidate ? (
        <section
          className="rounded-2xl border border-[#cfe4fa] bg-[var(--primary-soft)] p-5"
          aria-labelledby="result-summary-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-[var(--primary-dark)]">
              예상 위반 유형
            </p>
            <StatusBadge
              tone={isPhoto && analysisIsDemo === false ? "blue" : "orange"}
            >
              {isPhoto && analysisIsDemo === false
                ? "업로드 자료 분석"
                : "데모 결과"}
            </StatusBadge>
          </div>
          <h2
            id="result-summary-title"
            className="mt-3 text-[23px] font-extrabold leading-tight tracking-[-0.035em] text-[var(--navy)]"
          >
            {violationLabels[selectedCandidate.type]}
            {selectedCandidate.type === "unknown" ? "" : " 의심"}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-semibold text-[#607d99]">
              AI 분류 참고값
            </span>
            <span
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#d6e5f4]"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${selectedCandidate.confidence}%` }}
              />
            </span>
            <strong className="text-sm tabular-nums text-[var(--navy)]">
              {selectedCandidate.confidence}%
            </strong>
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-[#66839e]">
            위반 확률이나 검증된 AI 정확도를 의미하지 않습니다.
          </p>
        </section>
      ) : null}

      <section
        className="surface-card space-y-3 p-4"
        aria-labelledby="analysis-reasoning-title"
      >
        <h2 id="analysis-reasoning-title" className="section-heading">
          AI 참고 분석 내용
        </h2>
        <ReasoningGroup title="주요 판단 근거" items={primaryReasoning} />
        <ReasoningGroup
          title="추가 확인이 필요한 사항"
          items={additionalChecks}
          tone="orange"
        />
        <ReasoningGroup
          title="판단의 한계"
          items={analysisLimitations}
          tone="orange"
        />
      </section>

      <section className="surface-card overflow-hidden p-4" aria-labelledby="preview-title">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="preview-title" className="section-heading">
            {isPhoto ? "등록한 사진" : "선택한 장면"}
          </h2>
          <StatusBadge tone={isPhoto ? "blue" : "mint"}>
            {isPhoto
              ? "사진 1장"
              : `${selectedCandidate.start} ~ ${selectedCandidate.end}`}
          </StatusBadge>
        </div>

        <MediaPreview
          kind={mediaKind}
          previewUrl={previewUrl}
          fileName={selectedFile?.name}
          videoRef={videoRef}
          label={
            selectedFile ? "등록한 자료" : isPhoto ? "예시 사진" : "데모 영상"
          }
        />
      </section>

      {!isPhoto ? (
        <section aria-labelledby="candidate-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <SectionLabel tone="mint">장면 타임라인</SectionLabel>
              <h2 id="candidate-title" className="section-heading mt-1.5">
                의심 장면을 선택해주세요
              </h2>
            </div>
            <span className="shrink-0 text-xs font-bold text-[var(--ink-muted)]">
              {candidates.length}개 후보
            </span>
          </div>

          {candidates.length === 0 ? (
            <div className="surface-card mt-4 p-6 text-center">
              <p className="font-extrabold text-[var(--navy)]">
                의심 장면을 찾지 못했습니다
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                자료를 다시 확인하거나 다른 사진·영상을 선택해주세요.
              </p>
              <Link href="/upload" className="button-secondary mt-5 w-full">
                다른 자료 선택
              </Link>
            </div>
          ) : (
            <ol className="relative mt-4 space-y-3 before:absolute before:bottom-8 before:left-[7px] before:top-8 before:w-px before:bg-[#bdd8f5]">
            {candidates.map((candidate, index) => {
              const selected =
                candidate.id === (selectedCandidateId ?? selectedCandidate?.id);
              return (
                <li key={candidate.id} className="relative pl-6">
                  <span
                    className={`absolute left-0 top-7 z-10 h-[15px] w-[15px] rounded-full border-[3px] border-white ${
                      selected ? "bg-[var(--primary)]" : "bg-[#a6bed3]"
                    }`}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => chooseCandidate(candidate.id, candidate.start)}
                    aria-pressed={selected}
                    className={`w-full rounded-[14px] border p-4 text-left transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                      selected
                        ? "border-[#79afe9] bg-[#f1f7fe]"
                        : "border-[var(--line)] bg-white hover:border-[#a9c7e8]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[var(--primary-dark)]">
                          {`장면 ${String(index + 1).padStart(2, "0")} · ${candidate.start} ~ ${candidate.end}`}
                        </p>
                        <p className="mt-1.5 text-[16px] font-extrabold text-[var(--navy)]">
                          {violationLabels[candidate.type]}
                          {candidate.type === "unknown" ? "" : " 의심"}
                        </p>
                      </div>
                      <StatusBadge tone={selected ? "blue" : "neutral"}>
                        {selected ? "선택됨" : "선택"}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs font-semibold text-[var(--ink-muted)]">
                        AI 분류 참고값
                      </span>
                      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#dce6ef]" aria-hidden="true">
                        <span
                          className={`block h-full rounded-full ${selected ? "bg-[var(--primary)]" : "bg-[#8da9c2]"}`}
                          style={{ width: `${candidate.confidence}%` }}
                        />
                      </span>
                      <strong className="text-sm text-[var(--navy)]">{candidate.confidence}%</strong>
                    </div>
                  </button>
                </li>
              );
            })}
            </ol>
          )}
        </section>
      ) : null}

      <p className="text-center text-xs font-semibold leading-5 text-[#667f96]" role="note">
        AI 참고 분석이며 최종 판단은 관계기관이 수행합니다.
      </p>

      <div className="space-y-3">
        {candidates.length > 0 && selectedCandidate ? (
          <PrimaryButton href="/diagnosis" fullWidth>
            {isPhoto ? "분석 내용 확인하기" : "선택한 장면으로 계속"}
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" fullWidth disabled>
            먼저 장면을 선택해주세요
          </PrimaryButton>
        )}
        <Link href="/upload" className="button-secondary w-full">
          자료 다시 선택
        </Link>
      </div>
    </div>
  );
}
