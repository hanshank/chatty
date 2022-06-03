import { BehaviorSubject, combineLatest, tap } from "rxjs";

export type Message = {
  text: string;
  username: string;
}

export type Participant = {
  username: string;
}

export const messages$ = new BehaviorSubject<Message[]>([]);

export const participants$ = new BehaviorSubject<Participant[]>([]);

// export const roomContent$ = combineLatest([participants$, messages$]).pipe(map(([participants, messages]) => ({ participants, messages })));

export function updateMessages(payload: Message) {
  console.log('updating', payload);
  messages$.next([...messages$.getValue(), { text: payload?.text, username: payload?.username }]);
}

export function updateParticipants(payload: any) {
  const existingParticipants = participants$.value;
  participants$.next([...existingParticipants, { username: payload.username }]);
}
