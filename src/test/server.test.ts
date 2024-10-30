'use strict';

import { describe, expect } from '@jest/globals';
import { init, start, stop } from '../server';
import { Server } from '@hapi/hapi';

describe('GET /health', () => {
    let server: Server;
    beforeAll(async () => {
        server = await init();
        await start(server);
    });

    afterAll(async () => {
        await stop(server);
    });

    test('responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/v1/health',
        });
        expect(res.statusCode).toBe(200);
    });
});
