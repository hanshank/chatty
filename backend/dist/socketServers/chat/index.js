"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatSocketServer = void 0;
const nanoid_1 = require("nanoid");
const ws_1 = require("ws");
const chat_store_1 = require("../../store/chat/chat.store");
const utils_1 = require("../utils");
const url_1 = require("url");
const MESSAGE_TYPES = {
    NEW_CHAT_MESSAGE: 'new-chat-message',
    NEW_PARTICIPANT_JOINED: 'new-participant-joined',
    PARTICIPANTS_UPDATED: 'participants-updated',
};
function createChatSocketServer() {
    const chatSocketServer = new ws_1.WebSocketServer({ noServer: true });
    chatSocketServer.on('connection', (socket, incommingMessage) => {
        let chatRoomParticipantsIds = [];
        const { query } = (0, url_1.parse)(incommingMessage.url || '');
        const queryParamsAsObject = new URLSearchParams(query || '');
        const chatId = queryParamsAsObject.get('chatid') || '';
        socket.id = (0, nanoid_1.nanoid)();
        const chatRoomParticipants$ = (0, chat_store_1.getRoomParticipantsObservable)(chatId);
        const participantsSubscription = chatRoomParticipants$.subscribe({ next: (participants) => {
                const socketIdsOfRoomParticipants = participants.map(p => p.id);
                chatRoomParticipantsIds = socketIdsOfRoomParticipants;
                (0, utils_1.sendToClientsInRoom)({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED }, chatSocketServer, chatRoomParticipantsIds);
            } });
        socket.on('message', (message) => {
            const { type, payload } = JSON.parse(message);
            switch (type) {
                case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
                    (0, utils_1.sendToClientsInRoom)({ payload, type }, chatSocketServer, chatRoomParticipantsIds);
                    break;
                }
                case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
                    (0, chat_store_1.updateRoomParticipants)({ participant: { ...payload, id: socket.id }, roomId: chatId });
                    break;
                }
                default: {
                    break;
                }
            }
        });
        socket.on('close', () => {
            let openClientIds = [];
            chatSocketServer.clients.forEach(clientSocket => {
                const isInRoom = chatRoomParticipantsIds.includes(clientSocket.id);
                if (clientSocket.readyState === clientSocket.OPEN && isInRoom) {
                    openClientIds.push(clientSocket.id);
                }
            });
            (0, chat_store_1.removeInactiveParticipants)(openClientIds, chatId);
            participantsSubscription.unsubscribe();
        });
    });
    return chatSocketServer;
}
exports.createChatSocketServer = createChatSocketServer;
