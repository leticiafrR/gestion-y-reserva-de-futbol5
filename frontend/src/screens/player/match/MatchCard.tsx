"use client"

import type React from "react"
import ReactDOM from "react-dom"

import { Calendar, Clock, MapPin, Users, User, Crown, Trophy, Settings } from "lucide-react"
import type { Match, Player } from "@/models/Match"
import { useJoinMatch, useLeaveMatch } from "@/services/MatchServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

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
  const queryClient = useQueryClient()

  const userProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userProfile") || '{}') : {};

  const normalizeMail = (mail: string | undefined) => (mail || "").trim().toLowerCase();

  const userEmail = normalizeMail(userProfile.email);
  const userUsername = normalizeMail(userProfile.username);

  const handleJoinMatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await joinMatch.mutateAsync(String(match.id), 1)
      // Toast de éxito
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.top = '20px'
      toast.style.right = '20px'
      toast.style.backgroundColor = '#22c55e'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '2000'
      toast.style.fontSize = '16px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Te uniste al partido'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
    } catch (error) {
      // Toast de error
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.top = '20px'
      toast.style.right = '20px'
      toast.style.backgroundColor = '#ef4444'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '2000'
      toast.style.fontSize = '16px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Error al unirse al partido'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
      console.error("Error joining match:", error)
    }
  }

  const handleLeaveMatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await leaveMatch.mutateAsync(String(match.id), 1)
      // Toast de éxito
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.top = '20px'
      toast.style.right = '20px'
      toast.style.backgroundColor = '#22c55e'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '2000'
      toast.style.fontSize = '16px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Saliste del partido'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
    } catch (error) {
      // Toast de error
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.top = '20px'
      toast.style.right = '20px'
      toast.style.backgroundColor = '#ef4444'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '2000'
      toast.style.fontSize = '16px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Error al salir del partido'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
      console.error("Error leaving match:", error)
    }
  }

  const getStatusColor = () => {
    if (!match.isActive) return "#dc3545"
    if (allPlayers.length >= match.maxPlayers) return "#ffc107"
    return "#28a745"
  }

  const isOpenMatch = !match.teamOne && !match.teamTwo;

  const getStatusText = () => {
    if (!match.isActive) return "Cancelado";
    if (isOpenMatch) {
      if (allPlayers.length >= match.maxPlayers) return "Completo";
      return "Por completar";
    }
  }

  const allPlayers =
    (Array.isArray(match.teamOne?.members) && match.teamOne.members.length > 0) ||
    (Array.isArray(match.teamTwo?.members) && match.teamTwo.members.length > 0)
      ? [
          ...(Array.isArray(match.teamOne?.members) ? match.teamOne.members : []),
          ...(Array.isArray(match.teamTwo?.members) ? match.teamTwo.members : [])
        ]
      : Array.isArray(match.players)
        ? match.players
        : [];

        const isParticipant = allPlayers.some((p: any) => p.username === userProfile.email);
        const isOrganizer = match.booking.user.username === userProfile.email;
        const canAssignTeams = isOrganizer && allPlayers.length >= match.minPlayers;
        const canJoin = match.isActive && allPlayers.length < match.maxPlayers && !isOrganizer;
        const canLeave = !isOrganizer && isParticipant && match.isActive;

  console.log("allPlayers (detallado):", allPlayers);

  console.log("Debug info:", {
    userEmail,
    userUsername,
    organizerUsername: match.booking.user.username,
    organizerEmail: match.booking.user.email,
    isOrganizer,
    isParticipant,
    canJoin,
    canLeave,
    canAssignTeams,
    showJoinButton,
    allPlayersLength: allPlayers.length,
    minPlayers: match.minPlayers,
    maxPlayers: match.maxPlayers,
    isActive: match.isActive,
    hasTeamOne: !!match.teamOne,
    hasTeamTwo: !!match.teamTwo,
    allPlayers: allPlayers.map(p => ({ email: p.email, username: p.username }))
  });

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
        {isOpenMatch && getStatusText()}
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
            backgroundColor: !match.teamOne && !match.teamTwo ? "#e3f2fd" : "#fff3e0",
            color: !match.teamOne && !match.teamTwo ? "#1976d2" : "#f57c00",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {!match.teamOne && !match.teamTwo ? "Partido Abierto" : "Partido Cerrado"}
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
        {match.booking.timeSlot.field.name}
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
            {new Date(match.booking.bookingDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={16} color="#6c757d" />
          <span style={{ fontSize: "14px", color: "#212529" }}>
            {match.booking.bookingHour}:00
          </span>
        </div>
      </div>

      {/* Location */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "16px",
        }}
      >
        <MapPin size={16} color="#6c757d" />
        <span style={{ fontSize: "14px", color: "#212529" }}>
          {match.booking.timeSlot.field.address}
        </span>
      </div>

      {/* Players */}
      {!match.teamOne && !match.teamTwo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
          }}
        >
          <Users size={16} color="#6c757d" />
          <span style={{ fontSize: "14px", color: "#212529" }}>
            {allPlayers.length} / {match.maxPlayers} jugadores
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        {canAssignTeams && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowTeamAssignment(true)
            }}
            style={{
              flex: 1,
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Asignar Equipos
          </button>
        )}
        {!canAssignTeams && canLeave && (
          <button
            onClick={handleLeaveMatch}
            style={{
              flex: 1,
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Salir del Partido
          </button>
        )}
        {!canAssignTeams && !canLeave && canJoin && (
          <button
            onClick={handleJoinMatch}
            style={{
              flex: 1,
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Unirse al Partido
          </button>
        )}
      </div>

      {showTeamAssignment &&
        ReactDOM.createPortal(
          <TeamAssignmentModal
            match={localMatch}
            onClose={() => setShowTeamAssignment(false)}
            onSave={(teams) => {
              const updatedMatch = { ...localMatch, teams }
              setLocalMatch(updatedMatch)
              setShowTeamAssignment(false)
            }}
          />,
          document.body
        )
      }
    </div>
  )
}
