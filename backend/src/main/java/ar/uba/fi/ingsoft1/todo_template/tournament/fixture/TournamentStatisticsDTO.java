package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentState;
import java.util.List;
import java.util.ArrayList;

public record TournamentStatisticsDTO(
                String tournamentName,
                TournamentFormat format,
                TournamentState state,
                int totalTeams,
                int totalMatches,
                int cantCompletedMatches,
                List<String> completedMatchesNames,
                String champion,
                String runnerUp,
                String topScoringTeam,
                Integer topScoringTeamGoals,
                String bestDefensiveTeam,
                Integer bestDefensiveTeamGoalsAgainst,
                int totalGoals,
                Double averageGoalsPerMatch) {
        public static TournamentStatisticsDTOBuilder builder() {
                return new TournamentStatisticsDTOBuilder();
        }

        public static class TournamentStatisticsDTOBuilder {
                private String tournamentName;
                private TournamentFormat format;
                private TournamentState state;
                private int totalTeams;
                private int totalMatches;
                private int cantCompletedMatches;
                private List<String> completedMatchesNames;
                private String champion;
                private String runnerUp;
                private String topScoringTeam;
                private Integer topScoringTeamGoals;
                private String bestDefensiveTeam;
                private Integer bestDefensiveTeamGoalsAgainst;
                private int totalGoals;
                private Double averageGoalsPerMatch;

                public TournamentStatisticsDTOBuilder tournamentName(String tournamentName) {
                        this.tournamentName = tournamentName;
                        return this;
                }

                public TournamentStatisticsDTOBuilder format(TournamentFormat format) {
                        this.format = format;
                        return this;
                }

                public TournamentStatisticsDTOBuilder state(TournamentState state) {
                        this.state = state;
                        return this;
                }

                public TournamentStatisticsDTOBuilder totalTeams(int totalTeams) {
                        this.totalTeams = totalTeams;
                        return this;
                }

                public TournamentStatisticsDTOBuilder totalMatches(int totalMatches) {
                        this.totalMatches = totalMatches;
                        return this;
                }

                public TournamentStatisticsDTOBuilder cantCompletedMatches(int cantCompletedMatches) {
                        this.cantCompletedMatches = cantCompletedMatches;
                        return this;
                }

                public TournamentStatisticsDTOBuilder completedMatchesNames(List<String> completedMatchesNames) {
                        this.completedMatchesNames = completedMatchesNames;
                        return this;
                }

                public TournamentStatisticsDTOBuilder champion(String champion) {
                        this.champion = champion;
                        return this;
                }

                public TournamentStatisticsDTOBuilder runnerUp(String runnerUp) {
                        this.runnerUp = runnerUp;
                        return this;
                }

                public TournamentStatisticsDTOBuilder topScoringTeam(String topScoringTeam) {
                        this.topScoringTeam = topScoringTeam;
                        return this;
                }

                public TournamentStatisticsDTOBuilder topScoringTeamGoals(Integer topScoringTeamGoals) {
                        this.topScoringTeamGoals = topScoringTeamGoals;
                        return this;
                }

                public TournamentStatisticsDTOBuilder bestDefensiveTeam(String bestDefensiveTeam) {
                        this.bestDefensiveTeam = bestDefensiveTeam;
                        return this;
                }

                public TournamentStatisticsDTOBuilder bestDefensiveTeamGoalsAgainst(
                                Integer bestDefensiveTeamGoalsAgainst) {
                        this.bestDefensiveTeamGoalsAgainst = bestDefensiveTeamGoalsAgainst;
                        return this;
                }

                public TournamentStatisticsDTOBuilder totalGoals(int totalGoals) {
                        this.totalGoals = totalGoals;
                        return this;
                }

                public TournamentStatisticsDTOBuilder averageGoalsPerMatch(Double averageGoalsPerMatch) {
                        this.averageGoalsPerMatch = averageGoalsPerMatch;
                        return this;
                }

                public TournamentStatisticsDTO build() {
                        return new TournamentStatisticsDTO(
                                        tournamentName,
                                        format,
                                        state,
                                        totalTeams,
                                        totalMatches,
                                        cantCompletedMatches,
                                        completedMatchesNames,
                                        champion,
                                        runnerUp,
                                        topScoringTeam,
                                        topScoringTeamGoals,
                                        bestDefensiveTeam,
                                        bestDefensiveTeamGoalsAgainst,
                                        totalGoals,
                                        averageGoalsPerMatch);
                }
        }

}
