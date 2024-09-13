'use strict';

import Hapi, { Server } from '@hapi/hapi';

import * as dotenv from 'dotenv';
import prisma from './plugins/prisma';

import usersPlugin from './plugins/user';
import userContactsPlugin from './plugins/user-contact';
import messagesPlugin from './plugins/message';
import socketPlugin from './plugins/socket';
import redisPlugin from './plugins/redis';
import jwtPlugin from './plugins/jwt';

dotenv.config();

export let server: Server;

export const init = async function (): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 50000,
        host: '0.0.0.0',
        debug: false,
        routes: {
            log: { collect: true },
            cors: {
                origin: ['*'],
                credentials: false,
            },
        },
    });
    //custom plugins
    await server.register([
        socketPlugin,
        prisma,
        redisPlugin,
        jwtPlugin,
        usersPlugin,
        userContactsPlugin,
        messagesPlugin,
    ]);
    await server.register({ plugin: require('hapi-auth-bearer-token') });
    server.auth.strategy('simple', 'bearer-access-token', {
        validate: async (request: Request, token: string, response: Response) => {
            const { redis } = server.app;
            //TODO: Refine search and index so as to be able to do full text search
            const { documents } = await redis.ft.search('idx:chattyTokens', `*`);
            const isValid = documents.find(
                ({ value }: { value: { id: string; token: string } }) => value.token === token
            );
            const credentials = { token };
            const artifacts = { test: 'info' };
            return { isValid, credentials, artifacts };
        },
    });
    server.auth.default('simple');
    await server.register({
        plugin: require('hapi-pino'),
        options: {
            redact: ['req.headers.authorization'],
        },
    });
    await server.register({
        plugin: require('hapi-alive'),
        options: {
            path: '/v1/health',
            tags: ['health', 'monitor'],
            healthCheck: async function (server: Server) {
                //Here you should preform your health checks
                //If something went wrong , throw an error.
                return true;
            },
        },
    });

    server.route({
        method: '*',
        path: '/{any*}',
        handler: function (request, h) {
            request.log('PAGE NOT FOUND', request.url);
            return h.response('404 Error! Page Not Found!').code(404);
        },
    });

    return server;
};

export const start = async function (server: Server): Promise<Server> {
    await server.start();
    server.log(['info'], `Listening on ${server.settings.host}:${server.settings.port}`);
    return server;
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init()
    .then(async (server) => {
        await start(server);
        return server;
    })
    .catch((err) => console.error('Error While Starting the server', err));
