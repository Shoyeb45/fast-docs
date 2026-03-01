"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, FileText, Folder, FolderPlus, MoreHorizontal, PanelLeftClose, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { buildWorkspaceTree, type TreeNode } from "@/lib/workspace-tree";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sidebarCls =
  "flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-sm text-[#c9d1d9] hover:bg-[#21262d]";

/** Unique key for tree nodes (folder and doc can share numeric id). */
function treeNodeKey(node: TreeNode): string {
  return node.type === "folder" ? `folder-${node.folder.id}` : `doc-${node.doc.id}`;
}

function DocItem({
  doc,
  depth,
  isActive,
}: {
  doc: { id: number; title: string };
  depth: number;
  isActive: boolean;
}) {
  const { deleteDoc, updateDoc } = useWorkspace();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(doc.title);
  const [isDragging, setIsDragging] = useState(false);

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    await updateDoc(doc.id, { title: renameValue.trim() });
    setRenameOpen(false);
  };

  const handleDelete = async () => {
    if (typeof window !== "undefined" && window.confirm("Delete this document?")) {
      await deleteDoc(doc.id);
    }
  };

  return (
    <>
      <div
        className={cn(
          sidebarCls,
          "group",
          isActive && "bg-[#21262d] text-white",
          isDragging && "opacity-50"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
        draggable
        onDragStart={(e) => {
          setIsDragging(true);
          e.dataTransfer.setData("application/x-fastdocs-doc", String(doc.id));
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => setIsDragging(false)}
      >
        <Link
          href={`/workspace/doc/${doc.id}`}
          className="flex min-w-0 flex-1 items-center gap-1.5 truncate"
        >
          <FileText className="h-4 w-4 shrink-0 text-[#8b949e]" />
          <span className="min-w-0 truncate">{doc.title || "Untitled"}</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-[#161b22] border-[#30363d]">
          <DropdownMenuItem
            className="text-[#c9d1d9] focus:bg-[#21262d]"
            onClick={(e) => {
              e.preventDefault();
              setRenameValue(doc.title);
              setRenameOpen(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            className="text-red-400 focus:bg-red-500/10"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d]">
          <DialogHeader>
            <DialogTitle className="text-[#c9d1d9]">Rename document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-doc" className="text-[#8b949e]">Title</Label>
              <Input
                id="rename-doc"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} className="border-[#30363d] text-[#c9d1d9]">
              Cancel
            </Button>
            <Button onClick={handleRename} className="bg-[#238636] hover:bg-[#2ea043]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FolderItem({
  node,
  depth,
  onNewFolderInside,
  onRefetch,
}: {
  node: { type: "folder"; folder: { id: number; name: string }; children: TreeNode[] };
  depth: number;
  onNewFolderInside?: (parentId: number) => void;
  onRefetch?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { deleteFolder, updateFolder, updateDoc } = useWorkspace();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(node.folder.name);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    await updateFolder(node.folder.id, { name: renameValue.trim() });
    setRenameOpen(false);
  };

  const handleDelete = async () => {
    if (typeof window !== "undefined" && window.confirm("Delete this folder and move its contents to root?")) {
      await deleteFolder(node.folder.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  };

  const handleDragLeave = () => setIsDropTarget(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    const docId = e.dataTransfer.getData("application/x-fastdocs-doc");
    const folderId = e.dataTransfer.getData("application/x-fastdocs-folder");
    if (docId) {
      updateDoc(Number(docId), { folderId: node.folder.id });
    } else if (folderId) {
      const id = Number(folderId);
      if (id !== node.folder.id) updateFolder(id, { parentId: node.folder.id });
    }
    onRefetch?.();
  };

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            sidebarCls,
            "group",
            isDragging && "opacity-50",
            isDropTarget && "bg-[#238636]/30 ring-1 ring-[#238636]"
          )}
          style={{ paddingLeft: 8 + depth * 16 }}
          draggable
          onDragStart={(e) => {
            setIsDragging(true);
            e.dataTransfer.setData("application/x-fastdocs-folder", String(node.folder.id));
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => setIsDragging(false)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CollapsibleTrigger className="flex items-center gap-1.5 shrink-0">
            {open ? (
              <ChevronDown className="h-4 w-4 text-[#8b949e]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#8b949e]" />
            )}
            <Folder className="h-4 w-4 shrink-0 text-[#8b949e]" />
          </CollapsibleTrigger>
          <span className="min-w-0 truncate flex-1">{node.folder.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-[#161b22] border-[#30363d]">
            {onNewFolderInside && (
              <DropdownMenuItem
                className="text-[#c9d1d9] focus:bg-[#21262d]"
                onClick={(e) => {
                  e.preventDefault();
                  onNewFolderInside(node.folder.id);
                }}
              >
                <FolderPlus className="h-4 w-4" />
                New folder inside
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-[#c9d1d9] focus:bg-[#21262d]"
              onClick={(e) => {
                e.preventDefault();
                setRenameValue(node.folder.name);
                setRenameOpen(true);
              }}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="text-red-400 focus:bg-red-500/10"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        <CollapsibleContent>
          <div className="pl-0">
            {node.children.map((child) => (
              <TreeItem
                key={treeNodeKey(child)}
                node={child}
                depth={depth + 1}
                onNewFolderInside={onNewFolderInside}
                onRefetch={onRefetch}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d]">
          <DialogHeader>
            <DialogTitle className="text-[#c9d1d9]">Rename folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename-folder" className="text-[#8b949e]">Name</Label>
              <Input
                id="rename-folder"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} className="border-[#30363d] text-[#c9d1d9]">
              Cancel
            </Button>
            <Button onClick={handleRename} className="bg-[#238636] hover:bg-[#2ea043]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TreeItem({ node, depth, onNewFolderInside, onRefetch }: { node: TreeNode; depth: number; onNewFolderInside?: (parentId: number) => void; onRefetch?: () => void }) {
  const pathname = usePathname();

  if (node.type === "folder") {
    return <FolderItem node={node} depth={depth} onNewFolderInside={onNewFolderInside} onRefetch={onRefetch} />;
  }
  const docId = pathname?.match(/\/workspace\/doc\/(\d+)/)?.[1];
  const isActive = docId ? String(node.doc.id) === docId : false;
  return <DocItem doc={node.doc} depth={depth} isActive={isActive} />;
}

export function WorkspaceSidebar({ onToggle }: { onToggle?: () => void }) {
  const router = useRouter();
  const { folders, docs, isLoading, error, createDoc, createFolder, refetch, updateDoc, updateFolder } = useWorkspace();
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [rootDropHighlight, setRootDropHighlight] = useState(false);

  const tree = buildWorkspaceTree(folders, docs);

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setRootDropHighlight(true);
  };

  const handleRootDragLeave = () => setRootDropHighlight(false);

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setRootDropHighlight(false);
    const docId = e.dataTransfer.getData("application/x-fastdocs-doc");
    const folderId = e.dataTransfer.getData("application/x-fastdocs-folder");
    if (docId) {
      updateDoc(Number(docId), { folderId: null });
    } else if (folderId) {
      updateFolder(Number(folderId), { parentId: null });
    }
    refetch();
  };

  const openCreateFolderInside = (parentId: number) => {
    setParentFolderId(parentId);
    setNewFolderName("");
    setNewFolderOpen(true);
  };

  const handleCreateDoc = async () => {
    if (!newDocTitle.trim() || creatingDoc) return;
    setCreatingDoc(true);
    try {
      const doc = await createDoc({ title: newDocTitle.trim(), folderId: parentFolderId });
      setNewDocTitle("");
      setNewDocOpen(false);
      setParentFolderId(null);
      router.push(`/workspace/doc/${doc.id}`);
    } finally {
      setCreatingDoc(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    try {
      await createFolder({ name: newFolderName.trim(), parentId: parentFolderId });
      setNewFolderName("");
      setNewFolderOpen(false);
      setParentFolderId(null);
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[#30363d] bg-[#161b22]/80">
      <div
        className={cn(
          "flex items-center justify-between border-b border-[#30363d] px-2 py-2",
          rootDropHighlight && "bg-[#238636]/20"
        )}
        onDragOver={handleRootDragOver}
        onDragLeave={handleRootDragLeave}
        onDrop={handleRootDrop}
      >
        <span className="text-xs font-medium text-[#8b949e]">Workspace</span>
        <div className="flex items-center gap-0.5">
          {onToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#8b949e] hover:bg-[#21262d] hover:text-white"
              onClick={onToggle}
              title="Hide file tree"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8b949e] hover:bg-[#21262d] hover:text-white"
            onClick={() => {
              setParentFolderId(null);
              setNewDocOpen(true);
            }}
            title="New document"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8b949e] hover:bg-[#21262d] hover:text-white"
            onClick={() => {
              setParentFolderId(null);
              setNewFolderOpen(true);
            }}
            title="New folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-[#8b949e]">Loading…</p>
        ) : error ? (
          <div className="px-2 py-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="link" className="h-auto p-0 text-[#58a6ff]" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={treeNodeKey(node)}
              node={node}
              depth={0}
              onNewFolderInside={openCreateFolderInside}
              onRefetch={refetch}
            />
          ))
        )}
      </div>

      <Dialog open={newDocOpen} onOpenChange={setNewDocOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d]">
          <DialogHeader>
            <DialogTitle className="text-[#c9d1d9]">New document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-doc-title" className="text-[#8b949e]">Title</Label>
              <Input
                id="new-doc-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Untitled"
                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                onKeyDown={(e) => e.key === "Enter" && handleCreateDoc()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDocOpen(false)} className="border-[#30363d] text-[#c9d1d9]">
              Cancel
            </Button>
            <Button onClick={handleCreateDoc} disabled={creatingDoc} className="bg-[#238636] hover:bg-[#2ea043]">
              {creatingDoc ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="bg-[#161b22] border-[#30363d]">
          <DialogHeader>
            <DialogTitle className="text-[#c9d1d9]">New folder</DialogTitle>
            {parentFolderId != null && (
              <p className="text-xs text-[#8b949e]">
                Creating inside: {folders.find((f) => f.id === parentFolderId)?.name ?? "Folder"}
              </p>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-folder-name" className="text-[#8b949e]">Name</Label>
              <Input
                id="new-folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="bg-[#0d1117] border-[#30363d] text-[#c9d1d9]"
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderOpen(false)} className="border-[#30363d] text-[#c9d1d9]">
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={creatingFolder} className="bg-[#238636] hover:bg-[#2ea043]">
              {creatingFolder ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
