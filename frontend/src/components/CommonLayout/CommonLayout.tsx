import React from "react";
import { Link } from "wouter";

import { useToken } from "@/services/TokenContext";

import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState, setTokenState] = useToken();

  const logOut = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  switch (tokenState.state) {
    case "LOGGED_OUT":
      return (
        <div className={styles.mainLayout}>
          <ul className={styles.topBar}>
            <li>Log in</li>
            <li>
              <Link href="/sign-up">Sign Up</Link>
            </li>
          </ul>
          {children}
        </div>
      );
    case "LOGGED_IN":
      return (
        <div className={styles.mainLayout}>
          <ul className={styles.topBar}>
            <li>
              <Link href="/under-construction">Main Page</Link>
            </li>
            <li>Projects</li>
            <li>Tasks</li>
            <li>
              <button onClick={logOut}>Log out</button>
            </li>
          </ul>
          {children}
        </div>
      );
    default:
      return tokenState satisfies never;
  }
};
