"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToClientsInRoom = exports.sendToAllClients = void 0;
function sendToAllClients(data, socket) {
    socket.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
exports.sendToAllClients = sendToAllClients;
function sendToClientsInRoom(data, socket, clientIdsInRoom) {
    const clientIdsArray = Array.from(clientIdsInRoom);
    socket.clients.forEach(client => {
        if (client.readyState === client.OPEN && clientIdsArray.includes(client.id)) {
            client.send(JSON.stringify(data));
        }
    });
}
exports.sendToClientsInRoom = sendToClientsInRoom;
