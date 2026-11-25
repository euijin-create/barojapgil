import Link from "next/link";
import { SectionLabel } from "@/components/ui";
import ReportsView from "@/features/public/reports-view";

export default function ReportsPage() {
  return (
    <div className="page-container space-y-7 pb-10 pt-2">
      <header>
        <SectionLabel tone="neutral">신고 준비 내역</SectionLabel>
        <h1 className="page-heading mt-3">내 신고</h1>
        <p className="page-subtitle mt-3">
          분석 중인 자료와 신고 준비 상태를 확인할 수 있어요.
        </p>
      </header>

      <ReportsView />

      <Link
        href="/upload"
        className="button-primary flex w-full items-center justify-center"
      >
        새 자료 분석하기
      </Link>
    </div>
  );
}
