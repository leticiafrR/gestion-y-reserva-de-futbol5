package ar.uba.fi.ingsoft1.todo_template.match;

import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.email.EmailService;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.AgeBasedAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.ManualAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.RandomAssignment;
import ar.uba.fi.ingsoft1.todo_template.match.strategy.TeamAssignmentStrategy;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.team.TeamRepository;
import ar.uba.fi.ingsoft1.todo_template.user.User;
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
    private final EmailService emailService;
    private final OpenMatchTeamRepository openMatchTeamRepo;

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
        OpenMatchTeam teamOne = new OpenMatchTeam();
        openMatchTeamRepo.save(teamOne);
        match.setTeamOne(teamOne);
        OpenMatchTeam teamTwo = new OpenMatchTeam();
        openMatchTeamRepo.save(teamTwo);
        match.setTeamTwo(teamTwo);


        return openMatchRepo.save(match);
    }

    @Transactional
    public void deleteMatch(Booking booking) {
        Optional<OpenMatch> openMatchOpt = openMatchRepo.findByBooking(booking);

        if (openMatchOpt.isPresent()) {
            OpenMatch openMatch = openMatchOpt.get();

            if (openMatch.getTeamOne() != null) {
                openMatchTeamRepo.delete(openMatch.getTeamOne());
            }
            if (openMatch.getTeamTwo() != null) {
                openMatchTeamRepo.delete(openMatch.getTeamTwo());
            }

            openMatchRepo.delete(openMatch);
            return;
        }

        Optional<CloseMatch> closeMatchOpt = closeMatchRepo.findByBooking(booking);
        closeMatchOpt.ifPresent(closeMatchRepo::delete);
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

        if (match.getPlayers().size() >= match.getMinPlayers()) {
            throw new IllegalStateException("Match is already confirmed.");
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
        LocalDate today = LocalDate.now();
        List<OpenMatch> allActiveMatches = openMatchRepo.findByIsActiveTrue();
        List<OpenMatch> futureMatches = new ArrayList<>();
        
        for (OpenMatch match : allActiveMatches) {
            if (match.getBooking().getBookingDate().isAfter(today) || 
                match.getBooking().getBookingDate().isEqual(today)) {
                futureMatches.add(match);
            }
        }
        return futureMatches;
    }

    @Transactional
    public List<CloseMatch> getCloseMatchesByTeams(Long teamOneId, Long teamTwoId) {
        return closeMatchRepo.findByTeamOne_IdAndTeamTwo_Id(teamOneId, teamTwoId);
    }
    public List<CloseMatch> listActiveCloseMatches() {
        LocalDate today = LocalDate.now();
        List<CloseMatch> allActiveMatches = closeMatchRepo.findByIsActiveTrue();
        List<CloseMatch> futureMatches = new ArrayList<>();

        for (CloseMatch match : allActiveMatches) {
            if (match.getBooking().getBookingDate().isAfter(today) ||
                match.getBooking().getBookingDate().isEqual(today)) {
                futureMatches.add(match);
            }
        }
        return futureMatches;
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

        TeamAssignmentStrategy strategy;
        switch (strategyType.toLowerCase()) {
            case "age" -> strategy = new AgeBasedAssignment();
            case "random" -> strategy = new RandomAssignment();
            case "manual" -> strategy = new ManualAssignment(manualMap);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown strategy");
        }

        strategy.assignTeams(match);
        openMatchRepo.save(match);
        notifyTeams(match);
        return match;
    }

    public List<OpenMatch> getPastOpenMatchesForUser(String username) {
        User user = userService.findByUsernameOrThrow(username);
        LocalDate today = LocalDate.now();
        List<OpenMatch> allMatches = openMatchRepo.findAll();
        List<OpenMatch> pastMatches = new ArrayList<>();

        for (OpenMatch openMatch : allMatches) {
            boolean userParticipates = openMatch.getPlayers().stream()
                .anyMatch(player -> player.getId().equals(user.getId()));
            boolean isPastMatch = openMatch.getBooking().getBookingDate().isBefore(today);
            
            if (userParticipates && isPastMatch) {
                pastMatches.add(openMatch);
            }
        }
        
        return pastMatches;
    }
    public List<CloseMatch> getPastCloseMatchesForUser(String username) {
        User user = userService.findByUsernameOrThrow(username);
        LocalDate today = LocalDate.now();
        List<CloseMatch> allMatches = closeMatchRepo.findAll();
        List<CloseMatch> pastMatches = new ArrayList<>();
        
        for (CloseMatch closeMatch : allMatches) {
            boolean userParticipates = false;
            
            if (closeMatch.getTeamOne() != null && closeMatch.getTeamOne().getMembers() != null) {
                userParticipates = closeMatch.getTeamOne().getMembers().stream()
                    .anyMatch(member -> member.getId().equals(user.getId()));
            }
            
            if (!userParticipates && closeMatch.getTeamTwo() != null && closeMatch.getTeamTwo().getMembers() != null) {
                userParticipates = closeMatch.getTeamTwo().getMembers().stream()
                    .anyMatch(member -> member.getId().equals(user.getId()));
            }
            
            boolean isPastMatch = closeMatch.getBooking().getBookingDate().isBefore(today);
            
            if (userParticipates && isPastMatch) {
                pastMatches.add(closeMatch);
            }
        }
        
        return pastMatches;
    }

    public List<OpenMatch> getPastOpenMatchesForOwner(String ownerUsername) {
        User owner = userService.findByUsernameOrThrow(ownerUsername);
        LocalDate today = LocalDate.now();
        List<OpenMatch> allMatches = openMatchRepo.findAll();
        List<OpenMatch> pastMatches = new ArrayList<>();

        for (OpenMatch openMatch : allMatches) {
            boolean isOwnerField = openMatch.getBooking().getTimeSlot().getField().getOwner().getId().equals(owner.getId());
            boolean isPastMatch = openMatch.getBooking().getBookingDate().isBefore(today);
            
            if (isOwnerField && isPastMatch) {
                pastMatches.add(openMatch);
            }
        }
        
        return pastMatches;
    }

    public List<CloseMatch> getPastCloseMatchesForOwner(String ownerUsername) {
        User owner = userService.findByUsernameOrThrow(ownerUsername);
        LocalDate today = LocalDate.now();
        List<CloseMatch> allMatches = closeMatchRepo.findAll();
        List<CloseMatch> pastMatches = new ArrayList<>();
        
        for (CloseMatch closeMatch : allMatches) {
            boolean isOwnerField = closeMatch.getBooking().getTimeSlot().getField().getOwner().getId().equals(owner.getId());
            boolean isPastMatch = closeMatch.getBooking().getBookingDate().isBefore(today);
            
            if (isOwnerField && isPastMatch) {
                pastMatches.add(closeMatch);
            }
        }
        
        return pastMatches;
    }

    public void notifyTeams(OpenMatch match) {
        if (match.getTeamOne() == null || match.getTeamTwo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both teams have to be present.");
        }
        int totalPlayers = match.getPlayers().size();
        int teamOneSize = match.getTeamOne().getMembers().size();
        int teamTwoSize = match.getTeamTwo().getMembers().size();
        if (teamOneSize != teamTwoSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teams must have the same amount of players.");
        }
        if (totalPlayers % 2 != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "There should be an even number of players.");
        }
        if (totalPlayers < match.getMinPlayers() || totalPlayers > match.getMaxPlayers()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The amount of players must be within the match ranges.");
        }
        sendNotifications(match);
    }


    private void sendNotifications(OpenMatch match) {
        List<User> todos = new ArrayList<>();
        todos.addAll(match.getTeamOne().getMembers());
        todos.addAll(match.getTeamTwo().getMembers());

        String fecha = match.getBooking().getBookingDate().toString();
        String hora = String.format("%02d:00", match.getBooking().getBookingHour());

        for (User jugador : todos) {
            String equipo = match.getTeamOne().getMembers().contains(jugador) ? "Equipo A" : "Equipo B";
            String nombreCompleto = jugador.getName() + " " + jugador.getLast_name();

            emailService.sendTeamConfirmation(
                    jugador.getUsername(),
                    nombreCompleto,
                    fecha,
                    hora,
                    equipo
            );
        }
    }
}
