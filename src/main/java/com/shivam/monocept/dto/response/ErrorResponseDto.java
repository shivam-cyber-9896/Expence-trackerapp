package com.shivam.monocept.dto.response;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponseDto {
    private int status;
    private String error;
    private String message;
    private Map<String, String> details;
    private LocalDateTime timestamp;

    public ErrorResponseDto(int status, String error, String message, Map<String, String> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
