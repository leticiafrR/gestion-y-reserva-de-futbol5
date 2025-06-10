package ar.uba.fi.ingsoft1.todo_template.field;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
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

import java.util.List;

@RestController
@RequestMapping("/fields")
@Tag(name = "2 - Canchas", description = "Gestión de canchas por parte de administradores")
public class FieldController {

    private final FieldService fieldService;


    public FieldController(FieldService fieldService) {
        this.fieldService = fieldService;
    }

    @PostMapping
    @Operation(summary = "Crear cancha", description = "Permite a un usuario crear una cancha asociada a su cuenta")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o cancha duplicada", content = @Content)
    })
    public ResponseEntity<Field> createField(
            @Parameter(description = "Datos de la cancha") @Valid @RequestBody FieldCreateDTO dto) {
        String username = getAuthenticatedUser().username();
        Field field = fieldService.createField(dto, username);
        return ResponseEntity.ok(field);
    }

    @GetMapping("/own")
    @Operation(summary = "Listar canchas propias", description = "Obtiene todas las canchas asociadas al usuario actual")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de canchas obtenido exitosamente")
    })
    public ResponseEntity<List<Field>> listMyFields() {
        String username = getAuthenticatedUser().username();
        List<Field> fields = fieldService.getFieldsOf(username);
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
        String username = getAuthenticatedUser().username();
        return ResponseEntity.ok(fieldService.updateField(id, dto, username));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cancha (borrado real)", description = "Elimina completamente una cancha de la base de datos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cancha eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario")
    })
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        String username = getAuthenticatedUser().username();
        fieldService.deleteField(id, username);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/{active}")
    @Operation(summary = "Activar /desactivar cancha", description = "Marca la cancha como activa nuevamente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancha activada correctamente"),
            @ApiResponse(responseCode = "404", description = "Cancha no encontrada o no pertenece al usuario")
    })
    public ResponseEntity<Field> setStatusField(@PathVariable Long id, @PathVariable boolean active) {
        String username = getAuthenticatedUser().username();
        Field updated = fieldService.setFieldActiveStatus(id, username, active);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todas las canchas activas", description = "Devuelve las canchas disponibles para cualquier usuario")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de canchas activas")
    })
    public ResponseEntity<List<Field>> listAllActiveFields() {
        List<Field> activeFields = fieldService.getAllActiveFields();
        return ResponseEntity.ok(activeFields);
    }


    private JwtUserDetails getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (JwtUserDetails) authentication.getPrincipal();
    }
}