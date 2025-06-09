package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import ar.uba.fi.ingsoft1.todo_template.team.TeamDetailsDTO;
import ar.uba.fi.ingsoft1.todo_template.team.TeamService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final TeamService teamService;

    public InvitationController(TeamService teamService, InvitationService invitationService) {
        this.teamService = teamService;
        this.invitationService = invitationService;
    }

    @PostMapping("/teams/{teamId}")
    public ResponseEntity<InvitationDTO> createInvitation(
            @Parameter(description = "ID del equipo al que se invita") @PathVariable Long teamId,
            @Valid @RequestBody CreateInvitationDTO body
    ) {
        Invitation inv = teamService.inviteMember(teamId,body.getInviteeEmail());
        return ResponseEntity
                .status(201)
                .body(InvitationDTO.fromInvitation(inv));
    }

    @PatchMapping("/teams/accept")
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