"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as workspaceApi from "@/lib/workspace-api";
import type { Doc, Folder, WorkspaceData } from "@/types";

type WorkspaceContextValue = {
  folders: Folder[];
  docs: Doc[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDoc: (payload: { title: string; folderId?: number | null; content?: string }) => Promise<Doc>;
  createFolder: (payload: { name: string; parentId?: number | null }) => Promise<Folder>;
  updateDoc: (
    id: number,
    payload: { title?: string; content?: string; folderId?: number | null; orderIndex?: number }
  ) => Promise<Doc>;
  updateFolder: (
    id: number,
    payload: { name?: string; parentId?: number | null; orderIndex?: number }
  ) => Promise<Folder>;
  deleteDoc: (id: number) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
  getDocById: (id: number) => Doc | undefined;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorkspaceData>({ folders: [], docs: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const next = await workspaceApi.getWorkspace();
      setData(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspace");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createDoc = useCallback(
    async (payload: { title: string; folderId?: number | null; content?: string }) => {
      const doc = await workspaceApi.createDoc(payload);
      setData((prev) => {
        if (prev.docs.some((d) => d.id === doc.id)) return prev;
        return {
          ...prev,
          docs: [...prev.docs, doc].sort((a, b) => {
            if (a.folderId !== b.folderId) return (a.folderId ?? -1) - (b.folderId ?? -1);
            return a.orderIndex - b.orderIndex;
          }),
        };
      });
      return doc;
    },
    []
  );

  const createFolder = useCallback(
    async (payload: { name: string; parentId?: number | null }) => {
      const folder = await workspaceApi.createFolder(payload);
      setData((prev) => {
        if (prev.folders.some((f) => f.id === folder.id)) return prev;
        return {
          ...prev,
          folders: [...prev.folders, folder].sort((a, b) => {
            if (a.parentId !== b.parentId) return (a.parentId ?? -1) - (b.parentId ?? -1);
            return a.orderIndex - b.orderIndex;
          }),
        };
      });
      return folder;
    },
    []
  );

  const updateDoc = useCallback(
    async (
      id: number,
      payload: { title?: string; content?: string; folderId?: number | null; orderIndex?: number }
    ) => {
      const updated = await workspaceApi.updateDoc(id, payload);
      setData((prev) => ({
        ...prev,
        docs: prev.docs.map((d) => (d.id === id ? { ...d, ...updated } : d)),
      }));
      return updated;
    },
    []
  );

  const updateFolder = useCallback(
    async (
      id: number,
      payload: { name?: string; parentId?: number | null; orderIndex?: number }
    ) => {
      const updated = await workspaceApi.updateFolder(id, payload);
      setData((prev) => ({
        ...prev,
        folders: prev.folders.map((f) => (f.id === id ? { ...f, ...updated } : f)),
      }));
      return updated;
    },
    []
  );

  const deleteDoc = useCallback(async (id: number) => {
    await workspaceApi.deleteDoc(id);
    setData((prev) => ({ ...prev, docs: prev.docs.filter((d) => d.id !== id) }));
  }, []);

  const deleteFolder = useCallback(async (id: number) => {
    await workspaceApi.deleteFolder(id);
    setData((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== id),
      docs: prev.docs.map((d) => (d.folderId === id ? { ...d, folderId: null } : d)),
    }));
  }, []);

  const getDocById = useCallback(
    (id: number) => data.docs.find((d) => d.id === id),
    [data.docs]
  );

  const value: WorkspaceContextValue = {
    folders: data.folders,
    docs: data.docs,
    isLoading,
    error,
    refetch,
    createDoc,
    createFolder,
    updateDoc,
    updateFolder,
    deleteDoc,
    deleteFolder,
    getDocById,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
