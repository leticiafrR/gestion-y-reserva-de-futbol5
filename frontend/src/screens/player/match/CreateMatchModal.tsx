"use client"

import { useState } from "react"
import { X, ArrowLeft, ArrowRight, MapPin, Clock, DollarSign, Calendar } from "lucide-react"
import { createOpenMatch, createClosedMatch } from "@/services/MatchServices"
import type { Field, AvailableSlot, CreateOpenMatchData, CreateClosedMatchData } from "@/models/Match"
import { useFieldAvailableHours, bookingService } from "@/services/bookingService"
import { fieldAvailabilityService } from "@/services/fieldAvailabilityService"
import { CalendarTimePicker } from "@/components/ScheduleConfiguration/CalendarTimePicker"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useUserTeams } from "@/services/TeamServices"
import type { Team } from "@/models/Team"

interface CreateMatchModalProps {
  onClose: () => void
  preselectedField?: Field
}

// Mock data para canchas disponibles
const mockFields: Field[] = [
  {
    id: "1",
    name: "Cancha Principal",
    location: "Zona Norte",
    surface: "Césped natural",
    pricePerHour: 80000,
  },
  {
    id: "2",
    name: "Cancha Sintética 1",
    location: "Zona Sur",
    surface: "Césped sintético",
    pricePerHour: 60000,
  },
  {
    id: "3",
    name: "Cancha Premium",
    location: "Centro",
    surface: "Césped natural",
    pricePerHour: 120000,
  },
  {
    id: "4",
    name: "Cancha Nocturna",
    location: "Zona Este",
    surface: "Césped sintético",
    pricePerHour: 70000,
  },
]

const mockAvailableSlots: AvailableSlot[] = [
  {
    id: "1",
    date: "2024-01-15",
    startTime: "16:00",
    endTime: "18:00",
    field: mockFields[0],
    pricePerHour: 80000,
    isAvailable: true,
  },
  {
    id: "2",
    date: "2024-01-15",
    startTime: "18:00",
    endTime: "20:00",
    field: mockFields[0],
    pricePerHour: 80000,
    isAvailable: true,
  },
  {
    id: "3",
    date: "2024-01-16",
    startTime: "14:00",
    endTime: "16:00",
    field: mockFields[1],
    pricePerHour: 60000,
    isAvailable: true,
  },
]

export const CreateMatchModal = ({ onClose, preselectedField }: CreateMatchModalProps) => {
  const [step, setStep] = useState(1)
  const [selectedField, setSelectedField] = useState<Field | null>(preselectedField || null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const { data: teams } = useUserTeams()

  // Form data
  const [formData, setFormData] = useState({
    type: "open" as "open" | "closed",
    title: "",
    minPlayers: 10,
    maxPlayers: 22,
    description: "",
    selectedTeams: {
      team1: "",
      team2: "",
    },
  })

  // Obtener los horarios disponibles reales
  const { data: availableHours, isLoading: loadingSlots, error: errorSlots } = useFieldAvailableHours(selectedField?.id)

  const getAvailableDates = () => {
    if (!availableHours) return []
    return Object.keys(availableHours).filter(date => 
      Array.isArray(availableHours[date]) && availableHours[date].length > 0
    )
  }

  const getAvailableHoursForDate = (date: string) => {
    return availableHours && availableHours[date] ? availableHours[date] : []
  }

  const handleFieldSelect = (field: Field) => {
    if (!preselectedField) setSelectedField(field)
  }

  const handleDateTimeSelect = (date: string, hour: number) => {
    setSelectedDate(date)
    setSelectedHour(hour)
  }

  const calculatePricePerPlayer = () => {
    if (!selectedField || !selectedDate || !selectedHour) return 0
    const totalHours = selectedHour
    const totalCost = (selectedField.pricePerHour || 0) * totalHours
    return Math.ceil(totalCost / formData.maxPlayers)
  }

  const handleSubmit = async () => {
    if (!selectedField || !selectedDate || !selectedHour) {
      return
    }

    try {
      setIsLoading(true)
      const dayOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][(new Date(selectedDate).getDay() + 6) % 7] as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
      console.log("Requesting availability for:", {
        fieldId: selectedField.id,
        dayOfWeek,
        date: selectedDate,
        hour: selectedHour,
      })

      const timeslot = await fieldAvailabilityService.getDayAvailability(
        parseInt(selectedField.id),
        dayOfWeek
      )
      console.log("Timeslot:", timeslot)

      const booking = await bookingService.createBooking(
        timeslot.id,
        selectedDate,
        selectedHour
      )
      console.log("Booking created:", booking)

      if (formData.type === "open") {
        const matchData: CreateOpenMatchData = {
          bookingId: booking.id,
          creatorId: 1, // TODO: Get from current user
          maxPlayers: formData.maxPlayers,
        }
        await createOpenMatch(matchData)
      } else {
        const matchData: CreateClosedMatchData = {
          bookingId: booking.id,
          teamOneId: parseInt(formData.selectedTeams.team1),
          teamTwoId: parseInt(formData.selectedTeams.team2),
        }
        await createClosedMatch(matchData)
      }

      setSuccessMessage("¡Partido creado exitosamente!")
      setTimeout(() => {
        setSuccessMessage("")
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error creating match:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {successMessage && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#10b981",
          color: "white",
          padding: "12px 24px",
          borderRadius: "8px",
          zIndex: 2000,
          fontWeight: 500,
          fontSize: "16px"
        }}>
          {successMessage}
        </div>
      )}
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
            maxWidth: "800px",
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
                Crear Nuevo Partido
              </h2>
              <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
                Paso {step} de 2: {step === 1 ? "Seleccionar cancha y horario" : "Configurar partido"}
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

          {/* Content */}
          <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
            {step === 1 ? (
              <div>
                {/* Field Selection */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                    Seleccionar Cancha
                  </h3>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}
                  >
                    {preselectedField ? (
                      <div
                        key={preselectedField.id}
                        style={{
                          padding: "16px",
                          border: "2px solid #007bff",
                          borderRadius: "12px",
                          backgroundColor: "#f8f9ff",
                          opacity: 0.7,
                          pointerEvents: "none",
                        }}
                      >
                        <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                          {preselectedField.name}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                          <MapPin size={14} style={{ color: "#6c757d" }} />
                          <span style={{ fontSize: "13px", color: "#6c757d" }}>{preselectedField.location}</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>{preselectedField.surface}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <DollarSign size={14} style={{ color: "#28a745" }} />
                          <span style={{ fontSize: "13px", color: "#28a745", fontWeight: "500" }}>
                            ${preselectedField.pricePerHour ? preselectedField.pricePerHour.toLocaleString() : "-"}/hora
                          </span>
                        </div>
                      </div>
                    ) : (
                      mockFields.map((field) => (
                        <div
                          key={field.id}
                          onClick={() => handleFieldSelect(field)}
                          style={{
                            padding: "16px",
                            border: selectedField?.id === field.id ? "2px solid #007bff" : "1px solid #dee2e6",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            backgroundColor: selectedField?.id === field.id ? "#f8f9ff" : "white",
                          }}
                        >
                          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                            {field.name}
                          </h4>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <MapPin size={14} style={{ color: "#6c757d" }} />
                            <span style={{ fontSize: "13px", color: "#6c757d" }}>{field.location}</span>
                          </div>
                          <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>{field.surface}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <DollarSign size={14} style={{ color: "#28a745" }} />
                            <span style={{ fontSize: "13px", color: "#28a745", fontWeight: "500" }}>
                              ${field.pricePerHour ? field.pricePerHour.toLocaleString() : "-"}/hora
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Time Slot Selection */}
                {/* Calendar Time Picker */}
                {selectedField && (
                  <div>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600", color: "#212529" }}>
                      Seleccionar Fecha y Horario
                    </h3>
                    {loadingSlots ? (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#6c757d",
                          border: "1px solid #dee2e6",
                          borderRadius: "12px",
                        }}
                      >
                        Cargando horarios disponibles...
                      </div>
                    ) : errorSlots ? (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#ef4444",
                          border: "1px solid #dee2e6",
                          borderRadius: "12px",
                        }}
                      >
                        Error al cargar horarios disponibles
                      </div>
                    ) : (
                      <CalendarTimePicker
                        availableHours={availableHours}
                        selectedDate={selectedDate}
                        selectedHour={selectedHour}
                        onDateTimeSelect={handleDateTimeSelect}
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Match Configuration */}
                <div style={{ display: "grid", gap: "24px" }}>
                  {/* Selected Field Info */}
                  {selectedField && (
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                        Cancha Seleccionada
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <MapPin size={14} style={{ color: "#6c757d" }} />
                        <span style={{ fontSize: "13px", color: "#6c757d" }}>{selectedField.name}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>{selectedField.surface}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <DollarSign size={14} style={{ color: "#28a745" }} />
                        <span style={{ fontSize: "13px", color: "#28a745", fontWeight: "500" }}>
                          ${selectedField.pricePerHour ? selectedField.pricePerHour.toLocaleString() : "-"}/hora
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Match Type */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#212529",
                      }}
                    >
                      Tipo de Partido
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => setFormData({ ...formData, type: "open" })}
                        style={{
                          flex: 1,
                          padding: "12px",
                          border: formData.type === "open" ? "2px solid #007bff" : "1px solid #dee2e6",
                          borderRadius: "8px",
                          backgroundColor: formData.type === "open" ? "#f8f9ff" : "white",
                          color: formData.type === "open" ? "#007bff" : "#6c757d",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Partido Abierto
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, type: "closed" })}
                        style={{
                          flex: 1,
                          padding: "12px",
                          border: formData.type === "closed" ? "2px solid #007bff" : "1px solid #dee2e6",
                          borderRadius: "8px",
                          backgroundColor: formData.type === "closed" ? "#f8f9ff" : "white",
                          color: formData.type === "closed" ? "#007bff" : "#6c757d",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Partido Cerrado
                      </button>
                    </div>
                  </div>

                  

                  {/* Players */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#212529",
                        }}
                      >
                        Jugadores mínimos
                      </label>
                      <input
                        type="number"
                        value={10}
                        disabled
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #dee2e6",
                          borderRadius: "8px",
                          fontSize: "14px",
                          backgroundColor: "#f8f9fa",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#212529",
                        }}
                      >
                        Máximo de Jugadores
                      </label>
                      <input
                        type="number"
                        value={formData.maxPlayers}
                        onChange={(e) => setFormData({ ...formData, maxPlayers: Number.parseInt(e.target.value) })}
                        min={formData.minPlayers}
                        max="22"
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #dee2e6",
                          borderRadius: "8px",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#212529" }}>
                      Cálculo de Precio
                    </h4>
                    <div style={{ fontSize: "13px", color: "#6c757d", marginBottom: "8px" }}>
                      Costo total: ${selectedDate && selectedHour && selectedField?.pricePerHour ? (selectedField.pricePerHour * 2).toLocaleString() : 0}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#28a745" }}>
                      Precio por jugador: ${calculatePricePerPlayer().toLocaleString()}
                    </div>
                  </div>

                  
                  {/* Teams Selection for Closed Match */}
                  {formData.type === "closed" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#212529",
                          }}
                        >
                          Equipo 1
                        </label>
                        <select
                          value={formData.selectedTeams.team1}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              selectedTeams: { ...formData.selectedTeams, team1: e.target.value },
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #dee2e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Seleccionar equipo</option>
                          {teams?.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#212529",
                          }}
                        >
                          Equipo 2
                        </label>
                        <select
                          value={formData.selectedTeams.team2}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              selectedTeams: { ...formData.selectedTeams, team2: e.target.value },
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid #dee2e6",
                            borderRadius: "8px",
                            fontSize: "14px",
                          }}
                        >
                          <option value="">Seleccionar equipo</option>
                          {teams?.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
            <div>
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
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
                  }}
                >
                  <ArrowLeft size={16} />
                  Anterior
                </button>
              )}
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

              {step === 1 ? (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedField || !selectedDate || !selectedHour}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    backgroundColor: selectedField && selectedDate && selectedHour ? "#007bff" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: selectedField && selectedDate && selectedHour ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Siguiente
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  style={{
                    padding: "10px 16px",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {isLoading ? "Creando..." : "Crear Partido"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
