import { prisma } from '..';

export type DocShareRole = 'editor' | 'viewer' | 'commenter';

async function create(data: { docId: number; userId: number; role: DocShareRole }) {
  return prisma.docShare.create({
    data: {
      docId: data.docId,
      userId: data.userId,
      role: data.role,
    },
  });
}

async function findByDocId(docId: number) {
  return prisma.docShare.findMany({
    where: { docId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

async function findByDocIdAndUserId(docId: number, userId: number) {
  return prisma.docShare.findUnique({
    where: { docId_userId: { docId, userId } },
  });
}

async function updateRole(docId: number, userId: number, role: DocShareRole) {
  return prisma.docShare.update({
    where: { docId_userId: { docId, userId } },
    data: { role },
  });
}

async function remove(docId: number, userId: number) {
  return prisma.docShare.delete({
    where: { docId_userId: { docId, userId } },
  });
}

async function removeByShareId(docId: number, shareId: number) {
  return prisma.docShare.deleteMany({
    where: { id: shareId, docId },
  });
}

async function findManyByUserIdWithDoc(userId: number) {
  return prisma.docShare.findMany({
    where: { userId },
    include: {
      doc: {
        select: {
          id: true,
          title: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default {
  create,
  findByDocId,
  findByDocIdAndUserId,
  updateRole,
  remove,
  removeByShareId,
  findManyByUserIdWithDoc,
};
