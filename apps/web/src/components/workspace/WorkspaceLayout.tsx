"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { WorkspaceSidebar } from "./WorkspaceSidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-[#0d1117]">
      <AppHeader />
      <div className="relative flex flex-1 overflow-hidden">
        {sidebarOpen ? (
          <WorkspaceSidebar onToggle={() => setSidebarOpen(false)} />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-0 top-0 z-10 h-10 w-10 shrink-0 rounded-r-md border border-l-0 border-[#30363d] bg-[#161b22] text-[#8b949e] hover:bg-[#21262d] hover:text-white"
            onClick={() => setSidebarOpen(true)}
            title="Show file tree"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
