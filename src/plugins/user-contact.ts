import Hapi from '@hapi/hapi';
import Joi from 'joi';

const userContactsPlugin: Hapi.Plugin<null> = {
    name: 'appUserContacts',
    dependencies: ['prisma'],
    register: async (server: Hapi.Server) => {
        server.route([
            {
                method: 'POST',
                path: '/v1/contacts',
                handler: createContactHandler,
                options: {
                    validate: {
                        payload: Joi.object({
                            userId: Joi.string().required(),
                            contactId: Joi.string().required(),
                        }),
                        failAction: 'log',
                    },
                    response: {
                        schema: Joi.object({
                            data: Joi.object({
                                userId: Joi.string(),
                                contactId: Joi.string(),
                                accepted: Joi.boolean(),
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
                    method: 'GET',
                    path: '/v1/contacts/list/{userId}',
                    handler: listContactsHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        userId: Joi.string(),
                                        contactId: Joi.string(),
                                        accepted: Joi.boolean(),
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
                    method: 'PUT',
                    path: '/v1/contacts/{contactId}',
                    handler: updateContactHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        userId: Joi.string(),
                                        contactId: Joi.string(),
                                        accepted: Joi.boolean(),
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
                    path: '/v1/contacts/{contactId}',
                    handler: deleteContactHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
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
                    path: '/v1/contacts/{contactId}',
                    handler: getContactHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
                            failAction: 'log',
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        id: Joi.string(),
                                        userName: Joi.string(),
                                        phone: Joi.string(),
                                        email: Joi.string().email(),
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
            ]);
    },
};

export default userContactsPlugin;

const createContactHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { userId, contactId } = request.payload as any;
    try {
        const createdContact = await prisma.contact.create({
            data: {
                userId,
                contactId,
            },
        });
        return h.response({ data: createdContact, version: '1.0.0' }).code(201);
    } catch (error) {
        console.log(error);
        return h.response({ error: 'A server error occurred', version: '1.0.0' }).code(500);
    }
};

const listContactsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { userId } = request.params as any;
    try {
        const contacts = await prisma.contact.findMany({
            where: {
                OR: [
                    {
                        userId: {
                            equals: userId,
                        },
                    },
                    {
                        contactId: {
                            equals: userId,
                        },
                    },
                ],
            },
            select: {
                createdAt: true,
                updatedAt: true,
                id: true,
                accepted: true,
                user: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                        phone: true,
                        bio: true,
                    },
                },
                contact: {
                    select: {
                        id: true,
                        userName: true,
                        email: true,
                        phone: true,
                        bio: true,
                    },
                },
            },
        });
        return h.response({ data: contacts, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const updateContactHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const update = request.payload as any;
    const { contactId } = request.params as any;
    console.log('Updating friendship', contactId, update);
    try {
        const contact = await prisma.contact.update({ where: { id: contactId }, data: update });
        return h.response({ data: contact, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const deleteContactHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { contactId } = request.params as any;
    try {
        await prisma.contact.delete({ where: { id: contactId } });
        return h.response({ data: {}, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};

const getContactHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { contactId } = request.params as any;
    try {
        const contact = await prisma.user.findUnique({ where: { id: contactId }, omit: { password: true } });
        return h.response({ data: contact, version: '1.0.0' }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: '1.0.0' }).code(500);
    }
};
