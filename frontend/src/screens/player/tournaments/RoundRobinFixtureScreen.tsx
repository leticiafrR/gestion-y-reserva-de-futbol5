"use client"

import { useState, useMemo } from "react"
import { useLocation } from "wouter"
import { Calendar, Users, Target, BarChart3, Gamepad2, Trophy } from "lucide-react"
import { useUserTournaments, Tournament } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch, useStandings, useTournamentStatistics, TeamStanding, TournamentStatistics, parseFixtureError } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"
import { ConfirmFinishMatchModal } from "./ConfirmFinishMatchModal"

interface RoundRobinFixtureScreenProps {
  tournament: Tournament
}

type TabType = "matches" | "standings" | "statistics"

export const RoundRobinFixtureScreen = ({ tournament }: RoundRobinFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { data: organizedTournaments = [] } = useUserTournaments()

  const isOrganizer = useMemo(() => {
    if (!tournament || organizedTournaments.length === 0) return false
    return organizedTournaments.some((t) => t.id === tournament.id)
  }, [tournament, organizedTournaments])

  const { generateFixture, isGenerating, getFixture, updateMatchResult, isUpdating } = useFixtureService()

  const { data: fixture = [], error: fixtureError, refetch, isLoading: isFixtureLoading } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
    retry: false,
  })

  const { data: standings = [] } = useStandings(tournament?.id || 0)
  const { data: statistics } = useTournamentStatistics(tournament?.id || 0)

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("matches")
  const [editingMatch, setEditingMatch] = useState<{ matchId: number; homeScore: string; awayScore: string } | null>(null)
  const [confirmingFinishMatch, setConfirmingFinishMatch] = useState<TournamentMatch | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGenerateFixture = async () => {
    if (!tournament?.id || isSubmitting) return

    setIsSubmitting(true)
    setShowGenerateModal(false)

    try {
      setErrorMessage(null)
      await generateFixture(tournament.id)
      refetch()
    } catch (error: any) {
      console.error("Error generating fixture:", error)
      setErrorMessage(parseFixtureError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateMatchResult = async (matchId: number, homeScore: number, awayScore: number) => {
    if (!tournament?.id) return;

    try {
      setErrorMessage(null);
      await updateMatchResult({ tournamentId: tournament.id, matchId, homeScore, awayScore });
      setEditingMatch(null);
      refetch();
      
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = '#22c55e';
      toast.style.color = 'white';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      toast.style.zIndex = '2000';
      toast.style.fontSize = '16px';
      toast.style.fontWeight = '500';
      toast.textContent = 'Resultado actualizado exitosamente.';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);

    } catch (error: any) {
      console.error("Error updating match result:", error);
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.top = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = '#ef4444';
      toast.style.color = 'white';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      toast.style.zIndex = '2000';
      toast.style.fontSize = '16px';
      toast.style.fontWeight = '500';
      if (error.message && error.message.includes("not in progress")) {
        toast.textContent = "Error: El partido debe estar 'En Progreso' para actualizar el resultado.";
      } else {
        toast.textContent = `Error al actualizar el resultado.`;
      }
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    }
  };

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
            🏆 {tournament.name} - Todos contra Todos
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
                    <div key={match.id} style={{ 
                      border: "1px solid var(--border)", 
                      borderRadius: "8px", 
                      padding: "20px", 
                      backgroundColor: "var(--background)",
                      position: "relative"
                    }}>
                      {/* Match Header */}
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        marginBottom: "16px" 
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ 
                            fontSize: "14px", 
                            fontWeight: "600", 
                            color: "var(--muted-foreground)" 
                          }}>
                            Partido #{match.matchNumber}
                          </span>
                          {match.scheduledDateTime && (
                            <span style={{ 
                              fontSize: "14px", 
                              color: "var(--muted-foreground)" 
                            }}>
                              📅 {formatDateTime(match.scheduledDateTime)}
                            </span>
                          )}
                          {match.field && (
                            <span style={{ 
                              fontSize: "14px", 
                              color: "var(--muted-foreground)" 
                            }}>
                              🏟️ {match.field.name}
                            </span>
                          )}
                        </div>
                        <span style={{ 
                          padding: "4px 8px", 
                          borderRadius: "6px", 
                          fontSize: "12px", 
                          fontWeight: "600", 
                          backgroundColor: getMatchStatusColor(match.status) + "20", 
                          color: getMatchStatusColor(match.status) 
                        }}>
                          {getMatchStatusLabel(match.status)}
                        </span>
                      </div>

                      {/* Match Content */}
                      {editingMatch?.matchId === match.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>
                              {match.homeTeam?.team.name || "Por definir"}
                            </span>
                            <input
                              type="number"
                              value={editingMatch.homeScore}
                              onChange={(e) => setEditingMatch({ ...editingMatch, homeScore: e.target.value })}
                              style={{ width: "80px", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", fontSize: '16px' }}
                              min="0"
                            />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--foreground)" }}>
                              {match.awayTeam?.team.name || "Por definir"}
                            </span>
                            <input
                              type="number"
                              value={editingMatch.awayScore}
                              onChange={(e) => setEditingMatch({ ...editingMatch, awayScore: e.target.value })}
                              style={{ width: "80px", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "6px", textAlign: "center", fontSize: '16px' }}
                              min="0"
                            />
                          </div>
                          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                            <button
                              onClick={() => {
                                const homeScore = parseInt(editingMatch.homeScore) || 0
                                const awayScore = parseInt(editingMatch.awayScore) || 0
                                handleUpdateMatchResult(match.id, homeScore, awayScore)
                              }}
                              disabled={isUpdating}
                              style={{ padding: "8px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingMatch(null)}
                              style={{ padding: "8px 16px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "12px 16px",
                            backgroundColor: "transparent",
                            borderRadius: "6px",
                            border: "1px solid var(--border)"
                          }}>
                            <span style={{ 
                              fontWeight: "600", 
                              fontSize: "16px",
                              color: "var(--foreground)"
                            }}>
                              {match.homeTeam?.team.name || "Por definir"}
                            </span>
                            <span style={{ 
                              fontWeight: "700", 
                              fontSize: "20px",
                              color: "var(--foreground)"
                            }}>
                              {match.homeTeamScore !== null ? match.homeTeamScore : "-"}
                            </span>
                          </div>

                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "12px 16px",
                            backgroundColor: "transparent",
                            borderRadius: "6px",
                            border: "1px solid var(--border)"
                          }}>
                            <span style={{ 
                              fontWeight: "600", 
                              fontSize: "16px",
                              color: "var(--foreground)"
                            }}>
                              {match.awayTeam?.team.name || "Por definir"}
                            </span>
                            <span style={{ 
                              fontWeight: "700", 
                              fontSize: "20px",
                              color: "var(--foreground)"
                            }}>
                              {match.awayTeamScore !== null ? match.awayTeamScore : "-"}
                            </span>
                          </div>

                          {/* Edit button for organizer */}
                          {isOrganizer && match.status !== "COMPLETED" && match.homeTeam && match.awayTeam && (
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                              <button
                                onClick={() => setEditingMatch({ 
                                  matchId: match.id, 
                                  homeScore: match.homeTeamScore?.toString() || '0', 
                                  awayScore: match.awayTeamScore?.toString() || '0' 
                                })}
                                style={{ 
                                  padding: "8px 16px", 
                                  backgroundColor: "#3b82f6", 
                                  color: "white", 
                                  border: "none", 
                                  borderRadius: "6px", 
                                  cursor: "pointer", 
                                  fontSize: "14px" 
                                }}
                              >
                                Editar Resultado
                              </button>
                            </div>
                          )}
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
                        <tr key={standing.id.teamId} style={{ 
                          borderBottom: "1px solid var(--border)"
                        }}>
                          <td style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>
                            {index + 1}
                          </td>
                          <td style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: "var(--foreground)" }}>
                            {standing.team.name}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.wins + standing.draws + standing.losses}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.wins}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.draws}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.losses}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.goalsFor}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.goalsAgainst}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--foreground)" }}>
                            {standing.goalDifference}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", fontWeight: "700", color: "var(--foreground)" }}>
                            {standing.points}
                          </td>
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
                      <div><strong>Formato:</strong> Todos contra todos</div>
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
              {isGenerating ? "Generando fixture..." : (fixtureError ? "Error al cargar el fixture" : "No hay fixture generado para este torneo")}
            </div>
            {isOrganizer && !fixtureError && !isGenerating && (
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
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Generar Fixture de Todos contra Todos</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Se generará automáticamente el fixture completo del torneo con formato de{" "}
              <strong>Todos contra Todos</strong> para {tournament.registeredTeams} equipos.
              Cada equipo jugará contra todos los demás equipos.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleGenerateFixture} disabled={isGenerating || isSubmitting} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: (isGenerating || isSubmitting) ? "not-allowed" : "pointer", opacity: (isGenerating || isSubmitting) ? 0.7 : 1 }}>
                {isGenerating || isSubmitting ? "Generando..." : "Generar Fixture"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Match Confirmation Modal */}
      {confirmingFinishMatch && (
        <ConfirmFinishMatchModal
          isConfirming={isUpdating}
          onClose={() => setConfirmingFinishMatch(null)}
          onConfirm={() => {
            setEditingMatch({ 
              matchId: confirmingFinishMatch.id, 
              homeScore: confirmingFinishMatch.homeTeamScore?.toString() || "0", 
              awayScore: confirmingFinishMatch.awayTeamScore?.toString() || "0" 
            });
            setConfirmingFinishMatch(null);
          }}
        />
      )}
    </div>
  )
} 