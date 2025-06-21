package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentState;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator.*;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.stream.Collectors;

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

    private static final LocalTime MATCH_START_TIME = LocalTime.of(18, 0); // 6:00 PM
    private static final int MATCH_DURATION_MINUTES = 90; // 90 minutos
    private static final int MATCHES_PER_DAY = 4;

    public FixtureService(
            TournamentRepository tournamentRepository,
            TeamRegisteredTournamentRepository teamRegisteredTournamentRepository,
            TournamentMatchRepository tournamentMatchRepository,
            FieldRepository fieldRepository,
            Map<TournamentFormat, FixtureGenerator> fixtureGenerators,
            CloseMatchRepository closeMatchRepository,
            BookingRepository bookingRepository,
            TimeSlotService timeSlotService) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.fieldRepository = fieldRepository;
        this.closeMatchRepository = closeMatchRepository;
        this.bookingRepository = bookingRepository;
        this.timeSlotService = timeSlotService;

        RoundRobinGenerator roundRobinGenerator = new RoundRobinGenerator();
        SingleEliminationGenerator singleEliminationGenerator = new SingleEliminationGenerator();
        GroupStageAndEliminationGenerator groupStageAndEliminationGenerator = new GroupStageAndEliminationGenerator(roundRobinGenerator, singleEliminationGenerator);

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

        List<TournamentMatch> existingMatches = tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
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
        if (!availableFields.isEmpty()) {
            int fieldIndex = 0;
            for (TournamentMatch match : matches) {
                match.setField(availableFields.get(fieldIndex));
                fieldIndex = (fieldIndex + 1) % availableFields.size();
            }
        }

        LocalDate currentDate = tournament.getStartDate();
        int matchesScheduledToday = 0;
        LocalDateTime currentDateTime = LocalDateTime.of(currentDate, MATCH_START_TIME);

        for (TournamentMatch match : matches) {
            if (matchesScheduledToday >= MATCHES_PER_DAY) {
                currentDate = currentDate.plusDays(1);
                currentDateTime = LocalDateTime.of(currentDate, MATCH_START_TIME);
                matchesScheduledToday = 0;
            }

            match.setScheduledDateTime(currentDateTime);
            currentDateTime = currentDateTime.plusMinutes(MATCH_DURATION_MINUTES);
            matchesScheduledToday++;

            DayOfWeek dayOfWeek = match.getScheduledDateTime().getDayOfWeek();
            int hour = match.getScheduledDateTime().getHour();
            TimeSlot timeSlot = timeSlotService.getTimeSlotByFieldAndDay(match.getField().getId(), dayOfWeek);

            if (timeSlot == null || hour < timeSlot.getOpenTime() || hour >= timeSlot.getCloseTime()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay franja horaria para la cancha y hora del partido");
            }

            Booking booking = new Booking(
                    tournament.getOrganizer(),
                    timeSlot,
                    match.getScheduledDateTime().toLocalDate(),
                    hour
            );
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

        if (match.getStatus() != MatchStatus.SCHEDULED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Match is not in scheduled state");
        }

        match.setHomeTeamScore(result.homeTeamScore());
        match.setAwayTeamScore(result.awayTeamScore());
        match.setStatus(MatchStatus.COMPLETED);

        if (match.getHomeTeam() != null && match.getAwayTeam() != null && match.getMatch() == null) {
            createMatchForTournamentMatch(match);
        }

        updateTeamStatistics(match);
        updateNextMatch(match);
        return tournamentMatchRepository.save(match);
    }

    public List<TournamentMatch> getFixture(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        return tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
    }

    public Map<String, Object> getTournamentStatistics(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        List<TeamRegisteredTournament> teams = teamRegisteredTournamentRepository.findByTournament(tournament);
        List<TournamentMatch> matches = tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);

        Map<String, Object> statistics = new java.util.HashMap<>();

        statistics.put("tournamentName", tournament.getName());
        statistics.put("format", tournament.getFormat());
        statistics.put("state", tournament.getState());
        statistics.put("totalTeams", teams.size());
        statistics.put("totalMatches", matches.size());

        long completedMatches = matches.stream()
                .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
                .count();
        statistics.put("completedMatches", completedMatches);

        if (!teams.isEmpty()) {
            teams.sort((t1, t2) -> {
                if (t1.getPoints() != t2.getPoints()) {
                    return Integer.compare(t2.getPoints(), t1.getPoints());
                }
                if (t1.getGoalDifference() != t2.getGoalDifference()) {
                    return Integer.compare(t2.getGoalDifference(), t1.getGoalDifference());
                }
                return Integer.compare(t2.getGoalsFor(), t1.getGoalsFor());
            });

            if (tournament.getState() == TournamentState.FINISHED && teams.size() >= 2) {
                statistics.put("champion", teams.get(0).getTeam().getName());
                statistics.put("runnerUp", teams.get(1).getTeam().getName());
            }

            TeamRegisteredTournament topScorer = teams.stream()
                    .max((t1, t2) -> Integer.compare(t1.getGoalsFor(), t2.getGoalsFor()))
                    .orElse(null);
            if (topScorer != null) {
                statistics.put("topScoringTeam", topScorer.getTeam().getName());
                statistics.put("topScoringTeamGoals", topScorer.getGoalsFor());
            }

            TeamRegisteredTournament bestDefense = teams.stream()
                    .min((t1, t2) -> Integer.compare(t1.getGoalsAgainst(), t2.getGoalsAgainst()))
                    .orElse(null);
            if (bestDefense != null) {
                statistics.put("bestDefensiveTeam", bestDefense.getTeam().getName());
                statistics.put("bestDefensiveTeamGoalsAgainst", bestDefense.getGoalsAgainst());
            }
        }

        if (!matches.isEmpty()) {
            int totalGoals = matches.stream()
                    .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
                    .mapToInt(match -> (match.getHomeTeamScore() != null ? match.getHomeTeamScore() : 0) +
                            (match.getAwayTeamScore() != null ? match.getAwayTeamScore() : 0))
                    .sum();
            statistics.put("totalGoals", totalGoals);

            if (completedMatches > 0) {
                statistics.put("averageGoalsPerMatch", (double) totalGoals / completedMatches);
            }
        }

        return statistics;
    }

    public TournamentStatisticsDTO getTournamentStatisticsDTO(Long tournamentId) {
        Map<String, Object> stats = getTournamentStatistics(tournamentId);
        return new TournamentStatisticsDTO(
                (String) stats.get("tournamentName"),
                stats.get("format").toString(),
                stats.get("state").toString(),
                (Integer) stats.get("totalTeams"),
                (Integer) stats.get("totalMatches"),
                stats.get("completedMatches") == null ? 0 : ((Long) stats.get("completedMatches")).intValue(),
                (String) stats.get("champion"),
                (String) stats.get("runnerUp"),
                (String) stats.get("topScoringTeam"),
                (Integer) stats.get("topScoringTeamGoals"),
                (String) stats.get("bestDefensiveTeam"),
                (Integer) stats.get("bestDefensiveTeamGoalsAgainst"),
                stats.get("totalGoals") == null ? 0 : (Integer) stats.get("totalGoals"),
                (Double) stats.get("averageGoalsPerMatch")
        );
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
        if (winner == null) return;

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
        List<TournamentMatch> allMatches = tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);

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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No hay franja horaria para la cancha y hora del partido");
        }

        Booking booking = new Booking(
                tournamentMatch.getTournament().getOrganizer(),
                timeSlot,
                tournamentMatch.getScheduledDateTime().toLocalDate(),
                hour
        );
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

    private void updateTeamStatistics(TournamentMatch match) {
        TeamRegisteredTournament homeTeam = match.getHomeTeam();
        TeamRegisteredTournament awayTeam = match.getAwayTeam();
        int homeScore = match.getHomeTeamScore();
        int awayScore = match.getAwayTeamScore();

        homeTeam.setGoalsFor(homeTeam.getGoalsFor() + homeScore);
        homeTeam.setGoalsAgainst(homeTeam.getGoalsAgainst() + awayScore);
        awayTeam.setGoalsFor(awayTeam.getGoalsFor() + awayScore);
        awayTeam.setGoalsAgainst(awayTeam.getGoalsAgainst() + homeScore);

        if (homeScore > awayScore) {
            homeTeam.setPoints(homeTeam.getPoints() + 3);
            homeTeam.setWins(homeTeam.getWins() + 1);
            awayTeam.setLosses(awayTeam.getLosses() + 1);
        } else if (awayScore > homeScore) {
            awayTeam.setPoints(awayTeam.getPoints() + 3);
            awayTeam.setWins(awayTeam.getWins() + 1);
            homeTeam.setLosses(homeTeam.getLosses() + 1);
        } else {
            homeTeam.setPoints(homeTeam.getPoints() + 1);
            awayTeam.setPoints(awayTeam.getPoints() + 1);
            homeTeam.setDraws(homeTeam.getDraws() + 1);
            awayTeam.setDraws(awayTeam.getDraws() + 1);
        }

        teamRegisteredTournamentRepository.save(homeTeam);
        teamRegisteredTournamentRepository.save(awayTeam);
    }
}