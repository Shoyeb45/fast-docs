"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { AuthContext } from "@/context/auth-context";
import { EditorHandle, MarkdownEditorPanel } from "@/components/editor/MarkdownEditor";
import { MarkdownPreviewPanel } from "@/components/editor/MarkdownPreviewPanel";
import { MarkdownState } from "@/components/editor/EditorState";
import type { ViewMode } from "@/components/editor/EditorState";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/workspace/ShareModal";
import { getDocWsRoom } from "@/lib/ws-url";
import apiClient from "@/lib/api-client";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

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
  docRole,
  initialYjsState,
  initialShareOpen,
}: {
  docId: number;
  initialTitle: string;
  initialContent: string;
  docRole?: "owner" | "editor" | "viewer" | "commenter";
  initialYjsState?: string;
  initialShareOpen?: boolean;
}) {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { updateDoc, getDocById } = useWorkspace();
  const [content, setContent] = useState(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [shareOpen, setShareOpen] = useState(initialShareOpen ?? false);
  const [collab, setCollab] = useState<{
    ydoc: Y.Doc;
    provider: WebsocketProvider;
    ytext: Y.Text;
  } | null>(null);
  const editorRef = useRef<EditorHandle>(null);

  const readOnly = docRole === "viewer" || docRole === "commenter";
  const canEdit = docRole === "owner" || docRole === "editor";

  useEffect(() => {
    if (docRole == null) return;
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("content");
    if (initialYjsState) {
      try {
        const state = Uint8Array.from(atob(initialYjsState), (c) => c.charCodeAt(0));
        Y.applyUpdate(ydoc, state);
      } catch (_e) {
        ytext.insert(0, initialContent);
      }
    } else {
      ytext.insert(0, initialContent);
    }
    const token = apiClient.getAccessToken();
    const { baseUrl, room } = getDocWsRoom(docId, token);
    const provider = new WebsocketProvider(baseUrl, room, ydoc);
    const displayName = auth?.user?.name ?? auth?.user?.githubUsername ?? "Koala";
    provider.awareness.setLocalStateField("user", { name: displayName });
    setCollab({ ydoc, provider, ytext });
    return () => {
      provider.destroy();
      ydoc.destroy();
      setCollab(null);
    };
  }, [docId, docRole, initialContent, initialYjsState, auth?.user?.name, auth?.user?.githubUsername]);

  useEffect(() => {
    if (!collab) return;
    const handler = () => setContent(collab.ytext.toString());
    collab.ytext.observe(handler);
    return () => collab.ytext.unobserve(handler);
  }, [collab]);

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
        <div className="ml-auto flex items-center gap-2">
          {docRole === "owner" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#8b949e] hover:text-[#c9d1d9]"
              onClick={() => setShareOpen(true)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
          <MarkdownState
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={false}
          />
        </div>
      </header>

      <ShareModal docId={docId} open={shareOpen} onOpenChange={setShareOpen} />

      <div className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {(viewMode === "edit" || viewMode === "split") && (
            <ResizablePanel
              defaultSize={viewMode === "split" ? 50 : 100}
              minSize={30}
              className="relative"
            >
              {collab ? (
                <MarkdownEditorPanel
                  key={docId}
                  mode="collaborative"
                  ytext={collab.ytext}
                  provider={collab.provider}
                  readOnly={readOnly}
                  onContentChange={canEdit ? handleContentChange : undefined}
                  ref={editorRef}
                />
              ) : (
                <MarkdownEditorPanel
                  key={docId}
                  mode="standalone"
                  initialValue={content}
                  onContentChange={handleContentChange}
                  ref={editorRef}
                />
              )}
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
