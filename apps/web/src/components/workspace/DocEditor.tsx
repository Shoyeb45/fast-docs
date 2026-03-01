"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { EditorHandle, MarkdownEditorPanel } from "@/components/editor/MarkdownEditor";
import { MarkdownPreviewPanel } from "@/components/editor/MarkdownPreviewPanel";
import { MarkdownState } from "@/components/editor/EditorState";
import type { ViewMode } from "@/components/editor/EditorState";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ArrowLeft } from "lucide-react";

const SAVE_DEBOUNCE_MS = 800;

function useDebouncedSave(save: (content: string) => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContentRef = useRef<string>("");

  const debouncedSave = useCallback(
    (content: string) => {
      lastContentRef.current = content;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        save(lastContentRef.current);
      }, delay);
    },
    [save, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debouncedSave;
}

export function DocEditor({
  docId,
  initialContent,
  initialTitle,
}: {
  docId: number;
  initialTitle: string;
  initialContent: string;
}) {
  const router = useRouter();
  const { updateDoc, getDocById } = useWorkspace();
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const editorRef = useRef<EditorHandle>(null);

  const docTitle = getDocById(docId)?.title ?? initialTitle;

  const saveContent = useDebouncedSave(
    (text) => updateDoc(docId, { content: text }),
    SAVE_DEBOUNCE_MS
  );

  const handleContentChange = useCallback(
    (text: string) => {
      setContent(text);
      saveContent(text);
    },
    [saveContent]
  );

  return (
    <div className="flex h-full flex-col bg-[#0d1117]">
      <header className="flex h-10 shrink-0 items-center gap-3 border-b border-[#30363d] bg-[#161b22]/80 px-3">
        <Link
          href="/workspace"
          className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9]"
          title="Back to documents"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-0 truncate text-sm text-[#c9d1d9]" title={docTitle}>
          {docTitle || "Untitled"}
        </span>
        <div className="ml-auto">
          <MarkdownState
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={false}
          />
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {(viewMode === "edit" || viewMode === "split") && (
            <ResizablePanel
              defaultSize={viewMode === "split" ? 50 : 100}
              minSize={30}
              className="relative"
            >
              <MarkdownEditorPanel
                key={docId}
                mode="standalone"
                initialValue={content}
                onContentChange={handleContentChange}
                ref={editorRef}
              />
            </ResizablePanel>
          )}
          {viewMode === "split" && (
            <ResizableHandle className="w-px bg-[#30363d] hover:bg-[#58a6ff] transition-colors" />
          )}
          {(viewMode === "preview" || viewMode === "split") && (
            <ResizablePanel
              defaultSize={viewMode === "split" ? 50 : 100}
              minSize={30}
            >
              <MarkdownPreviewPanel content={content} />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
