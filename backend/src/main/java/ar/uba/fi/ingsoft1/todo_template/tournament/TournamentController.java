package ar.uba.fi.ingsoft1.todo_template.tournament;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tournament", description = "Allows a tournament organizer to delete an unstarted tournament from the database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tournament deleted successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "403", description = "User is not the creator of this tournament, unauthorized to delete it.", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Tournament not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "409", description = "Tournament has already started and cannot be deleted", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class)))
    })
    public ResponseEntity<Void> deleteField(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
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
            @PathVariable Long id,
            @RequestBody TournamentUpdateDTO updateRequest) {
        return tournamentService.updateTournament(id, updateRequest);
    }

}
