var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { nanoid } from 'nanoid';
import setupDatabase from './database/setupDatabase.js';
const MESSAGE_TYPES = {
    ROOM_CREATED: "room-created",
    ROOMS_RETRIEVED: "rooms-retrieved",
};
const PORT = 5000;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const db = yield setupDatabase();
        const chatsLobby = new WebSocketServer({ noServer: true });
        const chatInstance = new WebSocketServer({ noServer: true });
        chatsLobby.on('connection', function connection(socket) {
            return __awaiter(this, void 0, void 0, function* () {
                const userId = chatsLobby.clients.size;
                yield db.read();
                // TODO: DRY this up
                chatsLobby.clients.forEach(client => {
                    var _a;
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: (_a = db.data) === null || _a === void 0 ? void 0 : _a.chatRooms }));
                    }
                });
                socket.on('error', (e) => console.log('error:', e));
                socket.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
                    let clientCount = 0;
                    const formattedData = JSON.parse(data);
                    if (formattedData.type === 'create-room') {
                        if (db === null || db === void 0 ? void 0 : db.data) {
                            yield db.read();
                            const chatRoomId = nanoid();
                            db.data.chatRooms.push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy });
                            yield db.write();
                            chatsLobby.clients.forEach((client) => {
                                var _a;
                                clientCount++;
                                console.log(clientCount);
                                if (client.readyState === WebSocket.OPEN) {
                                    if (clientCount === userId) {
                                        console.log('room created');
                                        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }));
                                    }
                                    client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: (_a = db.data) === null || _a === void 0 ? void 0 : _a.chatRooms }));
                                }
                            });
                        }
                    }
                    chatsLobby.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(db.data));
                        }
                    });
                }));
            });
        });
        chatInstance.on('connection', function connection(ws) {
        });
        const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
        server.on('upgrade', (request, socket, head) => {
            const { pathname } = parse(request.url || '');
            if (pathname === '/lobby') {
                chatsLobby.handleUpgrade(request, socket, head, socket => {
                    chatsLobby.emit('connection', socket, request);
                });
            }
            if (pathname === '/chat') {
                chatInstance.handleUpgrade(request, socket, head, socket => {
                    chatInstance.emit('connection', socket, request);
                });
            }
        });
    });
}
startServer();
