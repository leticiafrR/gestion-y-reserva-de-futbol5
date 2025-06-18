package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

public record TournamentStatisticsDTO(
        String tournamentName,
        String format,
        String state,
        int totalTeams,
        int totalMatches,
        int completedMatches,
        String champion,
        String runnerUp,
        String topScoringTeam,
        Integer topScoringTeamGoals,
        String bestDefensiveTeam,
        Integer bestDefensiveTeamGoalsAgainst,
        int totalGoals,
        Double averageGoalsPerMatch
) {}