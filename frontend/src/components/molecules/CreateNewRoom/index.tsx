import React from "react";

import Label from "../../atoms/Label";
import TextInput from "../../atoms/Inputs/TextInput";
import Button from "../../atoms/Button";

import styles from "./styles.module.css";

type Props = {
  username: string;
  onUsernameChange: React.ChangeEventHandler<HTMLInputElement>;
  onRoomNameChange?: React.ChangeEventHandler<HTMLInputElement>;
  roomName?: string;
  type: "create" | "join";
  onSubmit: Function;
};

const CreateNewRoom = ({
  onRoomNameChange,
  roomName,
  username,
  type,
  onSubmit,
}: Props) => {
  const isCreatingRoom = type === "create";
  const title = isCreatingRoom ? "Create New Room" : "Join Room";
  const buttonText = isCreatingRoom ? "Create" : "join";
  const isSubmitEnabled =
    (isCreatingRoom && roomName) || (!isCreatingRoom && username);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>

        {!isCreatingRoom ? null : (
          <Label text="Room Name" variation="light">
            <TextInput value={roomName} onChange={onRoomNameChange} />
          </Label>
        )}

        <div className={styles.buttonWrapper}>
          <Button
            variation="primary"
            size="full-width"
            disabled={!isSubmitEnabled}
            onClick={() => onSubmit()}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewRoom;
