import { nanoid } from "nanoid";
import { sendToAllClients } from "../utils"
import { WebSocketServer, WebSocket } from "ws";
import { db } from "../../database/setupDatabase";

const MESSAGE_TYPES = {
  ROOM_CREATED: "room-created",
  ROOMS_RETRIEVED: "rooms-retrieved",
};

const chatLobbySocketServer = new WebSocketServer({ noServer: true });

chatLobbySocketServer.on('connection', function connection(socket) {
  socket.id = nanoid();

  const chatRooms = db.get('chatRooms');

  sendToAllClients({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }, chatLobbySocketServer)
  
  socket.on('message', (data: string) => {
    const formattedData = JSON.parse(data);

    if (formattedData.type === 'create-room') {
      const chatRoomId = nanoid();

      db.get('chatRooms').push({ name: formattedData.roomName, id: chatRoomId, createdBy: formattedData.createdBy }).write();
      
      chatLobbySocketServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          if (client.id === socket.id) {
            client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOM_CREATED, id: chatRoomId }))  
          }

          client.send(JSON.stringify({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms: db.get('chatRooms') }));
        }
      })
    }

    const chatRooms = db.get('chatRooms');
    
    sendToAllClients({ type: MESSAGE_TYPES.ROOMS_RETRIEVED, chatRooms }, chatLobbySocketServer);

  });
});

export default chatLobbySocketServer;
