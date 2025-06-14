package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.match.*;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.AgeBasedAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.ManualAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.RandomAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.TeamAssignmentStrategy;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import ar.uba.fi.ingsoft1.todo_template.user.UserRepository;
import ar.uba.fi.ingsoft1.todo_template.user.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final UserService userService;
    private final OpenMatchRepository openMatchRepo;
    private final CloseMatchRepository closeMatchRepo;
    private final TeamRepository teamRepo;
    private final OpenMatchRepository openMatchRepository;

    @Transactional
    public OpenMatch createOpenMatch(OpenMatchCreateDTO dto, String creatorUsername) {
        User creator = userService.findByUsernameOrThrow(creatorUsername);
        Booking booking = bookingRepo.findById(dto.getBookingId()).orElseThrow();

        if (dto.getMinPlayers() < 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El mínimo de jugadores debe ser al menos 10.");
        }

        if (dto.getMaxPlayers() < dto.getMinPlayers()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe haber al menos 2 jugadores.");
        }

        OpenMatch match = new OpenMatch();
        match.setBooking(booking);
        match.setPlayers(new ArrayList<>(List.of(creator)));
        match.setMinPlayers(dto.getMinPlayers());
        match.setMaxPlayers(dto.getMaxPlayers());

        return openMatchRepository.save(match);
    }

    @Transactional
    public OpenMatch joinOpenMatch(Long matchId, Long userId) {
        OpenMatch match = openMatchRepo.findById(matchId).orElseThrow();
        User user = userRepo.findById(userId).orElseThrow();

        if (match.getPlayers().contains(user)) {
            throw new IllegalStateException("El usuario ya está inscripto");
        }
        if (match.getPlayers().size() >= match.getMaxPlayers()) {
            throw new IllegalStateException("El partido ya está lleno");
        }

        match.getPlayers().add(user);
        return openMatchRepo.save(match);
    }

    @Transactional
    public CloseMatch createCloseMatch(CloseMatchCreateDTO dto) {
        Booking booking = bookingRepo.findById(dto.getBookingId()).orElseThrow();
        Team teamOne = teamRepo.findById(dto.getTeamOneId()).orElseThrow();
        Team teamTwo = teamRepo.findById(dto.getTeamTwoId()).orElse(null);

        CloseMatch match = new CloseMatch();
        match.setBooking(booking);
        match.setTeamOne(teamOne);
        match.setTeamTwo(teamTwo); 
        return closeMatchRepo.save(match);
    }

    @Transactional
    
    public List<OpenMatch> listActiveOpenMatches() {
        return openMatchRepo.findByIsActiveTrue();
    }

    @Transactional
    public List<OpenMatch> listOpenMatchesOfUser(Long userId) {
        return openMatchRepo.findByIsActiveTrueAndPlayers_Id(userId);
    }
    @Transactional
    public List<CloseMatch> getCloseMatchesByTeams(Long teamOneId, Long teamTwoId) {
        return closeMatchRepo.findByTeamOne_IdAndTeamTwo_Id(teamOneId, teamTwoId);
    }
    public List<CloseMatch> listActiveCloseMatches() {
        return closeMatchRepo.findByIsActiveTrue();
    }

    @Transactional
    public CloseMatch getCloseMatch(Long matchId) {
        return closeMatchRepo.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("This match does not exist"));
    }
    @Transactional
    public OpenMatch getOpenMatch(Long matchId) {
        return openMatchRepo.findById(matchId)
            .orElseThrow(() -> new IllegalArgumentException("This match does not exist"));
    }

    @Transactional
    public OpenMatch assignTeams(Long matchId, String strategyType, Map<Long, Integer> manualMap) {
        OpenMatch match = openMatchRepo.findById(matchId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (match.getTeamOne() == null) {
            match.setTeamOne(new Team());
        }
        if (match.getTeamTwo() == null) {
            match.setTeamTwo(new Team());
        }

        TeamAssignmentStrategy strategy;
        switch (strategyType.toLowerCase()) {
            case "age":
                strategy = new AgeBasedAssignment();
                break;
            case "random":
                strategy = new RandomAssignment();
                break;
            case "manual":
                strategy = new ManualAssignment(manualMap);
                break;
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown strategy");
        }

        strategy.assignTeams(match);
        return openMatchRepo.save(match);
    }
}