import { useRouter } from "next/router";
import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { useObservableState } from "../../src/hooks/useObservableState";
import {
  participantsWithColors$,
  messagesWithColors$,
  typedMessage$,
  username$,
} from "../../src/store/chat/chat.store";
import {
  initializeChat,
  sendChatMessage,
} from "../../src/store/chat/chat.actions";
import UsernameInput from "../../src/components/molecules/UsernameInput";
import ChatMessageEditor from "../../src/components/molecules/ChatMessageEditor/index";

import styles from "./styles.module.css";

type Props = {};

const Chat: NextPage = ({}: Props) => {
  const isChatInitialized = useRef(false);
  const participants = useObservableState(participantsWithColors$, []);
  const messages = useObservableState(messagesWithColors$, []);
  const typedMessage = useObservableState(typedMessage$, "");
  const username = useObservableState(username$, "");
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  useEffect(() => {
    if (!username) {
      setShowUsernameInput(true);
    }

    if (!isChatInitialized.current) {
      const urlArray = window.location.pathname.split("/");
      const chatId = urlArray[urlArray.length - 1];

      initializeChat(chatId);
      isChatInitialized.current = true;
    }
  }, [username]);

  function handleUsernameSubmit(username: string) {
    username$.next(username);
    setShowUsernameInput(false);
  }

  if (showUsernameInput) {
    return <UsernameInput onSubmit={handleUsernameSubmit} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Welcome to the Chat{username ? ` ${username}` : ""}
      </h1>

      <div>{participants?.length} users in room:</div>

      <div className={styles.participantsList}>
        {participants?.map((participant, idx) => (
          <div
            key={`${participant.username}-${idx}`}
            style={{ color: participant.color }}
          >
            {participant.username}
          </div>
        ))}
      </div>

      <div className={styles.chatWindow}>
        {messages?.map((message, idx) => (
          <div key={`${message.username}-${idx}`}>
            <span style={{ color: message.color }}>{message.username}: </span>
            <div className={styles.message}>
              <p dangerouslySetInnerHTML={{ __html: message.text }} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <ChatMessageEditor
          onChange={(newContent) => typedMessage$.next(newContent)}
          onSubmit={() => sendChatMessage(typedMessage)}
        />
      </div>
    </div>
  );
};

export default Chat;
