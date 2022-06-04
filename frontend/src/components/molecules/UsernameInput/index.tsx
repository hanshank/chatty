import React, { useState } from "react";

import TextInput from "../../atoms/Inputs/TextInput";
import Button from "../../atoms/Button";
import Label from "../../atoms/Label";

import styles from "./styles.module.css";

type Props = {
  onSubmit: (username: string) => void;
};

const UsernameInput = (props: Props) => {
  const [username, setUsername] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Enter Chat</h2>
        <Label variation="light" text="Enter Username">
          <TextInput
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Label>
        <div className={styles.buttonWrapper}>
          <Button
            size="full-width"
            variation="primary"
            disabled={!username}
            onClick={() => props.onSubmit(username)}
          >
            Enter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsernameInput;
