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

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final BookingRepository bookingRepo;
    private final UserService userService;
    private final OpenMatchRepository openMatchRepo;
    private final CloseMatchRepository closeMatchRepo;
    private final TeamRepository teamRepo;

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

        return openMatchRepo.save(match);
    }

    @Transactional
    public OpenMatch joinOpenMatch(Long matchId, String creatorUsername) {
        OpenMatch match = openMatchRepo.findById(matchId).orElseThrow();
        User user = userService.findByUsernameOrThrow(creatorUsername);

        if (match.getPlayers().contains(user)) {
            throw new IllegalStateException("User is already in the match.");
        }
        if (match.getPlayers().size() >= match.getMaxPlayers()) {
            throw new IllegalStateException("Match is already full.");
        }

        match.getPlayers().add(user);
        return openMatchRepo.save(match);
    }

    @Transactional
    public OpenMatch leaveOpenMatch(Long matchId, String creatorUsername) {
        OpenMatch match = openMatchRepo.findById(matchId).orElseThrow();
        User user = userService.findByUsernameOrThrow(creatorUsername);

        if (!match.getPlayers().contains(user)) {
            throw new IllegalStateException("User does not belong to match.");
        }

        User matchOwner = match.getBooking().getUser();

        if (matchOwner == user) {
            throw new IllegalStateException("Match owner can't leave an open match.");
        }

        match.getPlayers().remove(user);

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

    public List<OpenMatch> getPastOpenMatchesForUser(String username) {
        User user = userService.findByUsernameOrThrow(username);

        LocalDate date = LocalDate.now();
        List<OpenMatch> openMatches = openMatchRepo.findByIsActiveTrue();
        List<OpenMatch> openMatchesFinal = new ArrayList<>();

        for (OpenMatch openMatch : openMatches) {
            if (openMatch.getBooking().getUser().equals(user) && openMatch.getBooking().getBookingDate().isBefore(date)) {
                openMatchesFinal.add(openMatch);
            }
        }
        return openMatchesFinal;
    }
    public List<CloseMatch> getPastCloseMatchesForUser(String username) {
        User user = userService.findByUsernameOrThrow(username);

        LocalDate date = LocalDate.now();
        List<CloseMatch> closeMatches = closeMatchRepo.findByIsActiveTrue();
        List<CloseMatch> closeMatchesFinal = new ArrayList<>();
        for (CloseMatch closeMatch : closeMatches) {
            if (closeMatch.getBooking().getUser().equals(user) && closeMatch.getBooking().getBookingDate().isBefore(date)) {
                closeMatchesFinal.add(closeMatch);
            }
        }
        return closeMatchesFinal;
    }
}