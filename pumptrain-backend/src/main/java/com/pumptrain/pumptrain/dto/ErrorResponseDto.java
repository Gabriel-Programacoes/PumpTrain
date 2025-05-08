package com.pumptrain.pumptrain.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ErrorResponseDto {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    // Campo opcional para erros de validação de campos específicos
    private List<String> fieldErrors;

    // Construtor básico
    public ErrorResponseDto(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Construtor para erros de validação
    public ErrorResponseDto(int status, String error, String message, String path, List<String> fieldErrors) {
        this(status, error, message, path); // Chama o construtor básico
        this.fieldErrors = fieldErrors;
    }
}