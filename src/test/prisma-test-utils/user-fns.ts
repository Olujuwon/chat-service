import prisma from '../../../client';

interface ICreateUser {
    userName: string;
    password: string;
    email: string;
    phone: string;
    id: string;
    bio: string;
}

export const createUser = async (user: ICreateUser) => {
    return await prisma.user.create({
        data: user,
    });
};

interface IUpdateUser {
    userName?: string;
    password?: string;
    email?: string;
    phone?: string;
    id: string;
}

export const updateUser = async (user: IUpdateUser) => {
    return await prisma.user.update({
        where: { id: user.id },
        data: user,
    });
};

export const getUser = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
    });
};

export const deleteUser = async (userId: string) => {
    return await prisma.user.delete({
        where: { id: userId },
    });
};
