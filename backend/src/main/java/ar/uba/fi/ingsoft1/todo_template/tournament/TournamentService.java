package ar.uba.fi.ingsoft1.todo_template.tournament;

import ar.uba.fi.ingsoft1.todo_template.common.HelperAuthenticatedUser;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentHelper;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamTournamentId;
import ar.uba.fi.ingsoft1.todo_template.tournament.update.TournamentUpdateCommand;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class TournamentService {
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TeamRegisteredTournamentHelper teamRegisteredTournamentHelper;

    public TournamentService(TournamentRepository tournamentRepository, UserRepository userRepository,
            TeamRepository teamRepository, TeamRegisteredTournamentRepository teamRegisteredTournamentRepository) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.teamRegisteredTournamentHelper = new TeamRegisteredTournamentHelper(teamRegisteredTournamentRepository);
    }

    public boolean isTeamAlreadyRegistered(Long teamId, Long tournamentId) {
        TeamTournamentId id = new TeamTournamentId(teamId, tournamentId);
        return teamRegisteredTournamentRepository.existsById(id);
    }

    private void checkConditionsToResgitTeam(String authenticatedUsername, Tournament tournament,
            String captainUsername) {
        if (!authenticatedUsername.equals(captainUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Only the team's captain can regist the team into a tournament. " + authenticatedUsername
                            + " isn't the captain " + captainUsername);
        }
        if (!tournament.addNewTeamRegisted()) { // ya se agregó uno a la cantidad de equipos registrados
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament is full, cannot register more teams");
        }
    }

    public void regist_team_into_tournament(Long team_id, Long tournament_id) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        Team team = teamRepository.findById(team_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        Tournament tournament = tournamentRepository.findById(tournament_id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        checkConditionsToResgitTeam(username, tournament, team.getCaptain());
        if (isTeamAlreadyRegistered(team_id, tournament_id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Team already registered into the indicated tournament");
        }
        TeamTournamentId id = new TeamTournamentId(team.getId(), tournament.getId());
        TeamRegisteredTournament registration = TeamRegisteredTournament.builder()
                .id(id)
                .team(team)
                .tournament(tournament)
                .build();

        teamRegisteredTournamentRepository.save(registration);
    }

    public Tournament createTournament(TournamentCreateDTO dto) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();

        if (tournamentRepository.existsByName(dto.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament name already exists");
        }

        Tournament tournament = new Tournament();
        tournament.setName(dto.name());
        tournament.setFormat(dto.format());
        tournament.setStartDate(dto.startDate());
        tournament.setMaxTeams(dto.maxTeams());
        tournament.setOrganizer(userRepository.findByUsername(username).get());
        tournament.setOpenInscription(true);

        if (dto.endDate() != null) {
            LocalDate newEnd = dto.endDate();
            LocalDate currentStart = dto.startDate() != null ? dto.startDate() : tournament.getStartDate();
            if (newEnd.isBefore(currentStart)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
            }
        }

        tournament.setEndDate(dto.endDate());
        tournament.setDescription(dto.description());
        tournament.setPrizes(dto.prizes());
        tournament.setRegistrationFee(dto.registrationFee());

        return tournamentRepository.save(tournament);
    }

    public boolean deleteTournament(Long id) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        if (!tournament.getOrganizer().username().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can delete the tournament");
        }

        if (tournament.hasStarted()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The tournament has already started and cannot be deleted");
        }
        
        // Delete all team registrations for the tournament first
        teamRegisteredTournamentRepository.deleteAll(teamRegisteredTournamentRepository.findByTournament(tournament));

        tournamentRepository.delete(tournament);
        return true;
    }

    public Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
    }

    private void checkStillModifiable(Tournament tournament) {
        if (!tournament.isStillOpenForRegistration()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tournament is not modifiable, it has already started or inscriptions are closed");
        }
    }

    public Tournament updateTournament(Long id_tournament, List<TournamentUpdateCommand> updateCommnads) {
        Tournament current = getTournament(id_tournament);
        checkActionCarriedOutByOrganizer(current.getOrganizer().username());
        checkStillModifiable(current);
        for (TournamentUpdateCommand command : updateCommnads) {
            current = command.apply(current);
        }
        tournamentRepository.save(current);
        return current;
    }

    public Tournament setOpenInscriptionActiveStatus(Long id, boolean active) {
        Tournament tournament = getTournament(id);
        checkActionCarriedOutByOrganizer(tournament.getOrganizer().username());
        if (tournament.hasStarted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot modify inscription status after the tournament has started");
        }

        tournament.setOpenInscription(active);
        return tournamentRepository.save(tournament);
    }

    public List<TournamentSummaryDTO> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<TournamentSummaryDTO> getFilteredByStateTournaments(TournamentState state) {
        return tournamentRepository.findAll().stream()
                .filter(tournament -> tournament.getState() == state)
                .map(this::toDTO)
                .toList();
    }

    private TournamentSummaryDTO toDTO(Tournament tournament) {
        return new TournamentSummaryDTO(
                tournament.getId(),
                tournament.getName(),
                tournament.getStartDate(),
                tournament.getEndDate(),
                tournament.getFormat(),
                tournament.getState(),
                tournament.getRegisteredTeams());
    }

    public Tournament getTournamentByName(String name) {
        Tournament tournament = tournamentRepository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tournament not found with name: " + name));
        return tournament;
    }

    public List<TournamentSummaryDTO> getTournamentsByOrganizer() {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        User organizer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return tournamentRepository.findByOrganizer(organizer).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<TournamentSummaryDTO> getTournamentsByParticipant() {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Team> userTeams = teamRepository.findByMembers(user);

        List<Tournament> participatingTournaments = teamRegisteredTournamentRepository
                .findAll()
                .stream()
                .filter(registration -> userTeams.contains(registration.getTeam()))
                .map(TeamRegisteredTournament::getTournament)
                .distinct()
                .toList();

        return participatingTournaments.stream()
                .map(this::toDTO)
                .toList();
    }

    private void checkActionCarriedOutByOrganizer(String usernameOrganizer) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        if (!usernameOrganizer.equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can perform this action");
        }
    }

    public void closeRegistration(Long id_tournament) {
        Tournament tournament = getTournament(id_tournament);
        checkActionCarriedOutByOrganizer(tournament.getOrganizer().username());
        if (tournament.getState() != TournamentState.OPEN_TO_REGISTER) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tournament is not open for registration, cannot close registrations");
        }
        tournament.setOpenInscription(false);
        tournamentRepository.save(tournament);
    }

    public List<TeamRegisteredTournament> getTournamentTeams(Long tournamentId) {
        Tournament tournament = getTournament(tournamentId);
        return teamRegisteredTournamentRepository.findByTournament(tournament);
    }

    public List<TeamRegisteredTournament> getTournamentSortedStandings(Long tournamentId) {
        Tournament tournament = getTournament(tournamentId);
        return teamRegisteredTournamentHelper.getSortedByStandingsTeamsForTournament(tournament);
    }

}
