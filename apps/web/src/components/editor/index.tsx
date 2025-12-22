import { initialMarkdownText } from "@/lib/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorHandle, MarkdownEditorPanel } from "./MarkdownEditor";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { ViewMode } from "./EditorState";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { MarkdownPreviewPanel } from "./MarkdownPreviewPanel";

export default function Editor() {
  // Markdown variable to handle the text of the editor
  const [markdown, setMarkdown] = useState(initialMarkdownText);
  // split, preview or edit
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  // exposes certain functions
  const editorRef = useRef<EditorHandle>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Force single panel view on mobile if split is selected
      if (mobile && viewMode === "split") {
        setViewMode("edit");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [viewMode]);

  const handleInsertMarkdown = useCallback((text: string) => {
    editorRef.current?.insertMarkdown(text);
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setMarkdown(text);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* The header of the markdown editor, where the inserting and the view mode is there */}
      <MarkdownToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onInsert={handleInsertMarkdown}
        isMobile={isMobile}
      />

      {/* main body of the markdown */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* on edit or in split */}
          {(viewMode === "edit" || viewMode === "split") && (
            <ResizablePanel
              defaultSize={viewMode === "split" ? 50 : 100}
              minSize={30}
              className="relative"
            >
              <MarkdownEditorPanel
                mode="standalone"
                initialValue={markdown}
                onContentChange={handleContentChange}
                ref={editorRef}
              />
            </ResizablePanel>
          )}

          {/* Only show the divider and resizable in split mode */}
          {viewMode === "split" && (
            <ResizableHandle className="w-px bg-[#30363d] hover:bg-[#58a6ff] transition-colors" />
          )}

          {/* Show the preview in either preview or split */}
          {(viewMode === "preview" || viewMode === "split") && (
            <ResizablePanel
              defaultSize={viewMode === "split" ? 50 : 100}
              minSize={30}
            >
              <MarkdownPreviewPanel content={markdown} />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
