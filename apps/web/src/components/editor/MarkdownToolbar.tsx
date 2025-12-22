// components/MarkdownToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownState } from "./EditorState";
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Table,
  Code,
  LucideIcon,
} from "lucide-react";
import { ViewMode } from "./EditorState";

interface MarkdownToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  onInsert: (text: string) => void;
  isMobile: boolean;
}

type ToolbarButton = {
  icon: LucideIcon;
  label: string;
  markdown: string;
};

type ToolbarDivider = {
  divider: true;
};

type ToolbarItem = ToolbarButton | ToolbarDivider;

const toolbarButtons: ToolbarItem[] = [
  { icon: Bold, label: "Bold", markdown: "**text**" },
  { icon: Italic, label: "Italic", markdown: "*text*" },
  { divider: true },
  { icon: List, label: "Bullet List", markdown: "\n- " },
  { icon: ListOrdered, label: "Numbered List", markdown: "\n1. " },
  { divider: true },
  { icon: Link, label: "Insert Link", markdown: "[text](url)" },
  { icon: ImageIcon, label: "Insert Image", markdown: "![alt](url)" },
  { divider: true },
  { icon: Quote, label: "Blockquote", markdown: "\n> " },
  {
    icon: Table,
    label: "Insert Table",
    markdown: "\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |",
  },
  { icon: Code, label: "Code Block", markdown: "\n```\ncode\n```" },
];

export function MarkdownToolbar({
  viewMode,
  onViewModeChange,
  onInsert,
  isMobile,
}: MarkdownToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 h-10 border-b border-[#30363d] bg-[#161b22]/50">
      {!isMobile && (
        <div className="flex items-center gap-1 px-4 h-10 border-b border-[#30363d] bg-[#161b22]/50">
          <TooltipProvider>
            {toolbarButtons.map((button, index) => {
              if ("divider" in button) {
                return (
                  <div
                    key={`divider-${index}`}
                    className="w-px h-4 bg-[#30363d] mx-1"
                  />
                );
              }

              const Icon = button.icon;
              return (
                <Tooltip key={button.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[#8b949e] hover:text-white hover:bg-[#21262d]"
                      onClick={() => onInsert(button.markdown)}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent
                    side="bottom"
                    className="bg-[#161b22] border-[#30363d] text-white"
                    sideOffset={5}
                  >
                    <span className="block">{button.label}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      )}
      <div>
        <MarkdownState
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
