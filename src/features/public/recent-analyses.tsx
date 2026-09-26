"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-context";
import { MOCK_REPORTS } from "@/lib/demo-data";

export default function RecentAnalyses() {
  const { selectedFile, analysisStarted, scheduledAt, reportComplete } = useDemo();
  const examples = MOCK_REPORTS.slice(0, 2);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {(selectedFile || analysisStarted) && <Link href={reportComplete ? "/reports" : scheduledAt !== null ? "/delay" : analysisStarted ? "/results" : "/upload"} className="surface-card group flex min-h-24 items-center gap-4 p-4 transition hover:border-[#7bcfbc] hover:shadow-md"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e8f5ef] text-[#24856e]" aria-hidden="true">●</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#1a3948]">현재 살펴보는 신고 자료</span><span className="mt-1 block text-xs text-[#697f87]">{reportComplete ? "직접 신고 완료로 표시됨" : scheduledAt !== null ? "신고 시점 설정됨" : analysisStarted ? "신고 자료 확인 중" : "분석 시작 전"}</span></span><span className="text-[#278d75] transition group-hover:translate-x-1" aria-hidden="true">→</span></Link>}
      {examples.map((report) => <Link key={report.id} href="/reports" className="surface-card group flex min-h-24 items-center gap-4 p-4 transition hover:border-[#7bcfbc] hover:shadow-md"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#edf3f5] text-[#66828c]" aria-hidden="true">▤</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#1a3948]">{report.title}</span><span className="mt-1 block text-xs text-[#697f87]">{report.date} · 체험용 예시</span></span><span className="text-[#278d75] transition group-hover:translate-x-1" aria-hidden="true">→</span></Link>)}
    </div>
  );
}
