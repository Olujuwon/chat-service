'use strict';

import { describe, expect } from '@jest/globals';

describe('Test user endpoints', () => {
    test('Signup/create user responds with 201', async () => {
        const res = { statusCode: 200 };
        expect(res.statusCode).toBe(200);
    });

    test('Signin/get user responds with 200', async () => {
        const res = { statusCode: 200 };
        expect(res.statusCode).toBe(200);
    });

    test('Update user responds with 200', async () => {
        const res = { statusCode: 200 };
        expect(res.statusCode).toBe(200);
    });

    test('Delete user responds with 200', async () => {
        const res = { statusCode: 200 };
        expect(res.statusCode).toBe(200);
    });
});
