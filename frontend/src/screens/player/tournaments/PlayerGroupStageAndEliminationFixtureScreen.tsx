"use client"

import { useState } from "react"
import { useLocation } from "wouter"
import { Calendar, Users, BarChart3, Gamepad2, Trophy } from "lucide-react"
import { Tournament } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch, useStandings, useTournamentStatistics } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"

interface PlayerGroupStageAndEliminationFixtureScreenProps {
  tournament: Tournament
}

type TabType = "matches" | "standings" | "statistics"

export const PlayerGroupStageAndEliminationFixtureScreen = ({ tournament }: PlayerGroupStageAndEliminationFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { getFixture } = useFixtureService()

  const { data: fixture = [], error: fixtureError } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
    retry: false,
  })

  const { data: standings = [] } = useStandings(tournament?.id || 0)
  const { data: statistics } = useTournamentStatistics(tournament?.id || 0)
  
  const [activeTab, setActiveTab] = useState<TabType>("matches")

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
            🏆 {tournament.name} - Fase de Grupos y Eliminación
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
        {fixture.length > 0 ? (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "24px", backgroundColor: "var(--border)", borderRadius: "8px", padding: "4px" }}>
              <button onClick={() => setActiveTab("matches")} style={{ flex: 1, padding: "12px 16px", backgroundColor: activeTab === "matches" ? "white" : "transparent", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: activeTab === "matches" ? "var(--foreground)" : "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Gamepad2 size={16} /> Partidos
              </button>
              <button onClick={() => setActiveTab("standings")} style={{ flex: 1, padding: "12px 16px", backgroundColor: activeTab === "standings" ? "white" : "transparent", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: activeTab === "standings" ? "var(--foreground)" : "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Trophy size={16} /> Posiciones
              </button>
              <button onClick={() => setActiveTab("statistics")} style={{ flex: 1, padding: "12px 16px", backgroundColor: activeTab === "statistics" ? "white" : "transparent", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: activeTab === "statistics" ? "var(--foreground)" : "var(--muted-foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <BarChart3 size={16} /> Estadísticas
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "matches" && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Partidos del Torneo</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {fixture.map((match) => (
                    <div key={match.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "20px", backgroundColor: "var(--background)", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--muted-foreground)" }}>
                            Partido #{match.groupName ? `${match.groupName}${match.matchNumber}` : match.matchNumber}
                          </span>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--foreground)", backgroundColor: "var(--background)", padding: "4px 8px", borderRadius: "4px" }}>
                            {match.groupName ? `Fase de Grupos - Grupo ${match.groupName}` : "Fase de Eliminación"}
                          </span>
                          {match.scheduledDateTime && <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>📅 {formatDateTime(match.scheduledDateTime)}</span>}
                          {match.field && <span style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>🏟️ {match.field.name}</span>}
                        </div>
                        <span style={{ padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", backgroundColor: getMatchStatusColor(match.status) + "20", color: getMatchStatusColor(match.status) }}>
                          {getMatchStatusLabel(match.status)}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "transparent", borderRadius: "6px", border: "1px solid var(--border)" }}>
                          <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>{match.homeTeam?.team.name || "Por definir"}</span>
                          <span style={{ fontWeight: "700", fontSize: "20px", color: "var(--foreground)" }}>{match.homeTeamScore !== null ? match.homeTeamScore : "-"}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "transparent", borderRadius: "6px", border: "1px solid var(--border)" }}>
                          <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>{match.awayTeam?.team.name || "Por definir"}</span>
                          <span style={{ fontWeight: "700", fontSize: "20px", color: "var(--foreground)" }}>{match.awayTeamScore !== null ? match.awayTeamScore : "-"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "standings" && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Tabla de Posiciones</h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--background)" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>Pos</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>Equipo</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>PJ</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>PG</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>PE</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>PP</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>GF</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>GC</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>DG</th>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid var(--border)", fontWeight: "600", color: "var(--foreground)" }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((standing, index) => (
                        <tr key={standing.id.teamId} style={{ backgroundColor: index < 2 ? "var(--background)" : "transparent", borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>{index + 1}</td>
                          <td style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>{standing.team.name}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.wins + standing.draws + standing.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.wins}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.draws}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.goalsFor}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.goalsAgainst}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{standing.goalDifference}</td>
                          <td style={{ padding: "12px", textAlign: "center", fontWeight: "700", color: "var(--foreground)" }}>{standing.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "statistics" && statistics && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Estadísticas del Torneo</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Información General</h3>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      <div><strong>Equipos:</strong> {statistics.totalTeams}</div>
                      <div><strong>Partidos:</strong> {statistics.totalMatches}</div>
                      <div><strong>Completados:</strong> {statistics.completedMatches}</div>
                      <div><strong>Formato:</strong> Fase de Grupos + Eliminación</div>
                    </div>
                  </div>
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Goles</h3>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      <div><strong>Total:</strong> {statistics.totalGoals}</div>
                      <div><strong>Promedio por partido:</strong> {statistics.averageGoalsPerMatch?.toFixed(2) || "0"}</div>
                    </div>
                  </div>
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Mejor Ataque</h3>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      <div><strong>Equipo:</strong> {statistics.topScoringTeam || "-"}</div>
                      <div><strong>Goles:</strong> {statistics.topScoringTeamGoals ?? "-"}</div>
                    </div>
                  </div>
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Mejor Defensa</h3>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      <div><strong>Equipo:</strong> {statistics.bestDefensiveTeam || "-"}</div>
                      <div><strong>Goles en contra:</strong> {statistics.bestDefensiveTeamGoalsAgainst ?? "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
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