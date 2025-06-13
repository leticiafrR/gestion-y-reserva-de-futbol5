package ar.uba.fi.ingsoft1.todo_template.tournament;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import ar.uba.fi.ingsoft1.todo_template.booking.BookingDTO;
import ar.uba.fi.ingsoft1.todo_template.config.GlobalControllerExceptionHandler.IncorrectValueResponse;

@RestController
@RequestMapping("/tournaments")
@Tag(name = "4 - Torneos", description = "Tournament management by the organizer.")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a tourney", description = "Allows a user to create a tournament")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tourney created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tournament.class))),
            @ApiResponse(responseCode = "400", description = "Required data is missing or inconsistent information were provided. The body is a JSON with dynamic keys corresponding to the form fields, each associated value is a description of the error found.", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "Tourney name already exists", content = @Content(mediaType = "application/json", schema = @Schema(implementation = IncorrectValueResponse.class))),
    })
    public Tournament createTourney(@Valid @RequestBody TournamentCreateDTO dto) {
        return tournamentService.createTournament(dto);
    }

    @DeleteMapping("/{id_tournament}")
    @Operation(summary = "Delete a tournament", description = "Allows a tournament organizer to delete an unstarted tournament from the database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tournament deleted successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "403", description = "User is not the creator of this tournament, unauthorized to delete it.", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Tournament not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "Tournament has already started and cannot be deleted", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteField(@PathVariable Long id_tournament) {
        tournamentService.deleteTournament(id_tournament);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id_tournament}")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Update details of a tournament", description = "Allows updating one or more details of a tournament")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tourney updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tournament.class))),
            @ApiResponse(responseCode = "400", description = "Invalid data or inconsistent tournament state. The body is a JSON with dynamic keys corresponding to the fields with errors.", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "403", description = "User is not the creator of this tournament, unauthorized to delete it.", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "the information provided is conflicting (Tournament already started or Tournament name already exists. Dates and format cannot be modified.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = IncorrectValueResponse.class))),
            @ApiResponse(responseCode = "404", description = "Tournament with given ID not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
    })
    public Tournament updateFieldDetails(
            @PathVariable Long id_tournament,
            @RequestBody TournamentUpdateDTO updateRequest) {
        return tournamentService.updateTournament(id_tournament, updateRequest.toCommands());
    }

    @GetMapping("/all")
    @Operation(summary = "Get all active tournaments", description = "Returns a list of all active tournaments (open for registration and closed)")
    @ApiResponse(responseCode = "200", description = "List of all tournaments", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class)))
    @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    @ApiResponse(responseCode = "404", description = "No tournament found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    public ResponseEntity<List<TournamentSummaryDTO>> getAlltTournaments() {
        List<TournamentSummaryDTO> allTournaments = tournamentService.getAllTournaments();
        if (allTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active tournaments found");
        }
        return ResponseEntity.ok(allTournaments);
    }

    @GetMapping("/all/open_to_registration")
    @Operation(summary = "Get all active tournaments", description = "Returns a list of all active tournaments")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of active tournaments", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "No active tournaments found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsOpenForRegistration() {
        List<TournamentSummaryDTO> activeTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.OPEN_TO_REGISTER);
        if (activeTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active tournaments found");
        }
        return ResponseEntity.ok(activeTournaments);
    }

    @GetMapping("/all/finished")
    @Operation(summary = "Get all active tournaments", description = "Returns a list of all active tournaments")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of active tournaments", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "No active tournaments found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsFinished() {
        List<TournamentSummaryDTO> activeTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.FINISHED);
        if (activeTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active tournaments found");
        }
        return ResponseEntity.ok(activeTournaments);
    }

    @GetMapping("/all/in_progress")
    @Operation(summary = "Get all active tournaments", description = "Returns a list of all active tournaments")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of active tournaments", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "No active tournaments found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsInProgress() {
        List<TournamentSummaryDTO> activeTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.IN_PROGRESS);
        if (activeTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No active tournaments found");
        }
        return ResponseEntity.ok(activeTournaments);
    }

}
