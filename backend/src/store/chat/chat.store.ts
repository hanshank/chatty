import { BehaviorSubject, from, map, distinctUntilKeyChanged } from "rxjs";

export type Message = {
  text: string;
  username: string;
}

export type Participant = {
  username: string;
  id: string;
}

export type ChatRooms = {
  [id: string]: Participant[],
}

// TODO: Remove
export const messages$ = new BehaviorSubject<Message[]>([]);

const chatRooms$ = new BehaviorSubject<ChatRooms>({});

export const participants$ = new BehaviorSubject<Participant[]>([]);

export function getRoomParticipantsObservable(roomId: string) {
  // TODO: not emitting on changes
  const obs$ = chatRooms$.pipe(distinctUntilKeyChanged(roomId)).pipe(map(chatRooms => chatRooms[roomId] || []));

  return obs$;
}

export function getRoomParticipantsIdsObservable(roomId: string) {
  const obs$ = chatRooms$.pipe(distinctUntilKeyChanged(roomId)).pipe(map(chatRooms => chatRooms[roomId].map(participant => participant.id)));

  return obs$;
}

export function updateRoomParticipants(payload: { participant: Participant, roomId: string }) {
  const existingRooms = chatRooms$.value;
  const roomSpecificParticipants = existingRooms[payload.roomId] || [];

  const newParticipant = { username: payload.participant.username, id: payload.participant.id };

  chatRooms$.next({ ...existingRooms, [payload.roomId]: [...roomSpecificParticipants, newParticipant] });
}

export function removeInactiveParticipants(idsOfActiveParticipants: string[], roomId: string) {
  const existingRooms = chatRooms$.getValue();
  const onlineParticipantsInRoom = existingRooms[roomId].filter(p => idsOfActiveParticipants.includes(p.id));
  
  chatRooms$.next({ ...existingRooms, [roomId]: onlineParticipantsInRoom })
}