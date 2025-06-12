package ar.uba.fi.ingsoft1.todo_template.team.invitation;

import ar.uba.fi.ingsoft1.todo_template.team.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByToken(String token);
    boolean existsByTeamAndInviteeEmailAndPending(Team team, String email, boolean pending);
    List<Invitation> findByTeamAndPendingIsTrue(Team team);
}
