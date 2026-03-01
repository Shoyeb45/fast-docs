"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { EditorHandle, MarkdownEditorPanel } from "@/components/editor/MarkdownEditor";
import { MarkdownToolbar } from "@/components/editor/MarkdownToolbar";
import { MarkdownPreviewPanel } from "@/components/editor/MarkdownPreviewPanel";
import { ViewMode } from "@/components/editor/EditorState";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";

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
  onTitleChange?: (title: string) => void;
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
      {/* Editor header: file name + close */}
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22]/90 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-[#8b949e]" />
          <span className="truncate text-sm font-medium text-[#c9d1d9]" title={docTitle}>
            {docTitle || "Untitled"}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-[#8b949e] hover:bg-[#21262d] hover:text-white"
          onClick={() => router.push("/workspace")}
          title="Close file"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <MarkdownToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onInsert={(text) => editorRef.current?.insertMarkdown(text)}
        isMobile={false}
      />
      <div className="flex-1 min-h-0 overflow-hidden rounded-b-lg border-x border-b border-[#30363d]/80 bg-[#0d1117] mx-2 mb-2">
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
