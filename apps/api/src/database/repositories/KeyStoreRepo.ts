import { prisma } from "..";


const create = async (clientId: number, primaryKey: string, secondaryKey: string) => {
    return await prisma.keystore.create({
        data: {
            clientId,
            primaryKey,
            secondaryKey,
        }
    });
}

const find = async (clientId: number, primaryKey: string, secondaryKey: string) => {
    return await prisma.keystore.findFirst({
        where: {
            clientId,
            primaryKey,
            secondaryKey
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

export default {
    create,
    find,
    remove,
    findForKey
};