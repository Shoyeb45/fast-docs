"use client";

import { useContext, useCallback, useRef, useState } from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save } from "lucide-react";
import { initialMarkdownText } from "@/lib/constants";

export function GuestEditor() {
  const auth = useContext(AuthContext);
  const [content, setContent] = useState(initialMarkdownText);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
  }, []);

  const handleSaveClick = () => setLoginDialogOpen(true);

  const handleLogin = () => {
    setLoginDialogOpen(false);
    auth?.loginWithGitHub();
  };

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
        <span className="min-w-0 truncate text-sm text-[#c9d1d9]">Untitled</span>
        <div className="ml-auto flex items-center gap-2">
          <MarkdownState
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isMobile={false}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-[#8b949e] hover:text-[#c9d1d9]"
            onClick={handleSaveClick}
            title="Save (sign in required)"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
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

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d]">
          <DialogHeader>
            <DialogTitle className="text-[#c9d1d9]">Sign in to save your document</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#8b949e] py-2">
            Sign in with GitHub to save this document to your workspace.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
              className="border-[#30363d] text-[#c9d1d9]"
            >
              Cancel
            </Button>
            <Button className="bg-[#238636] hover:bg-[#2ea043]" onClick={handleLogin}>
              Sign in with GitHub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
