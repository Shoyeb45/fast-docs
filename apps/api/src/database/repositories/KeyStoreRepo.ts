import { prisma } from "..";


const create = async (clientId: number, primaryKey: string, secondaryKey: string, refreshToken: string, deviceFingerprint: string) => {
    return await prisma.keystore.create({
        data: {
            clientId,
            primaryKey,
            secondaryKey,
            refreshToken,
            deviceFingerprint
        }
    });
}

const find = async (clientId: number, primaryKey: string, secondaryKey: string, refreshToken: string) => {
    return await prisma.keystore.findFirst({
        where: {
            clientId,
            primaryKey,
            secondaryKey,
            refreshToken
        }
    });
};

const remove = async (id: number) => {
    return await prisma.keystore.delete({
        where: { id }
    })
};


const findForKey = async (clientId: number, key: string) => {
    return prisma.keystore.findFirst({
        where: {
            clientId,
            primaryKey: key,
            status: true
        }
    });
}

const removeAllForUser = async (userId: number) => {
    return prisma.keystore.deleteMany({
        where: {
            clientId: userId
        }
    });
}

export default {
    create,
    find,
    remove,
    findForKey,
    removeAllForUser
};