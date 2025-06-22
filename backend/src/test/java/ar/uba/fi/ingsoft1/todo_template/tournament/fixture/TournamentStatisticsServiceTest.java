package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
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

        setupTournamentInProgress();
        TournamentStatisticsDTO stats = tournamentStatisticsService.getTournamentStatistics(1L);
        assertNotNull(stats);
        assertEquals(3, stats.getTotalTeams());
    }

    @Test
    void testGetTournamentStatistics_CompletedMatchesNames() {
        // Crear equipos de prueba
        Team team1 = new Team();
        team1.setName("Equipo A");
        Team team2 = new Team();
        team2.setName("Equipo B");
        Team team3 = new Team();
        team3.setName("Equipo C");

        // Crear registros de equipos en el torneo
        TeamRegisteredTournament reg1 = new TeamRegisteredTournament();
        reg1.setTeam(team1);
        TeamRegisteredTournament reg2 = new TeamRegisteredTournament();
        reg2.setTeam(team2);
        TeamRegisteredTournament reg3 = new TeamRegisteredTournament();
        reg3.setTeam(team3);

        // Crear matches completados
        TournamentMatch match1 = new TournamentMatch();
        match1.setHomeTeam(reg1);
        match1.setAwayTeam(reg2);
        match1.setStatus(MatchStatus.COMPLETED);

        TournamentMatch match2 = new TournamentMatch();
        match2.setHomeTeam(reg2);
        match2.setAwayTeam(reg3);
        match2.setStatus(MatchStatus.COMPLETED);

        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setStartDate(LocalDate.now().minusDays(1));
        tournament.setEndDate(LocalDate.now().plusDays(10));
        tournament.setOpenInscription(true);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(teamRegisteredTournamentRepository.findByTournament(tournament))
                .thenReturn(new ArrayList<>(List.of(reg1, reg2, reg3)));
        when(tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament))
                .thenReturn(new ArrayList<>(List.of(match1, match2)));

        // Obtener estadísticas
        TournamentStatisticsDTO stats = tournamentStatisticsService.getTournamentStatistics(1L);
        assertNotNull(stats);

        // Verificar nombres de matches completados
        List<String> completedMatchesNames = stats.getCompletedMatchesNames();
        assertNotNull(completedMatchesNames);
        assertEquals(2, completedMatchesNames.size());
        assertTrue(completedMatchesNames.contains("Equipo A vs Equipo B"));
        assertTrue(completedMatchesNames.contains("Equipo B vs Equipo C"));
    }

    void setupTournamentInProgress() {
        Tournament tournament = new Tournament();
        tournament.setId(1L);
        tournament.setName("Test Tournament");
        tournament.setFormat(TournamentFormat.ROUND_ROBIN);
        tournament.setStartDate(LocalDate.now().minusDays(1));// empezó hace poco
        tournament.setEndDate(LocalDate.now().plusDays(10));// termina en 10 dias
        tournament.setOpenInscription(true);// nunca se cambió manualmente

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(teamRegisteredTournamentRepository.findByTournament(tournament)).thenReturn(new ArrayList<>());
        when(tournamentMatchRepository.findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament))
                .thenReturn(new ArrayList<>());
    }

    @Test
    void testUpdateTeamStatistics_HomeTeamWins() {

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

        tournamentStatisticsService.updateTeamStatistics(match);

        verify(teamRegisteredTournamentRepository, times(2)).save(any(TeamRegisteredTournament.class));
        assertEquals(3, homeTeam.getGoalsFor());
        assertEquals(1, homeTeam.getGoalsAgainst());
        assertEquals(3, homeTeam.getPoints());
        assertEquals(1, homeTeam.getWins());
        assertEquals(1, awayTeam.getGoalsFor());
        assertEquals(3, awayTeam.getGoalsAgainst());
        assertEquals(0, awayTeam.getPoints());
        assertEquals(1, awayTeam.getLosses());
    }

    @Test
    void testUpdateTeamStatistics_Draw() {
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
        match.setHomeTeamScore(2);
        match.setAwayTeamScore(2);

        tournamentStatisticsService.updateTeamStatistics(match);

        verify(teamRegisteredTournamentRepository, times(2)).save(any(TeamRegisteredTournament.class));
        assertEquals(2, homeTeam.getGoalsFor());
        assertEquals(2, homeTeam.getGoalsAgainst());
        assertEquals(1, homeTeam.getPoints());
        assertEquals(1, homeTeam.getDraws());
        assertEquals(2, awayTeam.getGoalsFor());
        assertEquals(2, awayTeam.getGoalsAgainst());
        assertEquals(1, awayTeam.getPoints());
        assertEquals(1, awayTeam.getDraws());
    }

}
