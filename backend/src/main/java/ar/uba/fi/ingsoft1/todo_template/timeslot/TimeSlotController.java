package ar.uba.fi.ingsoft1.todo_template.timeslot;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/timeslots")
@Tag(name = "3 - TimeSlots", description = "Gestión de franjas horarias")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }


    @GetMapping("/field/{fieldId}")
    @Operation(summary = "Listar dias y horarios de servicio de una cancha")
    public ResponseEntity<List<TimeSlotResponseDTO>> listTimeSlotsByField(@PathVariable Long fieldId) {
        List<TimeSlotResponseDTO> dtos = timeSlotService.getTimeSlotsByField(fieldId).stream()
                .map(TimeSlotResponseDTO::from)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/field/{fieldId}/{dayOfWeek}")
    @Operation(summary = "Listar horarios de servicio de una cancha para un día de semana específico")
    public ResponseEntity<TimeSlot> getSlotForDay(
            @PathVariable Long fieldId,
            @PathVariable DayOfWeek dayOfWeek
    ) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotByFieldAndDay(fieldId, dayOfWeek));
    }

    @PutMapping("/field/{fieldId}")
    @Operation(summary = "Reemplazar todos los dias y horarios de servicio de una cancha")
    public ResponseEntity<Void> replaceWeeklySlots(
            @PathVariable Long fieldId,
            @RequestBody @Valid List<TimeSlotDTO> timeSlots
    ) {
        timeSlotService.replaceAllTimeSlots(fieldId, timeSlots);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/field/{fieldId}/{dayOfWeek}")
    @Operation(summary = "Reemplazar los horarios de servicio de un día específico sin pisar el resto")
    public ResponseEntity<Void> updateDaySlots(
            @PathVariable Long fieldId,
            @PathVariable DayOfWeek dayOfWeek,
            @RequestBody @Valid TimeSlotDTO timeslot
    ) {
        timeSlotService.replaceDayTimeSlot(fieldId, dayOfWeek, timeslot);
        return ResponseEntity.ok().build();
    }


}
