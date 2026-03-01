import type { Doc, Folder } from "@/types";

export type TreeNode =
  | { type: "folder"; folder: Folder; children: TreeNode[] }
  | { type: "doc"; doc: Doc };

function getChildren(
  parentFolderId: number | null,
  folders: Folder[],
  docs: Doc[]
): TreeNode[] {
  const childFolders = folders
    .filter((f) => f.parentId === parentFolderId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
  const childDocs = docs
    .filter((d) => d.folderId === parentFolderId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const nodes: TreeNode[] = [
    ...childFolders.map((folder) => ({
      type: "folder" as const,
      folder,
      children: getChildren(folder.id, folders, docs),
    })),
    ...childDocs.map((doc) => ({ type: "doc" as const, doc })),
  ];
  return nodes;
}

export function buildWorkspaceTree(folders: Folder[], docs: Doc[]): TreeNode[] {
  return getChildren(null, folders, docs);
}
