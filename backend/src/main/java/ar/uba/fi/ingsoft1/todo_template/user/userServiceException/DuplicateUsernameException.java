package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class DuplicateUsernameException extends RuntimeException {
    public DuplicateUsernameException(String username) {
        super("The username '" + username + "' is already taken");
    }
}
