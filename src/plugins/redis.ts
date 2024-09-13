import Hapi from '@hapi/hapi';
import { createClient, RediSearchSchema, SchemaFieldTypes } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        redis: any;
    }
}

const redisPlugin: Hapi.Plugin<null> = {
    name: 'redis',
    register: async (server: Hapi.Server) => {
        const client = createClient({
            url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}`,
        });
        client.on('error', (error) => console.log('Redis Client Error', error));
        const schema: RediSearchSchema = {
            '$.userId': {
                type: SchemaFieldTypes.TEXT,
                SORTABLE: true,
                AS: 'userId',
            },
            '$.token': {
                type: SchemaFieldTypes.TEXT,
                AS: 'token',
            },
        };
        await client.connect();
        const existingindexes = await client.ft._LIST();
        if (existingindexes.length === 0) {
            await client.ft.create('idx:chattyTokens', schema, { ON: 'JSON', PREFIX: 'token:' });
        }
        console.log("['info'] Redis client is connected and ready");
        server.app.redis = client;
    },
};

export default redisPlugin;
