package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
@Tag(name = "3 - Equipos", description = "Gestión de equipos por parte de jugadores")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "Listar equipos", description = "Devuelve todos los equipos del sistema")
    @ApiResponse(responseCode = "200", description = "Equipos listados correctamente")
    public ResponseEntity<List<TeamDetailsDTO>> getAllTeams() {
        return ResponseEntity.ok(TeamDetailsDTO.toTeamDetailsDTOS(teamService.getAllTeams()));
    }

    @PostMapping
    @Operation(summary = "Crear equipo", description = "Permite crear un nuevo equipo con el usuario autenticado como capitán")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Equipo creado exitosamente"),
            @ApiResponse(responseCode = "409", description = "Ya existe un equipo con ese nombre", content = @Content),
            @ApiResponse(responseCode = "401", description = "Token inválido", content = @Content)
    })
    public ResponseEntity<TeamDetailsDTO> createTeam(@Valid @RequestBody TeamCreateDTO dto) {
        return ResponseEntity.status(201).body(TeamDetailsDTO.toTeamDetailsDTO(teamService.createTeam(dto)));
    }
    @PatchMapping("/{id}")
    @Operation(summary = "Actualizar equipo", description = "Permite modificar los colores o logo de un equipo. Solo el capitán puede hacerlo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Equipo actualizado exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el capitán puede modificar el equipo"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    })
    public ResponseEntity<TeamDetailsDTO> updateTeam(
            @Parameter(description = "ID del equipo") @PathVariable Long id,
            @Valid @RequestBody TeamUpdateDTO dto
    ) {
        return teamService.updateTeam(id, dto)
                .map(TeamDetailsDTO::toTeamDetailsDTO)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar equipo", description = "Elimina un equipo. Solo puede hacerlo el capitán.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Equipo eliminado exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el capitán puede eliminar el equipo"),
            @ApiResponse(responseCode = "404", description = "Equipo no encontrado")
    })
    public ResponseEntity<Void> deleteTeam(@Parameter(description = "ID del equipo") @PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    //metodo para listar a los equipos en los que está un usuario
    @GetMapping("/myParticipations")
    @Operation(summary = "Listar equipos de un usuario", description = "Devuelve los equipos en los que el usuario participa")
    @ApiResponse(responseCode = "200", description = "Equipos listados correctamente")
    public ResponseEntity<List<TeamDetailsDTO>> getUsersTeams(){
        return ResponseEntity.ok(TeamDetailsDTO.toTeamDetailsDTOS(teamService.getUsersTeams()));
    }

}
