"use client"

import { useState } from "react"
import { X, Users, MapPin, Clock, DollarSign, Settings, CheckCircle, UserMinus, UserPlus } from "lucide-react"
import { useJoinMatch, useLeaveMatch, useConfirmMatch } from "@/services/MatchServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"
import type { Match } from "@/models/Match" 

interface MatchDetailsModalProps {
  match: Match
  onClose: () => void
}

export const MatchDetailsModal = ({ match, onClose }: MatchDetailsModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showTeamAssignment, setShowTeamAssignment] = useState(false)
  const [localMatch, setLocalMatch] = useState(match)
  const joinMatch = useJoinMatch()
  const leaveMatch = useLeaveMatch()
  const confirmMatch = useConfirmMatch()

  const isOrganizer = match.organizer.id === "current-user" // Mock check
  const isParticipant = match.players.some((p) => p.id === "current-user") // Mock check
  const canJoin = match.status === "open" && match.currentPlayers < match.maxPlayers && !isParticipant
  const canLeave = isParticipant && match.status !== "finished"
  const canConfirm = isOrganizer && match.status === "open" && match.currentPlayers >= match.minPlayers
  const canAssignTeams = isOrganizer && match.status === "confirmed" && !match.teams

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#28a745"
      case "confirmed":
        return "#007bff"
      case "full":
        return "#ffc107"
      case "finished":
        return "#6c757d"
      case "cancelled":
        return "#dc3545"
      default:
        return "#6c757d"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Abierto para inscripciones"
      case "confirmed":
        return "Partido confirmado"
      case "full":
        return "Partido completo"
      case "finished":
        return "Partido finalizado"
      case "cancelled":
        return "Partido cancelado"
      default:
        return status
    }
  }

  const handleJoinMatch = async () => {
    setIsLoading(true)
    try {
      await joinMatch.mutateAsync(match.id)
      // Update local state
      setLocalMatch({
        ...localMatch,
        currentPlayers: localMatch.currentPlayers + 1,
        players: [
          ...localMatch.players,
          {
            id: "current-user",
            name: "Usuario Actual",
            avatar: "/placeholder.svg?height=32&width=32",
          },
        ],
      })
    } catch (error) {
      console.error("Error joining match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveMatch = async () => {
    setIsLoading(true)
    try {
      await leaveMatch.mutateAsync(match.id)
      // Update local state
      setLocalMatch({
        ...localMatch,
        currentPlayers: localMatch.currentPlayers - 1,
        players: localMatch.players.filter((p) => p.id !== "current-user"),
      })
    } catch (error) {
      console.error("Error leaving match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmMatch = async () => {
    setIsLoading(true)
    try {
      await confirmMatch.mutateAsync(match.id)
      setLocalMatch({
        ...localMatch,
        status: "confirmed",
      })
    } catch (error) {
      console.error("Error confirming match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "700px",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: getStatusColor(localMatch.status),
                    backgroundColor: `${getStatusColor(localMatch.status)}20`,
                    padding: "4px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {getStatusText(localMatch.status)}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    backgroundColor: "#f8f9fa",
                    padding: "4px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {localMatch.type === "open" ? "Partido Abierto" : "Partido Cerrado"}
                </span>
              </div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600", color: "#212529" }}>
                {localMatch.title}
              </h2>
              <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>{getStatusText(localMatch.status)}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                color: "#6c757d",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            {/* Match Info */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Clock size={20} style={{ color: "#6c757d" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>{localMatch.date}</div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>{localMatch.time}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <MapPin size={20} style={{ color: "#6c757d" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>{localMatch.field.name}</div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                      {localMatch.field.location} • {localMatch.field.surface}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Users size={20} style={{ color: "#6c757d" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                      {localMatch.currentPlayers}/{localMatch.maxPlayers} jugadores
                    </div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>Mínimo: {localMatch.minPlayers}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <DollarSign size={20} style={{ color: "#6c757d" }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                      ${localMatch.pricePerPlayer.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>por jugador</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                Organizador
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={localMatch.organizer.avatar || "/placeholder.svg"}
                  alt={localMatch.organizer.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#212529" }}>
                    {localMatch.organizer.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6c757d" }}>Organizador del partido</div>
                </div>
              </div>
            </div>

            {/* Description */}
            {localMatch.description && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                  Descripción
                </h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#495057", lineHeight: "1.5" }}>
                  {localMatch.description}
                </p>
              </div>
            )}

            {/* Players List */}
            {localMatch.players.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                  Jugadores Inscritos ({localMatch.players.length})
                </h3>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}
                >
                  {localMatch.players.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                      }}
                    >
                      <img
                        src={player.avatar || "/placeholder.svg"}
                        alt={player.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: "#212529" }}>{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams */}
            {localMatch.teams && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                  Equipos Formados
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#e3f2fd",
                      borderRadius: "12px",
                      border: "1px solid #bbdefb",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#1976d2" }}>
                      Equipo 1 ({localMatch.teams.team1.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {localMatch.teams.team1.map((player) => (
                        <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img
                            src={player.avatar || "/placeholder.svg"}
                            alt={player.name}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <span style={{ fontSize: "13px", color: "#1976d2" }}>{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#fff3e0",
                      borderRadius: "12px",
                      border: "1px solid #ffcc02",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#f57c00" }}>
                      Equipo 2 ({localMatch.teams.team2.length})
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {localMatch.teams.team2.map((player) => (
                        <div key={player.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img
                            src={player.avatar || "/placeholder.svg"}
                            alt={player.name}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <span style={{ fontSize: "13px", color: "#f57c00" }}>{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: "24px",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Organizer Actions */}
              {isOrganizer && canConfirm && (
                <button
                  onClick={handleConfirmMatch}
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <CheckCircle size={16} />
                  Confirmar Partido
                </button>
              )}

              {isOrganizer && canAssignTeams && (
                <button
                  onClick={() => setShowTeamAssignment(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <Settings size={16} />
                  Asignar Equipos
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {/* Player Actions */}
              {canJoin && (
                <button
                  onClick={handleJoinMatch}
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <UserPlus size={16} />
                  {isLoading ? "Uniéndose..." : "Unirse al Partido"}
                </button>
              )}

              {canLeave && (
                <button
                  onClick={handleLeaveMatch}
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <UserMinus size={16} />
                  {isLoading ? "Saliendo..." : "Salir del Partido"}
                </button>
              )}

              <button
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "transparent",
                  color: "#6c757d",
                  border: "1px solid #dee2e6",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Team Assignment Modal */}
      {showTeamAssignment && (
        <TeamAssignmentModal
          match={localMatch}
          onClose={() => setShowTeamAssignment(false)}
          onSave={(teams) => {
            setLocalMatch({
              ...localMatch,
              teams: teams,
            })
            setShowTeamAssignment(false)
          }}
        />
      )}
    </>
  )
}
