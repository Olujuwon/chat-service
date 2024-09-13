'use strict';

import { describe } from '@jest/globals';
// @ts-ignore
import { prismaMock } from '../../singleton';
import { createUser, deleteUser, getUser, updateUser } from './prisma-test-utils/user-fns';
import {
    createUserContact,
    deleteUserContact,
    getUserContact,
    updateUserContact,
} from './prisma-test-utils/user-contact-fns';
import { createMessage, deleteMessage, getMessage, updateMessage } from './prisma-test-utils/messages-fns';
import { createUpload, deleteUpload, getUpload, updateUpload } from './prisma-test-utils/uploads-fns';

describe('Test user schema', () => {
    const user = {
        id: '1',
        userName: 'omobabamukomuko',
        password: '123456',
        email: 'omobabamukomuko@gmail.com',
        phone: '123456',
        bio: '123456',
    };
    test('create a new user', async () => {
        // @ts-ignore
        prismaMock.user.create.mockResolvedValue(user);
        await expect(createUser(user)).resolves.toEqual(user);
    });
    test('update user name', async () => {
        const user = {
            id: '1',
            userName: 'omobabamukomuko-test',
            password: '123456',
            email: 'omobabamukomuko@gmail.com',
            phone: '123456',
            bio: '123456',
        };
        // @ts-ignore
        prismaMock.user.update.mockResolvedValue(user);
        await expect(updateUser({ id: '1', userName: 'omobabamukomuko-test' })).resolves.toEqual(user);
    });
    test('get user by ID', async () => {
        // @ts-ignore
        prismaMock.user.findUnique.mockResolvedValue(user);
        await expect(getUser('1')).resolves.toEqual(user);
    });
    test('delete user by ID', async () => {
        // @ts-ignore
        prismaMock.user.delete.mockResolvedValue(user);
        await expect(deleteUser('1')).resolves.toEqual(user);
    });
});

describe('Test user-contact schema', () => {
    test('create a new user contact', async () => {
        const user_contact = {
            id: '1',
            userId: '1',
            contactId: '2',
            accepted: true,
        };
        // @ts-ignore
        prismaMock.contact.create.mockResolvedValue(user_contact);
        await expect(createUserContact(user_contact)).resolves.toEqual(user_contact);
    });
    test('update user contact', async () => {
        const user_contact = {
            id: '1',
            userId: '1',
            contactId: '2',
            accepted: false,
        };
        // @ts-ignore
        prismaMock.contact.update.mockResolvedValue(user_contact);
        await expect(updateUserContact({ id: '1', accepted: false })).resolves.toEqual(user_contact);
    });
    test('get user contact by ID', async () => {
        const user_contact = {
            id: '1',
            userId: '1',
            contactId: '2',
            accepted: false,
        };
        // @ts-ignore
        prismaMock.contact.findUnique.mockResolvedValue(user_contact);
        await expect(getUserContact('1')).resolves.toEqual(user_contact);
    });
    test('delete user contact by ID', async () => {
        prismaMock.contact.findUnique.mockResolvedValue(null);
        await expect(deleteUserContact('1')).resolves.toEqual(undefined);
    });
});

describe('Test message schema', () => {
    const message = {
        id: '1',
        from: '1',
        to: '2',
        isRead: false,
        body: 'test body',
    };
    test('create a new message', async () => {
        // @ts-ignore
        prismaMock.message.create.mockResolvedValue(message);
        await expect(createMessage(message)).resolves.toEqual(message);
    });
    test('update message', async () => {
        const message = {
            id: '1',
            from: '1',
            to: '2',
            isRead: true,
            body: 'test body',
        };
        // @ts-ignore
        prismaMock.message.update.mockResolvedValue(message);
        await expect(updateMessage({ id: '1', isRead: true })).resolves.toEqual(message);
    });
    test('get message by ID', async () => {
        // @ts-ignore
        prismaMock.message.findUnique.mockResolvedValue(message);
        await expect(getMessage('1')).resolves.toEqual(message);
    });
    test('delete message by ID', async () => {
        prismaMock.message.findUnique.mockResolvedValue(null);
        await expect(deleteMessage('1')).resolves.toEqual(undefined);
    });
});

describe('Test upload schema', () => {
    const upload = {
        id: '1',
        url: 'http://localhost/image.png',
        serviceId: 'test',
        serviceName: 'test',
    };
    test('create a new upload', async () => {
        // @ts-ignore
        prismaMock.upload.create.mockResolvedValue(upload);
        await expect(createUpload(upload)).resolves.toEqual(upload);
    });
    test('update upload', async () => {
        const uploadUpdate = {
            id: '1',
            url: 'http://localhost/image.png',
            serviceId: 'test',
            serviceName: 'test1',
        };
        // @ts-ignore
        prismaMock.upload.update.mockResolvedValue(uploadUpdate);
        await expect(updateUpload({ id: '1', serviceName: 'test1' })).resolves.toEqual(uploadUpdate);
    });
    test('get upload by ID', async () => {
        // @ts-ignore
        prismaMock.upload.findUnique.mockResolvedValue(upload);
        await expect(getUpload('1')).resolves.toEqual(upload);
    });
    test('delete upload by ID', async () => {
        prismaMock.upload.findUnique.mockResolvedValue(null);
        await expect(deleteUpload('1')).resolves.toEqual(undefined);
    });
});
