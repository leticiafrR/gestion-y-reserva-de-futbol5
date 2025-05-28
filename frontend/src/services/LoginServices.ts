// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";

// @ts-expect-error - Mocked for development
// import { BASE_API_URL } from "@/config/app-query-client";
// @ts-expect-error - Mocked for development
import { LoginRequest } from "@/models/Login";
import { useToken } from "@/services/TokenContext";

export function useLogin() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await login(req);
      setToken({ state: "LOGGED_IN", ...tokenData });
    },
  });
}

async function login(data: LoginRequest) {
  // Mock successful login response
  return {
    accessToken: "dummy-access-token-123",
    refreshToken: "dummy-refresh-token-456"
  };

  /*
  const response = await fetch(BASE_API_URL + "/sessions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    return LoginResponseSchema.parse(await response.json());
  } else {
    throw new Error(`Login failed with status ${response.status}: ${await response.text()}`);
  }
  */
} 