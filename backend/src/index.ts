import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { nanoid } from 'nanoid'
import setupDatabase from './database/setupDatabase.js';

type ChatRoom = {
  createdBy: string;
  name: string;
  id: string;
}

type Data = {
  chatRooms: ChatRoom[];
}

const MESSAGE_TYPES = {
  ROOM_CREATED: "room-created",
  ROOMS_RETRIEVED: "rooms-retrieved",
};

const PORT = 5000;

async function startServer() {
  const app = express();

  const db = await setupDatabase();
  
  const chatsLobby = new WebSocketServer({ noServer: true });
  const chatInstance = new WebSocketServer({ noServer: true });

  chatsLobby.on('connection', async function connection(socket) {
    const userId = chatsLobby.clients.size;
    
    await db.read();
  
    // TODO: DRY this up
    chatsLobby.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: db.data?.chatRooms }));
      }
    })
  
    socket.on('error', (e) => console.log('error:', e));
   
    socket.on('message', async (data: string) => {
      let clientCount = 0;
      const formattedData = JSON.parse(data);
  
      if (formattedData.type === 'create-room') {
        if (db?.data) {
          await db.read();

          const chatRoomId = nanoid();
  
          db.data.chatRooms.push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy });
          
          await db.write();

          chatsLobby.clients.forEach((client) => {
            clientCount ++;
            console.log(clientCount);

            if (client.readyState === WebSocket.OPEN) {
              if (clientCount === userId) {
                console.log('room created');
                client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }))  
              }

              client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: db.data?.chatRooms }));
            }
          })
        }
      }
  
      chatsLobby.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(db.data));
        }
      })
    });
  });
    
  
  chatInstance.on('connection', function connection(ws) {
    
  });
  
  const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
  
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url ||'');
  
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
}

startServer();