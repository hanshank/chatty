import { BehaviorSubject, } from "rxjs";

export type Message = {
  text: string;
  username: string;
}

export type Participant = {
  username: string;
  id: string;
}

export const messages$ = new BehaviorSubject<Message[]>([]);

export const participants$ = new BehaviorSubject<Participant[]>([]);

export function updateMessages(payload: Message) {
  console.log('updating', payload);
  messages$.next([...messages$.getValue(), { text: payload?.text, username: payload?.username }]);
}

export function updateParticipants(payload: any) {
  const existingParticipants = participants$.value;
  participants$.next([...existingParticipants, { username: payload.username, id: payload.id }]);
}

export function removeInactiveParticipants(idsOfActiveParticipants: string[]) {
  const onlineParticipants = participants$.getValue().filter(p => idsOfActiveParticipants.includes(p.id));
  participants$.next(onlineParticipants);
}