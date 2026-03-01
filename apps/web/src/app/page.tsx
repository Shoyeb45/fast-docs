"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/workspace");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[#8b949e]">Redirecting to workspace…</p>
    </div>
  );
}
