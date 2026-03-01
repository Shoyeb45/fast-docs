"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDocByShareToken } from "@/lib/workspace-api";
import { MarkdownPreviewPanel } from "@/components/editor/MarkdownPreviewPanel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SharedDocPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params?.token === "string" ? params.token : Array.isArray(params?.token) ? params.token[0] : "";
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof getDocByShareToken>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Invalid link");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDocByShareToken(token)
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch(() => {
        if (!cancelled) setError("This link is invalid or has expired.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#8b949e]">Loading…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-red-400">{error ?? "Document not found"}</p>
        <Link href="/" className="text-[#58a6ff] hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1117]">
      <header className="flex h-10 shrink-0 items-center gap-3 border-b border-[#30363d] bg-[#161b22]/80 px-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9]"
          title="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-0 truncate text-sm text-[#c9d1d9]" title={doc.title}>
          {doc.title || "Untitled"}
        </span>
        <span className="ml-auto text-xs text-[#8b949e]">View only</span>
      </header>
      <div className="flex-1 min-h-0 overflow-hidden">
        <MarkdownPreviewPanel content={doc.content} />
      </div>
    </div>
  );
}
