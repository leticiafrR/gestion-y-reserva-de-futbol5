import React from "react";
import { Link } from "wouter";

import { useToken } from "@/services/TokenContext";

import styles from "./CommonLayout.module.css";

export const CommonLayout = ({ children }: React.PropsWithChildren) => {
  const [tokenState] = useToken();

  return (
    <div className={styles.mainLayout}>
      <ul className={styles.topBar}>{tokenState.state === "LOGGED_OUT" ? <LoggedOutLinks /> : <LoggedInLinks />}</ul>
      <div className={styles.body}>{children}</div>
    </div>
  );
};

const LoggedOutLinks = () => {
  return (
    <>
      <li>
        <Link href="/login">Log in</Link>
      </li>
      <li>
        <Link href="/signup">Sign Up</Link>
      </li>
    </>
  );
};

const LoggedInLinks = () => {
  const [, setTokenState] = useToken();

  const logOut = () => {
    setTokenState({ state: "LOGGED_OUT" });
  };

  return (
    <>
      <li>
        <Link href="/main">Inicio</Link>
      </li>
      <li>
        <Link href="/create-field">Crear Cancha</Link>
      </li>
      <li>
        <Link href="/search-field">Buscar Cancha</Link>
      </li>
      <li>
        <button onClick={logOut}>Cerrar Sesión</button>
      </li>
    </>
  );
};
