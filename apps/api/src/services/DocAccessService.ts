import DocRepo from '../database/repositories/DocRepo';
import DocShareRepo from '../database/repositories/DocShareRepo';
import { NotFoundError, ForbiddenError, BadRequestError } from '../core/ApiError';
import type { Doc } from '@prisma/client';

export type DocRole = 'owner' | 'editor' | 'viewer' | 'commenter';

const ROLE_ORDER: DocRole[] = ['owner', 'editor', 'commenter', 'viewer'];

function hasMinimumRole(userRole: DocRole, minRole: DocRole): boolean {
  return ROLE_ORDER.indexOf(userRole) <= ROLE_ORDER.indexOf(minRole);
}

export function canEdit(role: DocRole): boolean {
  return role === 'owner' || role === 'editor';
}

export function canView(role: DocRole): boolean {
  return true; // all roles can view
}

export function canManageShare(role: DocRole): boolean {
  return role === 'owner';
}

export interface DocWithAccess {
  doc: Doc;
  role: DocRole;
}

async function getDocWithAccess(
  userId: number | null,
  options: { docId?: number; shareToken?: string }
): Promise<DocWithAccess | null> {
  const { docId, shareToken } = options;

  // Public share link (no auth)
  if (shareToken) {
    const doc = await DocRepo.findByShareToken(shareToken);
    if (!doc) return null;
    return { doc, role: 'viewer' };
  }

  if (userId == null || docId == null) return null;

  const doc = await DocRepo.findById(docId);
  if (!doc) return null;

  if (doc.userId === userId) {
    return { doc, role: 'owner' };
  }

  const share = await DocShareRepo.findByDocIdAndUserId(docId, userId);
  if (!share) return null;

  const role = share.role as DocRole;
  if (!['editor', 'viewer', 'commenter'].includes(role)) return null;

  return { doc, role };
}

async function requireDocWithAccess(
  userId: number | null,
  options: { docId?: number; shareToken?: string }
): Promise<DocWithAccess> {
  const result = await getDocWithAccess(userId, options);
  if (!result) throw new NotFoundError('Document not found');
  return result;
}

export default {
  getDocWithAccess,
  requireDocWithAccess,
  hasMinimumRole,
  canEdit,
  canView,
  canManageShare,
};
