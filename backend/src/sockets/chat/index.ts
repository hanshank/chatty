import { nanoid } from "nanoid";
import { WebSocketServer } from "ws";
import { participants$, updateParticipants } from '../../store/chat/chat.store';

const MESSAGE_TYPES = {
  NEW_CHAT_MESSAGE: 'new-chat-message',
  NEW_PARTICIPANT_JOINED: 'new-participant-joined',
  PARTICIPANTS_UPDATED: 'participants-updated',
}

const chatSocket = new WebSocketServer({ noServer: true });

function sendToAllClients(data: any) {
  console.log('sending to client', data);
  chatSocket.clients.forEach(client => { 
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data)) 
    }
    
  });
}

chatSocket.on('connection', (socket) => {
  socket.id = nanoid(); // TODO: keep track of clients if necessary

  const participantsSubscription = participants$.subscribe({ next: (participants) => {
    sendToAllClients({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED })
  }})

  socket.on('message', (message: string) => {
    const { type, payload } = JSON.parse(message);

    console.log({type, payload});
    
    switch(type) {
      case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
        sendToAllClients({ payload, type });
        break;
      }
      case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
        updateParticipants(payload)
        break;
      }
      default: {
        break;
      }
    }
  })

  socket.on('close', () => {
    // TODO: Remove Participant
    participantsSubscription.unsubscribe();
  })

  socket.on('close', () => console.log('socket closed'));

  socket.on('error', (e) => {
    console.log('the error is', e);
  })
});

export default chatSocket;