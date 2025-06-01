package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class InavlidCredentialsException extends RuntimeException {

    public InavlidCredentialsException() {
        super("Invalid credentials: please check your username and password.");
    }

}
