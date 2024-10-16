import Hapi from '@hapi/hapi';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { recordIndexer, removeIndex } from './algolia';
import * as dotenv from 'dotenv';
import { IUser } from '../types';
import { RedisClientType } from 'redis';

dotenv.config();

const usersPlugin: Hapi.Plugin<null> = {
    name: 'appUsers',
    dependencies: ['prisma'],
    register: async (server: Hapi.Server) => {
        server.route([
            {
                method: 'POST',
                path: '/v1/auth/signup',
                handler: signupHandler,
                options: {
                    auth: false,
                    validate: {
                        payload: Joi.object({
                            userName: Joi.string().required(),
                            password: Joi.string().required(),
                            phone: Joi.string(),
                            email: Joi.string().email().required(),
                        }),
                        failAction: 'log',
                    },
                    response: {
                        schema: Joi.object({
                            data: Joi.object({
                                userName: Joi.string(),
                                phone: Joi.string(),
                                email: Joi.string().email(),
                                createdAt: Joi.date(),
                                updatedAt: Joi.date(),
                            }),
                            version: Joi.string().required(),
                        }),
                        failAction: 'log',
                    },
                },
            },
        ]),
            server.route([
                {
                    method: 'POST',
                    path: '/v1/auth/signin',
                    handler: signinHandler,
                    options: {
                        auth: false,
                        validate: {
                            payload: Joi.object({
                                userName: Joi.string().required(),
                                password: Joi.string().required(),
                            }),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.object({
                                    username: Joi.string(),
                                    phone: Joi.string(),
                                    email: Joi.string().email(),
                                    createdAt: Joi.date(),
                                    updatedAt: Joi.date(),
                                }),
                                version: Joi.string().required(),
                            }),
                            failAction: 'log',
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: 'POST',
                    path: '/v1/auth/logout',
                    handler: logoutUserHandler,
                    options: {
                        auth: false,
                        validate: {
                            payload: Joi.object({
                                userName: Joi.string().required(),
                                password: Joi.string().required(),
                            }),
                            failAction: 'log',
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: 'PUT',
                    path: '/v1/users/{id}',
                    handler: updateUserHandler,
                },
            ]),
            server.route([
                {
                    method: 'GET',
                    path: '/v1/users/search/{searchParam}',
                    handler: searchUsersHandler,
                    options: {
                        validate: {
                            params: Joi.string(),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        userName: Joi.string(),
                                        id: Joi.string(),
                                        bio: Joi.string(),
                                        createdAt: Joi.date(),
                                        updatedAt: Joi.date(),
                                    })
                                ),
                                version: Joi.string().required(),
                            }),
                            failAction: 'log',
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: 'DELETE',
                    path: '/v1/users/{userId}',
                    handler: deleteUserHandler,
                    options: {
                        validate: {
                            params: Joi.string(),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.object({}),
                                version: Joi.string().required(),
                            }),
                            failAction: 'log',
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: 'GET',
                    path: '/v1/users/{id}',
                    handler: getUserHandler,
                },
            ]);
    },
};

export default usersPlugin;

const generateNewJwtToken = async (user: IUser, jwt: any): Promise<string> => {
    return await jwt.sign({ data: user.userName }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const setTokenToRedis = async (user: IUser, redis: RedisClientType, token: string) => {
    await redis.json.set(`token:${user.id as string}`, '$', { userId: user.id as string, token: token });
    await redis.expire(`token:${user.id}`, Number(process.env.REDIS_TTL));
};

const signupHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma, jwt, redis } = request.server.app;
    const { userName, password, phone, email, bio } = request.payload as any;
    try {
        const createdUser = await prisma.user.create({
            data: {
                userName: userName,
                phone: phone,
                email: email,
                bio: bio,
                password: bcrypt.hashSync(password, 10),
            },
            omit: { password: true },
        });
        //Add chattyAi as new user's contact TODO: Add the ID to .env
        await prisma.contact.create({
            data: { userId: createdUser.id, contactId: '621dc179-6489-4087-a98d-993966eba7dc', accepted: true },
        });
        const userToken = await generateNewJwtToken(createdUser as IUser, jwt);
        await recordIndexer({ ...createdUser }, 'IDX_USER');
        await setTokenToRedis(createdUser as IUser, redis, userToken);
        return h
            .response({
                data: { ...createdUser, token: userToken },
                version: '1.0.0',
            })
            .code(201);
    } catch (error) {
        return h.response({ error: 'A server error occurred', version: '1.0.0' }).code(500);
    }
};

const signinHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma, jwt, redis } = request.server.app;
    const { userName, password } = request.payload as any;
    try {
        const user = await prisma.user.findUnique({ where: { userName: userName } });
        if (!user) throw new Error('User does not exist');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error('Username or password incorrect');
        let userAuthToken = await redis.json.get(`token:${user.id}`);
        if (!userAuthToken) {
            userAuthToken = await generateNewJwtToken(user as IUser, jwt);
            await setTokenToRedis(user as IUser, redis, userAuthToken);
        }
        return jwt.verify(userAuthToken, process.env.JWT_SECRET, async (error: any) => {
            const userToSend = { ...user };
            // @ts-ignore
            delete userToSend.password;
            if (error) {
                userAuthToken = await generateNewJwtToken(user as IUser, jwt);
                await setTokenToRedis(user as IUser, redis, userAuthToken);
                return h.response({ data: { ...userToSend, token: userAuthToken }, version: '1.0.0' }).code(200);
            } else {
                return h.response({ data: { ...userToSend, token: userAuthToken }, version: '1.0.0' }).code(200);
            }
        });
    } catch (error: any) {
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const searchUsersHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { searchParam } = request.params as any;
    try {
        return h.response({ data: {}, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const logoutUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {};

const updateUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {};

const deleteUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { userId } = request.params as any;
    try {
        await prisma.user.delete({ where: { id: userId } });
        const deleteIndex = await removeIndex(userId, 'IDX_USER');
        return h.response({ data: {}, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const getUserHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {};
