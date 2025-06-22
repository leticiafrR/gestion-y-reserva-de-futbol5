package ar.uba.fi.ingsoft1.todo_template.tournament.fixture;

import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentFormat;
import ar.uba.fi.ingsoft1.todo_template.tournament.TournamentState;
import java.util.List;
import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
@Builder
public class TournamentStatisticsDTO {

        private String tournamentName;
        private TournamentFormat format;
        private TournamentState state;
        private int totalTeams;
        private int totalMatches;
        private int cantCompletedMatches;
        private List<String> completedMatchesNames;
        private String champion;
        private String runnerUp;
        private List<TeamName_Goals> topScoringTeams;
        private String bestDefensiveTeam;
        private Integer bestDefensiveTeamGoalsAgainst;
        private int totalGoals;
        private Double averageGoalsPerMatch;

        public TournamentStatisticsDTO() {
                this.completedMatchesNames = new ArrayList<>();
                this.topScoringTeams = new ArrayList<>();
                this.bestDefensiveTeam = "";
                this.bestDefensiveTeamGoalsAgainst = 0;
                this.totalGoals = 0;
                this.averageGoalsPerMatch = 0.0;
                this.cantCompletedMatches = 0;
                this.totalMatches = 0;
                this.totalTeams = 0;
                this.champion = "";
                this.runnerUp = "";
        }

        public TournamentStatisticsDTO(String tournamentName, TournamentFormat format, TournamentState state,
                        int totalTeams, int totalMatches, int cantCompletedMatches, List<String> completedMatchesNames,
                        String champion, String runnerUp, List<TeamName_Goals> topScoringTeams,
                        String bestDefensiveTeam,
                        Integer bestDefensiveTeamGoalsAgainst, int totalGoals, Double averageGoalsPerMatch) {
                this.tournamentName = tournamentName;
                this.format = format;
                this.state = state;
                this.totalTeams = totalTeams;
                this.totalMatches = totalMatches;
                this.cantCompletedMatches = cantCompletedMatches;
                this.completedMatchesNames = completedMatchesNames != null ? completedMatchesNames : new ArrayList<>();
                this.champion = champion;
                this.runnerUp = runnerUp;
                this.topScoringTeams = topScoringTeams != null ? topScoringTeams : new ArrayList<>();
                this.bestDefensiveTeam = bestDefensiveTeam;
                this.bestDefensiveTeamGoalsAgainst = bestDefensiveTeamGoalsAgainst;
                this.totalGoals = totalGoals;
                this.averageGoalsPerMatch = averageGoalsPerMatch;
        }
}
