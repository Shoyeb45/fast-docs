"use client";

import { createContext, ReactNode, useState, useCallback, useEffect } from "react";
import apiClient from "@/lib/api-client";
import type { User } from "@/types";

type ContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<ContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!apiClient.getAccessToken();

  const refreshUser = useCallback(async () => {
    if (!apiClient.getAccessToken()) {
      setUser(null);
      return;
    }
    try {
      const u = await apiClient.get<User>("/auth/me");
      setUser(u ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  const loginWithGitHub = useCallback(() => {
    if (!BACKEND_URL) return;
    window.location.href = `${BACKEND_URL}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.delete("/auth/signout");
    } finally {
      apiClient.clearAuth();
      setUser(null);
    }
  }, []);

  // On mount: restore session from storage, start refresh timer, load user
  useEffect(() => {
    const token = apiClient.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient.startTokenRefreshTimer();
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        loginWithGitHub,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
