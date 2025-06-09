import React, { Dispatch, useContext, useState, useEffect } from "react";

const TOKEN_KEY = "authToken";

type TokenContextData =
  | {
      state: "LOGGED_OUT";
    }
  | {
      state: "LOGGED_IN";
      accessToken: string;
      refreshToken: string | null;
      email: string;
    };

const TokenContext = React.createContext<[TokenContextData, Dispatch<TokenContextData>] | null>(null);

export const TokenProvider = ({ children }: React.PropsWithChildren) => {
  // Lee el token de localStorage al iniciar
  const [state, setState] = useState<TokenContextData>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? JSON.parse(stored) : { state: "LOGGED_OUT" };
  });

  // Guarda el token en localStorage cuando cambia
  useEffect(() => {
    if (state.state === "LOGGED_IN") {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("loginUserType");
    }
  }, [state]);

  return <TokenContext.Provider value={[state, setState]}>{children}</TokenContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useToken() {
  const context = useContext(TokenContext);
  if (context === null) {
    throw new Error("React tree should be wrapped in TokenProvider");
  }
  return context;
}
