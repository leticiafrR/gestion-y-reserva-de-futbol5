package ar.uba.fi.ingsoft1.todo_template.tournament.fixture.generator;

import ar.uba.fi.ingsoft1.todo_template.tournament.Tournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.TeamRegisteredTournament;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.TournamentMatch;
import ar.uba.fi.ingsoft1.todo_template.tournament.fixture.MatchStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class SingleEliminationGenerator implements FixtureGenerator {
    @Override
    public List<TournamentMatch> generateFixture(Tournament tournament, List<TeamRegisteredTournament> teams) {
        List<TournamentMatch> matches = new ArrayList<>();
        int numTeams = teams.size();

        // Calcular el número de rondas necesarias
        int numRounds = (int) Math.ceil(Math.log(numTeams) / Math.log(2));
        int totalMatches = (int) Math.pow(2, numRounds) - 1;
        int firstRoundMatches = (int) Math.pow(2, numRounds - 1);

        // Crear todos los partidos
        for (int i = 0; i < totalMatches; i++) {
            TournamentMatch match = new TournamentMatch();
            match.setTournament(tournament);
            match.setRoundNumber((int) (Math.log(i + 1) / Math.log(2)) + 1);
            match.setMatchNumber(i + 1);
            match.setStatus(MatchStatus.SCHEDULED);
            matches.add(match);
        }

        // Asignar equipos a la primera ronda
        List<TeamRegisteredTournament> seededTeams = new ArrayList<>(teams);
        Collections.shuffle(seededTeams); // Mezclar equipos para el sorteo

        for (int i = 0; i < firstRoundMatches; i++) {
            TournamentMatch match = matches.get(i);
            int homeIndex = i * 2;
            int awayIndex = i * 2 + 1;

            if (homeIndex < seededTeams.size()) {
                match.setHomeTeam(seededTeams.get(homeIndex));
            }
            if (awayIndex < seededTeams.size()) {
                match.setAwayTeam(seededTeams.get(awayIndex));
            }
        }

        // Conectar los partidos para la siguiente ronda
        for (int round = 1; round < numRounds; round++) {
            int matchesInRound = (int) Math.pow(2, numRounds - round - 1);
            int startIndex = (int) Math.pow(2, round) - 1;

            for (int i = 0; i < matchesInRound; i++) {
                TournamentMatch currentMatch = matches.get(startIndex + i);
                TournamentMatch nextMatch = matches.get(startIndex + i + matchesInRound);

                currentMatch.setNextMatch(nextMatch);
                currentMatch.setHomeTeamNextMatch(i % 2 == 0);
            }
        }

        return matches;
    }
}