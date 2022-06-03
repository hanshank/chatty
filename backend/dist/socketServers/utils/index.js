"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToAllClients = void 0;
function sendToAllClients(data, socket) {
    socket.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
exports.sendToAllClients = sendToAllClients;
