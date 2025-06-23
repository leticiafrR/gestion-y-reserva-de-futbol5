package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamTournamentId;
import java.util.List;
import java.time.LocalDate;

import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.team.Team;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentStatisticsServiceTest {

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;

    @Mock
    private TournamentMatchRepository tournamentMatchRepository;

    private TournamentStatisticsService tournamentStatisticsService;

    @BeforeEach
    void cleanMocks() {
        reset(tournamentRepository);
        reset(teamRegisteredTournamentRepository);
        reset(tournamentMatchRepository);
    }

    @BeforeEach
    void setUp() {
        tournamentStatisticsService = new TournamentStatisticsService(
                tournamentRepository,
                teamRegisteredTournamentRepository,
                tournamentMatchRepository);
    }

    @Test
    void testGetTournamentStatistics_TournamentNotFound() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> {
            tournamentStatisticsService.getTournamentStatistics(1L);
        });
    }

    @Test
    void testGetTournamentStatistics_TournamentFoundByName() {
        setupTournamentInProgress();
        TournamentStatisticsDTO stats = tournamentStatisticsService.getTournamentStatistics(1L);
        assertNotNull(stats);
        assertEquals("Test Tournament", stats.getTournamentName());
    }

    @Test
    void testGetTournamentStatistics_TournamentWith3TeamsShouldReturn3TotalTeams() {
        setupTournamentWith3Teams();
        TournamentStatisticsDTO stats = tournamentStatisticsService.getTournamentStatistics(1L);
        assertNotNull(stats);
        assertEquals(3, stats.getTotalTeams());
    }

    @Test
    void testDrawUpdatesHomeTeamGoalsFor() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament homeTeam = match.getHomeTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(2, homeTeam.getGoalsFor());
    }

    @Test
    void testDrawUpdatesHomeTeamGoalsAgainst() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament homeTeam = match.getHomeTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(2, homeTeam.getGoalsAgainst());
    }

    @Test
    void testDrawUpdatesHomeTeamPoints() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament homeTeam = match.getHomeTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, homeTeam.getPoints());
    }

    @Test
    void testDrawUpdatesHomeTeamDraws() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament homeTeam = match.getHomeTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, homeTeam.getDraws());
    }

    @Test
    void testDrawUpdatesAwayTeamGoalsFor() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament awayTeam = match.getAwayTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(2, awayTeam.getGoalsFor());
    }

    @Test
    void testDrawUpdatesAwayTeamGoalsAgainst() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament awayTeam = match.getAwayTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(2, awayTeam.getGoalsAgainst());
    }

    @Test
    void testDrawUpdatesAwayTeamPoints() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament awayTeam = match.getAwayTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, awayTeam.getPoints());
    }

    @Test
    void testDrawUpdatesAwayTeamDraws() {
        TournamentMatch match = setupDrawMatch();
        TeamRegisteredTournament awayTeam = match.getAwayTeam();

        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, awayTeam.getDraws());
    }

    @Test
    void testGetTournamentStatistics_CompletedMatchesNames() {
        setupTournamentWithCompletedMatches();
        TournamentStatisticsDTO stats = tournamentStatisticsService.getTournamentStatistics(1L);
        assertNotNull(stats);

        List<String> completedMatchesNames = stats.getCompletedMatchesNames();
        assertNotNull(completedMatchesNames);
        assertEquals(2, completedMatchesNames.size());
        assertTrue(completedMatchesNames.contains("Equipo A vs Equipo B"));
        assertTrue(completedMatchesNames.contains("Equipo B vs Equipo C"));
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_VerifyRepositoryCalls() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        verify(teamRegisteredTournamentRepository, times(2)).save(any(TeamRegisteredTournament.class));
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_HomeTeamGoalsFor() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(3, match.getHomeTeam().getGoalsFor());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_HomeTeamGoalsAgainst() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, match.getHomeTeam().getGoalsAgainst());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_HomeTeamPoints() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(3, match.getHomeTeam().getPoints());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_HomeTeamWins() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, match.getHomeTeam().getWins());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_AwayTeamGoalsFor() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, match.getAwayTeam().getGoalsFor());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_AwayTeamGoalsAgainst() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(3, match.getAwayTeam().getGoalsAgainst());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_AwayTeamPoints() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(0, match.getAwayTeam().getPoints());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins_AwayTeamLosses() {
        TournamentMatch match = setupHomeTeamWinsMatch();
        tournamentStatisticsService.updateTeamStatistics(match);
        assertEquals(1, match.getAwayTeam().getLosses());
    }

    private TournamentMatch setupHomeTeamWinsMatch() {
        Tournament tournament = new Tournament();
        Team team1 = new Team();
        Team team2 = new Team();
        TeamRegisteredTournament homeTeam = TeamRegisteredTournament.builder()
                .tournament(tournament)
                .team(team1)
                .build();

        TeamRegisteredTournament awayTeam = TeamRegisteredTournament.builder()
                .tournament(tournament)
                .team(team2)
                .build();
        TournamentMatch match = new TournamentMatch();
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setHomeTeamScore(3);
        match.setAwayTeamScore(1);
        return match;
    }

    TournamentMatch setupDrawMatch() {
        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.GROUP_STAGE_AND_ELIMINATION);
        tournament.setStartDate(LocalDate.now());
        tournament.setMaxTeams(2);
        tournament.setOpenInscription(true);

        TeamRegisteredTournament homeTeam = new TeamRegisteredTournament();
        homeTeam.setId(new TeamTournamentId(1L, 1L));

        TeamRegisteredTournament awayTeam = new TeamRegisteredTournament();
        awayTeam.setId(new TeamTournamentId(2L, 1L));

        tournament.addNewTeamRegisted();
        tournament.addNewTeamRegisted();

        TournamentMatch match = new TournamentMatch();
        match.setHomeTeam(homeTeam);
        match.setAwayTeam(awayTeam);
        match.setHomeTeamScore(2);
        match.setAwayTeamScore(2);
        match.setRoundNumber(1);
        match.setMatchNumber(1);

        return match;
    }

    void setupTournamentWithCompletedMatches() {
        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setStartDate(LocalDate.now().minusDays(1));
        tournament.setEndDate(LocalDate.now().plusDays(10));
        tournament.setOpenInscription(true);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        Team team1 = new Team();
        team1.setId(1L);
        team1.setName("Equipo A");
        Team team2 = new Team();
        team2.setId(2L);
        team2.setName("Equipo B");
        Team team3 = new Team();
        team3.setId(3L);
        team3.setName("Equipo C");

        TeamRegisteredTournament reg1 = new TeamRegisteredTournament();
        reg1.setId(new TeamTournamentId(1L, 1L));
        reg1.setTeam(team1);
        reg1.setTournament(tournament);
        TeamRegisteredTournament reg2 = new TeamRegisteredTournament();
        reg2.setId(new TeamTournamentId(2L, 1L));
        reg2.setTeam(team2);
        reg2.setTournament(tournament);
        TeamRegisteredTournament reg3 = new TeamRegisteredTournament();
        reg3.setId(new TeamTournamentId(3L, 1L));
        reg3.setTeam(team3);
        reg3.setTournament(tournament);

        TournamentMatch match1 = new TournamentMatch();
        match1.setId(1L);
        match1.setHomeTeam(reg1);
        match1.setAwayTeam(reg2);
        match1.setStatus(MatchStatus.COMPLETED);
        match1.setRoundNumber(1);
        match1.setMatchNumber(1);

        TournamentMatch match2 = new TournamentMatch();
        match2.setId(2L);
        match2.setHomeTeam(reg2);
        match2.setAwayTeam(reg3);
        match2.setStatus(MatchStatus.COMPLETED);
        match2.setRoundNumber(1);
        match2.setMatchNumber(2);

        when(teamRegisteredTournamentRepository.findByTournament(tournament))
                .thenReturn(new ArrayList<>(List.of(reg1, reg2, reg3)));
        when(tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament))
                .thenReturn(new ArrayList<>(List.of(match1, match2)));
    }

    void setupTournamentWith3Teams() {
        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setStartDate(LocalDate.now().minusDays(1));
        tournament.setEndDate(LocalDate.now().plusDays(10));
        tournament.setOpenInscription(true);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        Team team1 = new Team();
        team1.setId(1L);
        team1.setName("Equipo A");
        Team team2 = new Team();
        team2.setId(2L);
        team2.setName("Equipo B");
        Team team3 = new Team();
        team3.setId(3L);
        team3.setName("Equipo C");

        TeamRegisteredTournament reg1 = new TeamRegisteredTournament();
        reg1.setId(new TeamTournamentId(1L, 1L));
        reg1.setTeam(team1);
        reg1.setTournament(tournament);
        TeamRegisteredTournament reg2 = new TeamRegisteredTournament();
        reg2.setId(new TeamTournamentId(2L, 1L));
        reg2.setTeam(team2);
        reg2.setTournament(tournament);
        TeamRegisteredTournament reg3 = new TeamRegisteredTournament();
        reg3.setId(new TeamTournamentId(3L, 1L));
        reg3.setTeam(team3);
        reg3.setTournament(tournament);

        when(teamRegisteredTournamentRepository.findByTournament(tournament))
                .thenReturn(new ArrayList<>(List.of(reg1, reg2, reg3)));
        when(tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament))
                .thenReturn(new ArrayList<>());
    }

    void setupTournamentInProgress() {
        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setStartDate(LocalDate.now().minusDays(1));
        tournament.setEndDate(LocalDate.now().plusDays(10));
        tournament.setOpenInscription(true);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(teamRegisteredTournamentRepository.findByTournament(tournament)).thenReturn(new ArrayList<>());
        when(tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament))
                .thenReturn(new ArrayList<>());
    }
}
