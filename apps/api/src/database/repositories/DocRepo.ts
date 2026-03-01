import { prisma } from '..';

async function create(data: {
  userId: number;
  title: string;
  content?: string;
  folderId?: number | null;
  orderIndex?: number;
}) {
  return prisma.doc.create({
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content ?? '',
      folderId: data.folderId ?? null,
      orderIndex: data.orderIndex ?? 0,
    },
  });
}

async function findById(id: number) {
  return prisma.doc.findUnique({
    where: { id },
  });
}

async function findByUserIdAndId(userId: number, id: number) {
  return prisma.doc.findFirst({
    where: { id, userId },
  });
}

async function findManyByUserId(userId: number) {
  return prisma.doc.findMany({
    where: { userId },
    orderBy: [{ folderId: 'asc' }, { orderIndex: 'asc' }],
  });
}

async function findManyByFolderId(userId: number, folderId: number | null) {
  return prisma.doc.findMany({
    where: { userId, folderId },
    orderBy: { orderIndex: 'asc' },
  });
}

async function update(
  id: number,
  userId: number,
  data: { title?: string; content?: string; folderId?: number | null; orderIndex?: number }
) {
  await prisma.doc.updateMany({
    where: { id, userId },
    data,
  });
}

async function updateOne(
  id: number,
  data: { title?: string; content?: string; folderId?: number | null; orderIndex?: number }
) {
  return prisma.doc.update({
    where: { id },
    data,
  });
}

async function remove(id: number, userId: number) {
  return prisma.doc.deleteMany({
    where: { id, userId },
  });
}

async function getMaxOrderIndex(userId: number, folderId: number | null) {
  const doc = await prisma.doc.findFirst({
    where: { userId, folderId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  return doc?.orderIndex ?? -1;
}

export default {
  create,
  findById,
  findByUserIdAndId,
  findManyByUserId,
  findManyByFolderId,
  update,
  updateOne,
  remove,
  getMaxOrderIndex,
};
