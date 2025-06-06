package ar.uba.fi.ingsoft1.todo_template.team;

import ar.uba.fi.ingsoft1.todo_template.config.security.JwtUserDetails;
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


    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team createTeam(TeamCreateDTO dto) {
        String username = getAuthenticatedUsername();

        if (teamRepository.findByName(dto.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists");
        }

        Team team = dto.toTeam(username);
        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() -> {
                    var msg = String.format("Username '%s' not found", username);
                    return new UsernameNotFoundException(msg);
                });
        team.addMember(user);

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

    private String getAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ((JwtUserDetails) auth.getPrincipal()).username();
    }
}
