"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDemo } from "@/features/demo/demo-context";
import { MOCK_REPORTS, violationLabels } from "@/lib/demo-data";

type Status = (typeof MOCK_REPORTS)[number]["status"];
type ReportRow = (typeof MOCK_REPORTS)[number] & { href: string; isCurrent?: boolean };

const statusOrder: Status[] = ["analyzing", "ready", "delayed", "available", "completed"];
const statusMeta: Record<Status, { label: string; className: string; description: string }> = {
  analyzing: { label: "분석 중", className: "bg-[#eaf1f5] text-[#386780]", description: "위반 의심 장면을 살펴보는 중" },
  ready: { label: "신고 준비 완료", className: "bg-[#e6f5f0] text-[#237961]", description: "내용을 확인하고 신고 시점을 정할 수 있어요" },
  delayed: { label: "안전 지연 중", className: "bg-[#fff2dd] text-[#95652a]", description: "설정한 신고 가능 시각을 기다리는 중" },
  available: { label: "신고 가능", className: "bg-[#e2f4e8] text-[#27834d]", description: "이동 버튼 활성 · 실제 신고 기한은 별도 확인" },
  completed: { label: "신고 완료", className: "bg-[#edf0f2] text-[#5f7079]", description: "사용자가 직접 완료로 표시한 내역" },
};

const exampleHref: Record<Status, string> = {
  analyzing: "/analyzing", ready: "/package", delayed: "/delay", available: "/delay", completed: "/reports",
};
const MOCK_ANALYSIS_DURATION_MS = 4_400;

export default function ReportsView() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [now, setNow] = useState<number | null>(null);
  const {
    selectedCandidate,
    scheduledAt,
    reportComplete,
    analysisStarted,
    analysisStartedAt,
    scheduleDelay,
    setAnalysisStarted,
  } = useDemo();
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timers = [window.setTimeout(refresh, 0)];
    for (const dueAt of [analysisStartedAt === null ? null : analysisStartedAt + MOCK_ANALYSIS_DURATION_MS, scheduledAt]) {
      if (dueAt !== null) {
        const remaining = dueAt - Date.now();
        if (remaining > 0) timers.push(window.setTimeout(refresh, remaining + 20));
      }
    }
    window.addEventListener("focus", refresh);
    return () => { timers.forEach(window.clearTimeout); window.removeEventListener("focus", refresh); };
  }, [analysisStartedAt, scheduledAt]);
  const hasCurrent = analysisStarted;
  const isAnalyzing = analysisStartedAt !== null && (now === null || now < analysisStartedAt + MOCK_ANALYSIS_DURATION_MS);
  const currentStatus: Status = reportComplete
    ? "completed"
    : scheduledAt !== null
      ? now !== null && now >= scheduledAt ? "available" : "delayed"
      : isAnalyzing ? "analyzing" : "ready";
  const currentHref = reportComplete ? "/reports" : scheduledAt !== null ? "/delay" : isAnalyzing ? "/analyzing" : "/package";
  const reports: ReportRow[] = [
    ...(hasCurrent ? [{ id: "current", title: "현재 신고 준비 자료", subtitle: isAnalyzing ? "AI 참고 분석 진행 중 · 현재 세션" : `${violationLabels[selectedCandidate.type]} 의심 · 현재 세션`, status: currentStatus, date: "현재 세션", type: selectedCandidate.type, href: currentHref, isCurrent: true }] : []),
    ...MOCK_REPORTS.map((report) => ({ ...report, href: exampleHref[report.status] })),
  ];
  const visible = filter === "all" ? reports : reports.filter((report) => report.status === filter);

  function openExample(status: Status) {
    if (status === "analyzing") setAnalysisStarted(true);
    if (status === "delayed") scheduleDelay(6);
    if (status === "available") scheduleDelay(0);
  }

  return (
    <div className="space-y-5">
      <section className="surface-card p-5" aria-labelledby="report-status-heading">
        <div className="flex items-center justify-between gap-3"><h2 id="report-status-heading" className="text-base font-bold text-[#17384a]">진행 상태</h2><span className="text-xs text-[#6b8088]">체험용 예시 포함</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {statusOrder.map((status) => {
            const count = reports.filter((report) => report.status === status).length;
            return <button type="button" key={status} onClick={() => setFilter(filter === status ? "all" : status)} aria-pressed={filter === status} className={`min-h-20 rounded-2xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-[#267f74] ${filter === status ? "border-[#268b7a] bg-[#e8f7f1]" : "border-[#e4ecec] bg-[#f8fbfa] hover:border-[#a9d9cc]"}`}><span className="block text-xs font-medium text-[#657b83]">{statusMeta[status].label}</span><span className="mt-1 block text-2xl font-bold text-[#17384a]">{count}<span className="ml-1 text-xs font-normal text-[#7d9095]">건</span></span></button>;
          })}
        </div>
      </section>

      <section aria-labelledby="report-list-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3"><h2 id="report-list-heading" className="section-heading">{filter === "all" ? "전체 내역" : statusMeta[filter].label}</h2>{filter !== "all" && <button type="button" onClick={() => setFilter("all")} className="text-sm font-semibold text-[#218274] underline-offset-4 hover:underline">전체 보기</button>}</div>
        {visible.length === 0 ? <div className="surface-card p-7 text-center text-sm text-[#6b8088]">해당 상태의 내역이 없습니다.</div> : visible.map((report) => {
          const meta = statusMeta[report.status];
          const content = <><div className="flex flex-wrap items-start justify-between gap-3"><span className="inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold text-[#277c6a] bg-[#e8f5ef]">{report.isCurrent ? "현재 진행" : "체험용 예시"}</span><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span></div><h3 className="mt-4 text-base font-bold text-[#17384a]">{report.title}</h3><p className="mt-1 text-sm text-[#687e86]">{report.subtitle}</p><div className="mt-5 flex items-center justify-between border-t border-[#e9efee] pt-4"><span className="text-xs text-[#819399]">{report.date} · {meta.description}</span><span className="shrink-0 text-sm font-bold text-[#23816f]">{report.status === "completed" ? "완료 표시" : "이어 보기 →"}</span></div></>;
          return report.status === "completed" ? <article key={report.id} className="surface-card p-5">{content}</article> : <Link key={report.id} href={report.href} onClick={report.isCurrent ? undefined : () => openExample(report.status)} className="surface-card block p-5 transition hover:border-[#8ccfbd] hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#267f74]">{content}</Link>;
        })}
      </section>
      <div className="rounded-2xl border border-[#d8e9e7] bg-[#f0f8f6] p-4 text-sm leading-6 text-[#55727a]">이 화면의 예시 내역은 모의 데이터입니다. 안전신문고로 이동하거나 신고 자료를 준비하는 것만으로 실제 신고 완료가 확인되지는 않습니다. 현재 세션의 자료는 새로고침하면 사라질 수 있습니다.</div>
    </div>
  );
}
