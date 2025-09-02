package gr.ath.ds.rentsystem.util.exceptions;

import gr.ath.ds.rentsystem.util.exceptions.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppObjectNotFoundException.class)
    public ResponseEntity<?> handleNotFound(AppObjectNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "not_found", ex.getMessage());
    }

    @ExceptionHandler(AppObjectAlreadyExists.class)
    public ResponseEntity<?> handleAlreadyExists(AppObjectAlreadyExists ex) {
        return buildResponse(HttpStatus.CONFLICT, "already_exists", ex.getMessage());
    }

    @ExceptionHandler(AppObjectNotAuthorizedException.class)
    public ResponseEntity<?> handleForbidden(AppObjectNotAuthorizedException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "forbidden", ex.getMessage());
    }

    @ExceptionHandler(AppObjectInvalidArgumentException.class)
    public ResponseEntity<?> handleBadRequest(AppObjectInvalidArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "invalid_argument", ex.getMessage());
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "validation_error", ex.getMessage());
    }

    @ExceptionHandler(AppServerException.class)
    public ResponseEntity<?> handleServer(AppServerException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "server_error", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "unexpected_error", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", code,
                "message", message
        ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "invalid_credentials", ex.getMessage());
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<?> handleDisabled(DisabledException ex) {
        return buildResponse(HttpStatus.FORBIDDEN, "account_disabled", ex.getMessage());
    }
}
