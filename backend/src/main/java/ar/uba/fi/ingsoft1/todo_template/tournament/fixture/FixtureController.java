package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tournaments/{tournamentId}/fixture")
@RequiredArgsConstructor
@Tag(name = "Fixture", description = "Fixture management endpoints")
public class FixtureController {
    private final FixtureService fixtureService;

    @PostMapping("/generate")
    @Operation(
            summary = "Generar el fixture del torneo",
            description = "Permite al organizador generar automáticamente el fixture del torneo, asignando los enfrentamientos, fechas, horarios y canchas según el formato seleccionado. Solo el organizador puede ejecutar esta acción y solo si las inscripciones están cerradas."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fixture generado exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el organizador puede generar el fixture"),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado"),
            @ApiResponse(responseCode = "409", description = "El torneo aún está abierto a inscripciones")
    })
    public ResponseEntity<List<TournamentMatch>> generateFixture(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(fixtureService.generateFixture(tournamentId));
    }

    @GetMapping
    @Operation(
            summary = "Obtener el fixture completo del torneo",
            description = "Devuelve la lista de todos los partidos del torneo, incluyendo equipos, fechas, horarios, canchas y estado de cada partido. Permite visualizar el avance de las rondas y los resultados en tiempo real."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fixture obtenido exitosamente"),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado")
    })
    public ResponseEntity<List<TournamentMatch>> getFixture(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(fixtureService.getFixture(tournamentId));
    }

    @PutMapping("/matches/{matchId}/result")
    @Operation(
            summary = "Registrar o actualizar el resultado de un partido",
            description = "Permite al organizador ingresar o modificar el resultado de un partido del torneo. El sistema actualizará automáticamente las posiciones y el avance de rondas según corresponda."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resultado actualizado exitosamente"),
            @ApiResponse(responseCode = "403", description = "Solo el organizador puede actualizar resultados"),
            @ApiResponse(responseCode = "404", description = "Partido no encontrado"),
            @ApiResponse(responseCode = "409", description = "El partido no está en estado programado")
    })
    public ResponseEntity<TournamentMatch> updateMatchResult(
            @PathVariable Long tournamentId,
            @PathVariable Long matchId,
            @RequestBody MatchResultDTO result) {
        return ResponseEntity.ok(fixtureService.updateMatchResult(matchId, result));
    }

    @GetMapping("/statistics")
    @Operation(
            summary = "Obtener estadísticas básicas del torneo",
            description = "Devuelve un resumen estadístico del torneo, incluyendo campeón, subcampeón, equipo más goleador, equipo menos goleado, total de goles, promedio de goles por partido y otros datos relevantes."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas del torneo obtenidas exitosamente", content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json", schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = TournamentStatisticsDTO.class))),
            @ApiResponse(responseCode = "404", description = "Torneo no encontrado")
    })
    public ResponseEntity<TournamentStatisticsDTO> getTournamentStatistics(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(fixtureService.getTournamentStatisticsDTO(tournamentId));
    }
}