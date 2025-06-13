package ar.uba.fi.ingsoft1.todo_template.match.strategy;

import ar.uba.fi.ingsoft1.todo_template.match.OpenMatch;
import ar.uba.fi.ingsoft1.todo_template.user.User;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class AgeBasedAssignment implements TeamAssignmentStrategy {
    @Override
    public void assignTeams(OpenMatch match) {
        List<User> players = new ArrayList<>(match.getPlayers());
        match.getTeamOne().clearMembers();
        match.getTeamTwo().clearMembers();

        players.sort(Comparator.comparing(User::getBirthYear));

        for (int i = 0; i < players.size(); i++) {
            int pattern = i % 4;
            if (pattern == 0 || pattern == 3) {
                match.getTeamOne().addMember(players.get(i)); // A
            } else {
                match.getTeamTwo().addMember(players.get(i)); // B
            }
        }
    }
}

