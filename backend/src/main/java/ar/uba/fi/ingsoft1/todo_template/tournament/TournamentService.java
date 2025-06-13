package ar.uba.fi.ingsoft1.todo_template.tournament;

import ar.uba.fi.ingsoft1.todo_template.common.HelperAuthenticatedUser;
import ar.uba.fi.ingsoft1.todo_template.tournament.update.TournamentUpdateCommand;
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

    public TournamentService(TournamentRepository tournamentRepository, UserRepository userRepository) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
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

        tournamentRepository.delete(tournament);
        return true;
    }

    private Tournament getTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));
    }

    private void checkActionCarriedOutByOrganizer(String usernameOrganizer) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        if (!usernameOrganizer.equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can perform this action");
        }
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
                tournament.getName(),
                tournament.getStartDate(),
                tournament.getFormat(),
                tournament.getState());
    }

}
