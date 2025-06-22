package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentState;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatchRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentStatisticsDTO;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentStatisticsDTO.TournamentStatisticsDTOBuilder;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatchHelper;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentHelper;
import ar.uba.fi.ingsoft1.todo_template.tournament.teamRegistration.TeamRegisteredTournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class TournamentStatisticsService {

    private final TournamentRepository tournamentRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentMatchHelper tournamentMatchHelper;
    private final TeamRegisteredTournamentHelper teamRegisteredTournamentHelper;

    public TournamentStatisticsService(TournamentRepository tournamentRepository,
            TeamRegisteredTournamentRepository teamRegisteredTournamentRepository,
            TournamentMatchRepository tournamentMatchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
        this.tournamentMatchHelper = new TournamentMatchHelper(tournamentMatchRepository);
        this.teamRegisteredTournamentHelper = new TeamRegisteredTournamentHelper(teamRegisteredTournamentRepository);
    }

    public void updateTeamStatistics(TournamentMatch match) {
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

    public TournamentStatisticsDTO getTournamentStatistics(Long tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found"));

        List<TeamRegisteredTournament> sortedByStandingsTeamsRegistered = teamRegisteredTournamentHelper
                .getSortedByStandingsTeamsForTournament(tournament);
        List<TeamName_Goals> teams_goals_SortedByGoals = teamRegisteredTournamentHelper
                .getSortedTeamsByGoalsFor(tournament)
                .stream()
                .map(team -> new TeamName_Goals(team.getTeam().getName(), team.getGoalsFor()))
                .collect(Collectors.toList());

        List<TournamentMatch> matchesTournament = tournamentMatchRepository
                .findAllByTournamentOrderByRoundNumberAscMatchNumberAsc(tournament);
        Optional<TeamRegisteredTournament> bestDefense = teamRegisteredTournamentHelper
                .getBestDefensiveTeam(sortedByStandingsTeamsRegistered);

        int completedMatches = (int) matchesTournament.stream()
                .filter(match -> match.getStatus() == MatchStatus.COMPLETED)
                .count();

        TournamentStatisticsDTOBuilder builder = TournamentStatisticsDTO.builder()
                .tournamentName(tournament.getName())
                .format(tournament.getFormat())
                .state(tournament.getState())
                .totalTeams(sortedByStandingsTeamsRegistered.size())
                .totalMatches(matchesTournament.size())
                .cantCompletedMatches((int) completedMatches)
                .topScoringTeams(teams_goals_SortedByGoals);
        if (bestDefense.isPresent()) {
            builder.bestDefensiveTeam(bestDefense.get().getTeam().getName());
            builder.bestDefensiveTeamGoalsAgainst(bestDefense.get().getGoalsAgainst());
        }
        // Map<String, Object> statistics = new java.util.HashMap<>();
        // statistics.put("tournamentName", tournament.getName());
        // statistics.put("format", tournament.getFormat());
        // statistics.put("state", tournament.getState());
        // statistics.put("totalTeams", sortedTeamsRegistered.size());
        // statistics.put("totalMatches", matchesTournament.size());

        // builder.cantCompletedMatches(completedMatches);

        if (!sortedByStandingsTeamsRegistered.isEmpty()) {

            if (!matchesTournament.isEmpty() && completedMatches == matchesTournament.size()) {
                builder.champion(sortedByStandingsTeamsRegistered.get(0).getTeam().getName());
                if (sortedByStandingsTeamsRegistered.size() >= 2) {
                    builder.runnerUp(sortedByStandingsTeamsRegistered.get(1).getTeam().getName());
                }
            }

        }

        if (!matchesTournament.isEmpty()) {
            int totalGoals = tournamentMatchHelper.calculateTotalGoals(matchesTournament);
            builder.totalGoals(totalGoals);

            List<String> completedMatchesNames = tournamentMatchHelper.getCompletedMatchesNames(matchesTournament);
            builder.completedMatchesNames(completedMatchesNames);

            if (completedMatches > 0) {
                double averageGoals = tournamentMatchHelper.calculateAverageGoalsPerMatch(totalGoals, completedMatches);
                builder.averageGoalsPerMatch(averageGoals);
            }
        }

        return builder.build();
    }

    // public TournamentStatisticsDTO getTournamentStatisticsDTO(Long tournamentId)
    // {
    // return getTournamentStatistics(tournamentId);
    // // return new TournamentStatisticsDTO(
    // // (String) stats.get("tournamentName"),
    // // (TournamentFormat) stats.get("format"),
    // // (TournamentState) stats.get("state"),
    // // ((Integer) stats.get("totalTeams")).intValue(),
    // ((Integer) stats.get("totalMatches")).intValue(),
    // stats.get("completedMatches") == null ? 0 : ((Long)
    // stats.get("completedMatches")).intValue(),
    // stats.get("completedMatchesNames") != null ? (List<String>)
    // stats.get("completedMatchesNames")
    // : new ArrayList<>(),
    // (String) stats.get("champion"),
    // (String) stats.get("runnerUp"),
    // (List<TeamName_Goals>) stats.get("topScoringTeams"),
    // (String) stats.get("bestDefensiveTeam"),
    // (Integer) stats.get("bestDefensiveTeamGoalsAgainst"),
    // stats.get("totalGoals") == null ? 0 : ((Integer)
    // stats.get("totalGoals")).intValue(),
    // stats.get("averageGoalsPerMatch") == null ? 0.0 : (Double)
    // stats.get("averageGoalsPerMatch"));
    // }
}