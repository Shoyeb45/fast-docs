import FolderRepo from '../database/repositories/FolderRepo';
import { NotFoundError } from '../core/ApiError';

async function createFolder(
  userId: number,
  data: { name: string; parentId?: number | null }
) {
  const orderIndex = (await FolderRepo.getMaxOrderIndex(userId, data.parentId ?? null)) + 1;
  return FolderRepo.create({
    userId,
    name: data.name,
    parentId: data.parentId ?? null,
    orderIndex,
  });
}

async function getFolder(userId: number, folderId: number) {
  const folder = await FolderRepo.findByUserIdAndId(userId, folderId);
  if (!folder) throw new NotFoundError('Folder not found');
  return folder;
}

async function updateFolder(
  userId: number,
  folderId: number,
  data: { name?: string; parentId?: number | null; orderIndex?: number }
) {
  const existing = await FolderRepo.findByUserIdAndId(userId, folderId);
  if (!existing) throw new NotFoundError('Folder not found');
  if (Object.keys(data).length === 0) return existing;
  return FolderRepo.updateOne(folderId, data);
}

async function deleteFolder(userId: number, folderId: number) {
  const existing = await FolderRepo.findByUserIdAndId(userId, folderId);
  if (!existing) throw new NotFoundError('Folder not found');
  await FolderRepo.remove(folderId, userId);
}

export default {
  createFolder,
  getFolder,
  updateFolder,
  deleteFolder,
};
