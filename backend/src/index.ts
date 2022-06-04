import express from 'express';
import { parse } from 'url';
import setupDatabase from './database/setupDatabase';
import { createChatSocketServer } from './socketServers/chat';
import chatLobbySocketServer from './socketServers/chatLobby';

const PORT = 5000;

function startServer() {
  const app = express();

  setupDatabase();
  
  const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));

  const chatSocketServer = createChatSocketServer();
  
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url || '');

    if (pathname === '/lobby') {
      chatLobbySocketServer.handleUpgrade(request, socket, head, socket => {
        chatLobbySocketServer.emit('connection', socket, request);
      });
    }
  
    if (pathname === '/chats') {
      chatSocketServer.handleUpgrade(request, socket, head, socket => {
        chatSocketServer.emit('connection', socket, request);
      });
    }
  });
}

startServer();