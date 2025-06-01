package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class InactiveOrUnverifiedAccountException extends RuntimeException {

    public InactiveOrUnverifiedAccountException() {
        super("Inactive or unverified account: if it is unverified, please verify your account; if it is inactive, please contact support.");
    }

}
