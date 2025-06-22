package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator.*;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.common.HelperAuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ar.uba.fi.ingsoft1.todo_template.match.CloseMatch;
import ar.uba.fi.ingsoft1.todo_template.match.CloseMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.booking.Booking;
import ar.uba.fi.ingsoft1.todo_template.booking.BookingRepository;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlotService;
import ar.uba.fi.ingsoft1.todo_template.timeslot.TimeSlot;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class FixtureService {
    private final TournamentRepository tournamentRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final FieldRepository fieldRepository;
    private final Map<TournamentFormat, FixtureGenerator> fixtureGenerators;
    private final CloseMatchRepository closeMatchRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotService timeSlotService;
    private final TournamentStatisticsService tournamentStatisticsService;

    private static final LocalTime MATCH_START_TIME = LocalTime.of(18, 0);
    private static final LocalTime MATCH_END_TIME = LocalTime.of(23, 0);
    private static final int MATCH_DURATION_MINUTES = 90; // 90 minutos

    public FixtureService(
            TournamentRepository tournamentRepository,
            TeamRegisteredTournamentRepository teamRegisteredTournamentRepository,
            TournamentMatchRepository tournamentMatchRepository,
            FieldRepository fieldRepository,
            Map<TournamentFormat, FixtureGenerator> fixtureGenerators,
            CloseMatchRepository closeMatchRepository,
            BookingRepository bookingRepository,
            TimeSlotService timeSlotService,
            TournamentStatisticsService tournamentStatisticsService) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.fieldRepository = fieldRepository;
        this.closeMatchRepository = closeMatchRepository;
        this.bookingRepository = bookingRepository;
        this.timeSlotService = timeSlotService;
        this.tournamentStatisticsService = tournamentStatisticsService;

        RoundRobinGenerator roundRobinGenerator = new RoundRobinGenerator();
        SingleEliminationGenerator singleEliminationGenerator = new SingleEliminationGenerator();
        GroupStageAndEliminationGenerator groupStageAndEliminationGenerator = new GroupStageAndEliminationGenerator(
                roundRobinGenerator, singleEliminationGenerator);

        this.fixtureGenerators = new HashMap<>();
        this.fixtureGenerators.put(TournamentFormat.ROUND_ROBIN, roundRobinGenerator);
        this.fixtureGenerators.put(TournamentFormat.SINGLE_ELIMINATION, singleEliminationGenerator);
        this.fixtureGenerators.put(TournamentFormat.GROUP_STAGE_AND_ELIMINATION, groupStageAndEliminationGenerator);
    }

    @Transactional
    public List<TournamentMatch> generateFixture(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        checkActionCarriedOutByOrganizer(tournament.getOrganizer().username());

        List<TournamentMatch> existingMatches = tournamentMatchRepository
                .findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
        if (!existingMatches.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Fixture already exists for this tournament");
        }

        if (tournament.isStillOpenForRegistration()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament is still open for registration");
        }

        List<TeamRegisteredTournament> teams = teamRegisteredTournamentRepository.findByTournament(tournament);
        if (teams.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No teams found for tournament");
        }

        FixtureGenerator generator = fixtureGenerators.get(tournament.getFormat());
        if (generator == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tournament format");
        }

        List<TournamentMatch> matches = generator.generateFixture(tournament, teams);

        List<Field> availableFields = fieldRepository.findByActiveTrue();
        if (availableFields.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No available fields to schedule matches");
        }

        int fieldIndex = 0;
        for (TournamentMatch match : matches) {
            match.setField(availableFields.get(fieldIndex));
            fieldIndex = (fieldIndex + 1) % availableFields.size();
        }

        LocalDateTime nextAvailableTime = LocalDateTime.of(tournament.getStartDate(), MATCH_START_TIME);

        for (TournamentMatch match : matches) {
            LocalDateTime proposedTime = nextAvailableTime;
            boolean scheduled = false;
            int attempts = 0;
            final int MAX_ATTEMPTS = 5000;

            while (!scheduled && attempts < MAX_ATTEMPTS) {
                if (proposedTime.toLocalTime().isAfter(MATCH_END_TIME)
                        || proposedTime.toLocalTime().isBefore(MATCH_START_TIME)) {
                    if (proposedTime.toLocalTime().isAfter(MATCH_END_TIME)) {
                        proposedTime = proposedTime.toLocalDate().plusDays(1).atTime(MATCH_START_TIME);
                    } else {
                        proposedTime = proposedTime.with(MATCH_START_TIME);
                    }
                    continue;
                }
                Field field = match.getField();
                DayOfWeek dayOfWeek = proposedTime.getDayOfWeek();
                int hour = proposedTime.getHour();
                TimeSlot timeSlot = timeSlotService.getTimeSlotByFieldAndDay(field.getId(), dayOfWeek);

                if (timeSlot != null && hour >= timeSlot.getOpenTime() && hour < timeSlot.getCloseTime()) {
                    match.setScheduledDateTime(proposedTime);
                    scheduled = true;
                } else {
                    proposedTime = proposedTime.plusMinutes(MATCH_DURATION_MINUTES);
                }
                attempts++;
            }
            if (!scheduled) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Could not find an available time slot for match.");
            }

            nextAvailableTime = match.getScheduledDateTime().plusMinutes(MATCH_DURATION_MINUTES);

            Booking booking = new Booking(
                    tournament.getOrganizer(),
                    timeSlotService.getTimeSlotByFieldAndDay(match.getField().getId(),
                            match.getScheduledDateTime().getDayOfWeek()),
                    match.getScheduledDateTime().toLocalDate(),
                    match.getScheduledDateTime().getHour());
            bookingRepository.save(booking);

            if (match.getHomeTeam() != null && match.getAwayTeam() != null) {
                CloseMatch closeMatch = new CloseMatch();
                closeMatch.setBooking(booking);
                closeMatch.setTeamOne(match.getHomeTeam().getTeam());
                closeMatch.setTeamTwo(match.getAwayTeam().getTeam());
                closeMatchRepository.save(closeMatch);
                match.setMatch(closeMatch);
            }
        }

        return tournamentMatchRepository.saveAll(matches);
    }

    @Transactional
    public TournamentMatch updateMatchResult(Long matchId, MatchResultDTO result) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        checkActionCarriedOutByOrganizer(match.getTournament().getOrganizer().username());

        if (match.getStatus() != MatchStatus.IN_PROGRESS) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Match is not in progress");
        }

        match.setHomeTeamScore(result.homeTeamScore());
        match.setAwayTeamScore(result.awayTeamScore());
        match.setStatus(MatchStatus.COMPLETED);

        if (match.getHomeTeam() != null && match.getAwayTeam() != null && match.getMatch() == null) {
            createMatchForTournamentMatch(match);
        }

        tournamentStatisticsService.updateTeamStatistics(match);
        updateNextMatch(match);
        return tournamentMatchRepository.save(match);
    }

    @Transactional
    public TournamentMatch cancelMatch(Long matchId) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found"));

        checkActionCarriedOutByOrganizer(match.getTournament().getOrganizer().username());

        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot cancel a completed match");
        }

        match.setStatus(MatchStatus.CANCELLED);
        return tournamentMatchRepository.save(match);
    }

    public List<TournamentMatch> getFixture(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        return tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
    }

    public TournamentStatisticsDTO getTournamentStatisticsDTO(Long tournamentId) {
        return tournamentStatisticsService.getTournamentStatisticsDTO(tournamentId);
    }

    private void updateNextMatch(TournamentMatch completedMatch) {
        Tournament tournament = completedMatch.getTournament();

        if (tournament.getFormat() == TournamentFormat.ROUND_ROBIN) {
            checkRoundRobinTournamentCompletion(tournament);
            return;
        }

        TournamentMatch nextMatch = completedMatch.getNextMatch();

        if (nextMatch == null) {
            TeamRegisteredTournament champion = determineWinner(completedMatch);
            TeamRegisteredTournament runnerUp = determineLoser(completedMatch);

            if (champion != null) {
                tournament.setEndDate(LocalDate.now());
                tournamentRepository.save(tournament);
            }
            return;
        }

        TeamRegisteredTournament winner = determineWinner(completedMatch);
        if (winner == null)
            return;

        if (completedMatch.isHomeTeamNextMatch()) {
            nextMatch.setHomeTeam(winner);
        } else {
            nextMatch.setAwayTeam(winner);
        }

        if (nextMatch.getHomeTeam() != null && nextMatch.getAwayTeam() != null) {
            createMatchForTournamentMatch(nextMatch);
        }

        tournamentMatchRepository.save(nextMatch);
    }

    private void checkRoundRobinTournamentCompletion(Tournament tournament) {
        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);

        boolean allMatchesCompleted = allMatches.stream()
                .allMatch(match -> match.getStatus() == MatchStatus.COMPLETED);

        if (allMatchesCompleted) {
            List<TeamRegisteredTournament> teams = teamRegisteredTournamentRepository.findByTournament(tournament);

            teams.sort((t1, t2) -> {
                if (t1.getPoints() != t2.getPoints()) {
                    return Integer.compare(t2.getPoints(), t1.getPoints());
                }
                if (t1.getGoalDifference() != t2.getGoalDifference()) {
                    return Integer.compare(t2.getGoalDifference(), t1.getGoalDifference());
                }
                return Integer.compare(t2.getGoalsFor(), t1.getGoalsFor());
            });

            if (!teams.isEmpty()) {
                TeamRegisteredTournament champion = teams.get(0);
                TeamRegisteredTournament runnerUp = teams.size() > 1 ? teams.get(1) : null;

                tournament.setEndDate(LocalDate.now());
                tournamentRepository.save(tournament);

            }
        }
    }

    private void createMatchForTournamentMatch(TournamentMatch tournamentMatch) {
        DayOfWeek dayOfWeek = tournamentMatch.getScheduledDateTime().getDayOfWeek();
        int hour = tournamentMatch.getScheduledDateTime().getHour();
        TimeSlot timeSlot = timeSlotService.getTimeSlotByFieldAndDay(tournamentMatch.getField().getId(), dayOfWeek);

        if (timeSlot == null || hour < timeSlot.getOpenTime() || hour >= timeSlot.getCloseTime()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No hay franja horaria para la cancha y hora del partido");
        }

        Booking booking = new Booking(
                tournamentMatch.getTournament().getOrganizer(),
                timeSlot,
                tournamentMatch.getScheduledDateTime().toLocalDate(),
                hour);
        bookingRepository.save(booking);

        CloseMatch closeMatch = new CloseMatch();
        closeMatch.setBooking(booking);
        closeMatch.setTeamOne(tournamentMatch.getHomeTeam().getTeam());
        closeMatch.setTeamTwo(tournamentMatch.getAwayTeam().getTeam());
        closeMatchRepository.save(closeMatch);

        tournamentMatch.setMatch(closeMatch);
    }

    private TeamRegisteredTournament determineWinner(TournamentMatch match) {
        if (match.getHomeTeamScore() > match.getAwayTeamScore()) {
            return match.getHomeTeam();
        } else if (match.getAwayTeamScore() > match.getHomeTeamScore()) {
            return match.getAwayTeam();
        }
        return null;
    }

    private TeamRegisteredTournament determineLoser(TournamentMatch match) {
        if (match.getHomeTeamScore() > match.getAwayTeamScore()) {
            return match.getAwayTeam();
        } else if (match.getAwayTeamScore() > match.getHomeTeamScore()) {
            return match.getHomeTeam();
        }
        return null;
    }

    private void checkActionCarriedOutByOrganizer(String usernameOrganizer) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        if (!usernameOrganizer.equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can perform this action");
        }
    }
}