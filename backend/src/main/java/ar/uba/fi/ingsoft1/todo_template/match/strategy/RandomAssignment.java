package ar.uba.fi.ingsoft1.todo_template.match.strategy;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import ar.uba.fi.ingsoft1.todo_template.match.OpenMatch;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import java.util.Collections;

public class RandomAssignment implements TeamAssignmentStrategy {
    private final Random random = new Random();

    @Override
    public void assignTeams(OpenMatch match) {
        List<User> players = new ArrayList<>(match.getPlayers());
        Collections.shuffle(players, random);
        match.getTeamOne().clearMembers();
        match.getTeamTwo().clearMembers();

        for (int i = 0; i < players.size(); i++) {
            if (i % 2 == 0) {
                match.getTeamOne().addMember(players.get(i));
            } else {
                match.getTeamTwo().addMember(players.get(i));
            }
        }
    }
}

