package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
import ar.uba.fi.ingsoft1.todo_template.team.invitation.Invitation;
import ar.uba.fi.ingsoft1.todo_template.team.invitation.InvitationService;
import ar.uba.fi.ingsoft1.todo_template.team.teamServiceException.UserAlreadyMemberException;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final InvitationService invitationService;


    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public List<Team> getUsersTeams() {
        String username = getAuthenticatedUsername();
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
        return teamRepository.findAllByMemberIdFetchMembers(user.getId());
    }


    public Team createTeam(TeamCreateDTO dto) {
        String username = getAuthenticatedUsername();

        if (teamRepository.findByName(dto.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists");
        }
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
        Team team = dto.toTeam(user);
        return teamRepository.save(team);
    }

    public Optional<Team> updateTeam(Long id, TeamUpdateDTO dto) {
        String username = getAuthenticatedUsername();

        Optional<Team> teamOpt = teamRepository.findById(id);
        if (teamOpt.isEmpty()) return Optional.empty();

        Team team = teamOpt.get();
        if (!team.getCaptain().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the captain can update the team");
        }

        // Check name uniqueness if updating
        if (dto.getName() != null && !dto.getName().equals(team.getName())) {
            Optional<Team> existingTeam = teamRepository.findByName(dto.getName());
            if (existingTeam.isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists");
            }
        }

        return Optional.of(teamRepository.save(dto.applyTo(team)));
    }

    public void deleteTeam(Long id) {
        String username = getAuthenticatedUsername();

        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (!team.getCaptain().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the captain can delete the team");
        }

        teamRepository.delete(team);
    }

    @Transactional
    public Invitation inviteMember(Long teamId, String invitee){
        //verifico que el usuario esté loggeado y sea mi capitan
        String captain = getAuthenticatedUsername();
        //verifico que el equipo exista
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        //que sea el capitan
        if (!team.getCaptain().equals(captain)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the captain can generate invitations to the team");
        }
        //verifico que el usuario a quien se invita no sea ya parte del equipo
        if (teamRepository.existsByIdAndMemberUsername(teamId, invitee)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The invitee is already a member of the team.");
        }
        //verifico que exista el invitado
        if (!userRepository.existsByUsername(invitee)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitee not found");
        }
        return invitationService.sendInvitationEmail(team,invitee);
    }

    public Team acceptInvitation(Invitation inv){
        //tengo que hacer las verificaciones respecto al team al que se va a unir
        User userInvitee = userRepository.findByUsername(getAuthenticatedUsername()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitee not found"));
        Team team = teamRepository.findById(inv.getTeamId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        //verifico que la invitación coincida con quien está aceptando
        if (!inv.getInviteeEmail().equals(userInvitee.getUsername())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"User logged is not the user who was invited ");
        }

        try{
            team.addMember(userInvitee);
        } catch (UserAlreadyMemberException e){
            throw new ResponseStatusException(HttpStatus.CONFLICT,e.getMessage());
        }
        return team;
    }

    private String getAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((JwtUserDetails) auth.getPrincipal()).username();
    }
}
