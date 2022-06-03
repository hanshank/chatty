"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const utils_1 = require("../utils");
const ws_1 = require("ws");
const setupDatabase_1 = require("../../database/setupDatabase");
const MESSAGE_TYPES = {
    ROOM_CREATED: "room-created",
    ROOMS_RETRIEVED: "rooms-retrieved",
};
const chatLobbySocketServer = new ws_1.WebSocketServer({ noServer: true });
chatLobbySocketServer.on('connection', function connection(socket) {
    socket.id = (0, nanoid_1.nanoid)();
    const chatRooms = setupDatabase_1.db.get('chatRooms');
    (0, utils_1.sendToAllClients)({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }, chatLobbySocketServer);
    socket.on('message', (data) => {
        const formattedData = JSON.parse(data);
        if (formattedData.type === 'create-room') {
            const chatRoomId = (0, nanoid_1.nanoid)();
            setupDatabase_1.db.get('chatRooms').push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy }).write();
            chatLobbySocketServer.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    if (client.id === socket.id) {
                        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }));
                    }
                    client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: setupDatabase_1.db.get('chatRooms') }));
                }
            });
        }
        const chatRooms = setupDatabase_1.db.get('chatRooms');
        (0, utils_1.sendToAllClients)({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }, chatLobbySocketServer);
    });
});
exports.default = chatLobbySocketServer;
