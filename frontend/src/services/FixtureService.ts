"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client"

export interface MatchResultDTO {
  homeTeamScore: number
  awayTeamScore: number
}

export interface Team {
  id: number
  name: string
}

export interface TeamRegistered {
  id: {
    tournamentId: number
    teamId: number
  }
  team: Team
}

export interface TournamentMatch {
  id: number
  homeTeam: TeamRegistered
  awayTeam: TeamRegistered
  homeTeamScore: number | null
  awayTeamScore: number | null
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED"
  scheduledDateTime: string | null
  roundNumber: number
  matchNumber: number
  groupName?: string
  field: {
    id: number
    name: string
  } | null
}

export interface TeamStanding {
  id: {
    teamId: number
    tournamentId: number
  }
  team: {
    id: number
    name: string
  }
  tournament: {
    id: number
    name: string
  }
  points: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  averageGoalsPerMatch: number | null
}

export interface TournamentStatistics {
  tournamentName: string
  format: string
  state: string
  totalTeams: number
  totalMatches: number
  completedMatches: number
  champion: string | null
  runnerUp: string | null
  topScoringTeam: string | null
  topScoringTeamGoals: number | null
  bestDefensiveTeam: string | null
  bestDefensiveTeamGoalsAgainst: number | null
  totalGoals: number
  averageGoalsPerMatch: number | null
}

export function useFixtureService() {
  const queryClient = useQueryClient()

  // Generate fixture mutation
  const generateFixtureMutation = useMutation({
    mutationFn: (tournamentId: number) => generateFixture(tournamentId),
    onSuccess: (data, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ["fixture", tournamentId] })
      queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] })
      queryClient.invalidateQueries({ queryKey: ["statistics", tournamentId] })
    },
  })

  // Update match result mutation
  const updateMatchResultMutation = useMutation({
    mutationFn: ({ tournamentId, matchId, homeScore, awayScore }: { tournamentId: number, matchId: number, homeScore: number, awayScore: number }) => 
      updateMatchResult(tournamentId, matchId, homeScore, awayScore),
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: ["fixture", tournamentId] })
      queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] })
      queryClient.invalidateQueries({ queryKey: ["statistics", tournamentId] })
    },
  })

  return {
    // Mutations
    generateFixture: generateFixtureMutation.mutateAsync,
    updateMatchResult: updateMatchResultMutation.mutateAsync,
    isGenerating: generateFixtureMutation.isPending,
    isUpdating: updateMatchResultMutation.isPending,
    
    // Direct functions for manual calls
    getFixture,
    getStandings,
    getTournamentStatistics,
  }
}

async function generateFixture(tournamentId: number): Promise<TournamentMatch[]> {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture/generate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Error ${response.status}: ${errorText}`)
    throw new Error(`Error al generar el fixture: ${errorText}`)
  }

  return await response.json()
}

async function updateMatchResult(tournamentId: number, matchId: number, homeScore: number, awayScore: number) {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture/matches/${matchId}/result`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      homeTeamScore: homeScore,
      awayTeamScore: awayScore,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Error ${response.status}: ${errorText}`)
    throw new Error(`Error al actualizar el resultado: ${errorText}`)
  }

  return await response.json()
}

export function useFixture(tournamentId: number) {
  return useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournamentId],
    queryFn: () => getFixture(tournamentId),
    enabled: !!tournamentId && tournamentId > 0,
  })
}

async function getFixture(tournamentId: number): Promise<TournamentMatch[]> {
  const accessToken = getAuthToken()
  console.log("Getting fixture for tournamentId:", tournamentId)
  const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Error ${response.status}: ${errorText}`)
    throw new Error(`Error al obtener el fixture: ${errorText}`)
  }

  const fixtureData = await response.json()
  
  // Log the fixture data for debugging
  console.log("=== FIXTURE DATA RECEIVED ===")
  console.log("Tournament ID:", tournamentId)
  console.log("Response status:", response.status)
  console.log("Fixture data:", fixtureData)
  console.log("Fixture data type:", typeof fixtureData)
  console.log("Is array:", Array.isArray(fixtureData))
  console.log("Number of matches:", Array.isArray(fixtureData) ? fixtureData.length : "Not an array")
  
  if (Array.isArray(fixtureData) && fixtureData.length > 0) {
    console.log("First match structure:", fixtureData[0])
  }
  console.log("=== END FIXTURE DATA ===")
  
  return fixtureData
}

export function useStandings(tournamentId: number) {
  return useQuery<TeamStanding[]>({
    queryKey: ["standings", tournamentId],
    queryFn: () => getStandings(tournamentId),
    enabled: !!tournamentId && tournamentId > 0,
  })
}

async function getStandings(tournamentId: number): Promise<TeamStanding[]> {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/standings`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Error ${response.status}: ${errorText}`)
    throw new Error(`Error al obtener las posiciones: ${errorText}`)
  }

  return await response.json()
}

export function useTournamentStatistics(tournamentId: number) {
  return useQuery<TournamentStatistics>({
    queryKey: ["statistics", tournamentId],
    queryFn: () => getTournamentStatistics(tournamentId),
    enabled: !!tournamentId && tournamentId > 0,
  })
}

async function getTournamentStatistics(tournamentId: number): Promise<TournamentStatistics> {
  const accessToken = getAuthToken()
  const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture/statistics`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Error ${response.status}: ${errorText}`)
    throw new Error(`Error al obtener las estadísticas: ${errorText}`)
  }

  return await response.json()
}

export function parseFixtureError(error: any): string {
  // Extraer el mensaje de error del backend
  let errorMessage = error.message || "Error desconocido al generar el fixture"
  
  // Si el error viene del backend, extraer el mensaje específico
  if (errorMessage.includes("Error al generar el fixture:")) {
    const backendMessage = errorMessage.replace("Error al generar el fixture: ", "")
    
    // Manejar diferentes tipos de errores del backend
    if (backendMessage.includes("409") || backendMessage.includes("CONFLICT")) {
      if (backendMessage.includes("Could not find an available time slot")) {
        return "No se encontraron horarios disponibles para programar los partidos. Verifique que las canchas tengan franjas horarias configuradas entre las 18:00 y 23:00 horas."
      } else if (backendMessage.includes("Fixture already exists")) {
        return "El fixture ya existe para este torneo."
      } else if (backendMessage.includes("No hay suficientes horarios disponibles")) {
        return backendMessage
      } else if (backendMessage.includes("no tienen franjas horarias configuradas")) {
        return backendMessage
      } else if (backendMessage.includes("no tienen franjas horarias que coincidan")) {
        return backendMessage
      } else {
        return "Error de conflicto: " + backendMessage
      }
    } else if (backendMessage.includes("403") || backendMessage.includes("FORBIDDEN")) {
      return "No tiene permisos para generar el fixture de este torneo."
    } else if (backendMessage.includes("404") || backendMessage.includes("NOT_FOUND")) {
      return "Torneo no encontrado."
    } else if (backendMessage.includes("400") || backendMessage.includes("BAD_REQUEST")) {
      return backendMessage
    } else {
      return backendMessage
    }
  } else {
    return errorMessage
  }
}
