import { prisma } from '..';

async function create(data: {
  userId: number;
  name: string;
  parentId?: number | null;
  orderIndex?: number;
}) {
  return prisma.folder.create({
    data: {
      userId: data.userId,
      name: data.name,
      parentId: data.parentId ?? null,
      orderIndex: data.orderIndex ?? 0,
    },
  });
}

async function findById(id: number) {
  return prisma.folder.findUnique({
    where: { id },
  });
}

async function findByUserIdAndId(userId: number, id: number) {
  return prisma.folder.findFirst({
    where: { id, userId },
  });
}

async function findManyByUserId(userId: number) {
  return prisma.folder.findMany({
    where: { userId },
    orderBy: [{ parentId: 'asc' }, { orderIndex: 'asc' }],
  });
}

async function findManyByParentId(userId: number, parentId: number | null) {
  return prisma.folder.findMany({
    where: { userId, parentId },
    orderBy: { orderIndex: 'asc' },
  });
}

async function update(
  id: number,
  userId: number,
  data: { name?: string; parentId?: number | null; orderIndex?: number }
) {
  await prisma.folder.updateMany({
    where: { id, userId },
    data,
  });
}

async function updateOne(
  id: number,
  data: { name?: string; parentId?: number | null; orderIndex?: number }
) {
  return prisma.folder.update({
    where: { id },
    data,
  });
}

async function remove(id: number, userId: number) {
  return prisma.folder.deleteMany({
    where: { id, userId },
  });
}

async function getMaxOrderIndex(userId: number, parentId: number | null) {
  const folder = await prisma.folder.findFirst({
    where: { userId, parentId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  return folder?.orderIndex ?? -1;
}

export default {
  create,
  findById,
  findByUserIdAndId,
  findManyByUserId,
  findManyByParentId,
  update,
  updateOne,
  remove,
  getMaxOrderIndex,
};
