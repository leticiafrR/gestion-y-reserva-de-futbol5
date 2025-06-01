// @ts-nocheck - Mocked for development
import { useQuery } from "@tanstack/react-query";
import type { Team } from "@/models/Team";

export function useUserTeams() {
  return useQuery({
    queryKey: ["userTeams"],
    queryFn: getUserTeams,
  });
}

async function getUserTeams(): Promise<Team[]> {
  // Mock data for development
  return [
    {
      id: "1",
      name: "Los Galácticos",
      logo: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308",
      colors: ["#ff0000", "#ffffff"],
      ranking: 1,
    },
    {
      id: "2",
      name: "Equipo Azul",
      logo: "https://images.unsplash.com/photo-1577223625816-7546b00e2664",
      colors: ["#0000ff", "#ffffff"],
      ranking: 3,
    },
    {
      id: "3",
      name: "Los Tigres",
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
      colors: ["#ffa500", "#000000"],
      ranking: 2,
    }
  ];

  /*
  const response = await fetch(BASE_API_URL + "/teams/user", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch teams with status ${response.status}: ${await response.text()}`);
  }
  */
} 