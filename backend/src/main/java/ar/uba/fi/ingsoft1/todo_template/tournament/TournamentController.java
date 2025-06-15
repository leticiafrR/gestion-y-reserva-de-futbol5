package ar.uba.fi.ingsoft1.todo_template.tournament;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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

    @PostMapping("/register_team/{team_id}/{tournament_id}")
    @Operation(summary = "Register a team into a tournament", description = "Registers the given team into the specified tournament. Only the team's captain can perform this action. The tournament must still be open and have free slots.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Team registered successfully into the tournament"),
            @ApiResponse(responseCode = "400", description = "Missing or inconsistent data provided", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "403", description = "User is not the captain of the team", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Team or tournament not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "Team already registered or tournament is full", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
    })
    public ResponseEntity<Void> registerTeamIntoTournament(
            @PathVariable Long team_id,
            @PathVariable Long tournament_id) {
        tournamentService.regist_team_into_tournament(team_id, tournament_id);
        return ResponseEntity.ok().build();
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
        return ResponseEntity.ok(allTournaments);
    }

    @GetMapping("/all/open_to_registration")
    @Operation(summary = "Retrieve all tournaments currently open for registration", description = "Returns a list of tournament summaries for tournaments that are currently accepting registrations. If no such tournaments exist, returns 404 Not Found.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of tournaments open for registration", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TournamentSummaryDTO.class)))),
            @ApiResponse(responseCode = "404", description = "No tournaments currently open for registration were found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsOpenForRegistration() {
        List<TournamentSummaryDTO> activeTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.OPEN_TO_REGISTER);
        if (activeTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No tournaments currently open for registration found");
        }
        return ResponseEntity.ok(activeTournaments);
    }

    @GetMapping("/all/finished")
    @Operation(summary = "Retrieve all finished tournaments", description = "Returns a list of tournament summaries for tournaments that have finished. If no finished tournaments exist, returns 404 Not Found.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of finished tournaments", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TournamentSummaryDTO.class)))),
            @ApiResponse(responseCode = "404", description = "No finished tournaments were found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsFinished() {
        List<TournamentSummaryDTO> finishedTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.FINISHED);
        if (finishedTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No finished tournaments found");
        }
        return ResponseEntity.ok(finishedTournaments);
    }

    @GetMapping("/all/in_progress")
    @Operation(summary = "Retrieve all tournaments currently in progress", description = "Returns a list of tournament summaries for tournaments that are currently ongoing but not open for registration.If no tournaments are in progress, returns 404 Not Found.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of tournaments in progress", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = TournamentSummaryDTO.class)))),
            @ApiResponse(responseCode = "404", description = "No tournaments currently in progress were found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getAllTournamentsInProgress() {
        List<TournamentSummaryDTO> inProgressTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.IN_PROGRESS);
        if (inProgressTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No tournaments currently in progress found");
        }
        return ResponseEntity.ok(inProgressTournaments);
    }

    @GetMapping("/all/closed_registration")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tournaments found successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "No tournaments found in this state", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    })
    @Operation(summary = "Get tournaments that have closed registration but have not started yet (not in progress)", description = "Returns a list of tournaments where registration is already closed and the tournament has not yet started.")
    public ResponseEntity<List<TournamentSummaryDTO>> getTournamentsClosedRegistrationNotStarted() {
        List<TournamentSummaryDTO> inProgressTournaments = tournamentService
                .getFilteredByStateTournaments(TournamentState.CLOSE_TO_REGISTER_NOT_STARTED);
        if (inProgressTournaments.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No tournaments currently in progress found");
        }
        return ResponseEntity.ok(inProgressTournaments);
    }

    @GetMapping("/search/{name}")
    @ApiResponse(responseCode = "404", description = "No tournament found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    @ApiResponse(responseCode = "200", description = "Tournament found successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Tournament.class)))
    @Operation(summary = "Get the details of the tournament specified by the name", description = "Returns a list of all active tournaments")
    public ResponseEntity<Tournament> getTournamentSummaryByName(@PathVariable String name) {
        return ResponseEntity.ok(tournamentService.getTournamentByName(name));
    }

    @PatchMapping("/{id_tournament}/close_registration")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Update details of a tournament", description = "Allows updating one or more details of a tournament")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Registrations closed successfully for tournament", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = Tournament.class))),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "403", description = "User is not the creator of this tournament, unauthorized to delete it.", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "the information provided is conflicting (Tournament already started)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = IncorrectValueResponse.class))),
            @ApiResponse(responseCode = "404", description = "Tournament with given ID not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
    })
    public ResponseEntity<String> closeRegistrationsTournament(
            @PathVariable Long id_tournament) {
        tournamentService.closeRegistration(id_tournament);
        return ResponseEntity.ok("Registrations closed successfully for tournament with ID: " + id_tournament);
    }

    @GetMapping("/organizer")
    @Operation(summary = "Get tournaments by organizer", description = "Returns a list of all tournaments created by the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of tournaments created by the user", content = @Content(mediaType = "application/json", schema = @Schema(implementation = TournamentSummaryDTO.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(mediaType = "text/plain"))
    })
    public ResponseEntity<List<TournamentSummaryDTO>> getTournamentsByOrganizer() {
        List<TournamentSummaryDTO> tournaments = tournamentService.getTournamentsByOrganizer();
        return ResponseEntity.ok(tournaments);
    }

    @GetMapping("/{id}/teams")
    @Operation(summary = "Get tournament teams with statistics", description = "Returns all teams registered in the tournament with their current statistics")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tournament teams retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Tournament not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<List<TeamRegisteredTournament>> getTournamentTeams(@PathVariable Long id) {
        List<TeamRegisteredTournament> teams = tournamentService.getTournamentTeams(id);
        return ResponseEntity.ok(teams);
    }

    @GetMapping("/{id}/standings")
    @Operation(summary = "Get tournament standings", description = "Returns tournament standings sorted by points and other criteria")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tournament standings retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Tournament not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<List<TeamRegisteredTournament>> getTournamentStandings(@PathVariable Long id) {
        List<TeamRegisteredTournament> standings = tournamentService.getTournamentStandings(id);
        return ResponseEntity.ok(standings);
    }

}
