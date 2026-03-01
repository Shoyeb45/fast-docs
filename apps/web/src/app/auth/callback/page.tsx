"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) {
      router.replace("/");
      return;
    }
    const params = new URLSearchParams(hash);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (accessToken && refreshToken) {
      apiClient.setTokens({ accessToken, refreshToken });
    }
    // Replace so we don't keep hash in history; app will load user in AuthProvider
    window.history.replaceState(null, "", window.location.pathname);
    router.replace("/");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}
