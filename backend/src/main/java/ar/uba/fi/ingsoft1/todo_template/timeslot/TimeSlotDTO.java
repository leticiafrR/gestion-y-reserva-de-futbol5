package ar.uba.fi.ingsoft1.todo_template.timeslot;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.DayOfWeek;

public record TimeSlotDTO(

        DayOfWeek dayOfWeek,

        @Min(0) @Max(23)
        int openTime,

        @Min(1) @Max(24)
        int closeTime
) {
}
