package ar.uba.fi.ingsoft1.todo_template.blockedslot;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/blockedslots")
@RequiredArgsConstructor
@Tag(name = "3 - Horarios Bloqueados", description = "Gestión de bloqueos de horarios por parte de dueños de canchas")
public class BlockedSlotController {

    private final BlockedSlotService service;

    private JwtUserDetails getAuthenticatedUser() {
        return (JwtUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/fields/{fieldId}")
    @Operation(
            summary = "Bloquear horario",
            description = "Permite al dueño de la cancha bloquear una hora específica en una fecha para evitar reservas."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Horario bloqueado exitosamente"),
            @ApiResponse(responseCode = "403", description = "El usuario no es el dueño de la cancha"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada"),
            @ApiResponse(responseCode = "409", description = "Ese horario ya está bloqueado")
    })
    public ResponseEntity<String> setBlockedSlot(
            @Parameter(description = "ID de la cancha") @PathVariable Long fieldId,
            @Parameter(description = "Fecha a bloquear (yyyy-MM-dd)") @RequestParam LocalDate date,
            @Parameter(description = "Hora a bloquear (entero en 24h)") @RequestParam Integer hour
    ) {
        String user = getAuthenticatedUser().getUsername();
        service.setBlockedSlot(fieldId, date, hour, user);
        return ResponseEntity.ok("Horario bloqueado exitosamente");
    }

    @DeleteMapping("/fields/{fieldId}")
    @Operation(
            summary = "Eliminar horario bloqueado",
            description = "Elimina un horario bloqueado para una cancha y hora específica si pertenece al usuario autenticado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Horario bloqueado eliminado exitosamente"),
            @ApiResponse(responseCode = "403", description = "El usuario no es el dueño de la cancha"),
            @ApiResponse(responseCode = "404", description = "Horario bloqueado no encontrado")
    })
    public ResponseEntity<Void> eliminarHorarioBloqueado(
            @Parameter(description = "ID de la cancha") @PathVariable Long fieldId,
            @Parameter(description = "Fecha del horario a eliminar") @RequestParam LocalDate date,
            @Parameter(description = "Hora del horario a eliminar") @RequestParam Integer hour
    ) {
        String user = getAuthenticatedUser().getUsername();
        service.deleteBlockedSlot(fieldId, date, hour, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/fields/{fieldId}")
    @Operation(
            summary = "Listar horarios bloqueados",
            description = "Devuelve todos los horarios bloqueados de una cancha en una fecha específica, solo accesible por su dueño."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de horarios bloqueados devuelta exitosamente"),
            @ApiResponse(responseCode = "403", description = "El usuario no es el dueño de la cancha"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada")
    })
    public ResponseEntity<List<Integer>> listAllBlockedSlotsForFieldAndDate(
            @Parameter(description = "ID de la cancha") @PathVariable Long fieldId,
            @Parameter(description = "Fecha a consultar") @RequestParam LocalDate date
    ) {
        String user = getAuthenticatedUser().getUsername();
        List<Integer> horasBloqueadas = service.listBlockedSlotsForFieldAndDate(fieldId, date, user);
        return ResponseEntity.ok(horasBloqueadas);
    }

    @GetMapping("/fields/{fieldId}/all")
    @Operation(
            summary = "Listar todos los horarios bloqueados de una cancha",
            description = "Devuelve todos los horarios bloqueados de una cancha sin importar la fecha. Solo accesible por su dueño."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista completa de horarios bloqueados obtenida exitosamente"),
            @ApiResponse(responseCode = "403", description = "El usuario no es el dueño de la cancha"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada")
    })
    public ResponseEntity<List<BlockedSlot>> listAllBlockedSlots(
            @Parameter(description = "ID de la cancha") @PathVariable Long fieldId
    ) {
        String user = getAuthenticatedUser().getUsername();
        List<BlockedSlot> bloqueos = service.listAllBlockedSlotsForField(fieldId, user);
        return ResponseEntity.ok(bloqueos);
    }



}
