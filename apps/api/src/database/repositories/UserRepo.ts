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

export default {
    findByEmail,
    checkById,
    checkByEmail,
    create,
    findById,
    findUserByGithubId
};
