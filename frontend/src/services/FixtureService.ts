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

  return await response.json()
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
