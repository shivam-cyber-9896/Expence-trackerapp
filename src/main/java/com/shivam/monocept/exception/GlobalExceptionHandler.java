package com.shivam.monocept.exception;

import com.shivam.monocept.dto.response.ErrorResponseDto;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Hidden
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BudgetExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleBudgetExceededException(BudgetExceededException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Budget Exceeded",
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponseDto> handleDuplicateResourceException(DuplicateResourceException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.CONFLICT.value(),
                "Duplicate Resource",
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DepartmentExpenseException.class)
    public ResponseEntity<ErrorResponseDto> handleDepartmentExpenseException(DepartmentExpenseException ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Business Rule Violation",
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((err) -> {
            String fieldName = ((FieldError) err).getField();
            String errorMessage = err.getDefaultMessage();
            details.put(fieldName, errorMessage);
        });

        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.BAD_REQUEST.value(),
                "Validation Failed",
                "Input parameter validation failed",
                details
        );
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({
        org.springframework.orm.ObjectOptimisticLockingFailureException.class,
        jakarta.persistence.OptimisticLockException.class
    })
    public ResponseEntity<ErrorResponseDto> handleOptimisticLockException(Exception ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.CONFLICT.value(),
                "Resource Conflict",
                "The resource has been updated or deleted by another transaction. Please refresh and try again.",
                null
        );
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneralException(Exception ex) {
        ErrorResponseDto error = new ErrorResponseDto(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
