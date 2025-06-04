package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.field.availability.FieldAvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ar.uba.fi.ingsoft1.todo_template.field.availability.FieldAvailabilityDTO;


import java.util.List;

@RestController
@RequestMapping("/fields")
@Tag(name = "2 - Canchas", description = "Gestión de canchas por parte de administradores")
public class FieldController {

    private final FieldService fieldService;
    private final FieldAvailabilityService availabilityService;

    public FieldController(FieldService fieldService, FieldAvailabilityService availabilityService) {
        this.fieldService = fieldService;
        this.availabilityService = availabilityService;
    }

    @PostMapping
    @Operation(summary = "Crear cancha", description = "Permite a un usuario crear una cancha asociada a su cuenta")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o cancha duplicada", content = @Content)
    })
    public ResponseEntity<Field> createField(
            @Parameter(description = "Datos de la cancha") @Valid @RequestBody FieldCreateDTO dto) {
        String username = getAuthenticatedUsername();
        Field field = fieldService.createField(dto, username);
        return ResponseEntity.ok(field);
    }

    @GetMapping("/mine")
    @Operation(summary = "Listar canchas propias", description = "Obtiene todas las canchas asociadas al usuario actual")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de canchas obtenido exitosamente")
    })
    public ResponseEntity<List<FieldDTO>> listMyFields() {
        String username = getAuthenticatedUsername();
        List<FieldDTO> fields = fieldService.getFieldsOf(username)
                .stream()
                .map(FieldDTO::from)
                .toList();
        return ResponseEntity.ok(fields);
    }


    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cancha", description = "Actualiza los datos de una cancha que pertenece al usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha actualizada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<Field> updateField(
            @Parameter(description = "ID de la cancha") @PathVariable Long id,
            @Valid @RequestBody FieldUpdateDTO dto) {
        String username = getAuthenticatedUsername();
        return ResponseEntity.ok(fieldService.updateField(id, dto, username));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cancha (borrado real)", description = "Elimina completamente una cancha de la base de datos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cancha eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario")
    })
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        String username = getAuthenticatedUsername();
        fieldService.deleteField(id, username);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desactivar cancha", description = "Marca la cancha como inactiva")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha desactivada correctamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario")
    })
    public ResponseEntity<Field> deactivateField(@PathVariable Long id) {
        String username = getAuthenticatedUsername();
        Field updated = fieldService.setFieldActiveStatus(id, username, false);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activar cancha", description = "Marca la cancha como activa nuevamente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha activada correctamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario")
    })
    public ResponseEntity<Field> activateField(@PathVariable Long id) {
        String username = getAuthenticatedUsername();
        Field updated = fieldService.setFieldActiveStatus(id, username, true);
        return ResponseEntity.ok(updated);
    }


    @PostMapping("/{fieldId}/availability")
    @Operation(summary = "Configurar disponibilidad", description = "Define los horarios disponibles semanales para la cancha")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Disponibilidad guardada correctamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada")
    })
    public ResponseEntity<Void> setAvailability(
            @PathVariable Long fieldId,
            @RequestBody List<@Valid FieldAvailabilityDTO> slots) {
        availabilityService.setAvailability(fieldId, slots);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todas las canchas activas", description = "Devuelve las canchas disponibles para cualquier usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de canchas activas")
    })
    public ResponseEntity<List<FieldDTO>> listAllActiveFields() {
        List<FieldDTO> activeFields = fieldService.getAllActiveFields()
                .stream()
                .map(FieldDTO::from)
                .toList();
        return ResponseEntity.ok(activeFields);
    }



    @GetMapping("/{fieldId}/availability")
    @Operation(summary = "Ver disponibilidad", description = "Obtiene los horarios disponibles configurados para la cancha")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Disponibilidad obtenida correctamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada")
    })
    public ResponseEntity<List<FieldAvailabilityDTO>> getAvailability(@PathVariable Long fieldId) {
        return ResponseEntity.ok(availabilityService.getAvailability(fieldId));
    }

    private String getAuthenticatedUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
