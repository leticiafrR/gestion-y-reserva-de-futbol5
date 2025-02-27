import { QueryClientProvider } from "@tanstack/react-query";

import reactLogo from "@/assets/react.svg";
import { appQueryClient } from "@/config";
import { SignupScreen } from "@/screens/SignupScreen";
import { TokenProvider, useToken } from "@/services/TokenContext";

import viteLogo from "/vite.svg";

function Content() {
  const [tokenState] = useToken();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <SignupScreen />
      <pre>{JSON.stringify(tokenState, null, 4)}</pre>
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <TokenProvider>
        <Content />
      </TokenProvider>
    </QueryClientProvider>
  );
}
