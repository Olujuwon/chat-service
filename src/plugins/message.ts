import Hapi from "@hapi/hapi";
import Joi from "joi";

const messagesPlugin: Hapi.Plugin<null> = {
    name: "appMessages",
    dependencies: ["prisma"],
    register: async (server: Hapi.Server) => {
        server.route([
            {
                method: "POST",
                path: "/v1/messages",
                handler: createMessageHandler,
                options: {
                    validate: {
                        payload: Joi.object({
                            from: Joi.string().required(),
                            to: Joi.string().required(),
                            body: Joi.string().required(),
                            isRead: Joi.boolean().required(),
                        }),
                        failAction: "log",
                    },
                    response: {
                        schema: Joi.object({
                            data: Joi.object({
                                from: Joi.string().required(),
                                to: Joi.string().required(),
                                body: Joi.string().required(),
                                isRead: Joi.boolean().required(),
                                createdAt: Joi.date(),
                                updatedAt: Joi.date(),
                            }),
                            version: Joi.string().required(),
                        }),
                        failAction: "log",
                    },
                },
            },
        ]),
            server.route([
                {
                    method: "GET",
                    path: "/v1/messages/list/{userId}/{contactId}",
                    handler: listMessagesHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
                            failAction: "log",
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        id: Joi.string(),
                                        from: Joi.string(),
                                        to: Joi.string(),
                                        body: Joi.string(),
                                        isRead: Joi.boolean(),
                                        createdAt: Joi.date(),
                                        updatedAt: Joi.date(),
                                    })
                                ),
                                version: Joi.string().required(),
                            }),
                            failAction: "log",
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: "PUT",
                    path: "/v1/messages/{messageId}",
                    handler: updateMessageHandler,
                    options: {
                        validate: {
                            params: Joi.string().length(36),
                            failAction: "log",
                        },
                        response: {
                            schema: Joi.object({
                                data: Joi.array().items(
                                    Joi.object({
                                        id: Joi.string(),
                                        from: Joi.string(),
                                        to: Joi.string(),
                                        isRead: Joi.boolean(),
                                        createdAt: Joi.date(),
                                        updatedAt: Joi.date(),
                                    })
                                ),
                                version: Joi.string().required(),
                            }),
                            failAction: "log",
                        },
                    },
                },
            ]),
            server.route([
                {
                    method: "DELETE",
                    path: "/v1/messages/{id}",
                    handler: deleteMessageHandler,
                },
            ]);
        server.route([
            {
                method: "GET",
                path: "/v1/messages/contact/{userId}/{contactId}",
                handler: getContactLastMessageHandler,
                options: {
                    validate: {
                        params: Joi.string().length(36),
                        failAction: "log",
                    },
                    response: {
                        schema: Joi.object({
                            data: Joi.array().items(
                                Joi.object({
                                    id: Joi.string(),
                                    from: Joi.string(),
                                    to: Joi.string(),
                                    body: Joi.string(),
                                    isRead: Joi.boolean(),
                                    createdAt: Joi.date(),
                                    updatedAt: Joi.date(),
                                })
                            ),
                            version: Joi.string().required(),
                        }),
                        failAction: "log",
                    },
                },
            },
        ]);
    },
};

export default messagesPlugin;

const createMessageHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { from, to, body, isRead } = request.payload as any;
    try {
        const createdMessage = await prisma.message.create({
            data: {
                from,
                to,
                body,
                isRead,
            },
        });
        return h.response({ data: createdMessage, version: "1.0.0" }).code(201);
    } catch (error) {
        console.log(error);
        return h.response({ error: "A server error occurred", version: "1.0.0" }).code(500);
    }
};

const listMessagesHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const [userId, contactId] = request.paramsArray as any;
    try {
        const messages = await prisma.message.findMany({
            where: {
                AND: [
                    {
                        from: {
                            in: [userId, contactId],
                        },
                    },
                    {
                        to: {
                            in: [userId, contactId],
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: { sort: "asc" },
            },
        });
        return h.response({ data: messages, version: "1.0.0" }).code(200);
    } catch (error: any) {
        return h.response({ error: error.message, version: "1.0.0" }).code(500);
    }
};

const updateMessageHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const { messageId } = request.params as any;
    const messageUpdate = request.payload as any;
    try {
        const updatedMessage = await prisma.message.update({
            where: {
                id: messageId,
            },
            data: messageUpdate,
        });
        return h.response({ data: updatedMessage, version: "1.0.0" }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: "1.0.0" }).code(500);
    }
};

const deleteMessageHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {};

const getContactLastMessageHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const { prisma } = request.server.app;
    const [userId, contactId] = request.paramsArray as any;
    try {
        const contactLastMessage = await prisma.message.findMany({
            where: {
                AND: [
                    {
                        from: {
                            in: [userId, contactId],
                        },
                    },
                    {
                        to: {
                            in: [userId, contactId],
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: { sort: "desc" },
            },
            take: 1,
        });
        return h.response({ data: contactLastMessage, version: "1.0.0" }).code(200);
    } catch (error: any) {
        console.log(error);
        return h.response({ error: error.message, version: "1.0.0" }).code(500);
    }
};
