"use client";

import { useState, useCallback, useRef } from "react";
import { MarkdownEditorPanel, EditorHandle } from "@/components/MarkdownEditor";
import { MarkdownPreviewPanel } from "@/components/MarkdownPreviewPanel";
import { MarkdownToolbar } from "@/components/MarkdownToolbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ViewMode } from "@/components/EditorState";

export default function Home() {
  const [markdown, setMarkdown] = useState(`
## Heading 2

This is **bold** and this is *italic*.

$$x^2$$
- List item 1
- List item 2

Simple text works?
`);
  
    const [viewMode, setViewMode] = useState<ViewMode>("split");

  // Use EditorHandle type for the ref
  const editorRef = useRef<EditorHandle>(null);

  const handleInsertMarkdown = useCallback((text: string) => {
    // Use the insertMarkdown method from the ref
    editorRef.current?.insertMarkdown(text);
  }, []);

  // Memoize the callback to prevent unnecessary re-renders
  const handleContentChange = useCallback((value: string) => {
    setMarkdown(value);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      <MarkdownToolbar viewMode={viewMode} onViewModeChange={setViewMode} onInsert={handleInsertMarkdown} />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
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
              <MarkdownPreviewPanel content={markdown} />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}