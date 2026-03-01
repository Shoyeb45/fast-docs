export type Token = {
    refreshToken: string | null,
    accessToken: string | null
}

export interface User {
  id: number;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  githubId: number;
  githubUsername: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Folder {
  id: number;
  userId: number;
  name: string;
  parentId: number | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doc {
  id: number;
  userId: number;
  folderId: number | null;
  title: string;
  content: string;
  /** Base64-encoded Yjs document state; used for CRDT persistence and real-time sync */
  yjsState?: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  /** Set when loading a single doc (owner | editor | viewer | commenter) */
  role?: DocRole;
}

export type DocRole = 'owner' | 'editor' | 'viewer' | 'commenter';

export type ShareRole = 'editor' | 'viewer' | 'commenter';

export interface DocShareWithUser {
  id: number;
  docId: number;
  userId: number;
  role: ShareRole;
  createdAt: string;
  user: { id: number; name: string; email: string; avatarUrl: string };
}

export interface ShareLinkResponse {
  shareToken: string;
  shareForAll: boolean;
  shareUrl: string;
}

export interface UserSearchItem {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface WorkspaceData {
  folders: Folder[];
  docs: Doc[];
  sharedWithMe: SharedWithMeItem[];
}

export interface SharedWithMeItem {
  id: number;
  title: string;
  role: ShareRole;
  ownerName: string;
}