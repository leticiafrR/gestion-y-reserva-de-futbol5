"use client"

import { useState, useMemo } from "react"
import { useLocation } from "wouter"
import { Calendar, Users, Target, BarChart3, Gamepad2 } from "lucide-react"
import { useUserTournaments, Tournament } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch, useTournamentStatistics } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"

interface SingleEliminationFixtureScreenProps {
  tournament: Tournament
}

type TabType = "fixture" | "statistics"

// Extend TournamentMatch to handle null teams for single elimination
interface BracketMatch extends Omit<TournamentMatch, 'homeTeam' | 'awayTeam'> {
  homeTeam: { team: { name: string } } | null
  awayTeam: { team: { name: string } } | null
}

export const SingleEliminationFixtureScreen = ({ tournament }: SingleEliminationFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { data: organizedTournaments = [] } = useUserTournaments()

  const isOrganizer = useMemo(() => {
    if (!tournament || organizedTournaments.length === 0) return false
    return organizedTournaments.some((t) => t.id === tournament.id)
  }, [tournament, organizedTournaments])

  const { generateFixture, isGenerating, getFixture, updateMatchResult, isUpdating } = useFixtureService()

  const { data: fixture = [], error: fixtureError, refetch } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
    retry: false,
  })

  const { data: statistics } = useTournamentStatistics(tournament?.id || 0)

  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("fixture")
  const [editingMatch, setEditingMatch] = useState<{ matchId: number; homeScore: string; awayScore: string } | null>(null)

  // Organizar partidos por rondas
  const matchesByRound = useMemo(() => {
    if (!fixture.length) return []
    
    const rounds = new Map<number, BracketMatch[]>()
    
    fixture.forEach(match => {
      if (!rounds.has(match.roundNumber)) {
        rounds.set(match.roundNumber, [])
      }
      rounds.get(match.roundNumber)!.push(match as unknown as BracketMatch)
    })
    
    return Array.from(rounds.entries())
      .sort(([a], [b]) => a - b)
      .map(([roundNumber, matches]) => ({
        roundNumber,
        matches: matches.sort((a, b) => a.matchNumber - b.matchNumber)
      }))
  }, [fixture])

  const handleGenerateFixture = async () => {
    if (!tournament?.id) return

    try {
      setErrorMessage(null)
      await generateFixture(tournament.id)
      setShowGenerateModal(false)
      refetch() 
    } catch (error: any) {
      console.error("Error generating fixture:", error)
      
      if (error.message && error.message.includes("409")) {
        setErrorMessage("El fixture ya existe para este torneo.")
      } else {
        setErrorMessage(`Error al generar el fixture: ${error.message}`)
      }
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

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (roundNumber === totalRounds) return "🏆 Final"
    if (roundNumber === totalRounds - 1) return "🥈 Semifinal"
    if (roundNumber === totalRounds - 2) return "🥉 Cuartos de Final"
    return `Ronda ${roundNumber}`
  }

  const getWinner = (match: BracketMatch) => {
    if (match.status !== "COMPLETED" || match.homeTeamScore === null || match.awayTeamScore === null) {
      return null
    }
    return match.homeTeamScore > match.awayTeamScore ? match.homeTeam : match.awayTeam
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

  const totalRounds = matchesByRound.length > 0 ? Math.max(...matchesByRound.map(r => r.roundNumber)) : 0

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "var(--card)", borderRadius: "12px", boxShadow: "0 2px 8px var(--border)", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--foreground)", margin: "0 0 8px 0" }}>
            🏆 {tournament.name} - Eliminación Directa
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
        {fixture.length > 0 ? (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "24px", backgroundColor: "var(--border)", borderRadius: "8px", padding: "4px" }}>
              <button
                onClick={() => setActiveTab("fixture")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  backgroundColor: activeTab === "fixture" ? "white" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: activeTab === "fixture" ? "var(--foreground)" : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Gamepad2 size={16} />
                Fixture
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
            {activeTab === "fixture" && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Fixture de Eliminación Directa</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  {matchesByRound.map((round) => (
                    <div key={round.roundNumber} style={{ 
                      border: "1px solid var(--border)", 
                      borderRadius: "12px", 
                      overflow: "hidden" 
                    }}>
                      {/* Round Header */}
                      <div style={{ 
                        padding: "16px 20px", 
                        backgroundColor: round.roundNumber === totalRounds ? "#fef9c3" : "var(--background)",
                        borderBottom: "1px solid var(--border)",
                        borderLeft: round.roundNumber === totalRounds ? "4px solid #fde047" : "none"
                      }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: "18px", 
                          fontWeight: "700",
                          color: round.roundNumber === totalRounds ? "#b45309" : "var(--foreground)"
                        }}>
                          {getRoundName(round.roundNumber, totalRounds)}
                        </h3>
                      </div>

                      {/* Matches */}
                      <div style={{ padding: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {round.matches.map((match) => (
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
                                    <span style={{ fontWeight: "600", fontSize: "16px", color: match.homeTeam ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                      {match.homeTeam ? match.homeTeam.team.name : "Por definir"}
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
                                    <span style={{ fontWeight: "600", fontSize: "16px", color: match.awayTeam ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                      {match.awayTeam ? match.awayTeam.team.name : "Por definir"}
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
                                    backgroundColor: getWinner(match) === match.homeTeam ? "#dcfce7" : "transparent",
                                    borderRadius: "6px",
                                    border: getWinner(match) === match.homeTeam ? "1px solid #22c55e" : "1px solid var(--border)"
                                  }}>
                                    <span style={{ 
                                      fontWeight: "600", 
                                      fontSize: "16px",
                                      color: match.homeTeam ? "var(--foreground)" : "var(--muted-foreground)"
                                    }}>
                                      {match.homeTeam ? match.homeTeam.team.name : "Por definir"}
                                    </span>
                                    <span style={{ 
                                      fontWeight: "700", 
                                      fontSize: "20px",
                                      color: getWinner(match) === match.homeTeam ? "#22c55e" : "var(--foreground)"
                                    }}>
                                      {match.homeTeamScore !== null ? match.homeTeamScore : "-"}
                                    </span>
                                  </div>

                                  <div style={{ 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    backgroundColor: getWinner(match) === match.awayTeam ? "#dcfce7" : "transparent",
                                    borderRadius: "6px",
                                    border: getWinner(match) === match.awayTeam ? "1px solid #22c55e" : "1px solid var(--border)"
                                  }}>
                                    <span style={{ 
                                      fontWeight: "600", 
                                      fontSize: "16px",
                                      color: match.awayTeam ? "var(--foreground)" : "var(--muted-foreground)"
                                    }}>
                                      {match.awayTeam ? match.awayTeam.team.name : "Por definir"}
                                    </span>
                                    <span style={{ 
                                      fontWeight: "700", 
                                      fontSize: "20px",
                                      color: getWinner(match) === match.awayTeam ? "#22c55e" : "var(--foreground)"
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "statistics" && statistics && (
              <>
                {/* Podium Section */}
                <div style={{
                  display: "flex",
                  gap: "24px",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "24px",
                  marginBottom: "24px",
                  borderRadius: "12px",
                  background: statistics.champion ? "linear-gradient(135deg, #fef9c3, #fef08a)" : "var(--card)",
                  border: statistics.champion ? "1px solid #fde047" : "1px solid var(--border)",
                  transition: "background 0.3s ease, border-color 0.3s ease"
                }}>
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "1.5rem", fontWeight: 700, color: statistics.champion ? "#b45309" : "var(--muted-foreground)" }}>🏆 Campeón</h3>
                    <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: statistics.champion ? "#78350f" : "var(--foreground)" }}>{statistics.champion || "-"}</p>
                  </div>
                  <div style={{ borderLeft: "2px solid", paddingLeft: "24px", borderLeftColor: statistics.champion ? '#fcd34d' : 'var(--border)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: "8px", fontSize: "1.5rem", fontWeight: 700, color: statistics.champion ? "#71717a" : "var(--muted-foreground)" }}>🥈 Subcampeón</h3>
                    <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: statistics.champion ? "#52525b" : "var(--foreground)" }}>{statistics.runnerUp || "-"}</p>
                  </div>
                </div>

                <div style={{ backgroundColor: "var(--card)", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px var(--border)" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--foreground)" }}>Estadísticas del Torneo</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                    <div style={{ padding: "16px", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--foreground)" }}>Información General</h3>
                      <div style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        <div><strong>Equipos:</strong> {statistics.totalTeams}</div>
                        <div><strong>Partidos:</strong> {statistics.totalMatches}</div>
                        <div><strong>Completados:</strong> {statistics.completedMatches}</div>
                        <div><strong>Formato:</strong> Eliminación Directa</div>
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
              </>
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
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Generar Fixture de Eliminación Directa</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Se generará automáticamente el fixture completo del torneo con formato de{" "}
              <strong>Eliminación Directa</strong> para {tournament.registeredTeams} equipos.
              Los equipos avanzarán automáticamente según los resultados de los partidos.
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