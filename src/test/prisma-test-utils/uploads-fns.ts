import prisma from '../../client';

/*interface ICreateUplaod {
    url: string;
    serviceId: string;
    serviceName: string;
    id: string;
}*/

export const createUpload = async (upload: any) => {
    return await prisma.upload.create({
        data: upload,
    });
};

/*interface IUpdateUpload {
    url?: string;
    serviceId?: string;
    serviceName?: string;
    id: string;
}*/

export const updateUpload = async (upload: any) => {
    return await prisma.upload.update({
        where: { id: upload.id },
        data: upload,
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
