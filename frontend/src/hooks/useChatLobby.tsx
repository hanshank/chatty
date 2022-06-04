import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { BehaviorSubject, Observable } from "rxjs";

type ChatRoom = {
  createdBy: string;
  name: string;
  id: string;
};

const MESSAGE_TYPES = {
  ROOM_CREATED: "room-created",
  ROOMS_RETRIEVED: "rooms-retrieved",
};

const roomCreatedByUser$ = new BehaviorSubject<boolean>(false);

export function useChatLobby() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const chatLobbySocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    chatLobbySocket.current = new WebSocket("ws://localhost:5000/lobby");
  }, []);

  function createRoom(roomName: string, username: string) {
    setUsername(username);
    chatLobbySocket.current?.send(
      JSON.stringify({ type: "create-room", roomName, createdBy: username })
    );
  }

  function createObservable() {
    return new Observable<ChatRoom[]>((subscriber) => {
      if (!chatLobbySocket.current) return;

      chatLobbySocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const messageType = data?.type;

        if (messageType === MESSAGE_TYPES.ROOM_CREATED) {
          roomCreatedByUser$.next(data.id);
        } else if (messageType === MESSAGE_TYPES.ROOMS_RETRIEVED) {
          subscriber.next(data.chatRooms);
        }
      };
    });
  }

  useEffect(() => {
    const observable = createObservable();

    observable.subscribe((rooms) => setRooms(rooms));
  }, []);

  return {
    rooms,
    roomCreatedByUser$,
    createRoom,
    joinRoom: (roomId: string) => router.push(`/chats/${roomId}`),
  };
}
