import React, { ButtonHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

import styles from "./styles.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variation: "primary" | "outline";
  size: "normal" | "full-width";
};

const Button = (props: Props) => {
  const { children, variation, ...nativeAttributes } = props;

  return (
    <button
      {...nativeAttributes}
      className={classnames(styles.button, {
        [styles.outlineButton]: props.variation === "outline",
        [styles.fullWidth]: props.size === "full-width",
      })}
    >
      {children}
    </button>
  );
};

export default Button;
