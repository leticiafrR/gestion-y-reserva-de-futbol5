// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";

// @ts-expect-error - Mocked for development
// import { BASE_API_URL } from "@/config/app-query-client";
// @ts-expect-error - Mocked for development
// import { LoginResponseSchema } from "@/models/Login";
import { SignupRequest } from "@/models/Signup";
import { useToken } from "@/services/TokenContext";

export function useSignup() {
  const [, setToken] = useToken();

  return useMutation({
    mutationFn: async (req: SignupRequest) => {
      const tokenData = await signup(req);
      setToken({ state: "LOGGED_IN", ...tokenData });
    },
  });
}

async function signup(data: SignupRequest) {
  // Mock successful signup response
  return {
    accessToken: "dummy-access-token-123",
    refreshToken: "dummy-refresh-token-456"
  };

  /*
  const response = await fetch(BASE_API_URL + "/users", {
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
    throw new Error(`Signup failed with status ${response.status}: ${await response.text()}`);
  }
  */
}
