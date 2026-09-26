"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DemoProvider } from "@/features/demo/demo-context";

type IconName = "home" | "upload" | "reports" | "map";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    home: (
      <>
        <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3" />
        <path d="m7 8 5-5 5 5" />
        <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </>
    ),
    reports: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15M15 6v15" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none" width="30" height="30">
        <path
          d="M9 28.5c6.7-2.6 11.2-6.1 11.2-11.3 0-3.2-1.8-5.5-4.6-7.2"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="m11.3 13.2 4.3-3.2-5-2.2"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="26.3" cy="10.5" r="2.3" fill="#B8EEDC" />
        <circle cx="8.7" cy="28.5" r="2.3" fill="#B8EEDC" />
      </svg>
    </span>
  );
}

const navigation = [
  { href: "/", label: "홈", icon: "home" as const },
  { href: "/upload", label: "자료 분석", icon: "upload" as const },
  { href: "/reports", label: "내 신고", icon: "reports" as const },
  { href: "/risk-map", label: "위험지도", icon: "map" as const },
];

function NavLink({
  href,
  label,
  icon,
  active,
  mobile = false,
}: {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      className={mobile ? "bottom-nav-link" : "desktop-nav-link"}
      aria-current={active ? "page" : undefined}
    >
      <Icon name={icon} size={mobile ? 21 : 18} />
      <span>{label}</span>
    </Link>
  );
}

function ShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="page-container header-inner">
          <Link href="/" className="brand-link" aria-label="바로잡길 홈">
            <BrandMark />
            <span className="brand-copy">
              <strong>바로잡길</strong>
              <small>교통안전 신고 지원</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="주 메뉴">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={
                  item.href === "/upload"
                    ? ["/upload", "/analyzing", "/results", "/diagnosis", "/package", "/delay"].some(
                        (path) => pathname.startsWith(path),
                      )
                    : pathname === item.href
                }
              />
            ))}
          </nav>
          <span className="demo-indicator">MVP 체험판</span>
        </div>
      </header>

      <main id="main-content" className="app-main">
        {children}
      </main>

      <nav className="bottom-nav" aria-label="하단 메뉴">
        <div className="bottom-nav-inner">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={
                item.href === "/upload"
                  ? ["/upload", "/analyzing", "/results", "/diagnosis", "/package", "/delay"].some(
                      (path) => pathname.startsWith(path),
                    )
                  : pathname === item.href
              }
              mobile
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <ShellContent>{children}</ShellContent>
    </DemoProvider>
  );
}
