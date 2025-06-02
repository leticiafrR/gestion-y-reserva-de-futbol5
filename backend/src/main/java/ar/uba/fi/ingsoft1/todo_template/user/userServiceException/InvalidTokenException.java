package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException() {
        super("Invalid or expired given token");
    }

}
