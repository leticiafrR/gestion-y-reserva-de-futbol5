"use client"

import { useState } from "react"
import { BASE_API_URL, getAuthToken } from "@/config/app-query-client"

export interface MatchResultDTO {
  homeTeamScore: number
  awayTeamScore: number
}

export interface TournamentMatch {
  id: number
  roundNumber: number
  matchNumber: number
  homeTeam: {
    id: number
    team: {
      id: number
      name: string
    }
  }
  awayTeam: {
    id: number
    team: {
      id: number
      name: string
    }
  }
  homeTeamScore: number | null
  awayTeamScore: number | null
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED"
  scheduledDateTime: string
  field: {
    id: number
    name: string
  } | null
  tournament: {
    id: number
    name: string
  }
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

export const useFixtureService = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const generateFixture = async (tournamentId: number, format: string) => {
    setIsGenerating(true)

    try {
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
        throw new Error("Error al generar el fixture")
      }

      return await response.json()
    } catch (error) {
      console.error("Error generating fixture:", error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const updateMatchResult = async (tournamentId: number, matchId: number, homeScore: number, awayScore: number) => {
    setIsUpdating(true)

    try {
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
        throw new Error("Error al actualizar el resultado")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating match result:", error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const getFixture = async (tournamentId: number): Promise<TournamentMatch[]> => {
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener el fixture")
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting fixture:", error)
      return []
    }
  }

  const getStandings = async (tournamentId: number): Promise<TeamStanding[]> => {
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/standings`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener las posiciones")
      }

      const standings: TeamStanding[] = await response.json()
      return standings
    } catch (error) {
      console.error("Error getting standings:", error)
      return []
    }
  }

  const getTournamentStatistics = async (tournamentId: number): Promise<TournamentStatistics> => {
    try {
      const accessToken = getAuthToken()
      const response = await fetch(`${BASE_API_URL}/tournaments/${tournamentId}/fixture/statistics`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener las estadísticas")
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting tournament statistics:", error)
      throw error
    }
  }

  return {
    generateFixture,
    updateMatchResult,
    getFixture,
    getStandings,
    getTournamentStatistics,
    isGenerating,
    isUpdating,
  }
}
