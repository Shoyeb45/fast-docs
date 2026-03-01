import apiClient from './api-client';
import type { Doc, Folder, WorkspaceData, DocShareWithUser, ShareRole, ShareLinkResponse, UserSearchItem } from '@/types';

const BASE = '/workspace';

export async function getWorkspace(): Promise<WorkspaceData> {
  return apiClient.get<WorkspaceData>(BASE);
}

export async function createDoc(payload: {
  title: string;
  folderId?: number | null;
  content?: string;
}): Promise<Doc> {
  return apiClient.post<Doc>(`${BASE}/docs`, payload);
}

export async function getDoc(id: number): Promise<Doc> {
  return apiClient.get<Doc>(`${BASE}/docs/${id}`);
}

export async function updateDoc(
  id: number,
  payload: { title?: string; content?: string; folderId?: number | null; orderIndex?: number }
): Promise<Doc> {
  return apiClient.patch<Doc>(`${BASE}/docs/${id}`, payload);
}

export async function deleteDoc(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/docs/${id}`);
}

export async function createFolder(payload: {
  name: string;
  parentId?: number | null;
}): Promise<Folder> {
  return apiClient.post<Folder>(`${BASE}/folders`, payload);
}

export async function updateFolder(
  id: number,
  payload: { name?: string; parentId?: number | null; orderIndex?: number }
): Promise<Folder> {
  return apiClient.patch<Folder>(`${BASE}/folders/${id}`, payload);
}

export async function deleteFolder(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/folders/${id}`);
}

export async function getDocShares(docId: number): Promise<DocShareWithUser[]> {
  return apiClient.get<DocShareWithUser[]>(`${BASE}/docs/${docId}/shares`);
}

export async function inviteDocShare(
  docId: number,
  payload: { userId: number; role: ShareRole }
): Promise<DocShareWithUser> {
  return apiClient.post<DocShareWithUser>(`${BASE}/docs/${docId}/shares`, payload);
}

export async function updateDocShareRole(
  docId: number,
  shareId: number,
  payload: { role: ShareRole }
): Promise<DocShareWithUser> {
  return apiClient.patch<DocShareWithUser>(`${BASE}/docs/${docId}/shares/${shareId}`, payload);
}

export async function removeDocShare(docId: number, shareId: number): Promise<void> {
  await apiClient.delete(`${BASE}/docs/${docId}/shares/${shareId}`);
}

export async function getOrCreateShareLink(
  docId: number,
  payload?: { shareForAll?: boolean }
): Promise<ShareLinkResponse> {
  return apiClient.post<ShareLinkResponse>(`${BASE}/docs/${docId}/share-link`, payload ?? {});
}

export async function getDocByShareToken(token: string): Promise<Doc & { role: 'viewer' }> {
  return apiClient.get<Doc & { role: 'viewer' }>(`/share/s/${token}`);
}

export async function searchUsers(q: string): Promise<UserSearchItem[]> {
  if (!q.trim()) return [];
  return apiClient.get<UserSearchItem[]>(`${BASE}/users/search`, { params: { q: q.trim() } });
}
