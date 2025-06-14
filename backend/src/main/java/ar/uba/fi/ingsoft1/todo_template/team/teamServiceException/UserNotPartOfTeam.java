package ar.uba.fi.ingsoft1.todo_template.team.teamServiceException;

public class UserNotPartOfTeam extends RuntimeException {
    public UserNotPartOfTeam(String message) {
        super(message);
    }
}
