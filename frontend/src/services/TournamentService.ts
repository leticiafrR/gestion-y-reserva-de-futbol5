// @ts-nocheck - Mocked for development
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client";

export interface TournamentCreateRequest {
  name: string;
  startDate: string;
  format: string;
  maxTeams: number;
  endDate: string;
  description: string;
  prizes: string;
  registrationFee: number;
}

export interface TournamentSummary {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  format: string;
  state: string;
}

export interface Tournament extends TournamentSummary {
  description: string;
  prizes: string;
  registrationFee: number;
  maxTeams: number;
  // Agrega más campos si el backend los devuelve
}

// Crear torneo
export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TournamentCreateRequest) => createTournament(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tournaments"] });
    },
  });
}

async function createTournament(data: TournamentCreateRequest) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `Error al crear torneo: ${response.status}`);
  }
  return response.json();
}

// Listar todos los torneos activos
export function useAllTournaments() {
  return useQuery({
    queryKey: ["all-tournaments"],
    queryFn: getAllTournaments,
  });
}
async function getAllTournaments(): Promise<TournamentSummary[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/all`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener torneos activos");
  return response.json();
}

// Listar torneos abiertos a inscripción
export function useTournamentsOpenToRegistration() {
  return useQuery({
    queryKey: ["tournaments-open"],
    queryFn: getTournamentsOpenToRegistration,
  });
}
async function getTournamentsOpenToRegistration(): Promise<TournamentSummary[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/all/open_to_registration`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener torneos abiertos a inscripción");
  return response.json();
}

// Listar torneos en progreso
export function useTournamentsInProgress() {
  return useQuery({
    queryKey: ["tournaments-in-progress"],
    queryFn: getTournamentsInProgress,
  });
}
async function getTournamentsInProgress(): Promise<TournamentSummary[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/all/in_progress`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener torneos en progreso");
  return response.json();
}

// Listar torneos finalizados
export function useTournamentsFinished() {
  return useQuery({
    queryKey: ["tournaments-finished"],
    queryFn: getTournamentsFinished,
  });
}
async function getTournamentsFinished(): Promise<TournamentSummary[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/all/finished`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener torneos finalizados");
  return response.json();
}

// Buscar torneo por nombre
export function useTournamentByName(name: string) {
  return useQuery({
    queryKey: ["tournament-by-name", name],
    queryFn: () => getTournamentByName(name),
    enabled: !!name,
  });
}
async function getTournamentByName(name: string): Promise<Tournament> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/search/${encodeURIComponent(name)}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Torneo no encontrado");
  return response.json();
}

// Eliminar torneo
export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["all-tournaments"] });
    },
  });
}
async function deleteTournament(id: number) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al eliminar torneo");
  return { success: true };
}

// Actualizar torneo
export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<TournamentCreateRequest> }) => updateTournament(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["all-tournaments"] });
    },
  });
}
async function updateTournament(id: number, updates: Partial<TournamentCreateRequest>) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/${id}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Error al actualizar torneo");
  return response.json();
}

// Cerrar inscripción
export function useCloseTournamentRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => closeTournamentRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["all-tournaments"] });
    },
  });
}
async function closeTournamentRegistration(id: number) {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/${id}/close_registration`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al cerrar inscripción del torneo");
  return response.text();
}

// Obtener torneos del usuario organizador
export function useUserTournaments() {
  return useQuery({
    queryKey: ["user-tournaments"],
    queryFn: getUserTournaments,
  });
}
async function getUserTournaments(): Promise<TournamentSummary[]> {
  const accessToken = getAuthToken();
  const response = await fetch(`${BASE_API_URL}/tournaments/organizer`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error("Error al obtener torneos del usuario");
  return response.json();
}
