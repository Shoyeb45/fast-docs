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
        <div className="markdown-preview p-5 md:p-8 max-w-3xl mx-auto">
          {isLoading && (
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#21262d] text-[#8b949e] text-xs rounded border border-[#30363d] animate-pulse">
              Rendering...
            </div>
          )}
          <div
            className="prose prose-invert max-w-none [&>*]:mt-0 [&>*:first-child]:mt-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </ScrollArea>
    </div>
  );
}