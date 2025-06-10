// @ts-nocheck - Mocked for development
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/models/User";
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}

async function getProfile(): Promise<User> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/users/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile with status ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  
  // Map the backend DTO to our frontend User type
  const user = {
    id: data.id || "1", // Backend doesn't return id, but we need it for frontend
    name: data.name,
    lastName: data.last_name,
    email: data.email,
    photo: data.profile_picture, // Default photo if none provided
    age: parseInt(data.age),
    gender: data.gender,
    userType: data.role
  };
  
  return user;
}