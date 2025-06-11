// @ts-nocheck - Mocked for development
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Team } from "@/models/Team";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";

interface TeamCreateRequest {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

interface TeamUpdateRequest {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function useUserTeams() {
  const [token] = useToken();
  return useQuery({
    queryKey: ["userTeams"],
    queryFn: () => getAllTeams(token),
    enabled: token.state === "LOGGED_IN",
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const [token] = useToken();
  return useMutation({
    mutationFn: (data: TeamCreateRequest) => createTeam(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const [token] = useToken();
  return useMutation({
    mutationFn: ({ teamId, updates }: { teamId: string; updates: TeamUpdateRequest }) => 
      updateTeam({ teamId, updates }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const [token] = useToken();
  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

export function useInviteToTeam() {
  const queryClient = useQueryClient();
  const [token] = useToken();
  return useMutation({
    mutationFn: ({ teamId, inviteeEmail }: { teamId: string; inviteeEmail: string }) =>
      inviteToTeam(teamId, inviteeEmail, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

async function getAllTeams(token: any): Promise<Team[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/teams/my-teams`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token.state === "LOGGED_IN" ? { Authorization: `Bearer ${token.accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener equipos: ${response.status}`);
    }

    const teams = await response.json();
    
    if (!Array.isArray(teams)) {
      throw new Error('La respuesta del servidor no tiene el formato esperado');
    }

    const mappedTeams = teams.map((team: any) => {
      return {
        id: team.id.toString(),
        name: team.name,
        logo: team.logo || "",
        colors: [team.primaryColor, team.secondaryColor],
        ownerId: team.captain,
        members: team.membersUsernames || [],
      };
    });

    return mappedTeams;
  } catch (error) {
    throw error;
  }
}

async function createTeam(data: TeamCreateRequest, token: any): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_API_URL}/teams`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token.state === "LOGGED_IN" ? { Authorization: `Bearer ${token.accessToken}` } : {}),
    },
    body: JSON.stringify({
      name: data.name,
      logo: data.logo,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al crear equipo: ${response.status}`);
  }

  return { success: true };
}

async function updateTeam({ teamId, updates }: { teamId: string; updates: TeamUpdateRequest }, token: any): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_API_URL}/teams/${parseInt(teamId)}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token.state === "LOGGED_IN" ? { Authorization: `Bearer ${token.accessToken}` } : {}),
    },
    body: JSON.stringify({
      name: updates.name,
      logo: updates.logo,
      primaryColor: updates.primaryColor,
      secondaryColor: updates.secondaryColor,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al actualizar equipo: ${response.status}`);
  }

  return { success: true };
}

async function deleteTeam(teamId: string, token: any): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_API_URL}/teams/${teamId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token.state === "LOGGED_IN" ? { Authorization: `Bearer ${token.accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al eliminar equipo: ${response.status}`);
  }

  return { success: true };
}

async function inviteToTeam(teamId: string, inviteeEmail: string, token: any): Promise<{ success: boolean }> {
  const response = await fetch(`${BASE_API_URL}/invitations/teams/${teamId}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token.state === "LOGGED_IN" ? { Authorization: `Bearer ${token.accessToken}` } : {}),
    },
    body: JSON.stringify({ inviteeEmail }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al invitar usuario: ${response.status}`);
  }

  return { success: true };
}


