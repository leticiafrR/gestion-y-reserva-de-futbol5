"use client"

import { useState, useEffect } from "react"
import { X, Users, MapPin, Clock, DollarSign, Settings, CheckCircle, UserMinus, UserPlus } from "lucide-react"
import { useJoinMatch, useLeaveMatch, useConfirmMatch } from "@/services/MatchServices"
import { TeamAssignmentModal } from "@/screens/player/match/TeamAssignmentModal"
import type { Match } from "@/models/Match" 
import { useQueryClient } from "@tanstack/react-query"
import { useUserProfile } from "@/services/UserServices"

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
  const { data: userProfile } = useUserProfile()

  // Sincronizar localMatch con el prop match cuando cambie
  useEffect(() => {
    setLocalMatch(match)
  }, [match])

  const basePlayers =
    (Array.isArray(localMatch.teamOne?.members) && localMatch.teamOne.members.length > 0) ||
    (Array.isArray(localMatch.teamTwo?.members) && localMatch.teamTwo.members.length > 0)
      ? [
          ...(Array.isArray(localMatch.teamOne?.members) ? localMatch.teamOne.members : []),
          ...(Array.isArray(localMatch.teamTwo?.members) ? localMatch.teamTwo.members : [])
        ]
      : Array.isArray(localMatch.players)
        ? localMatch.players
        : [];

  const allPlayers = basePlayers;

  const normalize = (str: string | undefined) => (str || "").trim().toLowerCase();

  const userIsParticipant = userProfile ? basePlayers.some((p) => p.username === userProfile.email) : false;
  const isOrganizer = userProfile ? localMatch.booking.user.username === userProfile.email : false;
  // Un partido abierto con equipos asignados se considera confirmado
  const hasAssignedTeams = (localMatch.teamOne?.members && localMatch.teamOne.members.length > 0) || 
                          (localMatch.teamTwo?.members && localMatch.teamTwo.members.length > 0);
  const isOpenMatch = localMatch.matchType === "open" && !hasAssignedTeams;
  const isConfirmedMatch = hasAssignedTeams;
  const canAssignTeams = isOrganizer && allPlayers.length >= localMatch.minPlayers && isOpenMatch;
  const canJoin = localMatch.isActive && allPlayers.length < localMatch.maxPlayers && !isOrganizer && isOpenMatch;
  const canLeave = !isOrganizer && userIsParticipant && localMatch.isActive && isOpenMatch;

  const getStatusColor = () => {
    if (!localMatch.isActive) return "#dc3545"
    if (Array.isArray(localMatch.players) && localMatch.players.length >= localMatch.maxPlayers) return "#ffc107"
    return "#28a745"
  }

  const getStatusText = () => {
    if (!localMatch.isActive) return "Partido cancelado"
    if (isConfirmedMatch) return "Partido confirmado"
    if (isOpenMatch) {
      if (Array.isArray(localMatch.players) && localMatch.players.length >= localMatch.maxPlayers) return "Partido completo"
      return "Abierto para inscripciones"
    }
    return "Partido confirmado" // Para partidos cerrados
  }

  const handleJoinMatch = async () => {
    if (!userProfile) return
    setIsLoading(true)
    try {
      await joinMatch.mutateAsync(String(localMatch.id))
      // Update local state
      setLocalMatch({
        ...localMatch,
        players: [
          ...(Array.isArray(localMatch.players) ? localMatch.players : []),
          localMatch.booking.user
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
    if (!userProfile) return;
    try {
      const updatedMatch = await leaveMatch.mutateAsync({ matchId: localMatch.id.toString() });
      // Update local state
      setLocalMatch(updatedMatch)
      queryClient.invalidateQueries({ queryKey: ['availableMatches'] })
      queryClient.invalidateQueries({ queryKey: ['myMatches'] })
    } catch (error: any) {
      console.error("Error leaving match:", error)
    }
  }

  const handleConfirmMatch = async () => {
    setIsLoading(true)
    try {
      await confirmMatch.mutateAsync(String(localMatch.id))
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
                  {isOpenMatch ? "Partido Abierto" : isConfirmedMatch ? "Confirmado" : "Partido Cerrado"}
                </span>
              </div>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600", color: "#212529" }}>
                {localMatch.booking.timeSlot.field.name}
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
                    {new Date(localMatch.booking.bookingDate).toLocaleDateString("es-ES", {
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
                    {localMatch.booking.bookingHour}:00
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
                  {localMatch.booking.timeSlot.field.address}
                </span>
              </div>
            </div>

            {/* Players/Teams */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                {isOpenMatch ? "Jugadores" : "Equipos"}
              </h3>
              
              {isOpenMatch ? (
                // Open match - show players list
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Users size={20} color="#6c757d" />
                    <span style={{ fontSize: "14px", color: "#212529" }}>
                      {allPlayers.length} / {localMatch.maxPlayers} jugadores
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
                      Equipo 1 ({Array.isArray(localMatch.teamOne?.members) ? localMatch.teamOne.members.length : 0} jugadores)
                    </h4>
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#e3f2fd", 
                      borderRadius: "8px",
                      border: "1px solid #bbdefb"
                    }}>
                      {Array.isArray(localMatch.teamOne?.members) ? (
                        localMatch.teamOne.members.map((player: any) => (
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
                      Equipo 2 ({Array.isArray(localMatch.teamTwo?.members) ? localMatch.teamTwo.members.length : 0} jugadores)
                    </h4>
                    <div style={{ 
                      padding: "12px", 
                      backgroundColor: "#fff3e0", 
                      borderRadius: "8px",
                      border: "1px solid #ffcc02"
                    }}>
                      {Array.isArray(localMatch.teamTwo?.members) ? (
                        localMatch.teamTwo.members.map((player: any) => (
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
          onMatchUpdate={handleMatchUpdate}
        />
      )}
    </>
  )
}
