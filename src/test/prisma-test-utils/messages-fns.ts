import prisma from '../../../client';

interface ICreateMessage {
    from: string;
    to: string;
    body: string;
    isRead: boolean;
    id: string;
}

export const createMessage = async (message: ICreateMessage) => {
    return await prisma.message.create({
        data: message,
    });
};

interface IUpdateMessage {
    from?: string;
    to?: string;
    body?: string;
    isRead?: boolean;
    id: string;
}

export const updateMessage = async (message: IUpdateMessage) => {
    return await prisma.message.update({
        where: { id: message.id },
        data: message,
    });
};

export const getMessage = async (id: string) => {
    return await prisma.message.findUnique({
        where: { id: id },
    });
};

export const deleteMessage = async (id: string) => {
    return await prisma.message.delete({
        where: { id: id },
    });
};
