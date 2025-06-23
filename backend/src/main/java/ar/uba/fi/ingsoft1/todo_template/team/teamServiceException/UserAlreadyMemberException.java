package ar.uba.fi.ingsoft1.todo_template.team.teamServiceException;

public class UserAlreadyMemberException extends RuntimeException {
    public UserAlreadyMemberException(String message) {
        super(message);
    }
}
