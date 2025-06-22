"use client"

import { useState, useMemo } from "react"
import { useLocation } from "wouter"
import { Calendar, Users, Target, Eye, Trophy, BarChart3, Gamepad2 } from "lucide-react"
import { useTournamentByName, useUserTournaments } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch, useStandings, useTournamentStatistics, TeamStanding, TournamentStatistics } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"

interface TournamentFixtureScreenProps {
  tournamentName: string
}

type TabType = "matches" | "standings" | "statistics"

export const OrganizerTournamentFixtureScreen = ({ tournamentName }: TournamentFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { data: tournament, isLoading } = useTournamentByName(tournamentName)
  const { data: organizedTournaments = [] } = useUserTournaments()

  const isOrganizer = useMemo(() => {
    if (!tournament || organizedTournaments.length === 0) return false
    return organizedTournaments.some((t) => t.id === tournament.id)
  }, [tournament, organizedTournaments])

  const { generateFixture, isGenerating, getFixture, updateMatchResult, isUpdating } = useFixtureService()

  const { data: fixture = [], error: fixtureError } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
    retry: false, // No reintentar si hay error
  })

  const { data: standings = [] } = useStandings(tournament?.id || 0)
  const { data: statistics } = useTournamentStatistics(tournament?.id || 0)

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("matches")
  const [editingMatch, setEditingMatch] = useState<{ matchId: number; homeScore: string; awayScore: string } | null>(null)

  const handleGenerateFixture = async () => {
    if (!tournament?.id) return

    try {
      setErrorMessage(null)
      await generateFixture(tournament.id)
      setShowGenerateModal(false)
    } catch (error: any) {
      console.error("Error generating fixture:", error)
      
      // Manejar específicamente el error 409 (fixture ya existe)
      if (error.message && error.message.includes("409")) {
        setErrorMessage("El fixture ya existe para este torneo. Puedes verlo usando el botón 'Ver Fixture'.")
      } else {
        setErrorMessage(`Error al generar el fixture: ${error.message}`)
      }
    }
  }

  const handleViewFixture = () => {
    // Navegar a la pantalla del fixture
    setLocation(`/tournament/${encodeURIComponent(tournamentName)}/organizer-fixture`)
  }

  const handleUpdateMatchResult = async (matchId: number, homeScore: number, awayScore: number) => {
    if (!tournament?.id) return

    try {
      await updateMatchResult({ tournamentId: tournament.id, matchId, homeScore, awayScore })
      setEditingMatch(null)
    } catch (error: any) {
      console.error("Error updating match result:", error)
      setErrorMessage(`Error al actualizar el resultado: ${error.message}`)
    }
  }

  const canGenerateFixture = () => {
    return (
      tournament &&
      isOrganizer &&
      fixture.length === 0 &&
      !fixtureError &&
      tournament.registeredTeams >= 2 &&
      (tournament.state === "CLOSE_TO_REGISTER_NOT_STARTED" || tournament.state === "IN_PROGRESS")
    )
  }

  const canViewFixture = () => {
    // Siempre mostrar si es organizador
    return tournament && isOrganizer
  }

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

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--muted-foreground)" }}>Cargando fixture del torneo...</div>
        </div>
      </div>
    )
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
      <header style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "var(--card)", borderRadius: "12px", boxShadow: "0 2px 8px var(--border)", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--foreground)", margin: "0 0 8px 0" }}>
            🏆 {tournament.name}
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
          {canGenerateFixture() && (
            <button onClick={() => setShowGenerateModal(true)} disabled={isGenerating} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isGenerating ? "not-allowed" : "pointer", opacity: isGenerating ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} />
              {isGenerating ? "Generando..." : "Generar Fixture"}
            </button>
          )}
          {canViewFixture() && (
            <button onClick={handleViewFixture} style={{ padding: "10px 16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={16} />
              Fixture
            </button>
          )}
          <button onClick={() => setLocation("/my-tournaments")} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
            Volver a Torneos
          </button>
        </div>
      </header>

      {/* Error Message */}
      {errorMessage && (
        <div style={{ maxWidth: "1200px", margin: "0 auto 24px auto", padding: "16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626" }}>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>Error:</div>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {fixture.length > 0 ? (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "24px", backgroundColor: "var(--border)", borderRadius: "8px", padding: "4px" }}>
              <button
                onClick={() => setActiveTab("matches")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: activeTab === "matches" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeTab === "matches" ? "var(--foreground)" : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Gamepad2 size={16} />
                Partidos
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: activeTab === "standings" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeTab === "standings" ? "var(--foreground)" : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Trophy size={16} />
                Posiciones
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: activeTab === "statistics" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeTab === "statistics" ? "var(--foreground)" : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <BarChart3 size={16} />
                Estadísticas
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "matches" && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Partidos del Torneo</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {fixture.map((match) => (
                    <div key={match.id} style={{ border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", backgroundColor: "var(--background)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Ronda {match.roundNumber} - Partido {match.matchNumber}</span>
                          <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "600", backgroundColor: getMatchStatusColor(match.status) + "20", color: getMatchStatusColor(match.status) }}>
                            {getMatchStatusLabel(match.status)}
                          </span>
                        </div>
                        {match.field && (
                          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>🏟️ {match.field.name}</span>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1, textAlign: "right", paddingRight: "16px" }}>
                          <div style={{ fontWeight: "600", fontSize: "16px" }}>{match.homeTeam.team.name}</div>
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "120px", justifyContent: "center" }}>
                          {editingMatch?.matchId === match.id ? (
                            <>
                              <input
                                type="number"
                                value={editingMatch.homeScore}
                                onChange={(e) => setEditingMatch({ ...editingMatch, homeScore: e.target.value })}
                                style={{ width: "50px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "center" }}
                                min="0"
                              />
                              <span style={{ fontWeight: "600", fontSize: "18px" }}>-</span>
                              <input
                                type="number"
                                value={editingMatch.awayScore}
                                onChange={(e) => setEditingMatch({ ...editingMatch, awayScore: e.target.value })}
                                style={{ width: "50px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "center" }}
                                min="0"
                              />
                              <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                  onClick={() => {
                                    const homeScore = parseInt(editingMatch.homeScore) || 0
                                    const awayScore = parseInt(editingMatch.awayScore) || 0
                                    handleUpdateMatchResult(match.id, homeScore, awayScore)
                                  }}
                                  disabled={isUpdating}
                                  style={{ padding: "4px 8px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingMatch(null)}
                                  style={{ padding: "4px 8px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                >
                                  ✕
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span style={{ fontWeight: "600", fontSize: "18px" }}>
                                {match.homeTeamScore !== null ? match.homeTeamScore : "-"}
                              </span>
                              <span style={{ fontWeight: "600", fontSize: "18px" }}>-</span>
                              <span style={{ fontWeight: "600", fontSize: "18px" }}>
                                {match.awayTeamScore !== null ? match.awayTeamScore : "-"}
                              </span>
                              {isOrganizer && match.status !== "COMPLETED" && (
                                <button
                                  onClick={() => setEditingMatch({ matchId: match.id, homeScore: match.homeTeamScore?.toString() || "0", awayScore: match.awayTeamScore?.toString() || "0" })}
                                  style={{ padding: "4px 8px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                                >
                                  Editar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div style={{ flex: 1, textAlign: "left", paddingLeft: "16px" }}>
                          <div style={{ fontWeight: "600", fontSize: "16px" }}>{match.awayTeam.team.name}</div>
                        </div>
                      </div>
                      
                      {match.scheduledDateTime && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--muted-foreground)", textAlign: "center" }}>
                          📅 {new Date(match.scheduledDateTime).toLocaleString('es-ES')}
                        </div>
                      )}
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
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>Pos</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>Equipo</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>PJ</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>PG</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>PE</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>PP</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>GF</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>GC</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>DG</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr key={team.id.teamId} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--foreground)" }}>{index + 1}</td>
                          <td style={{ padding: "12px", fontWeight: "600", color: "var(--foreground)" }}>{team.team.name}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.wins + team.draws + team.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.wins}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.draws}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.goalsFor}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.goalsAgainst}</td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>{team.goalDifference}</td>
                          <td style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "var(--foreground)" }}>{team.points}</td>
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
                      <div><strong>Formato:</strong> {statistics.format}</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Goles</h3>
                    <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      <div><strong>Total:</strong> {statistics.totalGoals}</div>
                      <div><strong>Promedio por partido:</strong> {statistics.averageGoalsPerMatch?.toFixed(2) || "0"}</div>
                    </div>
                  </div>
                  
                  {statistics.champion && (
                    <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Campeón</h3>
                      <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        <div><strong>🏆 {statistics.champion}</strong></div>
                        {statistics.runnerUp && <div><strong>🥈 {statistics.runnerUp}</strong></div>}
                      </div>
                    </div>
                  )}
                  
                  {statistics.topScoringTeam && (
                    <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Mejor Ataque</h3>
                      <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        <div><strong>{statistics.topScoringTeam}</strong></div>
                        <div>{statistics.topScoringTeamGoals} goles</div>
                      </div>
                    </div>
                  )}
                  
                  {statistics.bestDefensiveTeam && (
                    <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Mejor Defensa</h3>
                      <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        <div><strong>{statistics.bestDefensiveTeam}</strong></div>
                        <div>{statistics.bestDefensiveTeamGoalsAgainst} goles en contra</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "48px", boxShadow: "0 2px 8px var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
              {fixtureError ? "Error al cargar el fixture" : "No hay fixture generado para este torneo"}
            </div>
            {isOrganizer && !fixtureError && (
              <button onClick={() => setShowGenerateModal(true)} style={{ padding: "12px 24px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
                Generar Fixture
              </button>
            )}
          </div>
        )}
      </main>

      {/* Generate Fixture Modal */}
      {showGenerateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Generar Fixture del Torneo</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Se generará automáticamente el fixture completo del torneo con formato{" "}
              <strong>
                {tournament.format === "SINGLE_ELIMINATION" ? "Eliminación Directa" : tournament.format === "ROUND_ROBIN" ? "Todos contra Todos" : "Grupos + Eliminatorias"}
              </strong>{" "}
              para {tournament.registeredTeams} equipos.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleGenerateFixture} disabled={isGenerating} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: isGenerating ? "not-allowed" : "pointer", opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? "Generando..." : "Generar Fixture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
