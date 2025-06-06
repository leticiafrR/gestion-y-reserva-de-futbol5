"use client"

import type React from "react"

import { useState } from "react"
import { X, Shuffle, Users, RotateCcw } from "lucide-react"
import { useAssignTeams } from "@/services/MatchServices"
import type { Match, Player, Teams } from "@/models/Match"

interface TeamAssignmentModalProps {
  match: Match
  onClose: () => void
  onSave: (teams: Teams) => void
}

export const TeamAssignmentModal = ({ match, onClose, onSave }: TeamAssignmentModalProps) => {
  const [teams, setTeams] = useState<Teams>({
    team1: [],
    team2: [],
  })
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>(match.players)
  const [isLoading, setIsLoading] = useState(false)
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null)
  const assignTeams = useAssignTeams()

  const playersPerTeam = Math.floor(match.currentPlayers / 2)
  const isBalanced =
    teams.team1.length === teams.team2.length && teams.team1.length + teams.team2.length === match.currentPlayers

  const handleDragStart = (player: Player) => {
    setDraggedPlayer(player)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetTeam: "team1" | "team2" | "unassigned") => {
    e.preventDefault()
    if (!draggedPlayer) return

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
    setDraggedPlayer(null)
  }

  const handleRandomAssignment = () => {
    const allPlayers = [...match.players]
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5)

    const newTeams: Teams = {
      team1: shuffled.slice(0, playersPerTeam),
      team2: shuffled.slice(playersPerTeam, playersPerTeam * 2),
    }

    setTeams(newTeams)
    setUnassignedPlayers(shuffled.slice(playersPerTeam * 2))
  }

  const handleBalancedByAge = () => {
    const playersWithAge = match.players.map((p) => ({
      ...p,
      age: Math.floor(Math.random() * 20) + 18, // Mock age between 18-38
    }))

    const sortedByAge = [...playersWithAge].sort((a, b) => a.age - b.age)
    const newTeams: Teams = { team1: [], team2: [] }

    // Alternate assignment to balance ages
    sortedByAge.forEach((player, index) => {
      if (index % 2 === 0 && newTeams.team1.length < playersPerTeam) {
        newTeams.team1.push(player)
      } else if (newTeams.team2.length < playersPerTeam) {
        newTeams.team2.push(player)
      }
    })

    setTeams(newTeams)
    setUnassignedPlayers(sortedByAge.slice(playersPerTeam * 2))
  }

  const handleReset = () => {
    setTeams({ team1: [], team2: [] })
    setUnassignedPlayers(match.players)
  }

  const handleSave = async () => {
    if (!isBalanced) return

    setIsLoading(true)
    try {
      await assignTeams.mutateAsync(match.id, teams)
      onSave(teams)
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
      onDragStart={() => handleDragStart(player)}
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
        src={player.avatar || "/placeholder.svg"}
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
    </div>
  )
}
