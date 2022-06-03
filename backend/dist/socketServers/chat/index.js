"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const ws_1 = require("ws");
const chat_store_1 = require("../../store/chat/chat.store");
const utils_1 = require("../utils");
const MESSAGE_TYPES = {
    NEW_CHAT_MESSAGE: 'new-chat-message',
    NEW_PARTICIPANT_JOINED: 'new-participant-joined',
    PARTICIPANTS_UPDATED: 'participants-updated',
};
const chatSocketServer = new ws_1.WebSocketServer({ noServer: true });
chatSocketServer.on('connection', (socket) => {
    socket.id = (0, nanoid_1.nanoid)();
    const participantsSubscription = chat_store_1.participants$.subscribe({ next: (participants) => {
            (0, utils_1.sendToAllClients)({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED }, chatSocketServer);
        } });
    socket.on('message', (message) => {
        const { type, payload } = JSON.parse(message);
        switch (type) {
            case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
                (0, utils_1.sendToAllClients)({ payload, type }, chatSocketServer);
                break;
            }
            case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
                socket.id = payload.username;
                (0, chat_store_1.updateParticipants)({ ...payload, id: socket.id });
                break;
            }
            default: {
                break;
            }
        }
    });
    socket.on('close', () => {
        console.log('client closed');
        // TODO: go through all clients and update participants accordingly
        let openClientIds = [];
        chatSocketServer.clients.forEach(clientSocket => {
            if (clientSocket.readyState === clientSocket.OPEN) {
                openClientIds.push(clientSocket.id);
            }
        });
        (0, chat_store_1.removeInactiveParticipants)(openClientIds);
        participantsSubscription.unsubscribe();
    });
});
exports.default = chatSocketServer;
