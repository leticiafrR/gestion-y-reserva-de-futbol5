package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("The email '" + email + "' was already registered");
    }
}