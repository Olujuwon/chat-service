'use strict';

import { describe, expect } from '@jest/globals';
import { init, start, stop } from '../server';
import { Server } from '@hapi/hapi';
import { IUser } from '../types';

const testUser = {
    userName: 'omobabamukomuko',
    phone: '358400471863',
    email: 'omobabamukomuko@chatty.com',
    bio: 'A test user from home',
    password: 'verysecurepassword',
};

describe('Test user endpoints', () => {
    let server: Server;
    beforeAll(async () => {
        server = await init();
        await start(server);
    });

    afterAll(async () => {
        await stop(server);
    });

    test('Signup/create user responds with 201', async () => {
        const res = await server.inject({
            method: 'post',
            url: '/v1/auth/signup',
            payload: { ...testUser },
        });
        const { statusCode, result } = res as { statusCode: number; result: { data: IUser } };
        const user = result?.data;
        expect(statusCode).toBe(201);
        expect(user.userName).toBe(testUser.userName);
    });

    test('Signin/get user responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/v1/auth/signin',
            payload: { userName: testUser.userName, password: testUser.password },
        });
        const { statusCode, result } = res as { statusCode: number; result: { data: IUser } };
        const user = result?.data;
        expect(statusCode).toBe(200);
        expect(user.userName).toBe(testUser.userName);
    });

    test.skip('Update user responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/v1/auth/signin',
            payload: { userName: testUser.userName, password: testUser.password },
        });
        const { statusCode, result } = res as { statusCode: number; result: { data: IUser } };
        const user = result?.data;
        expect(statusCode).toBe(200);
        expect(user.userName).toBe(testUser.userName);
        const updateRes = await server.inject({
            method: 'put',
            url: '/v1/users/' + user.id,
            payload: { userName: testUser.userName + '-updated' },
        });
        const { statusCode: statCode, result: updateResult } = updateRes as {
            statusCode: number;
            result: { data: IUser };
        };
        const updatedUser = updateResult?.data;
        expect(statCode).toBe(200);
        expect(updatedUser.userName).toBe(testUser.userName + '-updated');
    });

    test('Delete user responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/v1/auth/signin',
            payload: { userName: testUser.userName, password: testUser.password },
        });
        const { statusCode, result } = res as { statusCode: number; result: { data: IUser } };
        const user = result?.data;
        expect(statusCode).toBe(200);
        expect(user.userName).toBe(testUser.userName);
        const deleteRes = await server.inject({
            method: 'delete',
            url: '/v1/users/' + user.id,
        });
        const { statusCode: statCode, result: deleteResult } = deleteRes as {
            statusCode: number;
            result: { data: IUser };
        };
        const deletedUser = deleteResult?.data;
        expect(statCode).toBe(200);
    });
});
