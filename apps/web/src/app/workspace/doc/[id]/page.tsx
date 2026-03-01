"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import * as workspaceApi from "@/lib/workspace-api";
import { AuthContext } from "@/context/auth-context";
import { DocEditor } from "@/components/workspace/DocEditor";
import { Button } from "@/components/ui/button";

export default function DocPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useContext(AuthContext);
  const [mounted, setMounted] = useState(false);
  const id = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN;
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof workspaceApi.getDoc>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = auth?.isAuthenticated ?? false;

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated || !Number.isFinite(id)) {
      setLoading(false);
      if (!Number.isFinite(id)) setError("Invalid document ID");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    workspaceApi
      .getDoc(id)
      .then((d) => {
        if (!cancelled) setDoc(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load document");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted, id, isAuthenticated]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#8b949e]">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-[#c9d1d9]">Sign in to open this document.</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-[#30363d] text-[#c9d1d9]"
            onClick={() => router.push("/workspace")}
          >
            Back to workspace
          </Button>
          <Button
            className="bg-[#238636] hover:bg-[#2ea043]"
            onClick={() => auth?.loginWithGitHub()}
          >
            Sign in with GitHub
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[#8b949e]">Loading document…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-red-400">{error ?? "Document not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/workspace")}
          className="text-[#58a6ff] hover:underline"
        >
          Back to workspace
        </button>
      </div>
    );
  }

  return (
    <DocEditor
      docId={doc.id}
      initialTitle={doc.title}
      initialContent={doc.content}
      docRole={doc.role}
      initialYjsState={doc.yjsState}
      initialShareOpen={searchParams.get("share") === "1"}
    />
  );
}
