"use client"

import { useLocation } from "wouter"
import { Calendar, Users } from "lucide-react"
import { Tournament } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"
import groupBy from "lodash.groupby"

interface PlayerSingleEliminationFixtureScreenProps {
  tournament: Tournament
}

export const PlayerSingleEliminationFixtureScreen = ({ tournament }: PlayerSingleEliminationFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { getFixture } = useFixtureService()

  const { data: fixture = [], error: fixtureError, isLoading: isFixtureLoading } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
    retry: false,
  })

  const matchesByRound = groupBy(fixture, 'roundNumber')

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "#10b981"
      case "IN_PROGRESS": return "#f59e0b"
      case "SCHEDULED": return "#6b7280"
      default: return "#6b7280"
    }
  }

  const getMatchStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED": return "Finalizado"
      case "IN_PROGRESS": return "En Progreso"
      case "SCHEDULED": return "Programado"
      default: return status
    }
  }

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return null
    try {
      const date = new Date(dateTimeString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return null
    }
  }

  if (!tournament) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--destructive)" }}>Torneo no encontrado</div>
          <button onClick={() => setLocation("/my-tournaments")} style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Volver a Torneos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "var(--card)", borderRadius: "12px", boxShadow: "0 2px 8px var(--border)", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--foreground)", margin: "0 0 8px 0" }}>
            🏆 {tournament.name} - Eliminación Simple
          </h1>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ padding: "4px 12px", backgroundColor: tournament.state === "IN_PROGRESS" ? "#dbeafe" : "#f3f4f6", color: tournament.state === "IN_PROGRESS" ? "#2563eb" : "#6b7280", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}>
              {tournament.state === "IN_PROGRESS" ? "En Progreso" : tournament.state === "FINISHED" ? "Finalizado" : tournament.state === "OPEN_TO_REGISTER" ? "Abierto" : "Listo para Iniciar"}
            </span>
            <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
              <Calendar size={16} style={{ display: "inline", marginRight: "4px" }} />
              {tournament.startDate} - {tournament.endDate}
            </span>
            <span style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
              <Users size={16} style={{ display: "inline", marginRight: "4px" }} />
              {tournament.registeredTeams} equipos
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setLocation("/my-tournaments")} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
            Volver a Torneos
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {isFixtureLoading ? (
          <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "48px", boxShadow: "0 2px 8px var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
              Cargando fixture, puede demorar unos segundos...
            </div>
          </div>
        ) : fixture.length > 0 ? (
          <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Partidos del Torneo</h2>
            {Object.entries(matchesByRound).map(([roundNumber, matches]) => (
              <div key={roundNumber} style={{ marginBottom: "32px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--foreground)", borderBottom: "2px solid var(--border)", paddingBottom: "8px" }}>
                  Ronda {roundNumber}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {matches.map((match) => (
                    <div key={match.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", backgroundColor: "var(--background)", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--muted-foreground)" }}>
                            Partido #{match.matchNumber}
                          </span>
                          {match.scheduledDateTime && (
                            <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
                              📅 {formatDateTime(match.scheduledDateTime)}
                            </span>
                          )}
                          {match.field && (
                            <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
                              🏟️ {match.field.name}
                            </span>
                          )}
                        </div>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", backgroundColor: getMatchStatusColor(match.status) + "20", color: getMatchStatusColor(match.status) }}>
                          {getMatchStatusLabel(match.status)}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "transparent", borderRadius: "6px", border: "1px solid var(--border)" }}>
                          <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>
                            {match.homeTeam?.team.name || "Por definir"}
                          </span>
                          <span style={{ fontWeight: "700", fontSize: "20px", color: "var(--foreground)" }}>
                            {match.homeTeamScore !== null ? match.homeTeamScore : "-"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "transparent", borderRadius: "6px", border: "1px solid var(--border)" }}>
                          <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>
                            {match.awayTeam?.team.name || "Por definir"}
                          </span>
                          <span style={{ fontWeight: "700", fontSize: "20px", color: "var(--foreground)" }}>
                            {match.awayTeamScore !== null ? match.awayTeamScore : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "48px", boxShadow: "0 2px 8px var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
              {fixtureError ? "Error al cargar el fixture" : "No hay fixture para este torneo"}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 