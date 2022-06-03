import { nanoid } from "nanoid";
import { WebSocketServer } from "ws";
import { participants$, updateParticipants, removeInactiveParticipants } from '../../store/chat/chat.store';
import { sendToAllClients } from "../utils"

const MESSAGE_TYPES = {
  NEW_CHAT_MESSAGE: 'new-chat-message',
  NEW_PARTICIPANT_JOINED: 'new-participant-joined',
  PARTICIPANTS_UPDATED: 'participants-updated',
}

const chatSocketServer = new WebSocketServer({ noServer: true });

chatSocketServer.on('connection', (socket) => {
  socket.id = nanoid();

  const participantsSubscription = participants$.subscribe({ next: (participants) => {
    sendToAllClients({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED }, chatSocketServer)
  }})

  socket.on('message', (message: string) => {
    const { type, payload } = JSON.parse(message);
    
    switch(type) {
      case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
        sendToAllClients({ payload, type }, chatSocketServer);
        break;
      }
      case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
        socket.id = payload.username;
        updateParticipants({ ...payload, id: socket.id });
        break;
      }
      default: {
        break;
      }
    }
  })

  socket.on('close', () => {
    console.log('client closed');
    // TODO: go through all clients and update participants accordingly

    let openClientIds: string[] = [];

    chatSocketServer.clients.forEach(clientSocket => {
      if (clientSocket.readyState === clientSocket.OPEN) {
        openClientIds.push(clientSocket.id);
      }
    });

    removeInactiveParticipants(openClientIds);

    participantsSubscription.unsubscribe();
  })
});

 export default chatSocketServer;