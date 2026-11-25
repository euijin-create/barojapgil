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
    iconClassName: string;
  }
> = {
  analyzing: {
    label: "분석 중",
    description: "AI 참고 분석을 진행하고 있어요.",
    tone: "blue",
    iconClassName: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  preparing: {
    label: "신고 준비 중",
    description: "결과와 신고 내용을 확인할 차례예요.",
    tone: "blue",
    iconClassName: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  submissionPending: {
    label: "안전신문고 제출 대기",
    description: "사용자가 안전신문고에서 직접 제출해야 해요.",
    tone: "orange",
    iconClassName: "bg-[var(--orange-soft)] text-[#9a5b0d]",
  },
  completed: {
    label: "신고 완료",
    description: "사용자가 직접 완료로 표시한 내역이에요.",
    tone: "mint",
    iconClassName: "bg-[var(--mint-soft)] text-[var(--mint-dark)]",
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

const exampleDetails: Record<
  string,
  { occurredAt: string; location: string }
> = {
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

function ReportStatusIcon({ status }: { status: DisplayStatus }) {
  if (status === "completed") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.4 12.1 2.3 2.3 4.9-5" />
      </svg>
    );
  }

  if (status === "submissionPending") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M5.5 4.5h8l5 5v10h-13v-15Z" />
        <path d="M13.5 4.5v5h5M9 14h6M12 11v6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M5.5 4.5h8l5 5v10h-13v-15Z" />
      <path d="M13.5 4.5v5h5M8.5 14h7M8.5 17h4" />
    </svg>
  );
}

function ReportCard({ report }: { report: ReportRow }) {
  const meta = statusMeta[report.status];
  const content = (
    <>
      <div className="flex items-start gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.iconClassName}`}
          aria-hidden="true"
        >
          <ReportStatusIcon status={report.status} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
                report.isCurrent
                  ? "bg-[var(--mint-soft)] text-[var(--mint-dark)]"
                  : "bg-[var(--orange-soft)] text-[#965d12]"
              }`}
            >
              {report.isCurrent ? "현재 작업" : "DEMO"}
            </span>
            <StatusBadge tone={meta.tone} showDot>
              {meta.label}
            </StatusBadge>
          </div>
          <h3 className="mt-2 text-base font-extrabold leading-6 text-[var(--navy)]">
            {report.title}
          </h3>
          <p className="mt-0.5 text-[13px] font-bold leading-5 text-[#45627a]">
            {violationLabel(report.type)}
          </p>
        </div>
      </div>

      <dl className="mt-4 divide-y divide-[#e8eef4] border-y border-[#e8eef4]">
        <div className="grid grid-cols-[68px_minmax(0,1fr)] gap-3 py-2.5">
          <dt className="text-xs font-semibold text-[var(--ink-muted)]">
            발생 일시
          </dt>
          <dd className="text-right text-[13px] font-bold text-[#294a65]">
            {report.occurredAt}
          </dd>
        </div>
        <div className="grid grid-cols-[68px_minmax(0,1fr)] gap-3 py-2.5">
          <dt className="text-xs font-semibold text-[var(--ink-muted)]">
            장소
          </dt>
          <dd className="break-words text-right text-[13px] font-bold leading-5 text-[#294a65]">
            {report.location}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-xs leading-5 text-[var(--ink-muted)]">
          {meta.description}
        </p>
        {report.href ? (
          <span className="shrink-0 text-xs font-extrabold text-[var(--primary)]">
            계속 보기
          </span>
        ) : null}
      </div>
    </>
  );

  if (!report.href) {
    return <article className="surface-card p-4">{content}</article>;
  }

  return (
    <Link
      href={report.href}
      onClick={report.onOpen}
      className="surface-card block p-4 transition-colors hover:border-[#91bff2] hover:bg-[#fbfdff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
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
      <InfoCard tone="blue" title="체험용 내역 안내">
        현재 작업은 이 화면에서만 유지되고, DEMO 표시는 예시 데이터입니다.
        실제 안전신문고 접수 상태와 연동되지 않아요.
      </InfoCard>

      <section aria-labelledby="report-filter-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 id="report-filter-title" className="section-heading">
              상태별 보기
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              원하는 상태만 골라볼 수 있어요.
            </p>
          </div>
          {filter !== "all" ? (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="min-h-11 shrink-0 rounded-lg px-2 text-sm font-extrabold text-[var(--primary)]"
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
            className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-xs font-extrabold transition-colors ${
              filter === "all"
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--line)] bg-white text-[#61788e]"
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
                className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-xs font-extrabold transition-colors ${
                  filter === status
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--line)] bg-white text-[#61788e]"
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
          <span className="text-xs font-bold text-[var(--ink-muted)]">
            {visibleReports.length}건
          </span>
        </div>

        {visibleReports.length === 0 ? (
          <div className="surface-card px-5 py-10 text-center">
            <span
              className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#eef3f7] text-[#61788e]"
              aria-hidden="true"
            >
              <ReportStatusIcon status="completed" />
            </span>
            <p className="mt-3 text-sm font-extrabold text-[var(--navy)]">
              표시할 내역이 없어요
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
              다른 상태를 선택해보세요.
            </p>
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
