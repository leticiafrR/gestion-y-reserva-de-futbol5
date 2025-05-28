import { useMutation } from "@tanstack/react-query";

import { BASE_API_URL } from "@/config/app-query-client";
import { SignupRequest } from "@/models/Signup";
import { LoginResponseSchema } from "@/models/Login";
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
}
