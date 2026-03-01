"use client";

import { FileText } from "lucide-react";

export default function WorkspaceHomePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <FileText className="h-16 w-16 text-[#8b949e]" />
      <h2 className="text-lg font-medium text-[#c9d1d9]">No document selected</h2>
      <p className="max-w-sm text-sm text-[#8b949e]">
        Create a new document from the sidebar or select one from the list to start editing.
      </p>
    </div>
  );
}
