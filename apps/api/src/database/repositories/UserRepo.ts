import { prisma } from '../index';
import { Prisma, User } from '@prisma/client';

async function findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    return user;
}

async function findById(id: number) {
    return await prisma.user.findUnique({ where: { id } });
}

async function checkById(id: number) {
    return prisma.user.findUnique({
        where: { id },
    });
}

async function checkByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
    });
}

async function create(userData: Prisma.UserCreateInput) {
    return await prisma.user.create({ data: userData });
}

async function findUserByGithubId(githubId: number) {
    return await prisma.user.findFirst({
        where: {
            githubId,
        },
    });
}

/** Search users by email or name (for invite). Returns limited fields. */
async function searchForInvite(query: string, limit = 10) {
    const q = query.trim();
    if (!q || q.length < 2) return [];
    const search = `%${q}%`;
    return prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ],
        },
        select: { id: true, name: true, email: true, avatarUrl: true },
        take: limit,
        orderBy: { name: 'asc' },
    });
}

export default {
    findByEmail,
    checkById,
    checkByEmail,
    create,
    findById,
    findUserByGithubId,
    searchForInvite,
};
