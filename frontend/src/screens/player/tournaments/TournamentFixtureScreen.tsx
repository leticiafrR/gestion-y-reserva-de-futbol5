"use client"

import { useState, useEffect } from "react"
import { useLocation } from "wouter"
import { X, Trophy, Calendar, Users, Target, ChevronRight, Edit3, Save } from "lucide-react"
import { useTournamentByName } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch, TeamStanding, TournamentStatistics } from "@/services/FixtureService"

interface TournamentFixtureScreenProps {
  tournamentName: string
}

export const TournamentFixtureScreen = ({ tournamentName }: TournamentFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { data: tournament, isLoading } = useTournamentByName(tournamentName)
  const { generateFixture, updateMatchResult, getFixture, getStandings, getTournamentStatistics, isGenerating, isUpdating } = useFixtureService()

  const [fixture, setFixture] = useState<TournamentMatch[]>([])
  const [standings, setStandings] = useState<TeamStanding[]>([])
  const [statistics, setStatistics] = useState<TournamentStatistics | null>(null)
  const [activeTab, setActiveTab] = useState<"fixture" | "standings" | "stats">("fixture")
  const [editingMatch, setEditingMatch] = useState<number | null>(null)
  const [matchResults, setMatchResults] = useState<{ [key: number]: { homeScore: number; awayScore: number } }>({})
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  useEffect(() => {
    if (tournament?.id) {
      loadFixtureData()
    }
  }, [tournament])

  const loadFixtureData = async () => {
    if (!tournament?.id) return

    try {
      const [fixtureData, standingsData, statisticsData] = await Promise.all([
        getFixture(tournament.id),
        getStandings(tournament.id),
        getTournamentStatistics(tournament.id).catch(() => null) // Ignore errors for statistics
      ])
      setFixture(fixtureData)
      setStandings(standingsData)
      setStatistics(statisticsData)
    } catch (error) {
      console.error("Error loading fixture data:", error)
    }
  }

  const handleGenerateFixture = async () => {
    if (!tournament?.id) return

    try {
      await generateFixture(tournament.id, tournament.format)
      await loadFixtureData()
      setShowGenerateModal(false)
    } catch (error) {
      console.error("Error generating fixture:", error)
    }
  }

  const handleSaveResult = async (matchId: number) => {
    const result = matchResults[matchId]
    if (!result || !tournament?.id) return

    try {
      await updateMatchResult(tournament.id, matchId, result.homeScore, result.awayScore)
      await loadFixtureData()
      setEditingMatch(null)
      setMatchResults((prev) => {
        const newResults = { ...prev }
        delete newResults[matchId]
        return newResults
      })
    } catch (error) {
      console.error("Error updating match result:", error)
    }
  }

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return { bg: "#f3f4f6", color: "#6b7280" }
      case "IN_PROGRESS":
        return { bg: "#dbeafe", color: "#2563eb" }
      case "COMPLETED":
        return { bg: "#dcfce7", color: "#16a34a" }
      default:
        return { bg: "#f3f4f6", color: "#6b7280" }
    }
  }

  const getRoundName = (round: number, format: string) => {
    if (format === "ROUND_ROBIN") return "Fecha " + round
    if (format === "SINGLE_ELIMINATION") {
      const totalRounds = Math.ceil(Math.log2(tournament?.maxTeams || 16))
      if (round === totalRounds) return "Final"
      if (round === totalRounds - 1) return "Semifinal"
      if (round === totalRounds - 2) return "Cuartos de Final"
      return `Ronda ${round}`
    }
    return `Ronda ${round}`
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Check if we can generate fixture - either closed registration or in progress without fixture
  const canGenerateFixture = () => {
    return (
      tournament &&
      fixture.length === 0 &&
      tournament.registeredTeams >= 2 &&
      (tournament.state === "CLOSE_TO_REGISTER_NOT_STARTED" || tournament.state === "IN_PROGRESS")
    )
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--muted-foreground)" }}>Cargando fixture del torneo...</div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--destructive)" }}>Torneo no encontrado</div>
          <button
            onClick={() => setLocation("/tournaments")}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Volver a Torneos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          boxShadow: "0 2px 8px var(--border)",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "var(--foreground)",
              margin: "0 0 8px 0",
            }}
          >
            🏆 {tournament.name}
          </h1>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: tournament.state === "IN_PROGRESS" ? "#dbeafe" : "#f3f4f6",
                color: tournament.state === "IN_PROGRESS" ? "#2563eb" : "#6b7280",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {tournament.state === "IN_PROGRESS"
                ? "En Progreso"
                : tournament.state === "FINISHED"
                  ? "Finalizado"
                  : tournament.state === "OPEN_TO_REGISTER"
                    ? "Abierto"
                    : "Listo para Iniciar"}
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
            <button
              onClick={() => setShowGenerateModal(true)}
              disabled={isGenerating}
              style={{
                padding: "10px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Target size={16} />
              {isGenerating ? "Generando..." : "Generar Fixture"}
            </button>
          )}
          <button
            onClick={() => setLocation("/tournaments")}
            style={{
              padding: "10px 16px",
              backgroundColor: "var(--secondary)",
              color: "var(--secondary-foreground)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Volver a Torneos
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 24px auto" }}>
        <div
          style={{ display: "flex", gap: "4px", backgroundColor: "var(--muted)", borderRadius: "8px", padding: "4px" }}
        >
          {["fixture", "standings", "stats"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1,
                padding: "12px 16px",
                backgroundColor: activeTab === tab ? "var(--background)" : "transparent",
                color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab === "fixture" ? "📅 Fixture" : tab === "standings" ? "📊 Posiciones" : "📈 Estadísticas"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {activeTab === "fixture" && (
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px var(--border)",
            }}
          >
            {fixture.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Target size={48} style={{ color: "var(--muted-foreground)", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "var(--foreground)", marginBottom: "8px" }}>
                  Fixture no generado
                </h3>
                <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
                  El fixture del torneo aún no ha sido generado. Con {tournament.registeredTeams} equipos inscritos,
                  puedes generar automáticamente todos los enfrentamientos.
                </p>
                {canGenerateFixture() && (
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    disabled={isGenerating}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      cursor: isGenerating ? "not-allowed" : "pointer",
                      opacity: isGenerating ? 0.7 : 1,
                    }}
                  >
                    {isGenerating ? "Generando Fixture..." : "Generar Fixture"}
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Group fixtures by round */}
                {Object.entries(
                  fixture.reduce((acc: any, match: TournamentMatch) => {
                    const round = match.roundNumber || 1
                    if (!acc[round]) acc[round] = []
                    acc[round].push(match)
                    return acc
                  }, {}),
                ).map(([round, matches]) => (
                  <div key={round} style={{ marginBottom: "32px" }}>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "var(--foreground)",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ChevronRight size={20} />
                      {getRoundName(Number.parseInt(round), tournament.format)}
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {(matches as TournamentMatch[]).map((match: TournamentMatch) => {
                        const statusColor = getMatchStatusColor(match.status)
                        const isEditing = editingMatch === match.id
                        const { date, time } = formatDateTime(match.scheduledDateTime)

                        return (
                          <div
                            key={match.id}
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "16px",
                              backgroundColor: "var(--background)",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  padding: "4px 8px",
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.color,
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {match.status === "SCHEDULED"
                                  ? "Pendiente"
                                  : match.status === "IN_PROGRESS"
                                    ? "En Juego"
                                    : "Finalizado"}
                              </span>
                              {match.status === "SCHEDULED" && tournament.state === "IN_PROGRESS" && (
                                <button
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingMatch(null)
                                      setMatchResults((prev) => {
                                        const newResults = { ...prev }
                                        delete newResults[match.id]
                                        return newResults
                                      })
                                    } else {
                                      setEditingMatch(match.id)
                                      setMatchResults((prev) => ({
                                        ...prev,
                                        [match.id]: { homeScore: 0, awayScore: 0 },
                                      }))
                                    }
                                  }}
                                  style={{
                                    padding: "4px 8px",
                                    backgroundColor: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  {isEditing ? <X size={14} /> : <Edit3 size={14} />}
                                  {isEditing ? "Cancelar" : "Editar"}
                                </button>
                              )}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "16px",
                              }}
                            >
                              <div style={{ flex: 1, textAlign: "center" }}>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "var(--foreground)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {match.homeTeam?.team?.name || "Por definir"}
                                </div>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  minWidth: "80px",
                                  justifyContent: "center",
                                }}
                              >
                                {isEditing ? (
                                  <>
                                    <input
                                      type="number"
                                      min="0"
                                      value={matchResults[match.id]?.homeScore || 0}
                                      onChange={(e) =>
                                        setMatchResults((prev) => ({
                                          ...prev,
                                          [match.id]: {
                                            ...prev[match.id],
                                            homeScore: Number.parseInt(e.target.value) || 0,
                                          },
                                        }))
                                      }
                                      style={{
                                        width: "40px",
                                        padding: "4px",
                                        textAlign: "center",
                                        border: "1px solid var(--border)",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    <span>-</span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={matchResults[match.id]?.awayScore || 0}
                                      onChange={(e) =>
                                        setMatchResults((prev) => ({
                                          ...prev,
                                          [match.id]: {
                                            ...prev[match.id],
                                            awayScore: Number.parseInt(e.target.value) || 0,
                                          },
                                        }))
                                      }
                                      style={{
                                        width: "40px",
                                        padding: "4px",
                                        textAlign: "center",
                                        border: "1px solid var(--border)",
                                        borderRadius: "4px",
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSaveResult(match.id)}
                                      disabled={isUpdating}
                                      style={{
                                        padding: "4px 8px",
                                        backgroundColor: "#10b981",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: isUpdating ? "not-allowed" : "pointer",
                                        opacity: isUpdating ? 0.7 : 1,
                                      }}
                                    >
                                      <Save size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "700",
                                      color:
                                        match.status === "COMPLETED" ? "var(--foreground)" : "var(--muted-foreground)",
                                    }}
                                  >
                                    {match.status === "COMPLETED" 
                                      ? `${match.homeTeamScore} - ${match.awayTeamScore}` 
                                      : "vs"}
                                  </div>
                                )}
                              </div>

                              <div style={{ flex: 1, textAlign: "center" }}>
                                <div
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    color: "var(--foreground)",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {match.awayTeam?.team?.name || "Por definir"}
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: "12px",
                                fontSize: "12px",
                                color: "var(--muted-foreground)",
                                textAlign: "center",
                              }}
                            >
                              📅 {date} - {time}
                              {match.field && ` - ${match.field.name}`}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "standings" && (
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px var(--border)",
            }}
          >
            {standings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Trophy size={48} style={{ color: "var(--muted-foreground)", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "var(--foreground)", marginBottom: "8px" }}>
                  Tabla de posiciones no disponible
                </h3>
                <p style={{ color: "var(--muted-foreground)" }}>
                  La tabla de posiciones se generará una vez que comiencen los partidos del torneo.
                </p>
              </div>
            ) : (
              <div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "var(--foreground)",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Trophy size={20} />
                  Tabla de Posiciones
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "var(--background)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "var(--muted)" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Pos</th>
                        <th style={{ padding: "12px", textAlign: "left", fontWeight: "600" }}>Equipo</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>PJ</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>G</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>E</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>P</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>GF</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>GC</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>DG</th>
                        <th style={{ padding: "12px", textAlign: "center", fontWeight: "600" }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team, index) => (
                        <tr
                          key={team.team.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            backgroundColor: index < 2 ? "#dcfce7" : "transparent",
                          }}
                        >
                          <td style={{ padding: "12px", fontWeight: "600" }}>
                            {index + 1}
                            {index === 0 && <Trophy size={16} style={{ marginLeft: "4px", color: "#fbbf24" }} />}
                          </td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>{team.team.name}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.wins + team.draws + team.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.wins}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.draws}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.losses}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.goalsFor}</td>
                          <td style={{ padding: "12px", textAlign: "center" }}>{team.goalsAgainst}</td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color:
                                team.goalDifference > 0 ? "#16a34a" : team.goalDifference < 0 ? "#dc2626" : "inherit",
                            }}
                          >
                            {team.goalDifference > 0 ? "+" : ""}
                            {team.goalDifference}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              fontWeight: "700",
                              color: "var(--foreground)",
                            }}
                          >
                            {team.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 2px 8px var(--border)",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "var(--foreground)",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📈 Estadísticas del Torneo
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  🏆 Campeón
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.champion || "Por definir"}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  🥈 Subcampeón
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.runnerUp || "Por definir"}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  🥅 Equipo más goleador
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.topScoringTeam 
                    ? `${statistics.topScoringTeam} (${statistics.topScoringTeamGoals} goles)`
                    : "Por definir"}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  🛡️ Equipo menos goleado
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.bestDefensiveTeam 
                    ? `${statistics.bestDefensiveTeam} (${statistics.bestDefensiveTeamGoalsAgainst} goles recibidos)`
                    : "Por definir"}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  ⚽ Total de goles
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.totalGoals || 0} goles
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  📊 Promedio de goles por partido
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.averageGoalsPerMatch 
                    ? `${statistics.averageGoalsPerMatch.toFixed(1)} goles`
                    : "Por definir"}
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  🏟️ Partidos jugados
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.completedMatches || 0} de {statistics?.totalMatches || 0} partidos
                </p>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--background)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)" }}>
                  👥 Equipos participantes
                </h4>
                <p style={{ color: "var(--muted-foreground)" }}>
                  {statistics?.totalTeams || 0} equipos
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Generate Fixture Modal */}
      {showGenerateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Generar Fixture del Torneo</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Se generará automáticamente el fixture completo del torneo con formato{" "}
              <strong>
                {tournament.format === "SINGLE_ELIMINATION"
                  ? "Eliminación Directa"
                  : tournament.format === "ROUND_ROBIN"
                    ? "Todos contra Todos"
                    : "Grupos + Eliminatorias"}
              </strong>{" "}
              para {tournament.registeredTeams} equipos.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowGenerateModal(false)}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "var(--secondary)",
                  color: "var(--secondary-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateFixture}
                disabled={isGenerating}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? "Generando..." : "Generar Fixture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
