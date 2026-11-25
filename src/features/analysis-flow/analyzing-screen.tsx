"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
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

const MOCK_RESULT_DELAY_MS = 4_400;

function AiAnalysisIcon({ isPaused = false }: { isPaused?: boolean }) {
  return (
    <div
      className="relative mx-auto grid h-24 w-24 place-items-center"
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full border border-[#c7e0fa] bg-[#f4f9ff]" />
      <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white ring-1 ring-[#d8e8f7]">
        <BrandLogo
          variant="icon"
          decorative
          preload
          className="h-13 w-13 object-contain"
        />
      </span>
      <span
        className={`absolute right-0 top-1 grid h-8 w-8 place-items-center rounded-full border-4 border-white text-white ${
          isPaused ? "bg-red-500" : "bg-[var(--mint)]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isPaused ? (
            <>
              <path d="M12 7v6" />
              <path d="M12 17h.01" />
            </>
          ) : (
            <path d="M12 2 10.7 7.2A5 5 0 0 1 7.2 10.7L2 12l5.2 1.3a5 5 0 0 1 3.5 3.5L12 22l1.3-5.2a5 5 0 0 1 3.5-3.5L22 12l-5.2-1.3a5 5 0 0 1-3.5-3.5L12 2Z" />
          )}
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
  const isImageRequest = mediaKind === "image" && selectedFile !== null;

  useEffect(() => {
    if (isImageRequest) return;

    const startedAt = analysisStartedAt ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const timer = window.setTimeout(
      () => router.replace("/results"),
      Math.max(0, MOCK_RESULT_DELAY_MS - elapsed),
    );

    return () => window.clearTimeout(timer);
  }, [analysisStartedAt, isImageRequest, router]);

  useEffect(() => {
    if (!isImageRequest || analysisStatus !== "success") return;
    router.replace("/results");
  }, [analysisStatus, isImageRequest, router]);

  const hasError = isImageRequest && analysisStatus === "error";
  const showDemoNotice =
    !isImageRequest || analysisIsDemo === true || analysisProvider === "mock";

  function returnToUpload() {
    cancelAnalysis();
    router.push("/upload");
  }

  function retryAnalysis() {
    void analyzeSelectedImage();
  }

  return (
    <div className="page-container flex min-h-[calc(100svh-124px)] flex-col pb-2 pt-5">
      <header className="text-center">
        <AiAnalysisIcon isPaused={hasError} />
        <SectionLabel className="mt-5 justify-center">AI 분석 중</SectionLabel>
        <h1 className="mt-3 whitespace-pre-line text-[28px] font-extrabold leading-[1.3] tracking-[-0.045em] text-[var(--navy)]">
          {"신고에 필요한 정보를\n확인하고 있어요."}
        </h1>
        <p
          className="mt-3 text-sm font-medium text-[var(--ink-muted)]"
          aria-live="polite"
        >
          {hasError
            ? "분석을 멈췄어요."
            : isImageRequest
              ? analysisStatus === "success"
                ? "분석 결과를 여는 중이에요."
                : "AI 분석 응답을 기다리고 있어요."
              : "데모 장면 후보를 준비하고 있어요."}
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
        <section
          className="mt-8 rounded-2xl border border-[#d5e8fb] bg-[#f7fbff] p-5"
          aria-labelledby="analysis-progress-title"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#c7ddf5] border-t-[var(--primary)]"
              aria-hidden="true"
            />
            <div>
              <h2
                id="analysis-progress-title"
                className="text-sm font-extrabold text-[var(--navy)]"
              >
                {isImageRequest ? "AI 분석 중" : "데모 결과 준비 중"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
                완료되면 결과 화면으로 자동 이동합니다.
              </p>
            </div>
          </div>
        </section>
      )}

      {!hasError ? (
        <section
          className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-5"
          aria-labelledby="analysis-items-title"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="analysis-items-title"
              className="text-sm font-extrabold text-[var(--navy)]"
            >
              AI가 확인하는 항목
            </h2>
            <StatusBadge tone="blue">참고 분석</StatusBadge>
          </div>
          <ul className="mt-4 grid gap-2.5">
            {ANALYSIS_STEPS.map((label) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-semibold text-[#526f88]"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#91b9df]"
                  aria-hidden="true"
                />
                {label}
              </li>
            ))}
          </ul>
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
