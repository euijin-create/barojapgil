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
import { MediaPreview } from "./media-preview";

const TYPE_LABELS = {
  signal: "신호위반",
  center: "중앙선 침범",
  cutin: "위험 끼어들기",
  unknown: "판단 어려움",
} as const;

const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

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
  const visibleWarnings =
    imageAnalysisResult?.warnings.filter(
      (warning) => !(analysisIsDemo && warning === MOCK_ANALYSIS_NOTICE),
    ) ?? [];

  return (
    <div className="page-container space-y-7 pb-10 pt-4">
      <header>
        <SectionLabel>{isPhoto ? "AI 참고 분석" : "AI RECOMMENDATION"}</SectionLabel>
        <h1 className="mt-3 whitespace-pre-line text-[30px] font-extrabold leading-[1.27] tracking-[-0.05em] text-[var(--navy)]">
          {isPhoto
            ? "사진 1장의\nAI 참고 결과예요."
            : "AI가 찾은\n3개의 의심 장면이에요."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          {isPhoto
            ? "원본 사진과 비교하며 분석 내용을 확인해주세요."
            : "신고 준비에 사용할 장면 하나를 선택해주세요."}
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
          label={selectedFile ? "등록한 자료" : "데모 영상"}
        />

        {selectedCandidate ? (
          <div className="mt-4 border-t border-[#e1eaf2] pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--primary)]">현재 선택 · AI 참고 분석</p>
                <p className="mt-1 text-base font-extrabold text-[var(--navy)]">
                  {TYPE_LABELS[selectedCandidate.type]}
                  {selectedCandidate.type === "unknown" ? "" : " 의심"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-extrabold text-[var(--primary-dark)]">
                신뢰도 {selectedCandidate.confidence}%
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[#667e94]">
              {selectedCandidate.reasoning}
            </p>
          </div>
        ) : null}
      </section>

      {visibleWarnings.length > 0 ? (
        <section
          className="rounded-xl border border-[#f4d9ad] bg-[var(--orange-soft)] p-4 text-sm leading-6 text-[#76501d]"
          aria-labelledby="analysis-warning-title"
        >
          <h2 id="analysis-warning-title" className="font-extrabold text-[#7b4d11]">
            분석 결과 확인 안내
          </h2>
          <ul className="mt-2 space-y-1.5">
            {visibleWarnings.map((warning) => (
              <li key={warning} className="flex items-start gap-2">
                <span aria-hidden="true">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="candidate-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <SectionLabel tone={isPhoto ? "blue" : "mint"}>
              {isPhoto ? "AI 참고 분석" : "장면 타임라인"}
            </SectionLabel>
            <h2 id="candidate-title" className="section-heading mt-1.5">
              {isPhoto ? "사진 분석 결과" : "의심 장면을 선택해주세요"}
            </h2>
          </div>
          <span className="shrink-0 text-xs font-bold text-[var(--ink-muted)]">
            {candidates.length}개 {isPhoto ? "결과" : "후보"}
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="surface-card mt-4 p-6 text-center">
            <p className="font-extrabold text-[var(--navy)]">의심 장면을 찾지 못했습니다</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
              자료를 다시 확인하거나 다른 사진·영상을 선택해주세요.
            </p>
            <Link href="/upload" className="button-secondary mt-5 w-full">
              다른 자료 선택
            </Link>
          </div>
        ) : (
          <ol
            className={`relative mt-4 space-y-3 ${
              isPhoto
                ? ""
                : "before:absolute before:bottom-8 before:left-[7px] before:top-8 before:w-px before:bg-[#bdd8f5]"
            }`}
          >
            {candidates.map((candidate, index) => {
              const selected =
                candidate.id === (selectedCandidateId ?? selectedCandidate?.id);
              return (
                <li key={candidate.id} className={`relative ${isPhoto ? "" : "pl-6"}`}>
                  {!isPhoto ? (
                    <span
                      className={`absolute left-0 top-7 z-10 h-[15px] w-[15px] rounded-full border-[3px] border-white ${
                        selected ? "bg-[var(--primary)]" : "bg-[#a6bed3]"
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
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
                          {isPhoto
                            ? "단일 사진"
                            : `장면 ${String(index + 1).padStart(2, "0")} · ${candidate.start} ~ ${candidate.end}`}
                        </p>
                        <p className="mt-1.5 text-[16px] font-extrabold text-[var(--navy)]">
                          {TYPE_LABELS[candidate.type]}
                          {candidate.type === "unknown" ? "" : " 의심"}
                        </p>
                      </div>
                      <StatusBadge tone={selected ? "blue" : "neutral"}>
                        {selected ? "선택됨" : "선택"}
                      </StatusBadge>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs font-semibold text-[var(--ink-muted)]">
                        AI 분석 신뢰도
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

      <InfoCard tone="neutral" role="note">
        AI 참고 분석이며 최종 판단은 관계기관이 수행합니다. 선택한 장면과 정보는 다음 화면에서 직접 확인하고 수정해주세요.
      </InfoCard>

      <div className="space-y-3">
        {candidates.length > 0 && selectedCandidate ? (
          <PrimaryButton href="/diagnosis" fullWidth trailingIcon={<ArrowIcon />}>
            선택한 장면으로 계속
          </PrimaryButton>
        ) : (
          <PrimaryButton type="button" fullWidth disabled>
            먼저 장면을 선택해주세요
          </PrimaryButton>
        )}
        <Link href="/upload" className="button-secondary w-full">
          다른 자료 선택
        </Link>
      </div>
    </div>
  );
}
