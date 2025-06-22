"use client"

import { useParams } from "wouter"
import { useTournamentByName } from "@/services/TournamentService"
import { SingleEliminationFixtureScreen } from "./SingleEliminationFixtureScreen"
import { OrganizerTournamentFixtureScreen } from "./OrganizerTournamentFixtureScreen"

export const TournamentFixtureWrapper = () => {
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
  if (tournament.format === "SINGLE_ELIMINATION") {
    return <SingleEliminationFixtureScreen tournament={tournament} />
  } else {
    return <OrganizerTournamentFixtureScreen tournamentName={tournamentName || ""} />
  }
} 