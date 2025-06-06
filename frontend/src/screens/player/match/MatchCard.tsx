"use client"

import type React from "react"

import { Calendar, Clock, MapPin, Users, User, Crown, Trophy, Settings } from "lucide-react"
import type { Match } from "@/models/Match"
import { useJoinMatch, useLeaveMatch } from "@/services/MatchServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"
import { useState } from "react"

interface MatchCardProps {
  match: Match
  onClick: () => void
  showJoinButton: boolean
  isHistory?: boolean
}

export const MatchCard = ({ match, onClick, showJoinButton, isHistory = false }: MatchCardProps) => {
  const joinMatch = useJoinMatch()
  const leaveMatch = useLeaveMatch()
  const [showTeamAssignment, setShowTeamAssignment] = useState(false)
  const [localMatch, setLocalMatch] = useState(match)

  const handleJoinMatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await joinMatch.mutateAsync(match.id)
    } catch (error) {
      console.error("Error joining match:", error)
    }
  }

  const handleLeaveMatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await leaveMatch.mutateAsync(match.id)
    } catch (error) {
      console.error("Error leaving match:", error)
    }
  }

  const getStatusColor = () => {
    switch (match.status) {
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

  const getStatusText = () => {
    switch (match.status) {
      case "open":
        return "Abierto"
      case "confirmed":
        return "Confirmado"
      case "full":
        return "Completo"
      case "finished":
        return "Finalizado"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  const canJoin = match.status === "open" && match.currentPlayers < match.maxPlayers && !match.isParticipant
  const canLeave = match.status === "open" && match.isParticipant
  const isOrganizer = match.isOrganizer
  const canAssignTeams =
    isOrganizer && match.status === "confirmed" && match.currentPlayers >= match.minPlayers && !match.teams

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: "1px solid #e9ecef",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none"
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
      }}
    >
      {/* Status Badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          backgroundColor: getStatusColor(),
          color: "white",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "10px",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        {getStatusText()}
      </div>

      {/* Match Type */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            backgroundColor: match.type === "open" ? "#e3f2fd" : "#fff3e0",
            color: match.type === "open" ? "#1976d2" : "#f57c00",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {match.type === "open" ? "Partido Abierto" : "Partido Cerrado"}
        </div>
        {isOrganizer && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#f59e0b",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            <Crown size={12} />
            Organizador
          </div>
        )}
        {isHistory && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#6c757d",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            <Trophy size={12} />
            Finalizado
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "16px",
          fontWeight: "600",
          color: "#212529",
          lineHeight: "1.3",
        }}
      >
        {match.title}
      </h3>

      {/* Date and Time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Calendar size={16} color="#6c757d" />
          <span style={{ fontSize: "14px", color: "#212529" }}>
            {new Date(match.date).toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={16} color="#6c757d" />
          <span style={{ fontSize: "14px", color: "#212529" }}>{match.time}</span>
        </div>
      </div>

      {/* Field */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        <MapPin size={16} color="#6c757d" />
        <span style={{ fontSize: "14px", color: "#212529", fontWeight: "500" }}>{match.field.name}</span>
        <span style={{ fontSize: "12px", color: "#6c757d" }}>- {match.field.location}</span>
      </div>

      {/* Players Count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={16} color="#6c757d" />
          <span style={{ fontSize: "14px", color: "#212529" }}>
            {match.currentPlayers}/{match.maxPlayers} jugadores
          </span>
        </div>

        {match.type === "open" && !isHistory && (
          <div
            style={{
              backgroundColor: match.currentPlayers >= match.minPlayers ? "#d4edda" : "#f8d7da",
              color: match.currentPlayers >= match.minPlayers ? "#155724" : "#721c24",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "500",
            }}
          >
            {match.currentPlayers >= match.minPlayers
              ? "Confirmado"
              : `Faltan ${match.minPlayers - match.currentPlayers}`}
          </div>
        )}
      </div>

      {/* Price */}
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#28a745",
          marginBottom: "16px",
        }}
      >
        {match.pricePerPlayer > 0 ? `$${match.pricePerPlayer}/jugador` : "Gratis"}
      </div>

      {/* Result (for history) */}
      {isHistory && match.result && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "8px 12px",
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#6c757d", marginBottom: "2px" }}>Resultado:</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#212529" }}>{match.result}</div>
        </div>
      )}

      {/* Action Buttons */}
      {showJoinButton && !isHistory && (
        <div style={{ display: "flex", gap: "8px" }}>
          {canJoin && (
            <button
              onClick={handleJoinMatch}
              disabled={joinMatch.isPending}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                opacity: joinMatch.isPending ? 0.7 : 1,
              }}
            >
              {joinMatch.isPending ? "Uniéndose..." : "Unirse"}
            </button>
          )}

          {canLeave && (
            <button
              onClick={handleLeaveMatch}
              disabled={leaveMatch.isPending}
              style={{
                flex: 1,
                padding: "10px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                opacity: leaveMatch.isPending ? 0.7 : 1,
              }}
            >
              {leaveMatch.isPending ? "Saliendo..." : "Salir"}
            </button>
          )}
        </div>
      )}

      {!showJoinButton && !isHistory && match.isParticipant && (
        <div style={{ display: "flex", gap: "8px" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px 16px",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            <User size={16} />
            Participando
          </div>

          {canAssignTeams && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTeamAssignment(true)
              }}
              style={{
                padding: "10px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Settings size={16} />
              Asignar Equipos
            </button>
          )}
        </div>
      )}

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
    </div>
  )
}
