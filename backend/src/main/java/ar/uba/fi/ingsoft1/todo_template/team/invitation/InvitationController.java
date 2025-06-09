package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import ar.uba.fi.ingsoft1.todo_template.team.TeamDetailsDTO;
import ar.uba.fi.ingsoft1.todo_template.team.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invitations")
@Tag(name = "4 - Team Invitations", description = "endpoint for invitations to join a team")
public class InvitationController {

    private final InvitationService invitationService;
    private final TeamService teamService;

    public InvitationController(TeamService teamService, InvitationService invitationService) {
        this.teamService = teamService;
        this.invitationService = invitationService;
    }

    @PostMapping("/teams/{teamId}")
    @Operation(summary = "Invite a user to a Team", description = "Allows the captain of the indicated team to send via email an invitation to a user to join its team")
    @ApiResponse(responseCode = "201", description = "Invitation created and sent successfully", content = @Content(schema = @Schema(implementation = InvitationDTO.class), mediaType = "application/json"))
    @ApiResponse(responseCode = "404", description = "Invitee indicated was not a valid username in the system.", content = @Content)
    @ApiResponse(responseCode = "404", description = "Team indicated was not an existing Team in the system.", content = @Content)
    @ApiResponse(responseCode = "401", description = "Unauthorized user: only the captain of the team can invite new members.", content = @Content)
    @ApiResponse(responseCode = "409", description = "Conflict: The invitee is already a member of the team.", content = @Content)
    @ApiResponse(responseCode = "409", description = "Conflict: There is already a pending invitation to the user to the indicated team.", content = @Content)
    @ApiResponse(responseCode = "409", description = "Conflict: Couldn't send an email to the invitee", content = @Content)
    public ResponseEntity<InvitationDTO> createInvitation(
            @Parameter(description = "ID of the Team") @PathVariable Long teamId,
            @Valid @RequestBody CreateInvitationDTO body
    ) {
        Invitation inv = teamService.inviteMember(teamId,body.getInviteeEmail());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(InvitationDTO.fromInvitation(inv));
    }

    @PatchMapping("/teams/accept")
    @Operation(summary = "Accept an invitation to join a team", description = "Allows an invited user to accept an existing and yet pending invitation to join a Team")
    @ApiResponse(responseCode = "200", description = "Invitation accepted successfully", content = @Content(schema = @Schema(implementation = TeamDetailsDTO.class), mediaType = "application/json"))
    @ApiResponse(responseCode = "401", description = "Unauthorized: Cant join the team, invalid Invitation token", content = @Content)
    @ApiResponse(responseCode = "409", description = "Conflict: The given invitation was already used.", content = @Content)
    @ApiResponse(responseCode = "409", description = "Conflict: User was already a member of the team.", content = @Content)
    @ApiResponse(responseCode = "404", description = "Not found: The indicated Team was not found", content = @Content)
    @ApiResponse(responseCode = "404", description = "Not found: The indicated User invited was not found", content = @Content)
    @ApiResponse(responseCode = "404", description = "Not found: The indicated User invited was not found", content = @Content)
    @ApiResponse(responseCode = "401", description = "Unauthorized: Cant join the team, user legged differs from invited user", content = @Content)
    @Transactional
    public ResponseEntity<TeamDetailsDTO> acceptInvitation(
            @RequestParam("token") String token
    ) {
        Invitation invitation = invitationService.getPendientInvitation(token);
        TeamDetailsDTO teamDetails = TeamDetailsDTO.fromTeam(teamService.acceptInvitation(invitation));
        invitationService.settleAcceptance(invitation);
        return ResponseEntity.status(200).body(teamDetails);
    }

}