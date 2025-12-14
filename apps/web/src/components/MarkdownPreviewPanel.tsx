// components/MarkdownPreviewPanel.tsx (Optimized with debouncing)
"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { renderMarkdown } from "@/lib/renderMarkdown";

interface MarkdownPreviewPanelProps {
  content: string;
  debounceMs?: number; // Optional debounce delay in milliseconds
}

export function MarkdownPreviewPanel({ 
  content, 
  debounceMs = 300 
}: MarkdownPreviewPanelProps) {
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clear existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    // Debounce the rendering
    renderTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const rendered = await renderMarkdown(content);
        if (!cancelled) {
          setHtml(rendered);
        }
      } catch (error) {
        console.error("Markdown rendering error:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [content, debounceMs]);

  return (
    <div className="h-full bg-[#0d1117] relative">
      <ScrollArea className="h-full">
        <div className="markdown-preview p-6 md:p-10 max-w-3xl mx-auto">
          {isLoading && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#21262d] text-[#8b949e] text-sm rounded-md border border-[#30363d] animate-pulse">
              Rendering...
            </div>
          )}
          <div
            className="prose prose-lg prose-invert max-w-none
              prose-headings:text-[#c9d1d9] 
              prose-p:text-[#c9d1d9] 
              prose-a:text-[#58a6ff] 
              prose-code:text-[#79c0ff] 
              prose-strong:text-[#c9d1d9]
              prose-pre:bg-[#161b22] 
              prose-pre:border 
              prose-pre:border-[#30363d]
              prose-code:before:content-none
              prose-code:after:content-none
              prose-pre:p-0
              prose-pre:my-4
              "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}