"use client";

import { useContext, useCallback, useRef, useState } from "react";
import { AuthContext } from "@/context/auth-context";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Save } from "lucide-react";
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

  const handleSaveClick = () => {
    setLoginDialogOpen(true);
  };

  const handleLogin = () => {
    setLoginDialogOpen(false);
    auth?.loginWithGitHub();
  };

  return (
    <div className="flex h-full flex-col bg-[#0d1117]">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22]/90 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-[#8b949e]" />
          <span className="truncate text-sm font-medium text-[#c9d1d9]">Untitled</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d] hover:text-white"
          onClick={handleSaveClick}
          title="Save (sign in required)"
        >
          <Save className="h-4 w-4" />
          Save
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
