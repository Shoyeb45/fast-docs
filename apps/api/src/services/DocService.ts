import DocRepo from '../database/repositories/DocRepo';
import { NotFoundError } from '../core/ApiError';

async function createDoc(
  userId: number,
  data: { title: string; folderId?: number | null; content?: string }
) {
  const orderIndex = (await DocRepo.getMaxOrderIndex(userId, data.folderId ?? null)) + 1;
  return DocRepo.create({
    userId,
    title: data.title,
    content: data.content,
    folderId: data.folderId ?? null,
    orderIndex,
  });
}

async function getDoc(userId: number, docId: number) {
  const doc = await DocRepo.findByUserIdAndId(userId, docId);
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

async function updateDoc(
  userId: number,
  docId: number,
  data: { title?: string; content?: string; yjsState?: Buffer; folderId?: number | null; orderIndex?: number }
) {
  const existing = await DocRepo.findByUserIdAndId(userId, docId);
  if (!existing) throw new NotFoundError('Document not found');
  if (Object.keys(data).length === 0) return existing;
  return DocRepo.updateOne(docId, data);
}

/** Update doc by id when access already verified (e.g. by requireDocAccess). */
async function updateDocById(
  docId: number,
  data: { title?: string; content?: string; yjsState?: Buffer; folderId?: number | null; orderIndex?: number }
) {
  if (Object.keys(data).length === 0) {
    const doc = await DocRepo.findById(docId);
    if (!doc) throw new NotFoundError('Document not found');
    return doc;
  }
  return DocRepo.updateOne(docId, data);
}

async function deleteDoc(userId: number, docId: number) {
  const existing = await DocRepo.findByUserIdAndId(userId, docId);
  if (!existing) throw new NotFoundError('Document not found');
  await DocRepo.remove(docId, userId);
}

async function moveDoc(userId: number, docId: number, folderId: number | null, orderIndex: number) {
  const existing = await DocRepo.findByUserIdAndId(userId, docId);
  if (!existing) throw new NotFoundError('Document not found');
  return DocRepo.updateOne(docId, { folderId, orderIndex });
}

export default {
  createDoc,
  getDoc,
  updateDoc,
  updateDocById,
  deleteDoc,
  moveDoc,
};
