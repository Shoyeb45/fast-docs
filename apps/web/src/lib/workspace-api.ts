import apiClient from './api-client';
import type { Doc, Folder, WorkspaceData } from '@/types';

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
