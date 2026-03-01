"use client";

import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { WorkspaceLayout } from "@/components/workspace";

export default function WorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </WorkspaceProvider>
  );
}
