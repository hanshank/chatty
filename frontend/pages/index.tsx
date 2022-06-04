import type { NextPage } from "next";
import Button from "../src/components/atoms/Button";
import { useEffect, useState } from "react";
import ChatRoomListing from "../src/components/molecules/ChatRoomListing";
import styles from "../styles/Home.module.css";
import { useChatLobby } from "../src/hooks/useChatLobby";
import { useRouter } from "next/router";
import CreateNewRoom from "../src/components/molecules/CreateNewRoom";

const Home: NextPage = () => {
  const router = useRouter();
  const [typedRoomName, setTypedRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [isUserCreatingRoom, setIsUserCreatingRoom] = useState(false);
  const [isUserBeingRedirected, setIsUserBeingRedirected] = useState(false);
  const { rooms, roomCreatedByUser$, createRoom, joinRoom } = useChatLobby();

  useEffect(() => {
    roomCreatedByUser$.subscribe((roomId) => {
      if (roomId && !isUserBeingRedirected) {
        setIsUserBeingRedirected(true);
        router.push(`/chats/${roomId}?host_username=${username}`);
      }
    });
  }, [roomCreatedByUser$, router, username, isUserBeingRedirected]);

  if (isUserCreatingRoom) {
    return (
      <CreateNewRoom
        username={username}
        onUsernameChange={(e) => setUsername(e.currentTarget.value)}
        roomName={typedRoomName}
        onRoomNameChange={(e) => setTypedRoomName(e.currentTarget.value)}
        onSubmit={() => createRoom(typedRoomName, username)}
        type="create"
      />
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome To Chatty</h1>

      <Button
        size="normal"
        variation="outline"
        onClick={() => setIsUserCreatingRoom(true)}
      >
        Create Room +
      </Button>

      <div className={styles.chatRoomsWrapper}>
        {rooms.map((room: any) => (
          <ChatRoomListing
            key={`room-${room.id}`}
            name={room.name}
            onClick={() => joinRoom(room.id)}
          />
        ))}
      </div>

      <div></div>
    </div>
  );
};

export default Home;
