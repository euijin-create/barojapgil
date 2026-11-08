"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InfoCard, StatusBadge } from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import {
  MOCK_REPORTS,
  violationLabels,
  type MockReport,
  type ViolationType,
} from "@/lib/demo-data";

type SourceStatus = MockReport["status"];
type DisplayStatus =
  | "analyzing"
  | "preparing"
  | "submissionPending"
  | "completed";

interface ReportRow {
  id: string;
  title: string;
  status: DisplayStatus;
  occurredAt: string;
  location: string;
  type: ViolationType;
  href?: string;
  isCurrent?: boolean;
  onOpen?: () => void;
}

const displayStatusOrder: DisplayStatus[] = [
  "analyzing",
  "preparing",
  "submissionPending",
  "completed",
];

const statusMeta: Record<
  DisplayStatus,
  {
    label: string;
    description: string;
    tone: "blue" | "mint" | "orange" | "neutral";
  }
> = {
  analyzing: {
    label: "분석 중",
    description: "AI가 신고에 필요한 정보를 확인하고 있어요.",
    tone: "blue",
  },
  preparing: {
    label: "신고 준비 중",
    description: "AI 참고 결과와 신고 내용을 확인하고 있어요.",
    tone: "blue",
  },
  submissionPending: {
    label: "안전신문고 제출 대기",
    description: "안전신문고에서 사용자의 최종 제출을 기다리고 있어요.",
    tone: "orange",
  },
  completed: {
    label: "신고 완료",
    description: "사용자가 직접 신고 완료로 표시한 내역이에요.",
    tone: "neutral",
  },
};

const sourceStatusMap: Record<SourceStatus, DisplayStatus> = {
  analyzing: "analyzing",
  ready: "preparing",
  submissionPending: "submissionPending",
  completed: "completed",
};

const exampleHref: Record<SourceStatus, string> = {
  analyzing: "/analyzing",
  ready: "/package",
  submissionPending: "/submission-ready",
  completed: "/reports",
};

const exampleDetails: Record<string, { occurredAt: string; location: string }> = {
  "sample-01": {
    occurredAt: "2026.09.19 14:32",
    location: "서울시 안전구 교통로 교차로 부근 (예시)",
  },
  "sample-02": {
    occurredAt: "2026.09.18 08:46",
    location: "서울시 안전구 중앙로 교차로 부근 (예시)",
  },
  "sample-03": {
    occurredAt: "2026.09.17 19:05",
    location: "서울시 안전구 중앙로 일대 (예시)",
  },
  "sample-05": {
    occurredAt: "2026.09.15 11:14",
    location: "서울시 안전구 교통로 사거리 부근 (예시)",
  },
};

const MOCK_ANALYSIS_DURATION_MS = 4_400;

function formatCurrentOccurredAt(value: string) {
  if (!value.trim()) return "확인 필요";
  return value.replace("T", " ");
}

function violationLabel(type: ViolationType) {
  return type === "unknown" ? "추가 확인 필요" : `${violationLabels[type]} 의심`;
}

function ReportCard({ report }: { report: ReportRow }) {
  const meta = statusMeta[report.status];
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold tracking-[0.06em] text-[#7890a8]">
            {report.isCurrent ? "CURRENT REPORT" : "DEMO REPORT"}
          </p>
          <h3 className="mt-1 text-base font-extrabold leading-6 text-[var(--navy)]">
            {report.title}
          </h3>
        </div>
        <StatusBadge tone={meta.tone} showDot className="shrink-0">
          {meta.label}
        </StatusBadge>
      </div>

      <dl className="mt-5 divide-y divide-[#e8eef4] border-y border-[#e8eef4]">
        <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-semibold text-[#7890a8]">예상 위반 유형</dt>
          <dd className="text-right text-sm font-extrabold text-[#294a65]">
            {violationLabel(report.type)}
          </dd>
        </div>
        <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-semibold text-[#7890a8]">발생 일시</dt>
          <dd className="text-right text-sm font-bold text-[#294a65]">
            {report.occurredAt}
          </dd>
        </div>
        <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-semibold text-[#7890a8]">장소</dt>
          <dd className="text-right text-sm font-bold leading-5 text-[#294a65]">
            {report.location}
          </dd>
        </div>
        <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3">
          <dt className="text-xs font-semibold text-[#7890a8]">현재 상태</dt>
          <dd className="text-right text-sm font-bold leading-5 text-[#294a65]">
            {meta.label}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[#7890a8]">{meta.description}</p>
        {report.href ? (
          <span className="shrink-0 text-sm font-extrabold text-[var(--primary)]">
            이어 보기 →
          </span>
        ) : null}
      </div>
    </>
  );

  if (!report.href) {
    return <article className="surface-card p-5">{content}</article>;
  }

  return (
    <Link
      href={report.href}
      onClick={report.onOpen}
      className="surface-card block p-5 transition-colors hover:border-[#9fc8f3] focus-visible:outline-2 focus-visible:outline-[#2f80ed]"
    >
      {content}
    </Link>
  );
}

export default function ReportsView() {
  const [filter, setFilter] = useState<DisplayStatus | "all">("all");
  const [now, setNow] = useState<number | null>(null);
  const {
    draft,
    submissionReady,
    reportComplete,
    analysisStarted,
    analysisStartedAt,
    setAnalysisStarted,
  } = useDemo();

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timers = [window.setTimeout(refresh, 0)];

    const analysisDueAt =
      analysisStartedAt === null
        ? null
        : analysisStartedAt + MOCK_ANALYSIS_DURATION_MS;
    if (analysisDueAt !== null) {
      const remaining = analysisDueAt - Date.now();
      if (remaining > 0) {
        timers.push(window.setTimeout(refresh, remaining + 20));
      }
    }

    window.addEventListener("focus", refresh);
    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("focus", refresh);
    };
  }, [analysisStartedAt]);

  const isAnalyzing =
    analysisStartedAt !== null &&
    (now === null || now < analysisStartedAt + MOCK_ANALYSIS_DURATION_MS);
  const currentStatus: DisplayStatus = reportComplete
    ? "completed"
    : isAnalyzing
      ? "analyzing"
      : submissionReady
        ? "submissionPending"
        : "preparing";
  const currentHref = reportComplete
    ? undefined
    : isAnalyzing
      ? "/analyzing"
      : submissionReady
        ? "/submission-ready"
        : "/package";

  function openExample(status: SourceStatus) {
    if (status === "analyzing") setAnalysisStarted(true);
  }

  const reports: ReportRow[] = [
    ...(analysisStarted
      ? [
          {
            id: "current",
            title: "현재 신고 준비 자료",
            status: currentStatus,
            occurredAt: formatCurrentOccurredAt(draft.occurredAt),
            location: draft.location.trim() || "확인 필요",
            type: draft.violationType,
            href: currentHref,
            isCurrent: true,
          },
        ]
      : []),
    ...MOCK_REPORTS.map((report): ReportRow => ({
      id: report.id,
      title: report.title,
      status: sourceStatusMap[report.status],
      occurredAt: exampleDetails[report.id]?.occurredAt ?? report.date,
      location: exampleDetails[report.id]?.location ?? "장소 확인 필요",
      type: report.type,
      href: report.status === "completed" ? undefined : exampleHref[report.status],
      onOpen: () => openExample(report.status),
    })),
  ];
  const visibleReports =
    filter === "all"
      ? reports
      : reports.filter((report) => report.status === filter);

  return (
    <div className="space-y-6">
      <InfoCard tone="blue" title="체험용 신고 내역이에요">
        현재 데이터베이스가 연결되지 않아 아래 내역은 모의 데이터로 표시됩니다.
        실제 안전신문고 접수 상태를 자동으로 확인하지 않습니다.
      </InfoCard>

      <section aria-labelledby="report-filter-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="report-filter-title" className="section-heading">
              상태별 보기
            </h2>
            <p className="mt-1 text-xs text-[#7890a8]">
              상태를 누르면 해당 내역만 볼 수 있어요.
            </p>
          </div>
          {filter !== "all" ? (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="min-h-11 shrink-0 px-2 text-sm font-extrabold text-[var(--primary)]"
            >
              전체 보기
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="신고 상태 필터">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className={`min-h-10 rounded-full border px-4 text-xs font-extrabold transition-colors ${
              filter === "all"
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[#dce7f1] bg-white text-[#61788e]"
            }`}
          >
            전체 {reports.length}
          </button>
          {displayStatusOrder.map((status) => {
            const count = reports.filter(
              (report) => report.status === status,
            ).length;
            return (
              <button
                type="button"
                key={status}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
                className={`min-h-10 rounded-full border px-4 text-xs font-extrabold transition-colors ${
                  filter === status
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[#dce7f1] bg-white text-[#61788e]"
                }`}
              >
                {statusMeta[status].label} {count}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="report-list-title" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="report-list-title" className="section-heading">
            {filter === "all" ? "전체 내역" : statusMeta[filter].label}
          </h2>
          <span className="text-xs font-bold text-[#7890a8]">
            {visibleReports.length}건
          </span>
        </div>

        {visibleReports.length === 0 ? (
          <div className="surface-card px-5 py-10 text-center text-sm text-[#7890a8]">
            해당 상태의 내역이 없습니다.
          </div>
        ) : (
          visibleReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))
        )}
      </section>
    </div>
  );
}
