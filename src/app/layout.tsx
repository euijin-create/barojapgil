import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "바로잡길 | AI 교통안전 신고 지원",
  description: "교통법규 위반 의심 장면을 찾고 신고 자료를 준비하는 AI 참고 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
