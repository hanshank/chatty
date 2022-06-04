import { updateChatStore, isChatInitialized$ } from './chat.store';
import { username$ } from "./chat.store";

const MESSAGE_TYPES = {
  NEW_CHAT_MESSAGE: 'new-chat-message',
  NEW_PARTICIPANT_JOINED: 'new-participant-joined',
}

let chatSocket: WebSocket;

export function initializeChat(chatId: string) {
  chatSocket = new WebSocket(
    `ws://localhost:5000/chats?chatid=${chatId}`
  );

  username$.subscribe({ next: (username) => {
    if (username) {
      chatSocket.send(JSON.stringify({ payload: { username }, type: MESSAGE_TYPES.NEW_PARTICIPANT_JOINED }))} 
    }
  });

  chatSocket.onmessage = (messageEvent => {
    const { type, payload } = JSON.parse(messageEvent.data);

    if (type && payload) {
      updateChatStore({ payload, type });
    }
  })
}

export function sendChatMessage(message: string) { 
  const username = username$.getValue();

  chatSocket.send(JSON.stringify({ payload: { text: message, username }, type: MESSAGE_TYPES.NEW_CHAT_MESSAGE }));
};