package ar.uba.fi.ingsoft1.todo_template.tournament;

import ar.uba.fi.ingsoft1.todo_template.common.HelperAuthenticatedUser;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

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

        if (!tournament.getOrganizer().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can delete the tournament");
        }

        boolean started = tournamentHasStarted(tournament);
        if (started) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "The tournament has already started and cannot be deleted");
        }

        tournamentRepository.delete(tournament);
        return true;
    }

    public Tournament updateTournament(Long id, TournamentUpdateDTO dto) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();

        Optional<Tournament> tournamentOpt = tournamentRepository.findById(id);

        if (!tournamentOpt.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "non-existent tournament");
        }
        Tournament tournament = tournamentOpt.get();

        if (!tournament.getOrganizer().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can update the tournament");
        }

        boolean started = tournamentHasStarted(tournament);

        // Validar cambio de formato si ya comenzó
        if (started && dto.format() != null && !dto.format().equals(tournament.getFormat())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can't change format of tournament after begin");
        } else if (!started && dto.format() != null) {
            tournament.setFormat(dto.format());
        }

        // No permitir cambio de startDate si ya comenzó
        if (started && dto.startDate() != null && !dto.startDate().equals(tournament.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot change after begin");
        }

        if (dto.endDate() != null) {
            LocalDate newEnd = dto.endDate();
            LocalDate currentStart = dto.startDate() != null ? dto.startDate() : tournament.getStartDate();
            if (newEnd.isBefore(currentStart)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
            }
            tournament.setEndDate(dto.endDate());
        }

        if (!tournament.getName().equals(dto.name()) && tournamentRepository.existsByName(dto.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament name already exists");
        }

        tournament.setName(dto.name());

        if (dto.startDate() != null && !started) {
            tournament.setStartDate(dto.startDate());
        }

        tournament.setMaxTeams(dto.maxTeams());
        tournament.setDescription(dto.description());
        tournament.setPrizes(dto.prizes());
        tournament.setRegistrationFee(dto.registrationFee());

        tournament.setOpenInscription(true);

        return tournamentRepository.save(tournament);
    }

    public Tournament setOpenInscriptionActiveStatus(Long id, boolean active) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();

        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        if (!tournament.getOrganizer().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can change the tournament");
        }

        tournament.setOpenInscription(active);
        return tournamentRepository.save(tournament);
    }

    private boolean tournamentHasStarted(Tournament tournament) {
        LocalDate today = LocalDate.now();
        return !tournament.getStartDate().isAfter(today);
    }

}
