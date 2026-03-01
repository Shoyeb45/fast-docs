"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getDocShares,
  inviteDocShare,
  removeDocShare,
  updateDocShareRole,
  getOrCreateShareLink,
  searchUsers,
} from "@/lib/workspace-api";
import type { DocShareWithUser, ShareRole, UserSearchItem } from "@/types";
import { Copy, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

const SHARE_ROLES: { value: ShareRole; label: string }[] = [
  { value: "editor", label: "Can edit" },
  { value: "viewer", label: "Can view" },
  { value: "commenter", label: "Can comment" },
];

export function ShareModal({
  docId,
  open,
  onOpenChange,
}: {
  docId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [shares, setShares] = useState<DocShareWithUser[]>([]);
  const [shareLink, setShareLink] = useState<{
    shareToken: string;
    shareForAll: boolean;
    shareUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<ShareRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!open || !docId) return;
    setLoading(true);
    try {
      const [sharesRes, linkRes] = await Promise.all([
        getDocShares(docId),
        getOrCreateShareLink(docId).catch(() => null),
      ]);
      setShares(sharesRes);
      if (linkRes) setShareLink(linkRes);
    } catch {
      toast.error("Failed to load sharing settings");
    } finally {
      setLoading(false);
    }
  }, [docId, open]);

  useEffect(() => {
    load();
  }, [load]);

  const sharedUserIds = new Set(shares.map((s) => s.userId));

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearching(true);
      searchUsers(searchQuery.trim())
        .then((users) => {
          setSearchResults(users);
          setDropdownOpen(users.length > 0);
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
      searchTimeoutRef.current = null;
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleInviteUser = async (user: UserSearchItem) => {
    setInviting(true);
    try {
      const share = await inviteDocShare(docId, { userId: user.id, role: inviteRole });
      setShares((prev) => [...prev, share]);
      setSearchQuery("");
      setSearchResults([]);
      setDropdownOpen(false);
      toast.success(`${user.name || user.email} invited`);
    } catch {
      toast.error("Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveShare = async (shareId: number) => {
    try {
      await removeDocShare(docId, shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      toast.success("Access removed");
    } catch {
      toast.error("Failed to remove access");
    }
  };

  const handleUpdateRole = async (shareId: number, role: ShareRole) => {
    try {
      const updated = await updateDocShareRole(docId, shareId, { role });
      setShares((prev) => prev.map((s) => (s.id === shareId ? updated : s)));
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleShareForAllChange = async (checked: boolean) => {
    try {
      const res = await getOrCreateShareLink(docId, { shareForAll: checked });
      setShareLink(res);
      toast.success(checked ? "Link sharing enabled" : "Link sharing disabled");
    } catch {
      toast.error("Failed to update link sharing");
    }
  };

  const handleCopyLink = () => {
    if (!shareLink?.shareToken) return;
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${shareLink.shareToken}`;
    void navigator.clipboard.writeText(url).then(() => toast.success("Link copied"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border-[#30363d] text-[#c9d1d9] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#c9d1d9]">Share document</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#8b949e]" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* People with access */}
            <div>
              <h4 className="text-sm font-medium text-[#8b949e] mb-2">People with access</h4>
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {shares.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-[#0d1117] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{s.user?.name ?? s.user?.email ?? "Unknown"}</p>
                      <p className="text-xs text-[#8b949e] truncate">{s.user?.email ?? "—"}</p>
                    </div>
                    <select
                      value={s.role}
                      onChange={(e) => handleUpdateRole(s.id, e.target.value as ShareRole)}
                      className="bg-[#21262d] border border-[#30363d] rounded text-sm text-[#c9d1d9] px-2 py-1"
                    >
                      {SHARE_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#8b949e] hover:text-red-400 shrink-0"
                      onClick={() => handleRemoveShare(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Invite people - search by email or name */}
            <div className="relative" ref={dropdownRef}>
              <h4 className="text-sm font-medium text-[#8b949e] mb-2">Invite people</h4>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setDropdownOpen(true)}
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#8b949e]"
                  />
                  {dropdownOpen && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#30363d] bg-[#161b22] shadow-lg">
                      {searchResults
                        .filter((u) => !sharedUserIds.has(u.id))
                        .map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#c9d1d9] hover:bg-[#21262d] disabled:opacity-50"
                            onClick={() => handleInviteUser(user)}
                            disabled={inviting}
                          >
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt=""
                                className="h-6 w-6 rounded-full shrink-0"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-[#30363d] shrink-0 flex items-center justify-center text-xs text-[#8b949e]">
                                {(user.name || user.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1 truncate">
                              <p className="font-medium truncate">{user.name || "No name"}</p>
                              <p className="text-xs text-[#8b949e] truncate">{user.email}</p>
                            </div>
                            <span className="text-xs text-[#8b949e] shrink-0">{inviteRole}</span>
                          </button>
                        ))}
                      {searchResults.filter((u) => !sharedUserIds.has(u.id)).length === 0 && (
                        <p className="px-3 py-2 text-sm text-[#8b949e]">Already added or no matches</p>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ShareRole)}
                  className="bg-[#21262d] border border-[#30363d] rounded text-sm text-[#c9d1d9] px-2 py-2 w-28"
                  title="Role for new invite"
                >
                  {SHARE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <p className="mt-1 text-xs text-[#8b949e]">Type at least 2 characters to search</p>
              )}
              {searching && (
                <p className="mt-1 text-xs text-[#8b949e] flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching...
                </p>
              )}
            </div>

            {/* Share link */}
            <div>
              <h4 className="text-sm font-medium text-[#8b949e] mb-2">Get link</h4>
              <div className="flex items-center justify-between gap-4 rounded-md bg-[#0d1117] px-3 py-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={shareLink?.shareForAll ?? false}
                    onCheckedChange={handleShareForAllChange}
                  />
                  <Label className="text-sm text-[#c9d1d9]">Anyone with the link can view</Label>
                </div>
              </div>
              {shareLink?.shareToken && (
                <div className="flex gap-2 mt-2">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/s/${shareLink.shareToken}`}
                    className="flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#8b949e]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#30363d] text-[#c9d1d9] shrink-0"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
