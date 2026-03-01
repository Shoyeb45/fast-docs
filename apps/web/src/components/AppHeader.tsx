"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Loader2 } from "lucide-react";

export function AppHeader() {
  const auth = useContext(AuthContext);
  if (!auth) return null;

  const { isAuthenticated, user, isLoading, loginWithGitHub, logout } = auth;

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-[#30363d] bg-[#161b22]/80 px-4">
      <span className="text-sm font-medium text-[#8b949e]">Fast Docs</span>
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#8b949e]" />
        ) : isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 gap-2 rounded-full px-2 text-[#c9d1d9] hover:bg-[#21262d]"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatarUrl ?? undefined} alt={user?.name ?? undefined} />
                  <AvatarFallback className="bg-[#30363d] text-xs text-[#8b949e]">
                    {user?.name?.[0] ?? user?.githubUsername?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[120px] truncate text-sm">
                  {user?.name ?? user?.githubUsername ?? "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#161b22] border-[#30363d]">
              <DropdownMenuItem
                className="text-[#c9d1d9] focus:bg-[#21262d] focus:text-white"
                onClick={() => void logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="bg-[#238636] text-white hover:bg-[#2ea043]"
            onClick={loginWithGitHub}
          >
            Sign in with GitHub
          </Button>
        )}
      </div>
    </header>
  );
}
