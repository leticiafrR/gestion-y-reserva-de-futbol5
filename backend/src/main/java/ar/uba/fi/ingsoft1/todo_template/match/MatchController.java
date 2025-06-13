package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

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
    public OpenMatch createOpenMatch(@RequestBody OpenMatchCreateDTO dto) {
        return matchService.createOpenMatch(dto);
    }

    @PostMapping("/open/{matchId}/join")
    @Operation(summary = "Unirse a partido abierto", description = "Permite a un usuario unirse a un partido abierto existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario unido al partido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public OpenMatch joinOpenMatch(
            @Parameter(description = "ID del partido abierto") @PathVariable Long matchId,
            @Parameter(description = "ID del usuario que se quiere unir") @RequestParam Long userId) {
        return matchService.joinOpenMatch(matchId, userId);
    }

    @PostMapping("/close")
    @Operation(summary = "Crear partido cerrado", description = "Crea un partido cerrado entre dos equipos predefinidos")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido cerrado creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    public CloseMatch createCloseMatch(@RequestBody CloseMatchCreateDTO dto) {
        return matchService.createCloseMatch(dto);
    }

    @GetMapping("/open")
    @Operation(summary = "Listar partidos abiertos", description = "Obtiene todos los partidos abiertos activos")
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    public List<OpenMatch> getAllOpenMatches() {
        return matchService.listActiveOpenMatches();
    }

    @GetMapping("/open/{id}")
    @Operation(summary = "Obtener partido abierto", description = "Devuelve los datos de un partido abierto por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido abierto encontrado"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public OpenMatch getOpenMatch(@PathVariable Long id) {
        return matchService.getOpenMatch(id);
    }

    @GetMapping("/close")
    @Operation(summary = "Listar partidos cerrados", description = "Obtiene todos los partidos cerrados activos")
    @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente")
    public List<CloseMatch> getAllCloseMatches() {
        return matchService.listActiveCloseMatches();
    }

    @GetMapping("/close/{id}")
    @Operation(summary = "Obtener partido cerrado", description = "Devuelve los datos de un partido cerrado por su ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partido cerrado encontrado"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public CloseMatch getCloseMatch(@PathVariable Long id) {
        return matchService.getCloseMatch(id);
    }

    @GetMapping("/close/teams/{teamOneId}/{teamTwoId}")
    @Operation(summary = "Buscar partidos cerrados entre dos equipos", description = "Devuelve los partidos cerrados que enfrentaron a los dos equipos dados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Partidos encontrados"),
            @ApiResponse(responseCode = "404", description = "No se encontraron partidos entre los equipos especificados")
    })
    public List<CloseMatch> getCloseMatchesByTeams(
            @Parameter(description = "ID del primer equipo") @PathVariable Long teamOneId,
            @Parameter(description = "ID del segundo equipo") @PathVariable Long teamTwoId) {
        List<CloseMatch> matches = matchService.getCloseMatchesByTeams(teamOneId, teamTwoId);
        if (matches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No se encontraron partidos cerrados para los equipos especificados");
        }
        return matches;
    }

    @PostMapping("/{id}/assign/age")
    @Operation(summary = "Asignar equipos por edad", description = "Asigna equipos automáticamente en un partido abierto usando criterios de edad")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public OpenMatch assignByAge(@PathVariable Long id) {
        return matchService.assignTeams(id, "age", Collections.emptyMap());
    }

    @PostMapping("/{id}/assign/random")
    @Operation(summary = "Asignar equipos aleatoriamente", description = "Asigna equipos aleatoriamente en un partido abierto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public OpenMatch assignRandom(@PathVariable Long id) {
        return matchService.assignTeams(id, "random", Collections.emptyMap());
    }

    @PostMapping("/{id}/assign/manual")
    @Operation(summary = "Asignar equipos manualmente", description = "Permite al usuario asignar equipos manualmente en un partido abierto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Equipos asignados correctamente"),
            @ApiResponse(responseCode = "400", description = "Asignaciones inválidas"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado")
    })
    public OpenMatch assignManual(
            @Parameter(description = "ID del partido abierto") @PathVariable Long id,
            @Parameter(description = "Mapa con asignaciones: clave = ID de usuario, valor = equipo (1 o 2)")
            @RequestBody Map<Long, Integer> manualAssignments) {
        return matchService.assignTeams(id, "manual", manualAssignments);
    }
}
