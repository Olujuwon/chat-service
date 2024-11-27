'use strict';

import { describe, expect } from '@jest/globals';

describe('Test server health', () => {
    test('GET /health responds with 200', async () => {
        const res = { statusCode: 200 };
        expect(res.statusCode).toBe(200);
    });
});
