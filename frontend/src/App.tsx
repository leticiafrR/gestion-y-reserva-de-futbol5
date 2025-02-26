import { QueryClientProvider, useMutation } from "@tanstack/react-query";

import reactLogo from "@/assets/react.svg";
import { BASE_API_URL, appQueryClient } from "@/config";

import viteLogo from "/vite.svg";

function Content() {
  const { mutate, data } = useMutation({
    mutationFn: async () => {
      const response = await fetch(BASE_API_URL + "/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: "testuser",
          password: "12345678",
        }),
      });

      return await response.json();
    },
  });

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
      <h1>Vite + React</h1>
      <button onClick={() => mutate()}>Create test user</button>
      <pre>{JSON.stringify(data, null, 4)}</pre>
    </>
  );
}

export function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <Content />
    </QueryClientProvider>
  );
}
