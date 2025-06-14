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

    @DeleteMapping("/{blockedSlotId}")
    @Operation(
            summary = "Eliminar horario bloqueado",
            description = "Elimina un horario bloqueado si pertenece a una cancha del usuario autenticado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Horario bloqueado eliminado exitosamente"),
            @ApiResponse(responseCode = "403", description = "El usuario no es el dueño de la cancha"),
            @ApiResponse(responseCode = "404", description = "Horario bloqueado no encontrado")
    })
    public ResponseEntity<Void> deleteBlockedSlot (
            @Parameter(description = "ID del horario bloqueado") @PathVariable Long blockedSlotId
    ) {
        String user = getAuthenticatedUser().getUsername();
        service.deleteBlockedSlot(blockedSlotId, user);
        return ResponseEntity.noContent().build();
    }
}
