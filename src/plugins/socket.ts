import Hapi from '@hapi/hapi';
import { Server, Socket } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import { PrismaClient } from '@prisma/client';

const WS_EVENTS = {
    connect: 'connection',
    SERVER: {
        JOIN_ROOM_SELF: 'JOIN_ROOM',
        STATUS: 'ONLINE',
        SEND_MESSAGE: 'SEND_MESSAGE',
    },
};

const socketPlugin: Hapi.Plugin<null> = {
    name: 'socket',
    dependencies: ['prisma'],
    register: async (server: Hapi.Server) => {
        const prisma = new PrismaClient();
        const io = new Server(server.listener, {
            cors: {
                origin: ['https://admin.socket.io', 'http://localhost:3000'],
                credentials: false,
            },
        });
        instrument(io, {
            auth: false,
            mode: 'development',
        });

        io.on(WS_EVENTS.connect, (socket: Socket) => {
            console.log("['info'] Socket.io is connected!");
            /*
             * on connect, join user to their username room
             * */
            socket.on(WS_EVENTS.SERVER.JOIN_ROOM_SELF, (userId) => {
                socket.join(userId);
                socket.to(userId).emit(WS_EVENTS.SERVER.STATUS, 'ONLINE');
                console.log("['info'] User joined own room", userId, socket.rooms);
            });

            socket.on(WS_EVENTS.SERVER.SEND_MESSAGE, async (socketMessage) => {
                const { to } = socketMessage;
                const savedMessage = await prisma.message.create({ data: socketMessage });
                socket.in(to).emit(WS_EVENTS.SERVER.SEND_MESSAGE, savedMessage);
            });
        });
        console.log("['info'] Socket.io is initialized");
    },
};

export default socketPlugin;
