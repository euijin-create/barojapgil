import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://barojapgil.vercel.app"),
  title: {
    default: "바로잡길 | AI 교통안전 신고 지원",
    template: "%s | 바로잡길",
  },
  description:
    "교통법규 위반 의심 장면을 찾고 신고 자료를 준비하는 AI 참고 서비스",
  applicationName: "바로잡길",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "바로잡길",
    title: "바로잡길 | AI 교통안전 신고 지원",
    description:
      "교통법규 위반 의심 장면을 찾고 신고 자료를 준비하는 AI 참고 서비스",
    images: [
      {
        url: "/brand/logo-full.png",
        width: 1200,
        height: 399,
        alt: "바로잡길",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "바로잡길 | AI 교통안전 신고 지원",
    description:
      "교통법규 위반 의심 장면을 찾고 신고 자료를 준비하는 AI 참고 서비스",
    images: ["/brand/logo-full.png"],
  },
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
