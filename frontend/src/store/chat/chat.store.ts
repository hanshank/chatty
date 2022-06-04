import { BehaviorSubject, combineLatest, map, zip } from "rxjs";

const MESSAGE_TYPES = {
  INCOMING_MESSAGE: 'incoming-message',
  PARTICIPANT_JOINED: 'incoming-participant',
  PARTICIPANT_LEFT: 'participant-left',
  NEW_CHAT_MESSAGE: 'new-chat-message',
  PARTICIPANTS_UPDATED: 'participants-updated',
  NEW_PARTICIPANT_JOINED: 'new-participant-joined',
}

export type Message = {
  text: string;
  username: string;
  color?: string;
}

export type Participant = {
  username: string;
  color?: string;
}

export const messages$ = new BehaviorSubject<Message[]>([]);

export const participants$ = new BehaviorSubject<Participant[]>([]);

export const participantsWithColors$ = participants$.pipe(map((participants) => participants.map(participant => ({ ...participant, color: participant?.color || generateRandomColor() }))))

export const messagesWithColors$ = combineLatest([messages$, participantsWithColors$])
  .pipe(
    map(([messages, participants]) => messages.map(message => {
      const matchingUser = participants.filter(p => p.username === message.username)[0];

      return {
        ...message,
        color: matchingUser?.color,
      }
    }))
  );

export const isChatInitialized$ = new BehaviorSubject<boolean>(false);

export const typedMessage$ = new BehaviorSubject<string>('');

export const username$ = new BehaviorSubject<Message['username']>('');

function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function isParticipant(value: any): value is Participant {
  if ('username' in value) {
    return true;
  }

  return false;
}

function isParticipants(value: any): value is Participant[] {
  if (Array.isArray(value) && value.every(el => isParticipant(el))) {
    return true;
  }

  return false;
}

function isMessage(value: any): value is Message {
  if ('text' in value && 'username' in value) {
    return true;
  }

  return false;
}

export function updateChatStore({ payload, type }: { payload: Message | Participant, type: string }) {
  switch(type) {
    case MESSAGE_TYPES.NEW_CHAT_MESSAGE: {
      if (isMessage(payload)) {
        const newMessage = payload;
        messages$.next([...messages$.getValue(), newMessage]);
      }
      break;
    } 
    case MESSAGE_TYPES.PARTICIPANTS_UPDATED: {
      if (isParticipants(payload)){
        participants$.next(payload);
      }
      break;
    } 
    case MESSAGE_TYPES.NEW_PARTICIPANT_JOINED: {
      if (isParticipant(payload)) {
        const existingParticipants = participants$.getValue() || [];
        participants$.next([...existingParticipants, { ...payload, color: generateRandomColor() }]);
      }
      break;
    }
    default: {
      // in a production app we would maybe utilize logging here (DataDog, New Relic etc)
      // and potentially add some error handling
      break;
    }
  }
}

export function setChatToInitialized() {
  isChatInitialized$.next(true);
}