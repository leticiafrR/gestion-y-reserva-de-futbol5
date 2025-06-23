"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react"

interface TimeSlot {
  hour: number
  available: boolean
  reserved?: boolean
}

interface CalendarTimePickerProps {
  availableHours: Record<string, number[]> | null
  selectedDate: string
  selectedHour: number | null
  onDateTimeSelect: (date: string, hour: number) => void
}

export const CalendarTimePicker = ({
  availableHours,
  selectedDate,
  selectedHour,
  onDateTimeSelect,
}: CalendarTimePickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7 // Adjust for Monday start
    const mondayOfThisWeek = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek))
    return mondayOfThisWeek
  })

  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 })
  const [selectedDayPopup, setSelectedDayPopup] = useState<string | null>(null)

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  const formatDateKey = (date: Date) => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`
  }

  const createUTCDate = (year: number, month: number, day: number) => {
    return new Date(Date.UTC(year, month, day))
  }

  const getTwoWeeksData = () => {
    const weeks = []
    const startDate = new Date(currentWeekStart)

    for (let week = 0; week < 2; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(Date.UTC(
          startDate.getUTCFullYear(),
          startDate.getUTCMonth(),
          startDate.getUTCDate() + week * 7 + day
        ))
        weekDays.push(currentDay)
      }
      weeks.push(weekDays)
    }

    return weeks
  }

  const getAvailableHoursForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return availableHours?.[dateKey] || []
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getUTCDate() === today.getUTCDate() &&
      date.getUTCMonth() === today.getUTCMonth() &&
      date.getUTCFullYear() === today.getUTCFullYear()
    )
  }

  const isSelected = (date: Date, hour?: number) => {
    const dateKey = formatDateKey(date)
    if (hour !== undefined) {
      return selectedDate === dateKey && selectedHour === hour
    }
    return selectedDate === dateKey
  }

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const dateKey = formatDateKey(date)
    onDateTimeSelect(dateKey, hour)
    setSelectedDayPopup(null)
  }

  const handleDayClick = (date: Date) => {
    const hours = getAvailableHoursForDate(date)
    if (hours.length > 0) {
      setSelectedDayPopup(formatDateKey(date))
    }
  }

  const handleMouseEnter = (date: Date, event: React.MouseEvent) => {
    const hours = getAvailableHoursForDate(date)
    if (hours.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoveredPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
      setHoveredDay(formatDateKey(date))
    }
  }

  const navigateWeeks = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(Date.UTC(
        prev.getUTCFullYear(),
        prev.getUTCMonth(),
        prev.getUTCDate() + (direction === "prev" ? -7 : 7)
      ))
      return newDate
    })
  }

  const weeks = getTwoWeeksData()

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "12px",
          backgroundColor: "white",
          overflow: "hidden",
        }}
      >
        {/* Calendar Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          <button
            onClick={() => navigateWeeks("prev")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#212529",
            }}
          >
            {weeks[0][0].toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </h3>

          <button
            onClick={() => navigateWeeks("next")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              color: "#6c757d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          {dayNames.map((day) => (
            <div
              key={day}
              style={{
                padding: "12px 8px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "#6c757d",
                textTransform: "uppercase",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid - 2 weeks */}
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "1px",
              backgroundColor: "#dee2e6",
            }}
          >
            {week.map((date, dayIndex) => {
              const availableHours = getAvailableHoursForDate(date)
              const hasAvailableHours = availableHours.length > 0
              const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <div
                  key={dayIndex}
                  style={{
                    minHeight: "100px",
                    backgroundColor: isSelected(date) ? "#f8f9ff" : "white",
                    padding: "8px 6px",
                    position: "relative",
                    cursor: hasAvailableHours && !isPastDate ? "pointer" : "default",
                    opacity: isPastDate ? 0.5 : 1,
                    border: isSelected(date) ? "2px solid #007bff" : "none",
                  }}
                  onClick={() => !isPastDate && handleDayClick(date)}
                  onMouseEnter={(e) => !isPastDate && handleMouseEnter(date, e)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Day Number */}
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: isToday(date) ? "600" : "500",
                      color: isToday(date) ? "#007bff" : "#212529",
                      marginBottom: "6px",
                      textAlign: "center",
                    }}
                  >
                    {date.getDate()}
                  </div>

                  {/* Available Hours Indicator */}
                  {hasAvailableHours && !isPastDate && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#28a745",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#28a745",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        {availableHours.length} horario{availableHours.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Hover Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: "fixed",
            left: hoveredPosition.x,
            top: hoveredPosition.y,
            transform: "translateX(-50%) translateY(-100%)",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "12px",
            zIndex: 1000,
            maxWidth: "200px",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "8px" }}>Horarios disponibles:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {getAvailableHoursForDate(new Date(hoveredDay)).map((hour) => (
              <span
                key={hour}
                style={{
                  backgroundColor: "#28a745",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                }}
              >
                {hour}:00
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day Selection Popup */}
      {selectedDayPopup && (
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
            zIndex: 2000,
          }}
          onClick={() => setSelectedDayPopup(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            {/* Popup Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#212529",
                }}
              >
                Seleccionar Horario
              </h4>
              <button
                onClick={() => setSelectedDayPopup(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "#6c757d",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Date */}
            <div
              style={{
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#6c757d",
              }}
            >
              {new Date(selectedDayPopup).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>

            {/* Time Slots Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "8px",
              }}
            >
              {getAvailableHoursForDate(new Date(selectedDayPopup)).map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleTimeSlotClick(new Date(selectedDayPopup), hour)}
                  style={{
                    padding: "12px 8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: isSelected(new Date(selectedDayPopup), hour) ? "2px solid #007bff" : "1px solid #dee2e6",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isSelected(new Date(selectedDayPopup), hour) ? "#f8f9ff" : "white",
                    color: isSelected(new Date(selectedDayPopup), hour) ? "#007bff" : "#212529",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected(new Date(selectedDayPopup), hour)) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected(new Date(selectedDayPopup), hour)) {
                      e.currentTarget.style.backgroundColor = "white"
                    }
                  }}
                >
                  {hour}:00
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Time Display */}
      {selectedDate && selectedHour && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px 20px",
            backgroundColor: "#f8f9ff",
            border: "1px solid #007bff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Clock size={16} style={{ color: "#007bff" }} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#007bff",
            }}
          >
            Seleccionado:{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            a las {selectedHour}:00
          </span>
        </div>
      )}
    </div>
  )
}
