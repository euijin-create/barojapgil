"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { DemoProvider } from "@/features/demo/demo-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DemoProvider>
      <div className="app-shell">
        <AppHeader />
        <main id="main-content" className="app-main">
          {children}
        </main>
      </div>
    </DemoProvider>
  );
}
