"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const url_1 = require("url");
const nanoid_1 = require("nanoid");
const setupDatabase_1 = __importDefault(require("./database/setupDatabase"));
const chat_1 = __importDefault(require("./sockets/chat"));
const MESSAGE_TYPES = {
    ROOM_CREATED: "room-created",
    ROOMS_RETRIEVED: "rooms-retrieved",
};
const PORT = 5000;
function startServer() {
    const app = (0, express_1.default)();
    const db = (0, setupDatabase_1.default)();
    const chatLobbySocket = new ws_1.WebSocketServer({ noServer: true });
    chatLobbySocket.on('connection', function connection(socket) {
        const socketId = (0, nanoid_1.nanoid)();
        socket.id = socketId;
        // TODO: DRY this up
        chatLobbySocket.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                const chatRooms = db.get('chatRooms');
                client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }));
            }
        });
        socket.on('error', (e) => console.log('error:', e));
        socket.on('message', (data) => {
            let clientCount = 0;
            const formattedData = JSON.parse(data);
            if (formattedData.type === 'create-room') {
                const chatRoomId = (0, nanoid_1.nanoid)();
                db.get('chatRooms').push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy }).write();
                chatLobbySocket.clients.forEach((client) => {
                    if (client.readyState === ws_1.WebSocket.OPEN) {
                        if (client.id === socketId) {
                            client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }));
                        }
                        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: db.get('chatRooms') }));
                    }
                });
            }
            // TODO: DRY up
            chatLobbySocket.clients.forEach(client => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    const chatRooms = db.get('chatRooms');
                    client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }));
                }
            });
        });
    });
    const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
    server.on('upgrade', (request, socket, head) => {
        const { pathname } = (0, url_1.parse)(request.url || '');
        if (pathname === '/lobby') {
            chatLobbySocket.handleUpgrade(request, socket, head, socket => {
                chatLobbySocket.emit('connection', socket, request);
            });
        }
        if (pathname === '/chats') {
            chat_1.default.handleUpgrade(request, socket, head, socket => {
                chat_1.default.emit('connection', socket, request);
            });
        }
    });
}
startServer();
