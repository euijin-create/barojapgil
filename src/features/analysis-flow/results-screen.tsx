"use client";

import { useRef } from "react";
import Link from "next/link";
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

function parseOffset(offset: string) {
  const parts = offset.split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !Number.isFinite(part))) return null;
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
    if (video && seconds !== null && Number.isFinite(video.duration) && seconds < video.duration) {
      video.currentTime = seconds;
    }
  }

  const isPhoto = mediaKind === "image";
  const hasStructuredImageResult = isPhoto && imageAnalysisResult !== null;
  const isDemoImageResult = isPhoto && analysisIsDemo !== false;
  const visibleWarnings =
    imageAnalysisResult?.warnings.filter(
      (warning) => !(analysisIsDemo && warning === MOCK_ANALYSIS_NOTICE),
    ) ?? [];

  return (
    <div className="page-container space-y-6 pt-6 pb-12 sm:pt-10">
      <div className="space-y-2">
        <Link href="/upload" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#0f6b65]">
          <span aria-hidden="true">←</span> 자료 선택으로
        </Link>
        <p className="eyebrow">장면 선택 · 3/4</p>
        <h1 className="page-heading">위반 의심 장면</h1>
        <p className="page-subtitle">{hasStructuredImageResult && !isDemoImageResult ? "업로드한 사진의 AI 참고 분석을 확인해 주세요." : "AI 참고 분석 예시에서 검토할 장면을 하나 선택해 주세요."}</p>
      </div>

      <div className="flex gap-1.5" aria-label="진행 단계: 후보 장면 선택 3단계">
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
      </div>

      {isDemoImageResult ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="note">
          <p className="font-bold">체험용 예시 결과</p>
          <p className="mt-1">{MOCK_ANALYSIS_NOTICE}</p>
        </div>
      ) : isPhoto ? (
        <div className="rounded-2xl border border-[#cfe3df] bg-[#f5faf8] p-4 text-sm leading-6 text-slate-700" role="note">
          <p className="font-bold text-[#155e58]">AI 참고 분석 결과</p>
          <p className="mt-1">업로드한 사진을 바탕으로 정리했습니다. 부정확할 수 있으므로 원본과 모든 항목을 직접 대조해 주세요.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="note">
          <p className="font-bold">체험용 예시 결과</p>
          <p className="mt-1">영상 분석은 모의 데이터로 체험합니다. 아래 후보와 정보는 선택한 영상을 실제로 판독한 값이 아닙니다.</p>
        </div>
      )}

      <section className="surface-card space-y-4 p-4 sm:p-5" aria-labelledby="preview-title">
        <div className="flex items-center justify-between gap-3 px-1">
          <h2 id="preview-title" className="section-heading">{selectedFile ? "선택한 자료 미리보기" : "샘플 장면 미리보기"}</h2>
          <span className="badge shrink-0">{isPhoto ? "사진" : "영상"}</span>
        </div>
        <MediaPreview
          kind={mediaKind}
          previewUrl={previewUrl}
          fileName={selectedFile?.name}
          videoRef={videoRef}
          label={selectedFile ? "내 파일 미리보기" : "체험용 예시"}
        />
        {selectedCandidate ? (
          <div className="rounded-2xl bg-[#f1f8f6] px-4 py-3">
            <p className="text-xs font-semibold text-[#0f766e]">현재 선택한 후보</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {isPhoto ? "사진 1장" : `${selectedCandidate.start} ~ ${selectedCandidate.end}`} · {TYPE_LABELS[selectedCandidate.type]} {selectedCandidate.type === "unknown" ? "" : "의심"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{selectedCandidate.reasoning}</p>
          </div>
        ) : null}
      </section>

      {visibleWarnings.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" aria-labelledby="analysis-warning-title">
          <h2 id="analysis-warning-title" className="font-bold">분석 결과 확인 안내</h2>
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

      <section aria-labelledby="candidate-title" className="space-y-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="eyebrow">AI 참고 분석</p>
            <h2 id="candidate-title" className="section-heading mt-1">{isPhoto ? "사진 분석 결과" : "후보 타임라인"}</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500">{candidates.length}개 후보</p>
        </div>

        {candidates.length === 0 ? (
          <div className="surface-card p-6 text-center">
            <p className="font-bold text-slate-900">의심 장면을 찾지 못했습니다</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">자료를 다시 확인하거나 다른 사진·영상을 선택해 주세요.</p>
            <Link href="/upload" className="button-secondary mt-5 w-full">다른 자료 선택</Link>
          </div>
        ) : (
          <ol className="relative space-y-3 before:absolute before:bottom-7 before:left-[13px] before:top-7 before:w-px before:bg-[#bddbd4]">
            {candidates.map((candidate, index) => {
              const selected = candidate.id === (selectedCandidateId ?? selectedCandidate?.id);
              return (
                <li key={candidate.id} className="relative pl-8">
                  <span className={`absolute left-[7px] top-8 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-sm ${selected ? "bg-[#0f766e]" : "bg-[#9bbcb5]"}`} aria-hidden="true" />
                  <button
                    type="button"
                    onClick={() => chooseCandidate(candidate.id, candidate.start)}
                    aria-pressed={selected}
                    className={`w-full rounded-[22px] border p-4 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e] ${selected ? "border-[#0f766e] bg-[#f1f8f6]" : "border-slate-200 bg-white hover:border-[#8ebdb4]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0f766e]">{isPhoto ? "사진 후보" : `장면 ${String(index + 1).padStart(2, "0")} · ${candidate.start} ~ ${candidate.end}`}</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{TYPE_LABELS[candidate.type]} {candidate.type === "unknown" ? "" : "의심"}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${selected ? "bg-[#d5ece5] text-[#0d665f]" : "bg-slate-100 text-slate-600"}`}>
                        {selected ? "선택됨" : "선택"}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{candidate.reasoning}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
                      <span className="text-xs text-slate-500">AI 분석 신뢰도</span>
                      <span className="text-sm font-bold text-slate-800">{candidate.confidence}%</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-600">
        AI 참고 분석이며 최종 판단은 관계기관이 수행합니다. 선택한 장면과 정보는 다음 화면에서 직접 확인하고 수정해 주세요.
      </p>

      <div className="space-y-3">
        {selectedCandidate ? (
          <Link href="/diagnosis" className="button-primary w-full">선택한 장면의 증거 진단 보기 <span aria-hidden="true">→</span></Link>
        ) : (
          <span className="button-primary w-full cursor-not-allowed opacity-50">먼저 장면을 선택해 주세요</span>
        )}
        <Link href="/upload" className="button-secondary w-full">다른 자료 선택</Link>
      </div>
    </div>
  );
}
