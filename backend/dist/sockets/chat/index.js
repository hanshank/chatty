"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const ws_1 = require("ws");
const chat_store_1 = require("../../store/chat/chat.store");
const MESSAGE_TYPES = {
    NEW_CHAT_MESSAGE: 'new-chat-message',
    NEW_PARTICIPANT_JOINED: 'new-participant-joined',
    PARTICIPANTS_UPDATED: 'participants-updated',
};
const chatSocket = new ws_1.WebSocketServer({ noServer: true });
function sendToAllClients(data) {
    console.log('sending to client', data);
    chatSocket.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
chatSocket.on('connection', (socket) => {
    socket.id = (0, nanoid_1.nanoid)(); // TODO: keep track of clients if necessary
    const participantsSubscription = chat_store_1.participants$.subscribe({ next: (participants) => {
            sendToAllClients({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED });
        } });
    socket.on('message', (message) => {
        const { type, payload } = JSON.parse(message);
        console.log({ type, payload });
        switch (type) {
            case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
                sendToAllClients({ payload, type });
                break;
            }
            case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
                (0, chat_store_1.updateParticipants)(payload);
                break;
            }
            default: {
                break;
            }
        }
    });
    socket.on('close', () => {
        // TODO: Remove Participant
        participantsSubscription.unsubscribe();
    });
    socket.on('close', () => console.log('socket closed'));
    socket.on('error', (e) => {
        console.log('the error is', e);
    });
});
exports.default = chatSocket;
