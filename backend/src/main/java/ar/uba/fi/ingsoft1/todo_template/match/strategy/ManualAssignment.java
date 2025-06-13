package ar.uba.fi.ingsoft1.todo_template.match.strategy;

import ar.uba.fi.ingsoft1.todo_template.match.OpenMatch;
import ar.uba.fi.ingsoft1.todo_template.user.User;
import java.util.Map;

public class ManualAssignment implements TeamAssignmentStrategy {
    private final Map<Long, Integer> assignments; // userId -> teamNumber (1 or 2)

    public ManualAssignment(Map<Long, Integer> assignments) {
        this.assignments = assignments;
    }

    @Override
    public void assignTeams(OpenMatch match) {

        match.getTeamOne().clearMembers();
        match.getTeamTwo().clearMembers();
        for (User player : match.getPlayers()) {
            Integer team = assignments.get(player.getId());
            if (team != null && team == 2) {
                match.getTeamTwo().addMember(player);
            } else {
                match.getTeamOne().addMember(player);
            }
        }
    }
}