// @ts-nocheck - Mocked for development
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Team } from "@/models/Team";

// Mock data storage
let mockTeams: Team[] = [
  {
    id: "1",
    name: "Los Galácticos",
    logo: "https://images.unsplash.com/photo-1589487391730-58f20eb2c308",
    colors: ["#ff0000", "#ffffff"],
    ranking: 1,
    ownerId: "user1",
    members: ["user2", "user3"]
  },
  {
    id: "2",
    name: "Equipo Azul",
    logo: "",
    colors: ["#0000ff", "#ffffff"],
    ranking: 3,
    ownerId: "user2",
    members: ["user1"]
  },
  {
    id: "3",
    name: "Los Tigres",
    logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    colors: ["#ffa500", "#000000"],
    ranking: 2,
    ownerId: "user3",
    members: ["user1", "user4"]
  }
];

export function useUserTeams() {
  return useQuery({
    queryKey: ["userTeams"],
    queryFn: getUserTeams,
  });
}

async function getUserTeams(): Promise<Team[]> {
  // En una implementación real, esto filtraría los equipos donde el usuario actual
  // es el dueño o miembro usando el email del usuario autenticado
  const currentUserId = "user1"; // Obtener del contexto de autenticación
  return mockTeams.filter(team => 
    team.ownerId === currentUserId || team.members.includes(currentUserId)
  );
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

async function createTeam(data: Omit<Team, "id" | "ownerId" | "members">) {
  // Check for duplicate name
  if (mockTeams.some(t => t.name.toLowerCase() === data.name.toLowerCase())) {
    throw new Error("Ya existe un equipo con ese nombre");
  }

  // In a real implementation, we would get the current user's ID
  const currentUserId = "user1";
  
  const newTeam: Team = {
    ...data,
    id: (mockTeams.length + 1).toString(),
    ownerId: currentUserId,
    members: []
  };

  mockTeams = [...mockTeams, newTeam];
  return { success: true };
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

async function deleteTeam(teamId: string) {
  const currentUserId = "user1"; // In real implementation, get from auth context
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error("Equipo no encontrado");
  }

  if (team.ownerId !== currentUserId) {
    throw new Error("Solo el dueño puede eliminar el equipo");
  }

  mockTeams = mockTeams.filter(t => t.id !== teamId);
  return { success: true };
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

type UpdateTeamParams = {
  teamId: string;
  updates: Omit<Team, "id" | "ownerId" | "members">;
};

async function updateTeam({ teamId, updates }: UpdateTeamParams) {
  const currentUserId = "user1"; // In real implementation, get from auth context
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error("Equipo no encontrado");
  }

  if (team.ownerId !== currentUserId) {
    throw new Error("Solo el dueño puede actualizar el equipo");
  }

  // Check for duplicate name if name is being updated
  if (updates.name && mockTeams.some(t => 
    t.id !== teamId && t.name.toLowerCase() === updates.name.toLowerCase()
  )) {
    throw new Error("Ya existe un equipo con ese nombre");
  }

  mockTeams = mockTeams.map(t =>
    t.id === teamId ? { ...t, ...updates, id: teamId, ownerId: t.ownerId, members: t.members } : t
  );
  return { success: true };
}

export function useLeaveMemberTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveMemberTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTeams"] });
    },
  });
}

async function leaveMemberTeam(teamId: string) {
  const currentUserId = "user1"; // En una implementación real, obtener del contexto de autenticación
  const team = mockTeams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error("Equipo no encontrado");
  }

  if (team.ownerId === currentUserId) {
    throw new Error("El dueño no puede abandonar el equipo, debe eliminarlo");
  }

  if (!team.members.includes(currentUserId)) {
    throw new Error("No eres miembro de este equipo");
  }

  mockTeams = mockTeams.map(t =>
    t.id === teamId
      ? { ...t, members: t.members.filter(m => m !== currentUserId) }
      : t
  );

  return { success: true };
}