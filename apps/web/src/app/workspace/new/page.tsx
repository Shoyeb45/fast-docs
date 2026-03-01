"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/auth-context";
import { GuestEditor } from "@/components/workspace/GuestEditor";

export default function NewDocPage() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/workspace");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#8b949e]">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <GuestEditor />
    </div>
  );
}
