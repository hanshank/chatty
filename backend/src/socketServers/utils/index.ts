import { WebSocketServer } from 'ws';

export function sendToAllClients(data: any, socket: WebSocketServer) {
  socket.clients.forEach(client => { 
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data)) 
    }
  });
}