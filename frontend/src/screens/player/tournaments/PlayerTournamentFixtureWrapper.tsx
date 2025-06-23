"use client"

import { useParams } from "wouter"
import { useTournamentByName } from "@/services/TournamentService"
import { PlayerSingleEliminationFixtureScreen } from "./PlayerSingleEliminationFixtureScreen"
import { PlayerRoundRobinFixtureScreen } from "./PlayerRoundRobinFixtureScreen"
import { PlayerGroupStageAndEliminationFixtureScreen } from "./PlayerGroupStageAndEliminationFixtureScreen"

export const PlayerTournamentFixtureWrapper = () => {
  const { tournamentName } = useParams<{ tournamentName: string }>()
  const { data: tournament, isLoading, error } = useTournamentByName(decodeURIComponent(tournamentName || ""))

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--muted-foreground)" }}>Cargando torneo...</div>
        </div>
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--destructive)" }}>Torneo no encontrado</div>
        </div>
      </div>
    )
  }

  // Route based on tournament format
  switch (tournament.format) {
    case "SINGLE_ELIMINATION":
      return <PlayerSingleEliminationFixtureScreen tournament={tournament} />
    case "GROUP_STAGE_AND_ELIMINATION":
      return <PlayerGroupStageAndEliminationFixtureScreen tournament={tournament} />
    case "ROUND_ROBIN":
      return <PlayerRoundRobinFixtureScreen tournament={tournament} />
    default:
      return <PlayerRoundRobinFixtureScreen tournament={tournament} />
  }
} 