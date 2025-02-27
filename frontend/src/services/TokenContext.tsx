import React, { Dispatch, useContext, useState } from "react";

type TokenContextData =
  | {
      state: "LOGGED_OUT";
    }
  | {
      state: "LOGGED_IN";
      accessToken: string;
      refreshToken: string | null;
    };

const TokenContext = React.createContext<[TokenContextData, Dispatch<TokenContextData>] | null>(null);

export const TokenProvider = ({ children }: React.PropsWithChildren) => {
  const [state, setState] = useState<TokenContextData>({ state: "LOGGED_OUT" });
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
