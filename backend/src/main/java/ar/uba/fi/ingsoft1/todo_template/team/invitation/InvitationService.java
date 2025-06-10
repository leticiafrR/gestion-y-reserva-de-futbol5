package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.email.EmailService;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.UUID;


@Service
@Transactional
public class InvitationService {
    private final InvitationRepository invitationRepository;
    private final EmailService emailService;
    private final InvitationFormatService invitationFormater;

    @Autowired
    public InvitationService(InvitationRepository invitationRepository,
                             EmailService emailService,InvitationFormatService invitationFormater) {
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
        this.invitationFormater =invitationFormater;
    }

    public Invitation getPendientInvitation(String token){
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"token given is invalid "));
        if (!inv.isPending()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Invitation already accepted");
        }
        return inv;
    }

    public void settleAcceptance(Invitation inv) {
        inv.setPending(false);
        invitationRepository.save(inv);
    }

    public Invitation sendInvitationEmail(Team team, String to) {
        //verifico que no haya una invitación penidente
        if (invitationRepository.existsByTeamAndInviteeEmailAndPending(team, to, true)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "There is already a pending invitation to the user to the indicated team.");
        }

        Invitation invitation = Invitation.builder().team(team).inviteeEmail(to)
                .pending(true)
                .token(UUID.randomUUID().toString())
                .build();
        invitationRepository.save(invitation);
        emailService.sendMailMessage(invitationFormater.getContEmailNormalized(team.getName(),to, invitation.getToken(), Locale.ENGLISH));
        return invitation;
    }
}
