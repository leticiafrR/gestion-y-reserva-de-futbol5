package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentRepository;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentState;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TournamentStatisticsService {

    private final TournamentRepository tournamentRepository;
    private final TeamRegisteredTournamentRepository teamRegisteredTournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;

    public TournamentStatisticsService(
            TournamentRepository tournamentRepository,
            TeamRegisteredTournamentRepository teamRegisteredTournamentRepository,
            TournamentMatchRepository tournamentMatchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.teamRegisteredTournamentRepository = teamRegisteredTournamentRepository;
        this.tournamentMatchRepository = tournamentMatchRepository;
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

            if (tournament.getState() == TournamentState.FINISHED && teams.size() >= 1) {
                statistics.put("champion", teams.get(0).getTeam().getName());
                if (teams.size() >= 2) {
                    statistics.put("runnerUp", teams.get(1).getTeam().getName());
                }
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
} 