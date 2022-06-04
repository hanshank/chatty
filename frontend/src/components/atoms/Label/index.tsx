import classnames from "classnames";
import React from "react";

import styles from "./styles.module.css";

type Props = React.LabelHTMLAttributes<HTMLLabelElement> & {
  text: string;
  children: React.ReactNode;
  variation: "light" | "dark";
};

const index = (props: Props) => {
  const { children, text, variation = "light", ...restOfProps } = props;

  return (
    <label {...restOfProps} className={styles.label}>
      <span
        className={classnames(styles.labelText, {
          [styles.lightText]: variation === "light",
          [styles.darkText]: variation === "dark",
        })}
      >
        {text}
      </span>
      {props.children}
    </label>
  );
};

export default index;
