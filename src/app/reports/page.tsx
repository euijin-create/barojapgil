import Link from "next/link";
import { SectionLabel } from "@/components/ui";
import ReportsView from "@/features/public/reports-view";

export default function ReportsPage() {
  return (
    <div className="page-container space-y-7 pb-10 pt-4">
      <header>
        <SectionLabel>MY REPORTS</SectionLabel>
        <h1 className="page-heading mt-3">내 신고</h1>
        <p className="page-subtitle mt-3">
          신고 준비부터 직접 제출한 내역까지 상태를 확인하세요.
        </p>
      </header>

      <ReportsView />

      <Link
        href="/upload"
        className="button-primary flex w-full items-center justify-center"
      >
        새 신고 준비하기
      </Link>
    </div>
  );
}
