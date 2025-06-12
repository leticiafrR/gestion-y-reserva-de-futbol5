"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Users, Calendar, Filter, History } from "lucide-react"
import { useAvailableMatches, useMyMatches, useMatchHistory } from "@/services/MatchServices"
import { MatchCard } from "./MatchCard"
import { CreateMatchModal } from "./CreateMatchModal"
import { MatchDetailsModal } from "./MatchDetailsModal"
import type { Match } from "@/models/Match"

export const MatchesScreen = () => {
  const [activeTab, setActiveTab] = useState<"available" | "my-matches" | "history">("available")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filtros
  const [dateFilter, setDateFilter] = useState("")
  const [timeFilter, setTimeFilter] = useState("")
  const [fieldFilter, setFieldFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState<"" | "open" | "closed">("")

  const { data: availableMatches, isLoading: loadingAvailable } = useAvailableMatches()
  const { data: myMatches, isLoading: loadingMy } = useMyMatches()
  const { data: matchHistory, isLoading: loadingHistory } = useMatchHistory()

  const filteredAvailableMatches = (availableMatches ?? []).filter((match: Match) => {
    const matchesDate = dateFilter ? match.date === dateFilter : true
    const matchesTime = timeFilter ? match.time.includes(timeFilter) : true
    const matchesField = fieldFilter ? match.field.name.toLowerCase().includes(fieldFilter.toLowerCase()) : true
    const matchesType = typeFilter ? match.type === typeFilter : true
    return matchesDate && matchesTime && matchesField && matchesType
  })

  const filteredHistory = (matchHistory ?? []).filter((match: Match) => {
    const matchesDate = dateFilter ? match.date === dateFilter : true
    const matchesTime = timeFilter ? match.time.includes(timeFilter) : true
    const matchesField = fieldFilter ? match.field.name.toLowerCase().includes(fieldFilter.toLowerCase()) : true
    const matchesType = typeFilter ? match.type === typeFilter : true
    return matchesDate && matchesTime && matchesField && matchesType
  })

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e9ecef",
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#212529",
                margin: "0 0 4px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚽ Partidos
            </h1>
            <p style={{ color: "#6c757d", margin: 0, fontSize: "14px" }}>
              Encuentra partidos abiertos, gestiona tus partidos y revisa tu historial
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => (window.location.href = "/main")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                backgroundColor: "transparent",
                color: "#6c757d",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={() => setActiveTab("available")}
            style={{
              flex: 1,
              padding: "12px 24px",
              backgroundColor: activeTab === "available" ? "#007bff" : "transparent",
              color: activeTab === "available" ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Users size={16} />
            Partidos Disponibles
          </button>
          <button
            onClick={() => setActiveTab("my-matches")}
            style={{
              flex: 1,
              padding: "12px 24px",
              backgroundColor: activeTab === "my-matches" ? "#007bff" : "transparent",
              color: activeTab === "my-matches" ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Calendar size={16} />
            Mis Partidos
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              flex: 1,
              padding: "12px 24px",
              backgroundColor: activeTab === "history" ? "#007bff" : "transparent",
              color: activeTab === "history" ? "white" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <History size={16} />
            Historial
          </button>
        </div>

        {/* Filtros */}
        {(activeTab === "available" || activeTab === "history") && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: showFilters ? "16px" : "0",
              }}
            >
              <h3 style={{ margin: 0, color: "#212529", fontSize: "16px", fontWeight: "600" }}>Filtros de búsqueda</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  backgroundColor: showFilters ? "#007bff" : "#f8f9fa",
                  color: showFilters ? "white" : "#6c757d",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                <Filter size={14} />
                {showFilters ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {showFilters && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#6c757d" }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#6c757d" }}>
                    Hora
                  </label>
                  <input
                    type="time"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#6c757d" }}>
                    Cancha
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar cancha..."
                    value={fieldFilter}
                    onChange={(e) => setFieldFilter(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #dee2e6",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {activeTab === "history" && (
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#6c757d" }}>
                      Tipo
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as "" | "open" | "closed")}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Todos</option>
                      <option value="open">Partido Abierto</option>
                      <option value="closed">Partido Cerrado</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {activeTab === "available" ? (
          <div>
            {loadingAvailable ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                Cargando partidos disponibles...
              </div>
            ) : filteredAvailableMatches.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  color: "#6c757d",
                }}
              >
                No hay partidos disponibles que coincidan con los filtros
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredAvailableMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                    showJoinButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "my-matches" ? (
          <div>
            {loadingMy ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>Cargando mis partidos...</div>
            ) : (myMatches ?? []).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  color: "#6c757d",
                }}
              >
                No tienes partidos registrados
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "20px",
                }}
              >
                {(myMatches ?? []).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                    showJoinButton={false}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>Cargando historial...</div>
            ) : filteredHistory.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  color: "#6c757d",
                }}
              >
                No hay partidos en el historial que coincidan con los filtros
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredHistory.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => setSelectedMatch(match)}
                    showJoinButton={false}
                    isHistory={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedMatch && <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}
    </div>
  )
}
