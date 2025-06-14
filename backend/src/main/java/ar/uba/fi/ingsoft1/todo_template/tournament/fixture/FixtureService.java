package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegistration;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegistrationRepository;
import ar.uba.fi.ingsoft1.todo_template.field.Field;
import ar.uba.fi.ingsoft1.todo_template.field.FieldRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator.*;
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
    private final TeamRegistrationRepository teamRegistrationRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final FieldRepository fieldRepository;
    private final Map<TournamentFormat, FixtureGenerator> fixtureGenerators;

    private static final LocalTime MATCH_START_TIME = LocalTime.of(18, 0); // 6:00 PM
    private static final int MATCH_DURATION_HOURS = 1;
    private static final int MATCHES_PER_DAY = 4;

    public FixtureService(
            TournamentRepository tournamentRepository,
            TeamRegistrationRepository teamRegistrationRepository,
            TournamentMatchRepository tournamentMatchRepository,
            FieldRepository fieldRepository,
            Map<TournamentFormat, FixtureGenerator> fixtureGenerators) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegistrationRepository = teamRegistrationRepository;
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

        List<TeamRegistration> teams = teamRegistrationRepository.findByTournamentAndStatus(tournament, TeamRegistrationStatus.APPROVED);
        if (teams.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No approved teams found for tournament");
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

        for (TournamentMatch match : matches) {
            if (matchesScheduledToday >= MATCHES_PER_DAY) {
                currentDate = currentDate.plusDays(1);
                matchesScheduledToday = 0;
            }

            LocalDateTime matchDateTime = LocalDateTime.of(currentDate, MATCH_START_TIME.plusHours(matchesScheduledToday * MATCH_DURATION_HOURS));
            match.setScheduledDateTime(matchDateTime);
            matchesScheduledToday++;
        }

        return tournamentMatchRepository.saveAll(matches);
    }

//    @Transactional
//    public TournamentMatch updateMatchResult(Long matchId, int homeTeamScore, int awayTeamScore) {
//
//    }

    private void updateNextMatch(TournamentMatch completedMatch) {
        TournamentMatch nextMatch = completedMatch.getNextMatch();
        if (nextMatch == null) return;

        TeamRegistration winner = determineWinner(completedMatch);
        if (winner == null) return;

        if (completedMatch.isHomeTeamNextMatch()) {
            nextMatch.setHomeTeam(winner);
        } else {
            nextMatch.setAwayTeam(winner);
        }

        tournamentMatchRepository.save(nextMatch);
    }

//    private TeamRegistration determineWinner(TournamentMatch match) {
//        if (match.getHomeTeamScore() > match.getAwayTeamScore()) {
//            return match.getHomeTeam();
//        } else if (match.getAwayTeamScore() > match.getHomeTeamScore()) {
//            return match.getAwayTeam();
//        }
//        return null;
//    }

    private void checkActionCarriedOutByOrganizer(String usernameOrganizer) {
        String username = HelperAuthenticatedUser.getAuthenticatedUsername();
        if (!usernameOrganizer.equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the organizer can perform this action");
        }
    }
}