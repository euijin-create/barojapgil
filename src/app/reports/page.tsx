import Link from "next/link";
import ReportsView from "@/features/public/reports-view";

export default function ReportsPage() {
  return (
    <div className="page-container space-y-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">신고 준비 현황</p><h1 className="page-heading mt-1">내 신고</h1><p className="page-subtitle mt-2">분석부터 직접 신고까지, 진행 상태를 확인하세요.</p></div>
        <Link href="/upload" className="button-primary inline-flex min-h-12 items-center justify-center px-5">새 자료 분석하기</Link>
      </div>
      <ReportsView />
    </div>
  );
}
