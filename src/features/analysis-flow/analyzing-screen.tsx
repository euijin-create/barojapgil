"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  InfoCard,
  PrimaryButton,
  SectionLabel,
  StatusBadge,
} from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";

const ANALYSIS_STEPS = [
  "영상/이미지 품질 확인",
  "차량번호 인식",
  "위반 상황 분석",
  "시간·장소 정보 확인",
  "신고 증거 확인",
] as const;

const MINIMUM_PROGRESS_MS = 3_200;
const MOCK_RESULT_DELAY_MS = 4_400;
const PROGRESS_VALUES = [20, 48, 76, 100] as const;

type StepState = "complete" | "current" | "pending";

function AiAnalysisIcon({ isPaused = false }: { isPaused?: boolean }) {
  return (
    <div
      className="relative mx-auto grid h-28 w-28 place-items-center"
      aria-hidden="true"
    >
      {!isPaused ? (
        <span className="absolute inset-1 animate-ping rounded-full bg-[#dceeff] opacity-40" />
      ) : null}
      <span className="absolute inset-0 rounded-full border border-[#c7e0fa] bg-[#f4f9ff]" />
      <span className="absolute inset-3 rounded-full border border-dashed border-[#8ab8ec]" />
      <span className="relative grid h-17 w-17 place-items-center rounded-[18px] bg-[var(--primary)] text-white shadow-[0_6px_18px_rgba(47,128,237,0.16)]">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="h-10 w-10"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="10" y="12" width="28" height="26" rx="8" />
          <path d="M24 7v5M17 21h.01M31 21h.01" />
          <path d="M17 29c2 2 4.3 3 7 3s5-1 7-3" />
          <path d="M10 24H6M42 24h-4" />
        </svg>
      </span>
      <span className="absolute right-0 top-2 grid h-8 w-8 place-items-center rounded-full border-4 border-white bg-[var(--mint)] text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 10.7 7.2A5 5 0 0 1 7.2 10.7L2 12l5.2 1.3a5 5 0 0 1 3.5 3.5L12 22l1.3-5.2a5 5 0 0 1 3.5-3.5L22 12l-5.2-1.3a5 5 0 0 1-3.5-3.5L12 2Z" />
        </svg>
      </span>
    </div>
  );
}

function NoticeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 10 4 4 8-8" />
    </svg>
  );
}

export function AnalyzingScreen() {
  const router = useRouter();
  const {
    selectedFile,
    mediaKind,
    analysisStartedAt,
    analysisStatus,
    analysisError,
    analysisProvider,
    analysisIsDemo,
    analyzeSelectedImage,
    cancelAnalysis,
  } = useDemo();
  const [step, setStep] = useState(0);
  const [visualStage, setVisualStage] = useState(0);
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const isImageRequest = mediaKind === "image" && selectedFile !== null;

  useEffect(() => {
    const startedAt = analysisStartedAt ?? Date.now();
    const elapsed = Date.now() - startedAt;

    const timers: number[] = [];
    const schedule = (targetMs: number, callback: () => void) => {
      timers.push(window.setTimeout(callback, Math.max(0, targetMs - elapsed)));
    };

    schedule(650, () => setVisualStage((current) => Math.max(current, 1)));
    schedule(1_300, () => setVisualStage((current) => Math.max(current, 2)));
    schedule(2_100, () => setVisualStage((current) => Math.max(current, 3)));
    schedule(2_750, () => setVisualStage((current) => Math.max(current, 4)));

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

  const displayedStep =
    isImageRequest && minimumElapsed && analysisStatus === "success" ? 3 : step;
  const progress = PROGRESS_VALUES[displayedStep];
  const hasError = isImageRequest && analysisStatus === "error";
  const isAnalysisComplete = displayedStep >= 3;
  const showDemoNotice =
    !isImageRequest || analysisIsDemo === true || analysisProvider === "mock";

  function getStepState(index: number): StepState {
    if (isAnalysisComplete) return "complete";
    if (index < visualStage) return "complete";
    if (index === visualStage) return "current";
    return "pending";
  }

  function returnToUpload() {
    cancelAnalysis();
    router.push("/upload");
  }

  function retryAnalysis() {
    setStep(0);
    setVisualStage(0);
    setMinimumElapsed(false);
    void analyzeSelectedImage();
  }

  return (
    <div className="page-container flex min-h-[calc(100svh-124px)] flex-col pb-2 pt-5">
      <header className="text-center">
        <AiAnalysisIcon isPaused={hasError} />
        <SectionLabel className="mt-6 justify-center">AI ANALYZING</SectionLabel>
        <h1 className="mt-3 whitespace-pre-line text-[28px] font-extrabold leading-[1.3] tracking-[-0.045em] text-[var(--navy)]">
          {"신고에 필요한 정보를\n확인하고 있어요."}
        </h1>
        <p className="mt-3 text-sm font-medium text-[var(--ink-muted)]">
          잠시만 기다려주세요.
        </p>
      </header>

      {hasError ? (
        <section
          className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-center"
          aria-live="polite"
        >
          <span
            className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-xl font-extrabold text-red-700"
            aria-hidden="true"
          >
            !
          </span>
          <h2 className="mt-4 text-base font-extrabold text-[var(--navy)]">
            분석을 완료하지 못했어요.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6d8091]">
            {analysisError?.message ??
              "사진을 분석하지 못했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
          <div className="mt-5 space-y-3">
            <PrimaryButton type="button" fullWidth onClick={retryAnalysis}>
              다시 분석하기
            </PrimaryButton>
            <PrimaryButton
              type="button"
              tone="neutral"
              fullWidth
              onClick={returnToUpload}
            >
              다른 사진 선택
            </PrimaryButton>
          </div>
        </section>
      ) : (
        <section className="mt-8" aria-labelledby="analysis-progress-title">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="analysis-progress-title"
              className="text-sm font-extrabold text-[var(--navy)]"
            >
              분석 진행 상황
            </h2>
            <span className="text-sm font-extrabold tabular-nums text-[var(--primary)]">
              {progress}%
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8eff6]"
            role="progressbar"
            aria-label="AI 참고 분석 진행률"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      )}

      {!hasError ? (
        <section
          className="mt-6 rounded-2xl border border-[var(--line)] bg-white px-5 py-2"
          aria-label="AI 분석 단계"
        >
          <ol>
            {ANALYSIS_STEPS.map((label, index) => {
              const state = getStepState(index);
              const isLast = index === ANALYSIS_STEPS.length - 1;
              return (
                <li
                  key={label}
                  className="relative flex min-h-[70px] items-center gap-4 py-3"
                  aria-current={state === "current" ? "step" : undefined}
                >
                  {!isLast ? (
                    <span
                      className={`absolute left-[17px] top-[47px] h-[38px] w-px ${state === "complete" ? "bg-[#94dcc8]" : "bg-[#dde7ef]"}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold transition-colors ${
                      state === "complete"
                        ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                        : state === "current"
                          ? "bg-[var(--primary)] text-white ring-4 ring-[#dceeff]"
                          : "border border-[#d8e3ec] bg-[#f4f7fa] text-[#9aabb9]"
                    }`}
                    aria-hidden="true"
                  >
                    {state === "complete" ? <CheckIcon /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold ${
                        state === "pending"
                          ? "text-[#91a2b1]"
                          : "text-[var(--navy)]"
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                  <StatusBadge
                    tone={
                      state === "complete"
                        ? "mint"
                        : state === "current"
                          ? "blue"
                          : "neutral"
                    }
                    showDot={state === "current"}
                  >
                    {state === "complete"
                      ? "완료"
                      : state === "current"
                        ? "진행 중"
                        : "대기"}
                  </StatusBadge>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {showDemoNotice ? (
        <InfoCard
          tone="orange"
          icon={<NoticeIcon />}
          title="데모 분석 안내"
          className="mt-5"
        >
          현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.
        </InfoCard>
      ) : (
        <InfoCard
          tone="blue"
          icon={<NoticeIcon />}
          title="AI 참고 분석"
          className="mt-5"
        >
          AI 분석은 부정확할 수 있습니다. 결과의 차량번호, 시각, 장소와 예상 위반 유형을 직접 확인해주세요.
        </InfoCard>
      )}

      {!hasError ? (
        <div className="mt-auto space-y-3 pt-7">
          {!isImageRequest ? (
            <PrimaryButton
              type="button"
              fullWidth
              onClick={() => router.replace("/results")}
            >
              예시 결과 바로 보기
            </PrimaryButton>
          ) : null}
          <PrimaryButton
            type="button"
            tone="neutral"
            fullWidth
            onClick={returnToUpload}
          >
            자료 선택으로 돌아가기
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}
