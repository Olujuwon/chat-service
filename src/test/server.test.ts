'use strict';

import { describe, expect } from '@jest/globals';
import { init, start, stop } from '../server';
import { Server } from '@hapi/hapi';

describe('Test server health', () => {
    let server: Server;
    beforeAll(async () => {
        server = await init();
        await start(server);
    });

    afterAll(async () => {
        await stop(server);
    });

    test('GET /health responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/v1/health',
        });
        expect(res.statusCode).toBe(200);
    });
});
