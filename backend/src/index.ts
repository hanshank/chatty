import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { nanoid } from 'nanoid'
import setupDatabase from './database/setupDatabase';
import chatSocket from './sockets/chat';

const MESSAGE_TYPES = {
  ROOM_CREATED: "room-created",
  ROOMS_RETRIEVED: "rooms-retrieved",
};

const PORT = 5000;

function startServer() {
  const app = express();

  const db = setupDatabase();
  
  const chatLobbySocket = new WebSocketServer({ noServer: true });

  chatLobbySocket.on('connection', function connection(socket) {
    const socketId = nanoid();
    socket.id = socketId;
  
    // TODO: DRY this up
    chatLobbySocket.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const chatRooms = db.get('chatRooms');
        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }));
      }
    })
  
    socket.on('error', (e) => console.log('error:', e));
   
    socket.on('message', (data: string) => {
      let clientCount = 0;
      const formattedData = JSON.parse(data);
  
      if (formattedData.type === 'create-room') {
        const chatRoomId = nanoid();

        db.get('chatRooms').push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy }).write();
        
        chatLobbySocket.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            if (client.id === socketId) {
              client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }))  
            }

            client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: db.get('chatRooms') }));
          }
        })
      }

      // TODO: DRY up
      chatLobbySocket.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          const chatRooms = db.get('chatRooms');
          client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }));
        }
      });

    });
  });
  
  const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
  
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url ||'');

    if (pathname === '/lobby') {
      chatLobbySocket.handleUpgrade(request, socket, head, socket => {
        chatLobbySocket.emit('connection', socket, request);
      });
    }
  
    if (pathname === '/chats') {
      chatSocket.handleUpgrade(request, socket, head, socket => {
        chatSocket.emit('connection', socket, request);
      });
    }
  });
}

startServer();