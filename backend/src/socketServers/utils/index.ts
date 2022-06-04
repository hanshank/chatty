import { WebSocketServer } from 'ws';

export function sendToAllClients(data: any, socket: WebSocketServer) {
  socket.clients.forEach(client => { 
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data)) 
    }
  });
}

export function sendToClientsInRoom(data: any, socket: WebSocketServer, clientIdsInRoom: string[]) {
  const clientIdsArray = Array.from(clientIdsInRoom);

  socket.clients.forEach(client => { 
    if (client.readyState === client.OPEN && clientIdsArray.includes(client.id)) {
      client.send(JSON.stringify(data)) 
    }
  });
}