package ar.uba.fi.ingsoft1.todo_template.team;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
@Tag(name = "3 - Teams", description = "Team management by players")
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    @Operation(summary = "List Teams", description = "Returns all the teams registered in the system")
    @ApiResponse(responseCode = "200", description = "Correctly listed equipment")
    public ResponseEntity<List<TeamDetailsDTO>> getAllTeams() {
        return ResponseEntity.ok(TeamDetailsDTO.fromTeamList(teamService.getAllTeams()));
    }

    @PostMapping
    @Operation(summary = "Create team", description = "Allows the authenticated user to create a new team and be its captain.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Team created successfully"),
            @ApiResponse(responseCode = "409", description = "Conflict: A team with that name already exists.", content = @Content),
            @ApiResponse(responseCode = "401", description = "Invalid Token", content = @Content)
    })
    public ResponseEntity<TeamDetailsDTO> createTeam(@Valid @RequestBody TeamCreateDTO dto) {
        return ResponseEntity.status(201).body(TeamDetailsDTO.fromTeam(teamService.createTeam(dto)));
    }
    @PatchMapping("/{id}")
    @Operation(summary = "Update Team", description = "Allows the captain to modify the colors or the logo of the indicated Team.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Team updated successfully"),
            @ApiResponse(responseCode = "403", description = "Unauthorized, only the captain can perform the operation"),
            @ApiResponse(responseCode = "404", description = "Team not found")
    })
    public ResponseEntity<TeamDetailsDTO> updateTeam(
            @Parameter(description = "ID of the Team") @PathVariable Long id,
            @Valid @RequestBody TeamUpdateDTO dto
    ) {
        return teamService.updateTeam(id, dto)
                .map(TeamDetailsDTO::fromTeam)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Team", description = "Deletes a Team. Only the captain of the team is able to perform this operation.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Team delete successfully"),
            @ApiResponse(responseCode = "403", description = "Unauthorized. Only the captain is able to delete the team"),
            @ApiResponse(responseCode = "404", description = "Team Not Found")
    })
    public ResponseEntity<Void> deleteTeam(@Parameter(description = "ID of the Team") @PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-teams")
    @Operation(summary = "List teams where the user is member", description = "Returns a list of the teams (TeamDetailsDTO) where the user is a member")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Teams listed succesfully"),
            @ApiResponse(responseCode = "403", description = "UserNotFound, invalid session")
    })
    public ResponseEntity<List<TeamDetailsDTO>> getUsersTeams(){
        return ResponseEntity.ok(TeamDetailsDTO.fromTeamList(teamService.getUsersTeams()));
    }

}
