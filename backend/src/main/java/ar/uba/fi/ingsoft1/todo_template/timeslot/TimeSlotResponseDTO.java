package ar.uba.fi.ingsoft1.todo_template.timeslot;

import java.time.DayOfWeek;

public record TimeSlotResponseDTO(
        Long id,
        DayOfWeek dayOfWeek,
        int openTime,
        int closeTime,
        Long fieldId
) {
    public static TimeSlotResponseDTO from(TimeSlot slot) {
        return new TimeSlotResponseDTO(
                slot.getId(),
                slot.getDayOfWeek(),
                slot.getOpenTime(),
                slot.getCloseTime(),
                slot.getField().getId()
        );
    }
}
