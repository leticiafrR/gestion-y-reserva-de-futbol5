"use client"

import type React from "react"
import ReactDOM from "react-dom"
import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { Calendar, Clock, MapPin, Users, User, Crown, Trophy, Settings } from "lucide-react"
import type { Match, Player } from "@/models/Match"
import { useJoinMatch, useLeaveMatch } from "@/services/MatchServices"
import { useUserProfile } from "@/services/UserServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"

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
  const { data: userProfile } = useUserProfile()

  // Sincronizar localMatch con el prop match cuando cambie
  useEffect(() => {
    setLocalMatch(match)
  }, [match])

  const normalizeMail = (mail: string | undefined) => (mail || "").trim().toLowerCase();

  const userEmail = normalizeMail(userProfile?.email);
  const userUsername = normalizeMail(userProfile?.username);

  const handleJoinMatch = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userProfile) return;
    try {
      await joinMatch.mutateAsync(String(localMatch.id))
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
    if (!userProfile) return;
    try {
      await leaveMatch.mutateAsync({ matchId: String(localMatch.id) })
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
    if (!localMatch.isActive) return "#dc3545"
    if (allPlayers.length >= localMatch.maxPlayers) return "#ffc107"
    return "#28a745"
  }

  const hasAssignedTeams = (localMatch.teamOne?.members && localMatch.teamOne.members.length > 0) || 
                          (localMatch.teamTwo?.members && localMatch.teamTwo.members.length > 0);
  const isOpenMatch = localMatch.matchType === "open" && !hasAssignedTeams;
  const isConfirmedMatch = hasAssignedTeams;

  const getStatusText = () => {
    if (!localMatch.isActive) return "Cancelado";
    if (isConfirmedMatch) return "Confirmado";
    if (isOpenMatch) {
      if (allPlayers.length >= localMatch.maxPlayers) return "Completo";
      return "Por completar";
    }
    return "Confirmado"; // Para partidos cerrados
  }

  const allPlayers =
    (Array.isArray(localMatch.teamOne?.members) && localMatch.teamOne.members.length > 0) ||
    (Array.isArray(localMatch.teamTwo?.members) && localMatch.teamTwo.members.length > 0)
      ? [
          ...(Array.isArray(localMatch.teamOne?.members) ? localMatch.teamOne.members : []),
          ...(Array.isArray(localMatch.teamTwo?.members) ? localMatch.teamTwo.members : [])
        ]
      : Array.isArray(localMatch.players)
        ? localMatch.players
        : [];

  const isParticipant = userProfile ? allPlayers.some((p: any) => p.id === userProfile.id) : false;
  const isOrganizer = userProfile ? localMatch.booking.user.id === userProfile.id : false;
  const canAssignTeams = isOrganizer && allPlayers.length >= localMatch.minPlayers && isOpenMatch;
  const canJoin = localMatch.isActive && allPlayers.length < localMatch.maxPlayers && !isOrganizer && isOpenMatch;
  const canLeave = !isOrganizer && isParticipant && localMatch.isActive && isOpenMatch;

  const handleMatchUpdate = (updatedMatch: Match) => {
    setLocalMatch(updatedMatch)
    // Invalidar las queries para refrescar los datos
    queryClient.invalidateQueries({ queryKey: ["availableMatches"] })
    queryClient.invalidateQueries({ queryKey: ["userMatches"] })
    // Toast de confirmación
    const toast = document.createElement('div')
    toast.style.position = 'fixed'
    toast.style.top = '20px'
    toast.style.right = '20px'
    toast.style.backgroundColor = '#28a745'
    toast.style.color = 'white'
    toast.style.padding = '12px 24px'
    toast.style.borderRadius = '8px'
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
    toast.style.zIndex = '2000'
    toast.style.fontSize = '16px'
    toast.style.fontWeight = '500'
    toast.textContent = '✅ Equipos asignados exitosamente'
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transition = 'opacity 0.3s ease-out'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

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
            backgroundColor: isOpenMatch ? "#e3f2fd" : isConfirmedMatch ? "#d4edda" : "#fff3e0",
            color: isOpenMatch ? "#1976d2" : isConfirmedMatch ? "#155724" : "#f57c00",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {isOpenMatch ? "Partido Abierto" : isConfirmedMatch ? "Confirmado" : "Partido Cerrado"}
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
        {localMatch.booking.timeSlot.field.name}
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
            {new Date(localMatch.booking.bookingDate).toLocaleDateString("es-ES", {
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
            {localMatch.booking.bookingHour}:00
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
          {localMatch.booking.timeSlot.field.address}
        </span>
      </div>

      {/* Players */}
      {isOpenMatch && (
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
            {allPlayers.length} / {localMatch.maxPlayers} jugadores
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
              handleMatchUpdate(updatedMatch)
            }}
            onMatchUpdate={handleMatchUpdate}
          />,
          document.body
        )
      }
    </div>
  )
}
