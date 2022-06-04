import { BehaviorSubject } from "rxjs";

type ChatRoom = {
  name: string;
  id: string;
}

export const chatRooms$ = new BehaviorSubject<ChatRoom[]>([]);