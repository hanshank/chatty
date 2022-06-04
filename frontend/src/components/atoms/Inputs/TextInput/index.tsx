import React from "react";

import styles from "./styles.module.css";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="text" className={styles.input} />;
}

export default TextInput;
