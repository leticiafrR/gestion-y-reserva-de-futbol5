package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator.*;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchResultDTO;
import ar.uba.fi.ingsoft1.todo_template.common.HelperAuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
public class FixtureService {
    private final TournamentRepository tournamentRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final FieldRepository fieldRepository;
    private final Map<TournamentFormat, FixtureGenerator> fixtureGenerators;

    private static final LocalTime MATCH_START_TIME = LocalTime.of(18, 0); // 6:00 PM
    private static final int MATCH_DURATION_HOURS = 1;
    private static final int MATCHES_PER_DAY = 4;

    public FixtureService(
            TournamentRepository tournamentRepository,
            TeamRegisteredTournamentRepository teamRegisteredTournamentRepository,
            TournamentMatchRepository tournamentMatchRepository,
            FieldRepository fieldRepository,
            Map<TournamentFormat, FixtureGenerator> fixtureGenerators) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.fieldRepository = fieldRepository;
        this.fixtureGenerators = fixtureGenerators;
    }

    @Transactional
    public List<TournamentMatch> generateFixture(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        checkActionCarriedOutByOrganizer(tournament.getOrganizer().username());

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
            currentDateTime = currentDateTime.plusHours(MATCH_DURATION_HOURS);
            matchesScheduledToday++;
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

        updateTeamStatistics(match);

        updateNextMatch(match);
        return tournamentMatchRepository.save(match);
    }

    public List<TournamentMatch> getFixture(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        return tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
    }

    private void updateNextMatch(TournamentMatch completedMatch) {
        TournamentMatch nextMatch = completedMatch.getNextMatch();
        if (nextMatch == null) return;

        TeamRegisteredTournament winner = determineWinner(completedMatch);
        if (winner == null) return;

        if (completedMatch.isHomeTeamNextMatch()) {
            nextMatch.setHomeTeam(winner);
        } else {
            nextMatch.setAwayTeam(winner);
        }

        tournamentMatchRepository.save(nextMatch);
    }

    private TeamRegisteredTournament determineWinner(TournamentMatch match) {
        if (match.getHomeTeamScore() > match.getAwayTeamScore()) {
            return match.getHomeTeam();
        } else if (match.getAwayTeamScore() > match.getHomeTeamScore()) {
            return match.getAwayTeam();
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