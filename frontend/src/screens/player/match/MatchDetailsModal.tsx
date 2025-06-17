"use client"

import { useState } from "react"
import { X, Users, MapPin, Clock, DollarSign, Settings, CheckCircle, UserMinus, UserPlus } from "lucide-react"
import { useJoinMatch, useLeaveMatch, useConfirmMatch } from "@/services/MatchServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"
import type { Match } from "@/models/Match" 
import { useQueryClient } from "@tanstack/react-query"

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
  const queryClient = useQueryClient()

  const userProfile = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userProfile") || '{}') : {};

  const basePlayers =
    (Array.isArray(match.teamOne?.members) && match.teamOne.members.length > 0) ||
    (Array.isArray(match.teamTwo?.members) && match.teamTwo.members.length > 0)
      ? [
          ...(Array.isArray(match.teamOne?.members) ? match.teamOne.members : []),
          ...(Array.isArray(match.teamTwo?.members) ? match.teamTwo.members : [])
        ]
      : Array.isArray(match.players)
        ? match.players
        : [];

  const allPlayers = basePlayers;

  const normalize = (str: string | undefined) => (str || "").trim().toLowerCase();

  const isParticipant = allPlayers.some((p: any) => p.username === userProfile.email);
  const isOrganizer = match.booking.user.username === userProfile.email;
  const canAssignTeams = isOrganizer && allPlayers.length >= match.minPlayers;
  const canJoin = match.isActive && allPlayers.length < match.maxPlayers && !isOrganizer;
  const canLeave = !isOrganizer && isParticipant && match.isActive;

  const getStatusColor = () => {
    if (!match.isActive) return "#dc3545"
    if (Array.isArray(match.players) && match.players.length >= match.maxPlayers) return "#ffc107"
    return "#28a745"
  }

  const getStatusText = () => {
    if (!match.isActive) return "Partido cancelado"
    if (Array.isArray(match.players) && match.players.length >= match.maxPlayers) return "Partido completo"
    return "Abierto para inscripciones"
  }

  const handleJoinMatch = async () => {
    setIsLoading(true)
    try {
      await joinMatch.mutateAsync(String(match.id), 1)
      // Update local state
      setLocalMatch({
        ...localMatch,
        players: [
          ...(Array.isArray(localMatch.players) ? localMatch.players : []),
          match.booking.user
        ],
      })
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
    } catch (error) {
      console.error("Error joining match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveMatch = async () => {
    setIsLoading(true)
    try {
      await leaveMatch.mutateAsync(String(match.id), 1)
      // Update local state
      setLocalMatch({
        ...localMatch,
        players: Array.isArray(localMatch.players) ? localMatch.players.filter((p) => p.id !== match.booking.user.id) : [],
      })
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
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
      onClose();
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmMatch = async () => {
    setIsLoading(true)
    try {
      await confirmMatch.mutateAsync(String(match.id))
      setLocalMatch({
        ...localMatch,
        isActive: true,
      })
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
    } catch (error) {
      console.error("Error confirming match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  console.log({
    userProfile,
    organizerUsername: match.booking.user.username,
    isOrganizer,
    isParticipant,
    canAssignTeams,
    canJoin,
    allPlayers
  });

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
                    color: getStatusColor(),
                    backgroundColor: `${getStatusColor()}20`,
                    padding: "4px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {getStatusText()}
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
                  {!match.teamOne && !match.teamTwo ? "Partido Abierto" : "Partido Cerrado"}
                </span>
              </div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600", color: "#212529" }}>
                {match.booking.timeSlot.field.name}
              </h2>
              <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>{getStatusText()}</p>
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
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px", overflowY: "auto" }}>
            {/* Date and Time */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                Fecha y Hora
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={20} color="#6c757d" />
                  <span style={{ fontSize: "14px", color: "#212529" }}>
                    {new Date(match.booking.bookingDate).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={20} color="#6c757d" />
                  <span style={{ fontSize: "14px", color: "#212529" }}>
                    {match.booking.bookingHour}:00
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                Ubicación
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MapPin size={20} color="#6c757d" />
                <span style={{ fontSize: "14px", color: "#212529" }}>
                  {match.booking.timeSlot.field.address}
                </span>
              </div>
            </div>

            {/* Players/Teams */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                {!match.teamOne && !match.teamTwo ? "Jugadores" : "Equipos"}
              </h3>
              
              {!match.teamOne && !match.teamTwo ? (
                // Open match - show players list
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Users size={20} color="#6c757d" />
                    <span style={{ fontSize: "14px", color: "#212529" }}>
                      {allPlayers.length} / {match.maxPlayers} jugadores
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {allPlayers.map((player) => (
                      <div
                        key={player.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <img
                          src={player.profilePicture}
                          alt={player.name}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#212529" }}>
                          {player.name} {player.last_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Closed match - show teams
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Team 1 */}
                  <div>
                    <h4 style={{ 
                      margin: "0 0 12px 0", 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: "#1976d2",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#1976d2",
                        borderRadius: "50%"
                      }}></div>
                      Equipo 1 ({Array.isArray(match.teamOne?.members) ? match.teamOne.members.length : 0} jugadores)
                    </h4>
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#e3f2fd", 
                      borderRadius: "8px",
                      border: "1px solid #bbdefb"
                    }}>
                      {Array.isArray(match.teamOne?.members) ? (
                        match.teamOne.members.map((player: any) => (
                          <div
                            key={player.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 0",
                            }}
                          >
                            <img
                              src={player.profilePicture}
                              alt={player.name}
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <span style={{ fontSize: "13px", color: "#212529" }}>
                              {player.name} {player.last_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "13px", color: "#6c757d" }}>Sin jugadores asignados</span>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div>
                    <h4 style={{ 
                      margin: "0 0 12px 0", 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: "#f57c00",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#f57c00",
                        borderRadius: "50%"
                      }}></div>
                      Equipo 2 ({Array.isArray(match.teamTwo?.members) ? match.teamTwo.members.length : 0} jugadores)
                    </h4>
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#fff3e0", 
                      borderRadius: "8px",
                      border: "1px solid #ffcc02"
                    }}>
                      {Array.isArray(match.teamTwo?.members) ? (
                        match.teamTwo.members.map((player: any) => (
                          <div
                            key={player.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 0",
                            }}
                          >
                            <img
                              src={player.profilePicture}
                              alt={player.name}
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <span style={{ fontSize: "13px", color: "#212529" }}>
                              {player.name} {player.last_name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "13px", color: "#6c757d" }}>Sin jugadores asignados</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              {canAssignTeams && (
                <button
                  onClick={() => setShowTeamAssignment(true)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Settings size={16} />
                  Asignar Equipos
                </button>
              )}
              {!canAssignTeams && canLeave && (
                <button
                  onClick={handleLeaveMatch}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <UserMinus size={16} />
                  Salir del Partido
                </button>
              )}
              {!canAssignTeams && !canLeave && canJoin && (
                <button
                  onClick={handleJoinMatch}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <UserPlus size={16} />
                  Unirse al Partido
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTeamAssignment && (
        <TeamAssignmentModal
          match={localMatch}
          onClose={() => setShowTeamAssignment(false)}
          onSave={(teams) => {
            const updatedMatch = { ...localMatch, teams }
            setLocalMatch(updatedMatch)
            setShowTeamAssignment(false)
          }}
        />
      )}
    </>
  )
}
