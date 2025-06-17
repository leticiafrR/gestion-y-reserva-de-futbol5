package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/matches")
@Tag(name = "5 - Partidos", description = "Organización y gestión de partidos abiertos y cerrados")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/open")
    @Operation(summary = "Crear partido abierto", description = "Permite crear un partido abierto al que otros usuarios se puedan unir")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido abierto creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<OpenMatch> createOpenMatch(
            @Valid @RequestBody OpenMatchCreateDTO dto) {
        String username = getAuthenticatedUser().username();
        return ResponseEntity.ok(matchService.createOpenMatch(dto, username));
    }

    @PostMapping("/open/{matchId}/join")
    @Operation(summary = "Unirse a partido abierto", description = "Permite a un usuario unirse a un partido abierto existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario unido al partido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> joinOpenMatch(
            @Parameter(description = "ID del partido abierto") @PathVariable Long matchId) {
        String username = getAuthenticatedUser().username();
        return ResponseEntity.ok(matchService.joinOpenMatch(matchId, username));
    }

    @DeleteMapping("/open/{matchId}/leave")
    @Operation(summary = "Darse de baja de un partido abierto", description = "Permite a un usuario abandonar un partido abierto en el que estaba inscripto.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario eliminado del partido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> leaveOpenMatch(
            @Parameter(description = "ID del partido abierto") @PathVariable Long matchId) {
        String username = getAuthenticatedUser().username();
        return ResponseEntity.ok(matchService.leaveOpenMatch(matchId, username));
    }

    @PostMapping("/close")
    @Operation(summary = "Crear partido cerrado", description = "Crea un partido cerrado entre dos equipos predefinidos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido cerrado creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public ResponseEntity<CloseMatch> createCloseMatch(@RequestBody CloseMatchCreateDTO dto) {
        return ResponseEntity.ok(matchService.createCloseMatch(dto));
    }

    @GetMapping("/open")
    @Operation(summary = "Listar partidos abiertos", description = "Obtiene todos los partidos abiertos activos")
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    public ResponseEntity<List<OpenMatch>> getAllOpenMatches() {
        return ResponseEntity.ok(matchService.listActiveOpenMatches());
    }

    @GetMapping("/open/{id}")
    @Operation(summary = "Obtener partido abierto", description = "Devuelve los datos de un partido abierto por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido abierto encontrado"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> getOpenMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getOpenMatch(id));
    }

    @GetMapping("/close")
    @Operation(summary = "Listar partidos cerrados", description = "Obtiene todos los partidos cerrados activos")
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    public ResponseEntity<List<CloseMatch>> getAllCloseMatches() {
        return ResponseEntity.ok(matchService.listActiveCloseMatches());
    }

    @GetMapping("/close/{id}")
    @Operation(summary = "Obtener partido cerrado", description = "Devuelve los datos de un partido cerrado por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido cerrado encontrado"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<CloseMatch> getCloseMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getCloseMatch(id));
    }

    @GetMapping("/close/teams/{teamOneId}/{teamTwoId}")
    @Operation(summary = "Buscar partidos cerrados entre dos equipos", description = "Devuelve los partidos cerrados que enfrentaron a los dos equipos dados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partidos encontrados"),
            @ApiResponse(responseCode = "404", description = "No se encontraron partidos entre los equipos especificados")
    })
    public ResponseEntity<List<CloseMatch>> getCloseMatchesByTeams(
            @Parameter(description = "ID del primer equipo") @PathVariable Long teamOneId,
            @Parameter(description = "ID del segundo equipo") @PathVariable Long teamTwoId) {
        List<CloseMatch> matches = matchService.getCloseMatchesByTeams(teamOneId, teamTwoId);
        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontraron partidos cerrados para los equipos especificados");
        }
        return ResponseEntity.ok(matches);
    }

    @PostMapping("/{id}/assign/age")
    @Operation(summary = "Asignar equipos por edad", description = "Asigna equipos automáticamente en un partido abierto usando criterios de edad")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> assignByAge(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.assignTeams(id, "age", Collections.emptyMap()));
    }

    @PostMapping("/{id}/assign/random")
    @Operation(summary = "Asignar equipos aleatoriamente", description = "Asigna equipos aleatoriamente en un partido abierto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> assignRandom(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.assignTeams(id, "random", Collections.emptyMap()));
    }

    @PostMapping("/{id}/assign/manual")
    @Operation(summary = "Asignar equipos manualmente", description = "Permite al usuario asignar equipos manualmente en un partido abierto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "400", description = "Asignaciones inválidas"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public ResponseEntity<OpenMatch> assignManual(
            @Parameter(description = "ID del partido abierto") @PathVariable Long id,
            @Parameter(description = "Mapa con asignaciones: clave = ID de usuario, valor = equipo (1 o 2)")
            @RequestBody Map<Long, Integer> manualAssignments) {
        return ResponseEntity.ok(matchService.assignTeams(id, "manual", manualAssignments));
    }

    private JwtUserDetails getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (JwtUserDetails) authentication.getPrincipal();
    }
}
