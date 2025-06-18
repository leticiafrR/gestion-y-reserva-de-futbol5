"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, Save, Copy, Trash2 } from "lucide-react"
import { fieldAvailabilityService, TimeSlotDTO, FieldAvailabilityService, BlockedSlotDTO } from "@/services/fieldAvailabilityService"
import { bookingService } from "@/services/bookingService"

interface TimeSlot {
  start: string
  end: string
}

interface WeeklySchedule {
  [key: string]: {
    available: boolean
    timeSlots: TimeSlot[]
  }
}

interface SpecificDateSchedule {
  date: string
  hour: string
}

interface Field {
  id: string
  name: string
}

interface ScheduleConfigurationProps {
  fields: Field[]
  selectedFieldId: string
  onFieldChange: (fieldId: string) => void
}

const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    const timeString = `${hour.toString().padStart(2, "0")}:00`
    options.push(timeString)
  }
  return options
}

const TimeSelect = ({
  value,
  onChange,
  placeholder = "Seleccionar hora",
  isStart = false,
  otherTime = "",
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isStart?: boolean
  otherTime?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeOptions = generateTimeOptions()

  const handleTimeChange = (newTime: string) => {
    if (isStart && otherTime && newTime >= otherTime) {
      return // Don't allow start time to be greater than or equal to end time
    }
    if (!isStart && otherTime && newTime <= otherTime) {
      return // Don't allow end time to be less than or equal to start time
    }
    onChange(newTime)
    setIsOpen(false)
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          backgroundColor: "white",
          fontSize: "14px",
          cursor: "pointer",
          minWidth: "80px",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#1f2937",
          fontWeight: "500",
        }}
      >
        <span style={{ color: "#1f2937" }}>{value || placeholder}</span>
        <Clock size={14} color="#6b7280" />
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              maxHeight: "200px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {timeOptions.map((time) => (
              <button
                key={time}
                onClick={() => handleTimeChange(time)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: value === time ? "#f3f4f6" : "white",
                  fontSize: "14px",
                  textAlign: "left",
                  cursor: "pointer",
                  borderBottom: "1px solid #f3f4f6",
                  color: "#1f2937",
                  fontWeight: value === time ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (value !== time) {
                    e.currentTarget.style.backgroundColor = "#f9fafb"
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== time) {
                    e.currentTarget.style.backgroundColor = "white"
                  }
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const ScheduleConfiguration = ({ fields, selectedFieldId, onFieldChange }: ScheduleConfigurationProps) => {
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    sunday: { available: false, timeSlots: [] },
    monday: { available: true, timeSlots: [{ start: "09:00", end: "18:00" }] },
    tuesday: { available: true, timeSlots: [{ start: "09:00", end: "18:00" }] },
    wednesday: { available: true, timeSlots: [{ start: "09:00", end: "18:00" }] },
    thursday: { available: true, timeSlots: [{ start: "09:00", end: "18:00" }] },
    friday: { available: true, timeSlots: [{ start: "09:00", end: "18:00" }] },
    saturday: { available: false, timeSlots: [] },
  })

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlotDTO[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [tempHour, setTempHour] = useState<string>("09:00")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const dayNames = {
    sunday: { short: "D", full: "Domingo" },
    monday: { short: "L", full: "Lunes" },
    tuesday: { short: "M", full: "Martes" },
    wednesday: { short: "M", full: "Miércoles" },
    thursday: { short: "J", full: "Jueves" },
    friday: { short: "V", full: "Viernes" },
    saturday: { short: "S", full: "Sábado" },
  }

  const toggleDayAvailability = (day: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
        timeSlots: !prev[day].available ? [{ start: "09:00", end: "18:00" }] : [],
      },
    }))
  }

  const updateTimeSlot = (day: string, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot) => ({ ...slot, [field]: value })),
      },
    }))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateString = formatDate(year, month, day)
    setSelectedDate(dateString)
  }

  const applySpecificDate = async () => {
    if (selectedDate && tempHour) {
      try {
        const hour = FieldAvailabilityService.timeStringToHour(tempHour)
        const result = await fieldAvailabilityService.addBlockedSlot(Number(selectedFieldId), selectedDate, hour)
        
        // Agregar el nuevo bloqueo al estado local inmediatamente
        setBlockedSlots((prev) => {
          const updated = [...prev, { fieldId: Number(selectedFieldId), date: selectedDate, hour }]
          return updated
        })
        
        // Refrescar la lista real del backend inmediatamente
        try {
          const slots = await fieldAvailabilityService.getAllBlockedSlots(Number(selectedFieldId))
          setBlockedSlots(slots)
        } catch (refreshError) {
          console.error("Error refreshing blocked slots:", refreshError)
        }
      } catch (e) {
        console.error("Error en applySpecificDate:", e)
        alert("Error al agregar el horario bloqueado: " + (e?.message || e))
      }
      setShowDatePicker(false)
      setSelectedDate("")
      setTempHour("09:00")
    }
  }

  const removeSpecificDate = async (date: string, hour: number) => {
    try {
      await fieldAvailabilityService.deleteBlockedSlot(Number(selectedFieldId), date, hour)
      setBlockedSlots((prev) => prev.filter((d) => !(d.date === date && d.hour === hour)))
    } catch (e) {
      // Manejar error
    }
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId)

  const handleSave = async () => {
    try {
      const availability: TimeSlotDTO[] = []
      Object.entries(weeklySchedule).forEach(([day, schedule]) => {
        if (schedule.available && schedule.timeSlots.length > 0) {
          const slot = schedule.timeSlots[0]
          availability.push({
            dayOfWeek: day.toUpperCase() as TimeSlotDTO['dayOfWeek'],
            openTime: FieldAvailabilityService.timeStringToHour(slot.start),
            closeTime: FieldAvailabilityService.timeStringToHour(slot.end)
          })
        }
      })
      await fieldAvailabilityService.setFieldAvailability(Number(selectedFieldId), availability)
      // Toast de éxito
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.bottom = '24px'
      toast.style.left = '24px'
      toast.style.backgroundColor = '#10b981'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '1000'
      toast.style.fontSize = '14px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Configuración guardada exitosamente'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => {
          document.body.removeChild(toast)
          window.location.href = '/'
        }, 300)
      }, 3000)
    } catch (error) {
      // Toast de error
      const toast = document.createElement('div')
      toast.style.position = 'fixed'
      toast.style.bottom = '24px'
      toast.style.left = '24px'
      toast.style.backgroundColor = '#ef4444'
      toast.style.color = 'white'
      toast.style.padding = '12px 24px'
      toast.style.borderRadius = '8px'
      toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
      toast.style.zIndex = '1000'
      toast.style.fontSize = '14px'
      toast.style.fontWeight = '500'
      toast.textContent = 'Error al guardar la configuración'
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transition = 'opacity 0.3s ease-out'
        setTimeout(() => document.body.removeChild(toast), 300)
      }, 3000)
    }
  }

  const loadFieldAvailability = async () => {
    try {
      const availability = await fieldAvailabilityService.getFieldAvailability(Number(selectedFieldId))
      
      // Reset weekly schedule
      const newWeeklySchedule: WeeklySchedule = {
        sunday: { available: false, timeSlots: [] },
        monday: { available: false, timeSlots: [] },
        tuesday: { available: false, timeSlots: [] },
        wednesday: { available: false, timeSlots: [] },
        thursday: { available: false, timeSlots: [] },
        friday: { available: false, timeSlots: [] },
        saturday: { available: false, timeSlots: [] },
      }

      // Group time slots by day
      availability.forEach((slot) => {
        const day = slot.dayOfWeek.toLowerCase()
        if (day in newWeeklySchedule) {
          if (!newWeeklySchedule[day].available) {
            newWeeklySchedule[day].available = true
            newWeeklySchedule[day].timeSlots = []
          }
          // Only add the first time slot for each day
          if (newWeeklySchedule[day].timeSlots.length === 0) {
            newWeeklySchedule[day].timeSlots.push({
              start: FieldAvailabilityService.hourToTimeString(slot.openTime),
              end: FieldAvailabilityService.hourToTimeString(slot.closeTime)
            })
          }
        }
      })

      setWeeklySchedule(newWeeklySchedule)
    } catch (error) {
      console.error('Error loading field availability:', error)
      alert('Error al cargar los horarios')
    }
  }

  // Cargar horarios bloqueados al cambiar cancha
  useEffect(() => {
    const loadBlockedSlots = async () => {
      try {
        if (selectedFieldId) {
          const slots = await fieldAvailabilityService.getAllBlockedSlots(Number(selectedFieldId))
          setBlockedSlots(slots)
        }
      } catch (e) {
        setBlockedSlots([])
      }
    }
    loadFieldAvailability()
    loadBlockedSlots()
  }, [selectedFieldId])

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
          Configuración de Horarios
        </h1>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>
          Define las franjas horarias de disponibilidad para {selectedField?.name}
        </p>
      </div>

      {/* Field Selector */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Seleccionar Cancha
        </label>
        <select
          value={selectedFieldId}
          onChange={(e) => onFieldChange(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: "white",
            color: "#374151"
          }}
        >
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Horas Semanales */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Clock size={20} color="#3b82f6" />
            <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", margin: 0 }}>Horarios semanales</h2>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Establece las franjas horarias disponibles para reservas durante la semana
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Object.entries(dayNames).map(([dayKey, dayInfo]) => (
              <div key={dayKey}>
                {/* Day Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: weeklySchedule[dayKey].available ? "#3b82f6" : "#e5e7eb",
                      color: weeklySchedule[dayKey].available ? "white" : "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleDayAvailability(dayKey)}
                  >
                    {dayInfo.short}
                  </div>
                  <span style={{ fontSize: "16px", fontWeight: "500", color: "#1f2937" }}>{dayInfo.full}</span>
                </div>

                {/* Time Slots */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "44px" }}>
                  {!weeklySchedule[dayKey].available ? (
                    <div
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#6b7280",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      Sin disponibilidad - Haz clic en el círculo para activar
                    </div>
                  ) : (
                    weeklySchedule[dayKey].timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          backgroundColor: "#1e293b",
                          borderRadius: "8px",
                          color: "white",
                        }}
                      >
                        <div style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
                          Horario disponible
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <TimeSelect
                            value={slot.start}
                            onChange={(value) => updateTimeSlot(dayKey, "start", value)}
                            isStart={true}
                            otherTime={slot.end}
                          />
                          <span style={{ color: "#94a3b8" }}>-</span>
                          <TimeSelect
                            value={slot.end}
                            onChange={(value) => updateTimeSlot(dayKey, "end", value)}
                            isStart={false}
                            otherTime={slot.start}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horas según el día */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={20} color="#3b82f6" />
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", margin: 0 }}>Bloqueos específicos</h2>
            </div>
            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);
                setShowDatePicker(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Plus size={16} />
              Agregar fecha
            </button>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            Configura eventos especiales que sobrescriben los horarios semanales para asegurarte de que no se pueda reservar en ese momento
          </p>

          {/* Lista de fechas específicas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {blockedSlots.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px",
                  padding: "40px 20px",
                }}
              >
                No hay eventos específicos configurados
                </div>
            ) : (
              <>
                {/* Mostrar fechas específicas configuradas */}
                {blockedSlots.map((slot) => {
                  const formattedDate = new Date(slot.date).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

                  return (
                    <div key={`${slot.date}-${slot.hour}`}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ fontWeight: "600", color: "#1f2937", fontSize: "16px" }}>
                          {formattedDate}
                        </span>
                        <button
                          onClick={() => removeSpecificDate(slot.date, slot.hour)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 size={14} />
                          Eliminar fecha
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 16px",
                            backgroundColor: "#1e293b",
                            borderRadius: "8px",
                            color: "white",
                          }}
                        >
                          <div style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
                            Evento especial para fecha específica
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "14px" }}>{slot.hour}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              margin: "20px",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>
              Configurar horario para fecha específica
            </h3>

            {/* Calendar Header */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}
            >
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{
                  padding: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <ChevronLeft size={20} color="#6b7280" />
              </button>
              <span style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{
                  padding: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <ChevronRight size={20} color="#6b7280" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ marginBottom: "16px" }}>
              {/* Day Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      padding: "8px 4px",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {getDaysInMonth(currentMonth).map((day, index) => {
                  if (day === null) {
                    return <div key={index} />
                  }

                  const dateString = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const isSelected = selectedDate === dateString

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      style={{
                        padding: "8px",
                        border: "none",
                        borderRadius: "6px",
                        backgroundColor: isSelected ? "#3b82f6" : "transparent",
                        color: isSelected ? "white" : "#1f2937",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slot Configuration */}
            {selectedDate && (
              <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                    Hora disponible
                  </h4>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  >
                    <div style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
                      Hora disponible para fecha específica
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <TimeSelect
                        value={tempHour}
                        onChange={(value) => setTempHour(value)}
                        placeholder="Seleccionar hora"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowDatePicker(false)
                  setSelectedDate("")
                  setTempHour("09:00")
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={applySpecificDate}
                disabled={!selectedDate}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  backgroundColor: selectedDate ? "#3b82f6" : "#e5e7eb",
                  color: selectedDate ? "white" : "#9ca3af",
                  borderRadius: "8px",
                  cursor: selectedDate ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Aplicar horario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 100,
        }}
      >
        <button
          onClick={handleSave}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
        >
          <Save size={20} />
          Guardar Configuración
        </button>
      </div>
    </div>
  )
}
