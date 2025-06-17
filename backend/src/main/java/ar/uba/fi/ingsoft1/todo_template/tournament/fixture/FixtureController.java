package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchResultDTO;
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
    @Operation(summary = "Generate tournament fixture")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fixture generated successfully"),
            @ApiResponse(responseCode = "403", description = "Only the organizer can generate the fixture"),
            @ApiResponse(responseCode = "404", description = "Tournament not found"),
            @ApiResponse(responseCode = "409", description = "Tournament is still open for registration")
    })
    public ResponseEntity<List<TournamentMatch>> generateFixture(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(fixtureService.generateFixture(tournamentId));
    }

    @GetMapping
    @Operation(summary = "Get tournament fixture")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Fixture retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Tournament not found")
    })
    public ResponseEntity<List<TournamentMatch>> getFixture(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(fixtureService.getFixture(tournamentId));
    }

    @PutMapping("/matches/{matchId}/result")
    @Operation(summary = "Update match result")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Result updated successfully"),
            @ApiResponse(responseCode = "403", description = "Only the organizer can update results"),
            @ApiResponse(responseCode = "404", description = "Match not found"),
            @ApiResponse(responseCode = "409", description = "Match is not in scheduled state")
    })
    public ResponseEntity<TournamentMatch> updateMatchResult(
            @PathVariable Long tournamentId,
            @PathVariable Long matchId,
            @RequestBody MatchResultDTO result) {
        return ResponseEntity.ok(fixtureService.updateMatchResult(matchId, result));
    }
}
