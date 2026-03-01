import { prisma } from '..';

async function create(data: {
  userId: number;
  title: string;
  content?: string;
  yjsState?: Buffer | Uint8Array;
  folderId?: number | null;
  orderIndex?: number;
}) {
  const yjsState: Uint8Array | undefined =
    data.yjsState !== undefined
      ? data.yjsState instanceof Uint8Array
        ? data.yjsState
        : new Uint8Array(data.yjsState as ArrayLike<number>)
      : undefined;
  return prisma.doc.create({
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content ?? '',
      // Prisma Bytes (bytea) accepts Buffer at runtime; TS typings expect Uint8Array<ArrayBuffer>
      yjsState: yjsState as never,
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
  data: { title?: string; content?: string; yjsState?: Buffer | Uint8Array; folderId?: number | null; orderIndex?: number }
) {
  const payload: Record<string, unknown> = { ...data };
  if (data.yjsState !== undefined) {
    payload.yjsState = data.yjsState instanceof Uint8Array ? data.yjsState : new Uint8Array(data.yjsState);
  }
  await prisma.doc.updateMany({
    where: { id, userId },
    data: payload as Parameters<typeof prisma.doc.updateMany>[0]['data'],
  });
}

async function updateOne(
  id: number,
  data: { title?: string; content?: string; yjsState?: Buffer | Uint8Array; folderId?: number | null; orderIndex?: number }
) {
  const payload: Record<string, unknown> = { ...data };
  if (data.yjsState !== undefined) {
    payload.yjsState = data.yjsState instanceof Uint8Array ? data.yjsState : new Uint8Array(data.yjsState);
  }
  return prisma.doc.update({
    where: { id },
    data: payload as Parameters<typeof prisma.doc.update>[0]['data'],
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
