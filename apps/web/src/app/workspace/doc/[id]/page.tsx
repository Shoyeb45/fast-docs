"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as workspaceApi from "@/lib/workspace-api";
import { DocEditor } from "@/components/workspace/DocEditor";

export default function DocPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? parseInt(params.id, 10) : NaN;
  const [doc, setDoc] = useState<Awaited<ReturnType<typeof workspaceApi.getDoc>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false);
      setError("Invalid document ID");
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
  }, [id]);

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
    />
  );
}
