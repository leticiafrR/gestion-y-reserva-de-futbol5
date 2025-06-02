package ar.uba.fi.ingsoft1.todo_template.config;

import ar.uba.fi.ingsoft1.todo_template.common.exception.ItemNotFoundException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.DuplicateUsernameException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InactiveOrUnverifiedAccountException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InavlidCredentialsException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.InvalidTokenException;
import ar.uba.fi.ingsoft1.todo_template.user.userServiceException.UnableToSendMessageException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalControllerExceptionHandler {

    @ExceptionHandler({ UnableToSendMessageException.class, DuplicateUsernameException.class })
    public ResponseEntity<IncorrectValueResponse> handleRegistUsernameExceptions(RuntimeException ex) {
        return new ResponseEntity<>(new IncorrectValueResponse("username", ex.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler({ InactiveOrUnverifiedAccountException.class, InavlidCredentialsException.class })
    public ResponseEntity<String> handleLoginExceptions(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<String> handleUnableToSendEmail(InvalidTokenException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = ItemNotFoundException.class, produces = "text/plain")
    @ApiResponse(responseCode = "404", description = "Referenced entity not found", content = @Content(mediaType = "text/plain", schema = @Schema(implementation = String.class, example = "Failed to find foo with id 42")))
    public ResponseEntity<String> handleItemNotFound(ItemNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ApiResponse(responseCode = "403", description = "Invalid jwt access token supplied", content = @Content)
    public ResponseEntity<String> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<String> handleFallback(Throwable ex) {
        return new ResponseEntity<>(
                ex.getClass().getCanonicalName() + " " + ex.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public record IncorrectValueResponse(String field, String error_description) {
    }

}