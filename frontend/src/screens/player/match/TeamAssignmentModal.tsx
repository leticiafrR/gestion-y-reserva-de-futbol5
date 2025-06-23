"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Shuffle, Users, RotateCcw } from "lucide-react"
import { useAssignTeams, useAssignRandomTeams, useAssignTeamsByAge } from "@/services/MatchServices"
import type { Match, Player, Teams } from "@/models/Match"

interface TeamAssignmentModalProps {
  match: Match
  onClose: () => void
  onSave: (teams: Teams) => void
  onMatchUpdate?: (updatedMatch: Match) => void
}

export const TeamAssignmentModal = ({ match, onClose, onSave, onMatchUpdate }: TeamAssignmentModalProps) => {
  const [teams, setTeams] = useState<Teams>({
    team1: [],
    team2: [],
  })
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>(Array.isArray(match.players) ? match.players : [])
  const [isLoading, setIsLoading] = useState(false)
  const draggedPlayerRef = useRef<Player | null>(null)
  const [showTeamsAssigned, setShowTeamsAssigned] = useState(false)
  const [assignedTeams, setAssignedTeams] = useState<any>(null)
  const assignTeams = useAssignTeams()
  const assignRandomTeams = useAssignRandomTeams()
  const assignTeamsByAge = useAssignTeamsByAge()

  const playersPerTeam = Math.floor((Array.isArray(match.players) ? match.players.length : 0) / 2)
  const isBalanced =
    teams.team1.length === teams.team2.length && teams.team1.length + teams.team2.length === (Array.isArray(match.players) ? match.players.length : 0)

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    draggedPlayerRef.current = player
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', player.id.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetTeam: "team1" | "team2" | "unassigned") => {
    const draggedPlayer = draggedPlayerRef.current
    e.preventDefault()
    e.stopPropagation()
    if (!draggedPlayer) {
      return;
    }

    // Remove player from current location
    const newTeams = { ...teams }
    let newUnassigned = [...unassignedPlayers]

    // Remove from current team
    if (teams.team1.some((p) => p.id === draggedPlayer.id)) {
      newTeams.team1 = teams.team1.filter((p) => p.id !== draggedPlayer.id)
    } else if (teams.team2.some((p) => p.id === draggedPlayer.id)) {
      newTeams.team2 = teams.team2.filter((p) => p.id !== draggedPlayer.id)
    } else {
      newUnassigned = unassignedPlayers.filter((p) => p.id !== draggedPlayer.id)
    }

    // Add to target location
    if (targetTeam === "team1" && newTeams.team1.length < playersPerTeam) {
      newTeams.team1.push(draggedPlayer)
    } else if (targetTeam === "team2" && newTeams.team2.length < playersPerTeam) {
      newTeams.team2.push(draggedPlayer)
    } else if (targetTeam === "unassigned") {
      newUnassigned.push(draggedPlayer)
    }

    setTeams(newTeams)
    setUnassignedPlayers(newUnassigned)
    draggedPlayerRef.current = null
  }

  const handleDragEnd = (e: React.DragEvent) => {
    draggedPlayerRef.current = null
  }

  const handleRandomAssignment = async () => {
    setIsLoading(true)
    try {
      const result = await assignRandomTeams.mutateAsync(match.id.toString())
      
      // Actualizar el estado local con los equipos asignados por el backend
      if (result.teamOne && result.teamTwo) {
        // Crear el partido actualizado con los equipos asignados
        const updatedMatch: Match = {
          ...match,
          teamOne: result.teamOne,
          teamTwo: result.teamTwo,
          // El backend mantiene isActive como true después de asignar equipos
          isActive: result.isActive,
          // Cambiar el tipo a cerrado después de asignar equipos
          // matchType: "closed"
        }
        
        // Mostrar los equipos asignados
        setAssignedTeams(result)
        setShowTeamsAssigned(true)
        
        // Llamar a la función de actualización del partido si existe
        if (onMatchUpdate) {
          onMatchUpdate(updatedMatch)
        }
        
        // Cerrar el modal después de un breve delay para mostrar los equipos
        setTimeout(() => {
          onClose()
        }, 8000)
      }
    } catch (error) {
      console.error("Error assigning random teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBalancedByAge = async () => {
    setIsLoading(true)
    try {
      const result = await assignTeamsByAge.mutateAsync(match.id.toString())
      
      // Actualizar el estado local con los equipos asignados por el backend
      if (result.teamOne && result.teamTwo) {
        // Crear el partido actualizado con los equipos asignados
        const updatedMatch: Match = {
          ...match,
          teamOne: result.teamOne,
          teamTwo: result.teamTwo,
          // El backend mantiene isActive como true después de asignar equipos
          isActive: result.isActive,
          // Cambiar el tipo a cerrado después de asignar equipos
          matchType: "closed"
        }
        
        // Mostrar los equipos asignados
        setAssignedTeams(result)
        setShowTeamsAssigned(true)
        
        // Llamar a la función de actualización del partido si existe
        if (onMatchUpdate) {
          onMatchUpdate(updatedMatch)
        }
        
        // Cerrar el modal después de un breve delay para mostrar los equipos
        setTimeout(() => {
          onClose()
        }, 5000)
      }
    } catch (error) {
      console.error("Error assigning teams by age:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setTeams({ team1: [], team2: [] })
    setUnassignedPlayers(Array.isArray(match.players) ? match.players : [])
  }

  const handleSave = async () => {
    if (!isBalanced) return

    setIsLoading(true)
    try {
      const result = await assignTeams.mutateAsync(match.id.toString(), teams)
      
      // Crear el partido actualizado con los equipos asignados
      const updatedMatch: Match = {
        ...match,
        teamOne: result.teamOne,
        teamTwo: result.teamTwo,
        isActive: result.isActive,
        matchType: "closed"
      }
      
      // Mostrar el modal de equipos confirmados
      setAssignedTeams(result)
      setShowTeamsAssigned(true)
      
      // Llamar a la función de actualización del partido si existe
      if (onMatchUpdate) {
        onMatchUpdate(updatedMatch)
      }
      
      // Esperar 5 segundos y cerrar el modal
      setTimeout(() => {
        onClose()
      }, 5000)
    } catch (error) {
      console.error("Error assigning teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const PlayerCard = ({ player, isDragging = false }: { player: Player; isDragging?: boolean }) => (
    <div
      key={player.id}
      draggable
      onDragStart={(e) => handleDragStart(e, player)}
      onDragEnd={handleDragEnd}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        backgroundColor: isDragging ? "#e3f2fd" : "white",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        cursor: "grab",
        transition: "all 0.2s ease",
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = "#f8f9fa"
          e.currentTarget.style.transform = "translateY(-1px)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.backgroundColor = "white"
          e.currentTarget.style.transform = "translateY(0)"
        }
      }}
    >
      <img
        src={player.profilePicture || "/placeholder.svg"}
        alt={player.name}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
      <span style={{ fontSize: "14px", color: "#212529", fontWeight: "500" }}>{player.name}</span>
    </div>
  )

  const TeamsAssignedDisplay = () => (
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
        zIndex: 1002,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "80vh",
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
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "600", color: "#28a745" }}>
            ✅ Equipos Asignados Exitosamente
          </h2>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>
            Los equipos han sido creados y el partido está listo
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Team 1 */}
            <div>
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1976d2",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#1976d2",
                  borderRadius: "50%"
                }}></div>
                Equipo 1 ({assignedTeams?.teamOne?.members?.length || 0} jugadores)
              </h3>
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#e3f2fd", 
                borderRadius: "12px",
                border: "2px solid #1976d2"
              }}>
                {assignedTeams?.teamOne?.members?.map((player: any) => (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 0",
                      borderBottom: "1px solid #bbdefb",
                    }}
                  >
                    <img
                      src={player.profilePicture || "/placeholder.svg"}
                      alt={player.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#212529", fontWeight: "500" }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <h3 style={{ 
                margin: "0 0 16px 0", 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#f57c00",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#f57c00",
                  borderRadius: "50%"
                }}></div>
                Equipo 2 ({assignedTeams?.teamTwo?.members?.length || 0} jugadores)
              </h3>
              <div style={{ 
                padding: "16px", 
                backgroundColor: "#fff3e0", 
                borderRadius: "12px",
                border: "2px solid #f57c00"
              }}>
                {assignedTeams?.teamTwo?.members?.map((player: any) => (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 0",
                      borderBottom: "1px solid #ffcc02",
                    }}
                  >
                    <img
                      src={player.profilePicture || "/placeholder.svg"}
                      alt={player.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <span style={{ fontSize: "14px", color: "#212529", fontWeight: "500" }}>
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <div style={{ color: "#28a745", fontSize: "16px", fontWeight: "600" }}>
              🎉 ¡Partido confirmado y listo para jugar!
            </div>
            <p style={{ color: "#6c757d", fontSize: "14px", margin: "8px 0 0 0" }}>
              El modal se cerrará automáticamente en unos segundos...
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
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
        zIndex: 1001,
        padding: "20px",
      }}
      onClick={onClose}
    >
      {!showTeamsAssigned && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "900px",
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
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "600", color: "#212529" }}>
                Asignar Equipos
              </h2>
              <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
                Arrastra los jugadores para formar equipos balanceados
              </p>
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

          {/* Auto Assignment Buttons */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e9ecef",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleRandomAssignment}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <Shuffle size={14} />
              Aleatorio
            </button>

            <button
              onClick={handleBalancedByAge}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <Users size={14} />
              Balanceado por Edad
            </button>

            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <RotateCcw size={14} />
              Reiniciar
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", height: "100%" }}>
              {/* Unassigned Players */}
              <div>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                  Jugadores Sin Asignar ({unassignedPlayers.length})
                </h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "unassigned")}
                  style={{
                    minHeight: "300px",
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    border: "2px dashed #dee2e6",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.backgroundColor = "#e9ecef"
                    e.currentTarget.style.borderColor = "#6c757d"
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.backgroundColor = "#f8f9fa"
                    e.currentTarget.style.borderColor = "#dee2e6"
                  }}
                >
                  {unassignedPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                  {unassignedPlayers.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100px",
                        color: "#6c757d",
                        fontSize: "14px",
                      }}
                    >
                      Todos los jugadores asignados
                    </div>
                  )}
                </div>
              </div>

              {/* Team 1 */}
              <div>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#1976d2" }}>
                  Equipo 1 ({teams.team1.length}/{playersPerTeam})
                </h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "team1")}
                  style={{
                    minHeight: "300px",
                    padding: "16px",
                    backgroundColor: "#e3f2fd",
                    border: teams.team1.length >= playersPerTeam ? "2px solid #1976d2" : "2px dashed #bbdefb",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    if (teams.team1.length < playersPerTeam) {
                      e.currentTarget.style.backgroundColor = "#bbdefb"
                      e.currentTarget.style.borderColor = "#1976d2"
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.backgroundColor = "#e3f2fd"
                    e.currentTarget.style.borderColor = teams.team1.length >= playersPerTeam ? "#1976d2" : "#bbdefb"
                  }}
                >
                  {teams.team1.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                  {teams.team1.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100px",
                        color: "#1976d2",
                        fontSize: "14px",
                      }}
                    >
                      Arrastra jugadores aquí
                    </div>
                  )}
                </div>
              </div>

              {/* Team 2 */}
              <div>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#f57c00" }}>
                  Equipo 2 ({teams.team2.length}/{playersPerTeam})
                </h3>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, "team2")}
                  style={{
                    minHeight: "300px",
                    padding: "16px",
                    backgroundColor: "#fff3e0",
                    border: teams.team2.length >= playersPerTeam ? "2px solid #f57c00" : "2px dashed #ffcc02",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    if (teams.team2.length < playersPerTeam) {
                      e.currentTarget.style.backgroundColor = "#ffcc02"
                      e.currentTarget.style.borderColor = "#f57c00"
                    }
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.backgroundColor = "#fff3e0"
                    e.currentTarget.style.borderColor = teams.team2.length >= playersPerTeam ? "#f57c00" : "#ffcc02"
                  }}
                >
                  {teams.team2.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                  {teams.team2.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100px",
                        color: "#f57c00",
                        fontSize: "14px",
                      }}
                    >
                      Arrastra jugadores aquí
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance Status */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              {isBalanced ? (
                <div style={{ color: "#28a745", fontSize: "14px", fontWeight: "500" }}>
                  ✅ Equipos balanceados - Listos para guardar
                </div>
              ) : (
                <div style={{ color: "#dc3545", fontSize: "14px" }}>
                  ⚠️ Los equipos deben tener la misma cantidad de jugadores
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "24px",
              borderTop: "1px solid #e9ecef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "13px", color: "#6c757d" }}>
              Arrastra y suelta jugadores entre las columnas para formar equipos
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
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
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={!isBalanced || isLoading}
                style={{
                  padding: "10px 16px",
                  backgroundColor: isBalanced && !isLoading ? "#28a745" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isBalanced && !isLoading ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {isLoading ? "Guardando..." : "Guardar Equipos"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showTeamsAssigned && <TeamsAssignedDisplay />}
    </div>
  )
}
