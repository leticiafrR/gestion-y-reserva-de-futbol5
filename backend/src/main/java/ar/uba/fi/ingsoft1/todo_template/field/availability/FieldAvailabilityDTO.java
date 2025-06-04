package ar.uba.fi.ingsoft1.todo_template.field.availability;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record FieldAvailabilityDTO(

        @Schema(description = "Día de la semana", example = "MONDAY")
        DayOfWeek dayOfWeek,

        @Schema(description = "Hora de apertura", example = "10:00")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
        LocalTime openTime,

        @Schema(description = "Hora de cierre", example = "18:00")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
        LocalTime closeTime

) {}
