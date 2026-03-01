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
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceData {
  folders: Folder[];
  docs: Doc[];
}