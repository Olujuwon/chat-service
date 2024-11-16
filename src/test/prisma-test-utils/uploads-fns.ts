import { Prisma } from '@prisma/client';
import prisma from '../../client';

interface ICreateUplaod {
    url: string;
    serviceId: string;
    serviceName: string;
    id: string;
}

export const createUpload = async (upload: ICreateUplaod) => {
    return await prisma.upload.create({
        data: upload as Prisma.UploadCreateInput,
    });
};

interface IUpdateUpload {
    url?: string;
    serviceId?: string;
    serviceName?: string;
    id: string;
}

export const updateUpload = async (upload: IUpdateUpload) => {
    return await prisma.upload.update({
        where: { id: upload.id },
        data: upload as Prisma.UploadCreateInput,
    });
};

export const getUpload = async (id: string) => {
    return await prisma.upload.findUnique({
        where: { id: id },
    });
};

export const deleteUpload = async (id: string) => {
    return await prisma.upload.delete({
        where: { id: id },
    });
};
