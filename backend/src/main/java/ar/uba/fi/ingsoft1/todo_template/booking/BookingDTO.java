package ar.uba.fi.ingsoft1.todo_template.booking;

import jakarta.validation.constraints.NotNull;

public record BookingDTO(
        Long id,
        @NotNull Long userId,
        @NotNull Long timeSlotId,
        boolean active
) {}
