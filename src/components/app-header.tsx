"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type NavigationIconName = "home" | "new" | "reports" | "map" | "points";

const navigation = [
  { href: "/", label: "홈", icon: "home" as const },
  { href: "/upload", label: "새 신고", icon: "new" as const },
  { href: "/reports", label: "내 신고", icon: "reports" as const },
  { href: "/risk-map", label: "교통위험지도", icon: "map" as const },
];

const reportFlowPaths = new Set([
  "/upload",
  "/analyzing",
  "/results",
  "/diagnosis",
  "/package",
  "/delay",
]);

const backHrefByPath: Record<string, string> = {
  "/upload": "/",
  "/analyzing": "/upload",
  "/results": "/upload",
  "/diagnosis": "/results",
  "/package": "/diagnosis",
  "/delay": "/package",
};

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const paths: Record<NavigationIconName, ReactNode> = {
    home: (
      <>
        <path d="m3.5 10.5 8.5-7 8.5 7" />
        <path d="M5.5 9.5v10h13v-10M9.5 19.5v-6h5v6" />
      </>
    ),
    new: (
      <>
        <path d="M12 3.5v11M7.5 8l4.5-4.5L16.5 8" />
        <path d="M5 14.5v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
      </>
    ),
    reports: (
      <>
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
      </>
    ),
    map: (
      <>
        <path d="m3.5 6 5.5-2.5 6 2.5 5.5-2.5v14L15 20l-6-2.5L3.5 20V6Z" />
        <path d="M9 3.5v14M15 6v14" />
      </>
    ),
    points: (
      <path d="M12 3.5 14.6 8l5.1 1.1-3.5 3.8.6 5.1-4.8-2.1L7.2 18l.6-5.1-3.5-3.8L9.4 8 12 3.5Z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="app-header__nav-icon"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="app-header__brand-mark" aria-hidden="true">
      <svg viewBox="0 0 28 28" fill="none" className="app-header__brand-icon">
        <path
          d="M7.5 22c5.3-2 8.6-4.7 8.6-8.8 0-2.4-1.3-4.2-3.5-5.5"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="m9.2 10.2 3.4-2.5-3.9-1.8"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20.5" cy="8.2" r="1.8" fill="#bfe0ff" />
        <circle cx="7.2" cy="22" r="1.8" fill="#bfe0ff" />
      </svg>
    </span>
  );
}

function isCurrentPath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/upload") return reportFlowPaths.has(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader() {
  const pathname = usePathname();
  const backHref = backHrefByPath[pathname];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__slot app-header__slot--start">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="이전 단계로 이동"
              className="app-header__icon-button"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m14.5 5-7 7 7 7" />
              </svg>
            </Link>
          ) : (
            <span className="app-header__placeholder" aria-hidden="true" />
          )}
        </div>

        <Link href="/" aria-label="바로잡길 홈" className="app-header__brand">
          <BrandMark />
          <span className="app-header__brand-name">바로잡길</span>
        </Link>

        <div
          ref={menuContainerRef}
          className="app-header__slot app-header__slot--end"
        >
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={isMenuOpen ? "전체 메뉴 닫기" : "전체 메뉴 열기"}
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="app-header__icon-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>

          {isMenuOpen ? (
            <nav id={menuId} aria-label="전체 메뉴" className="app-header__menu">
              <ul className="app-header__menu-list">
                {navigation.map((item) => {
                  const isCurrent = isCurrentPath(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                        className="app-header__menu-link"
                      >
                        <span className="app-header__menu-icon">
                          <NavigationIcon name={item.icon} />
                        </span>
                        <span>{item.label}</span>
                        {isCurrent ? (
                          <span className="app-header__current-label">현재</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                <li className="app-header__menu-disabled-row">
                  <button
                    type="button"
                    disabled
                    title="준비 중인 기능입니다"
                    className="app-header__menu-disabled"
                  >
                    <span className="app-header__menu-icon">
                      <NavigationIcon name="points" />
                    </span>
                    <span>안전 포인트</span>
                    <StatusBadge tone="orange" className="app-header__menu-badge">
                      준비 중
                    </StatusBadge>
                  </button>
                </li>
              </ul>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
