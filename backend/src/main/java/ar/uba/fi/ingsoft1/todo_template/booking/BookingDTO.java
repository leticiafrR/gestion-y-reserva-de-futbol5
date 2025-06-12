package ar.uba.fi.ingsoft1.todo_template.booking;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record BookingDTO(
        @NotNull Long id,
        @NotNull Long userId,
        @NotNull Long timeSlotId,
        @NotNull LocalDate bookingDate,
        @NotNull int bookingHour,
        boolean active
) {}
