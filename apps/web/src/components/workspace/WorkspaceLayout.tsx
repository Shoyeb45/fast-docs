"use client";

import { AppHeader } from "@/components/AppHeader";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-[#0d1117]">
      <AppHeader />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
