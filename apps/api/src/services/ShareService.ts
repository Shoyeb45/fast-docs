import crypto from 'crypto';
import DocRepo from '../database/repositories/DocRepo';
import DocShareRepo from '../database/repositories/DocShareRepo';
import UserRepo from '../database/repositories/UserRepo';
import { NotFoundError, BadRequestError, ForbiddenError } from '../core/ApiError';
import type { DocShareRole } from '../database/repositories/DocShareRepo';

function generateShareToken(): string {
  return crypto.randomBytes(16).toString('base64url');
}

async function getOrCreateShareToken(docId: number, ownerId: number, shareForAll?: boolean) {
  const doc = await DocRepo.findById(docId);
  if (!doc) throw new NotFoundError('Document not found');
  if (doc.userId !== ownerId) throw new ForbiddenError('Only the owner can manage the share link');
  let token = doc.shareToken;
  if (!token) {
    token = generateShareToken();
    await DocRepo.updateOne(docId, { shareToken: token });
  }
  if (shareForAll !== undefined) {
    await DocRepo.updateOne(docId, { shareForAll });
  }
  const updated = await DocRepo.findById(docId);
  return {
    shareToken: updated!.shareToken!,
    shareForAll: updated!.shareForAll,
    shareUrl: `/s/${updated!.shareToken}`,
  };
}

async function listShares(docId: number, ownerId: number) {
  const doc = await DocRepo.findById(docId);
  if (!doc) throw new NotFoundError('Document not found');
  if (doc.userId !== ownerId) throw new ForbiddenError('Only the owner can list shares');
  return DocShareRepo.findByDocId(docId);
}

async function inviteUser(docId: number, ownerId: number, userId: number, role: DocShareRole) {
  const doc = await DocRepo.findById(docId);
  if (!doc) throw new NotFoundError('Document not found');
  if (doc.userId !== ownerId) throw new ForbiddenError('Only the owner can invite users');
  if (doc.userId === userId) throw new BadRequestError('Cannot share with the document owner');
  const user = await UserRepo.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  try {
    const share = await DocShareRepo.create({ docId, userId, role });
    return share;
  } catch (e) {
    // Unique constraint: already shared
    const existing = await DocShareRepo.findByDocIdAndUserId(docId, userId);
    if (existing) {
      await DocShareRepo.updateRole(docId, userId, role);
      return DocShareRepo.findByDocIdAndUserId(docId, userId);
    }
    throw e;
  }
}

async function updateShareRole(docId: number, ownerId: number, shareId: number, role: DocShareRole) {
  const doc = await DocRepo.findById(docId);
  if (!doc) throw new NotFoundError('Document not found');
  if (doc.userId !== ownerId) throw new ForbiddenError('Only the owner can update shares');
  const shares = await DocShareRepo.findByDocId(docId);
  const share = shares.find((s) => s.id === shareId);
  if (!share) throw new NotFoundError('Share not found');
  return DocShareRepo.updateRole(docId, share.userId, role);
}

async function removeShare(docId: number, ownerId: number, shareId: number) {
  const doc = await DocRepo.findById(docId);
  if (!doc) throw new NotFoundError('Document not found');
  if (doc.userId !== ownerId) throw new ForbiddenError('Only the owner can remove shares');
  const shares = await DocShareRepo.findByDocId(docId);
  const share = shares.find((s) => s.id === shareId);
  if (!share) throw new NotFoundError('Share not found');
  await DocShareRepo.remove(docId, share.userId);
}

export default {
  getOrCreateShareToken,
  listShares,
  inviteUser,
  updateShareRole,
  removeShare,
  generateShareToken,
};
