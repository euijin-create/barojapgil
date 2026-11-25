"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-context";
import { MOCK_REPORTS } from "@/lib/demo-data";

function AnalysisIcon({ current = false }: { current?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {current ? (
        <>
          <path d="M5.5 4.5h8l5 5v10h-13v-15Z" />
          <path d="M13.5 4.5v5h5M8.5 14h7M8.5 17h4" />
        </>
      ) : (
        <>
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
        </>
      )}
    </svg>
  );
}

export default function RecentAnalyses() {
  const { selectedFile, analysisStarted, submissionReady, reportComplete } =
    useDemo();
  const examples = MOCK_REPORTS.slice(0, 2);
  const currentHref = reportComplete
    ? "/reports"
    : submissionReady
      ? "/submission-ready"
      : analysisStarted
        ? "/results"
        : "/upload";
  const currentStatus = reportComplete
    ? "신고 완료로 표시됨"
    : submissionReady
      ? "안전신문고 제출 대기"
      : analysisStarted
        ? "신고 자료 확인 중"
        : "분석 시작 전";

  return (
    <div className="grid gap-3">
      {selectedFile || analysisStarted ? (
        <Link
          href={currentHref}
          className="surface-card group flex min-h-24 items-center gap-3 p-4 transition-colors hover:border-[#91bff2] hover:bg-[#fbfdff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--mint-soft)] text-[var(--mint-dark)]"
            aria-hidden="true"
          >
            <AnalysisIcon current />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <strong className="text-sm font-extrabold text-[var(--navy)]">
                현재 신고 준비 자료
              </strong>
              <span className="rounded-full bg-[var(--mint-soft)] px-2 py-1 text-[10px] font-extrabold text-[var(--mint-dark)]">
                현재 작업
              </span>
            </span>
            <span className="mt-1.5 block text-xs leading-5 text-[var(--ink-muted)]">
              {currentStatus}
            </span>
            <span className="mt-1 block text-xs font-extrabold text-[var(--primary)]">
              계속 보기
            </span>
          </span>
        </Link>
      ) : null}

      {examples.map((report) => (
        <Link
          key={report.id}
          href="/reports"
          className="surface-card group flex min-h-24 items-center gap-3 p-4 transition-colors hover:border-[#b8ccdf] hover:bg-[#fbfdff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef3f7] text-[#61788e]"
            aria-hidden="true"
          >
            <AnalysisIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <strong className="truncate text-sm font-extrabold text-[var(--navy)]">
                {report.title}
              </strong>
              <span className="rounded-full bg-[var(--orange-soft)] px-2 py-1 text-[10px] font-extrabold text-[#965d12]">
                DEMO
              </span>
            </span>
            <span className="mt-1.5 block text-xs leading-5 text-[var(--ink-muted)]">
              {report.date} · 체험용 내역
            </span>
            <span className="mt-1 block text-xs font-extrabold text-[var(--primary)]">
              내 신고에서 보기
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
