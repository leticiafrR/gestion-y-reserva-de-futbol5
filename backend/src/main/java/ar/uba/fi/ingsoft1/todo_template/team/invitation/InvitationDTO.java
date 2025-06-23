package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import lombok.*;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvitationDTO {
    private Long id;
    private Long team_id;
    private String inviteeEmail;
    private boolean pending;
    // This value is only being returned so i can use it to test the accepting
    private String token;

    public static InvitationDTO fromInvitation(Invitation inv) {
        return InvitationDTO.builder()
                .id(inv.getId())
                .team_id(inv.getTeamId())
                .inviteeEmail(inv.getInviteeEmail())
                .pending(inv.isPending())
                .token(inv.getToken())
                .build();
    }

    public static List<InvitationDTO> fromInvitations(List<Invitation> invs){
        return invs.stream().map(InvitationDTO::fromInvitation).collect(Collectors.toList());
    }
}
