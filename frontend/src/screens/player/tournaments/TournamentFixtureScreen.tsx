"use client"

import { useState, useMemo } from "react"
import { useLocation } from "wouter"
import { Calendar, Users, Target } from "lucide-react"
import { useTournamentByName, useUserTournaments } from "@/services/TournamentService"
import { useFixtureService, TournamentMatch } from "@/services/FixtureService"
import { useQuery } from "@tanstack/react-query"

interface TournamentFixtureScreenProps {
  tournamentName: string
}

export const TournamentFixtureScreen = ({ tournamentName }: TournamentFixtureScreenProps) => {
  const [, setLocation] = useLocation()
  const { data: tournament, isLoading } = useTournamentByName(tournamentName)
  const { data: organizedTournaments = [] } = useUserTournaments()

  const isOrganizer = useMemo(() => {
    if (!tournament || organizedTournaments.length === 0) return false
    return organizedTournaments.some((t) => t.id === tournament.id)
  }, [tournament, organizedTournaments])

  const { generateFixture, isGenerating, getFixture } = useFixtureService()

  const { data: fixture = [] } = useQuery<TournamentMatch[]>({
    queryKey: ["fixture", tournament?.id],
    queryFn: () => getFixture(tournament!.id),
    enabled: !!tournament?.id,
  })

  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const handleGenerateFixture = async () => {
    if (!tournament?.id) return

    try {
      await generateFixture(tournament.id)
      setShowGenerateModal(false)
    } catch (error) {
      console.error("Error generating fixture:", error)
    }
  }

  const canGenerateFixture = () => {
    return (
      tournament &&
      isOrganizer &&
      fixture.length === 0 &&
      tournament.registeredTeams >= 2 &&
      (tournament.state === "CLOSE_TO_REGISTER_NOT_STARTED" || tournament.state === "IN_PROGRESS")
    )
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--muted-foreground)" }}>Cargando fixture del torneo...</div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "var(--destructive)" }}>Torneo no encontrado</div>
          <button onClick={() => setLocation("/my-tournaments")} style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "var(--primary)", color: "var(--primary-foreground)", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Volver a Torneos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "var(--card)", borderRadius: "12px", boxShadow: "0 2px 8px var(--border)", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "var(--foreground)", margin: "0 0 8px 0" }}>
            🏆 {tournament.name}
          </h1>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ padding: "4px 12px", backgroundColor: tournament.state === "IN_PROGRESS" ? "#dbeafe" : "#f3f4f6", color: tournament.state === "IN_PROGRESS" ? "#2563eb" : "#6b7280", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}>
              {tournament.state === "IN_PROGRESS" ? "En Progreso" : tournament.state === "FINISHED" ? "Finalizado" : tournament.state === "OPEN_TO_REGISTER" ? "Abierto" : "Listo para Iniciar"}
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
            <button onClick={() => setShowGenerateModal(true)} disabled={isGenerating} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: isGenerating ? "not-allowed" : "pointer", opacity: isGenerating ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={16} />
              {isGenerating ? "Generando..." : "Generar Fixture"}
            </button>
          )}
          <button onClick={() => setLocation("/my-tournaments")} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>
            Volver a Torneos
          </button>
        </div>
      </header>

      {/* Main Content Area - To be rebuilt */}
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* The content will be added here */}
      </main>

      {/* Generate Fixture Modal */}
      {showGenerateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", maxWidth: "500px", width: "90%" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Generar Fixture del Torneo</h3>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Se generará automáticamente el fixture completo del torneo con formato{" "}
              <strong>
                {tournament.format === "SINGLE_ELIMINATION" ? "Eliminación Directa" : tournament.format === "ROUND_ROBIN" ? "Todos contra Todos" : "Grupos + Eliminatorias"}
              </strong>{" "}
              para {tournament.registeredTeams} equipos.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ padding: "10px 16px", backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={handleGenerateFixture} disabled={isGenerating} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: isGenerating ? "not-allowed" : "pointer", opacity: isGenerating ? 0.7 : 1 }}>
                {isGenerating ? "Generando..." : "Generar Fixture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
