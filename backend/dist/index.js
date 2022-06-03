"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_1 = require("url");
const setupDatabase_1 = __importDefault(require("./database/setupDatabase"));
const chat_1 = __importDefault(require("./socketServers/chat"));
const chatLobby_1 = __importDefault(require("./socketServers/chatLobby"));
const PORT = 5000;
function startServer() {
    const app = (0, express_1.default)();
    (0, setupDatabase_1.default)();
    const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
    server.on('upgrade', (request, socket, head) => {
        const { pathname } = (0, url_1.parse)(request.url || '');
        if (pathname === '/lobby') {
            chatLobby_1.default.handleUpgrade(request, socket, head, socket => {
                chatLobby_1.default.emit('connection', socket, request);
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
