package ar.uba.fi.ingsoft1.todo_template.user.userServiceException;

public class UnableToSendMessageException extends RuntimeException {

    public UnableToSendMessageException(String email) {
        super("Unable to comunicate to'" + email + "', retry later or try with another email");
    }

}
