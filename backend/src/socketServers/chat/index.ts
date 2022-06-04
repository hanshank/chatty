import { nanoid } from "nanoid";
import { WebSocketServer } from "ws";
import { updateRoomParticipants, removeInactiveParticipants, getRoomParticipantsObservable } from '../../store/chat/chat.store';
import { sendToClientsInRoom } from "../utils"
import { parse } from "url";

const MESSAGE_TYPES = {
  NEW_CHAT_MESSAGE: 'new-chat-message',
  NEW_PARTICIPANT_JOINED: 'new-participant-joined',
  PARTICIPANTS_UPDATED: 'participants-updated',
}

export function createChatSocketServer() {
  const chatSocketServer = new WebSocketServer({ noServer: true });

  chatSocketServer.on('connection', (socket, incommingMessage) => {
    let chatRoomParticipantsIds: string[] = [];
    const { query } = parse(incommingMessage.url || '');
    const queryParamsAsObject = new URLSearchParams(query || '');
    const chatId = queryParamsAsObject.get('chatid') || '';

    socket.id = nanoid();
    
    const chatRoomParticipants$ = getRoomParticipantsObservable(chatId);

    const participantsSubscription = chatRoomParticipants$.subscribe({ next: (participants) => {
      const socketIdsOfRoomParticipants = participants.map(p => p.id);
      chatRoomParticipantsIds = socketIdsOfRoomParticipants;
      
      sendToClientsInRoom({ payload: participants, type: MESSAGE_TYPES.PARTICIPANTS_UPDATED }, chatSocketServer, chatRoomParticipantsIds)
    }})
  
    socket.on('message', (message: string) => {
      const { type, payload } = JSON.parse(message);
      
      switch(type) {
        case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
          sendToClientsInRoom({ payload, type }, chatSocketServer, chatRoomParticipantsIds);
          break;
        }
        case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
          updateRoomParticipants({ participant: { ...payload, id: socket.id }, roomId: chatId });
          break;
        }
        default: {
          break;
        }
      }
    })
  
    socket.on('close', () => {
      let openClientIds: string[] = [];
  
      chatSocketServer.clients.forEach(clientSocket => {
        const isInRoom = chatRoomParticipantsIds.includes(clientSocket.id);

        if (clientSocket.readyState === clientSocket.OPEN && isInRoom) {
          openClientIds.push(clientSocket.id);
        }
      });
  
      removeInactiveParticipants(openClientIds, chatId);
  
      participantsSubscription.unsubscribe();
    })
  });

  return chatSocketServer
}

