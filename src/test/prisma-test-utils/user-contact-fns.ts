import prisma from '../../client';

interface ICreateUserContact {
    userId: string;
    contactId: string;
    accepted: boolean;
    id: string;
}

export const createUserContact = async (userContact: ICreateUserContact) => {
    return await prisma.contact.create({
        data: userContact,
    });
};

interface IUpdateUserContact {
    userId?: string;
    contactId?: string;
    accepted?: boolean;
    id: string;
}

export const updateUserContact = async (userContact: IUpdateUserContact) => {
    return await prisma.contact.update({
        where: { id: userContact.id },
        data: userContact,
    });
};

export const getUserContact = async (id: string) => {
    return await prisma.contact.findUnique({
        where: { id: id },
    });
};

export const deleteUserContact = async (id: string) => {
    return await prisma.contact.delete({
        where: { id: id },
    });
};
