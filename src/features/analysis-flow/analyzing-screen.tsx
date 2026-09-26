"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/features/demo/demo-context";

const ANALYSIS_STEPS = [
  { title: "위반 의심 장면을 찾고 있습니다", detail: "전체 자료에서 살펴볼 구간을 정리합니다." },
  { title: "차량 및 주변 상황을 분석하고 있습니다", detail: "차량 움직임과 주변 장면을 함께 살펴봅니다." },
  { title: "신고 증거를 확인하고 있습니다", detail: "확인된 내용과 추가 확인이 필요한 내용을 나눕니다." },
];

const MINIMUM_PROGRESS_MS = 3_200;
const MOCK_RESULT_DELAY_MS = 4_400;
const PROGRESS_VALUES = [20, 48, 76, 100] as const;

export function AnalyzingScreen() {
  const router = useRouter();
  const {
    selectedFile,
    mediaKind,
    analysisStartedAt,
    analysisStatus,
    analysisError,
    analyzeSelectedImage,
    cancelAnalysis,
  } = useDemo();
  const [step, setStep] = useState(0);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const isImageRequest = mediaKind === "image" && selectedFile !== null;

  useEffect(() => {
    const startedAt = analysisStartedAt ?? Date.now();
    const elapsed = Date.now() - startedAt;

    const timers: number[] = [];
    const schedule = (targetMs: number, callback: () => void) => {
      timers.push(window.setTimeout(callback, Math.max(0, targetMs - elapsed)));
    };

    schedule(900, () => setStep((current) => Math.max(current, 1)));
    schedule(1_900, () => setStep((current) => Math.max(current, 2)));
    schedule(MINIMUM_PROGRESS_MS, () => setMinimumElapsed(true));

    if (!isImageRequest) {
      schedule(3_500, () => setStep(3));
      schedule(MOCK_RESULT_DELAY_MS, () => router.replace("/results"));
    }

    return () => timers.forEach(window.clearTimeout);
  }, [analysisStartedAt, isImageRequest, router]);

  useEffect(() => {
    if (!isImageRequest || !minimumElapsed || analysisStatus !== "success") return;
    const timer = window.setTimeout(() => router.replace("/results"), 500);
    return () => window.clearTimeout(timer);
  }, [analysisStatus, isImageRequest, minimumElapsed, router]);

  const displayedStep = isImageRequest && minimumElapsed && analysisStatus === "success" ? 3 : step;
  const progress = PROGRESS_VALUES[displayedStep];
  const hasError = isImageRequest && analysisStatus === "error";

  function returnToUpload() {
    cancelAnalysis();
    router.push("/upload");
  }

  function retryAnalysis() {
    setStep(0);
    setMinimumElapsed(false);
    void analyzeSelectedImage();
  }

  return (
    <div className="page-container space-y-6 pt-6 pb-12 sm:pt-10">
      <div className="space-y-2">
        <p className="eyebrow">AI 참고 분석 · 2/4</p>
        <h1 className="page-heading">{hasError ? "사진을 분석하지 못했어요" : "자료를 살펴보고 있어요"}</h1>
        <p className="page-subtitle">
          {isImageRequest
            ? "업로드한 사진에서 확인할 내용을 정리하고 있습니다."
            : selectedFile
              ? "영상의 검토 흐름을 모의 데이터로 체험하고 있습니다."
              : "샘플 영상으로 검토 흐름을 체험하고 있습니다."}
        </p>
      </div>

      <div className="flex gap-1.5" aria-label="진행 단계: 분석 진행 2단계">
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
      </div>

      {hasError ? (
        <section className="surface-card p-6 text-center sm:p-8" aria-live="polite">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-red-700" aria-hidden="true">!</span>
          <h2 className="mt-5 text-lg font-bold text-slate-900">다시 시도할 수 있습니다</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {analysisError?.message ?? "사진을 분석하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={retryAnalysis} className="button-primary flex-1">다시 분석하기</button>
            <button type="button" onClick={returnToUpload} className="button-secondary flex-1">다른 사진 선택</button>
          </div>
        </section>
      ) : (
        <section className="surface-card overflow-hidden p-6 sm:p-8" aria-label="분석 진행 상태">
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#e1f1ed]" />
            <div className="absolute inset-3 animate-spin rounded-full border-4 border-[#cae6de] border-t-[#0f766e]" />
            <div className="relative flex h-17 w-17 items-center justify-center rounded-full bg-white text-[#0f766e] shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
                <path d="m10 9 5 3-5 3V9Z" />
              </svg>
            </div>
          </div>
          <p className="mt-5 text-center text-lg font-bold text-slate-900" role="status" aria-live="polite">
            {displayedStep >= ANALYSIS_STEPS.length ? "분석 결과를 준비했습니다" : ANALYSIS_STEPS[displayedStep].title}
          </p>
          <p className="mt-1 text-center text-sm text-slate-500">
            {isImageRequest && minimumElapsed && analysisStatus === "loading"
              ? "사진 분석이 진행 중입니다. 잠시만 기다려 주세요."
              : "잠시 후 후보 장면을 확인할 수 있습니다."}
          </p>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="분석 진행률" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-[#0f766e] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-right text-xs font-semibold text-[#0f766e]">{progress}%</p>
        </section>
      )}

      {!hasError ? (
        <section className="surface-card p-5 sm:p-6" aria-label="분석 단계">
          <h2 className="section-heading">분석 단계</h2>
          <ol className="mt-5 space-y-5">
            {ANALYSIS_STEPS.map((item, index) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index < displayedStep ? "bg-[#0f766e] text-white" : index === displayedStep ? "bg-[#dff2eb] text-[#0f766e]" : "bg-slate-100 text-slate-400"}`} aria-hidden="true">
                  {index < displayedStep ? "✓" : index + 1}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${index > displayedStep ? "text-slate-400" : "text-slate-900"}`}>{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {!isImageRequest ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-bold">체험용 분석 화면</p>
          <p className="mt-1">영상과 샘플은 실제 AI가 판독하지 않습니다. 이어지는 내용은 체험용 예시 데이터입니다.</p>
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-600">
          AI 참고 분석은 부정확할 수 있습니다. 분석 결과의 차량번호, 시각, 장소와 예상 위반 유형을 직접 확인해 주세요.
        </p>
      )}

      {!hasError ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {!isImageRequest ? (
            <button type="button" onClick={() => router.replace("/results")} className="button-primary flex-1">예시 결과 바로 보기</button>
          ) : null}
          <button type="button" onClick={returnToUpload} className="button-secondary flex-1">자료 선택으로 돌아가기</button>
        </div>
      ) : null}
    </div>
  );
}
