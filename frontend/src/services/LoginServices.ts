// @ts-nocheck - Mocked for development
import { useMutation } from "@tanstack/react-query";
import { LoginRequest, LoginResponse, LoginResponseSchema } from "@/models/Login";
import { useToken } from "@/services/TokenContext";
import { BASE_API_URL } from "@/config/app-query-client";
import { useLocation } from "wouter";

export function useLogin() {
  const [, setToken] = useToken();
  const [, setLocation] = useLocation();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (req: LoginRequest) => {
      const tokenData = await login(req);

      // Fetch user profile to get the role
      const profileResponse = await fetch(`${BASE_API_URL}/users/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
      }

      const profileData = await profileResponse.json();
      
      // Store the role in localStorage - using the role directly from backend
      localStorage.setItem("loginUserType", profileData.role);
      window.dispatchEvent(new Event("userTypeChanged"));

      setToken({ state: "LOGGED_IN", ...tokenData, email: req.email });

      // Check for pending invitation token
      const pendingInvitationToken = localStorage.getItem("pendingInvitationToken");
      if (pendingInvitationToken) {
        localStorage.removeItem("pendingInvitationToken"); // Clean up
        setLocation(`/invitation-team?token=${pendingInvitationToken}`);
      }
      
      return tokenData;
    },
  });
}

async function login(req: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${BASE_API_URL}/sessions`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: req.email,
      password: req.password
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al iniciar sesión: ${response.status}`);
  }

  const data = await response.json();
  return LoginResponseSchema.parse(data);
} 