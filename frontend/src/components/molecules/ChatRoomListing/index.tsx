import React from "react";

import styles from "./styles.module.css";
import Button from "../../atoms/Button";

type Props = {
  name: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

const ChatRoomListing = ({ name, onClick }: Props) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.name}>{name}</span>

      <Button onClick={onClick}>Join</Button>
    </div>
  );
};

export default ChatRoomListing;
