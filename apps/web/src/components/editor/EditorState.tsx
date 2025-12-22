import { Button } from "../ui/button";
import { Code, Eye, FileText } from "lucide-react";

export type ViewMode = "split" | "edit" | "preview";

export function MarkdownState({
  viewMode,
  onViewModeChange,
  isMobile,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isMobile: boolean;
}) {
  return (
    <div className="flex items-center bg-[#21262d] rounded-lg p-0.5">
      {/* Edit button */}
      <Button
        variant={viewMode === "edit" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("edit")}
        className={`h-7 px-3 ${viewMode === "edit" ? "bg-[#30363d] text-white" : "text-[#8b949e] hover:text-white"}`}
      >
        <Code className="w-3.5 h-3.5 mr-1.5" />
        Edit
      </Button>
      {/* Split button, don't show if the width is too small */}
      {!isMobile && (
        <Button
          variant={viewMode === "split" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("split")}
          className={`h-7 px-3 ${viewMode === "split" ? "bg-[#30363d] text-white" : "text-[#8b949e] hover:text-white"}`}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Split
        </Button>
      )}

      {/* Preview button */}
      <Button
        variant={viewMode === "preview" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("preview")}
        className={`h-7 px-3 ${viewMode === "preview" ? "bg-[#30363d] text-white" : "text-[#8b949e] hover:text-white"}`}
      >
        <Eye className="w-3.5 h-3.5 mr-1.5" />
        Preview
      </Button>
    </div>
  );
}
