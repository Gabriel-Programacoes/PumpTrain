package com.pumptrain.pumptrain.controller;

import com.pumptrain.pumptrain.dto.ExerciseCreateDto;
import com.pumptrain.pumptrain.dto.ExerciseDto;
import com.pumptrain.pumptrain.service.ExerciseService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    @Autowired
    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseDto>> getAllExercises() {
        log.info("Requisição recebida para listar todos os exercícios.");

        // Chama o serviço diretamente. Se ocorrer uma exceção, o GlobalExceptionHandler tratará.
        List<ExerciseDto> exercises = exerciseService.getAllExercises();

        log.debug("Retornando {} exercícios.", exercises.size());

        // Retorna 200 OK com a lista de exercícios
        return ResponseEntity.ok(exercises);
        // O GlobalExceptionHandler cuida de exceções inesperadas retornando 500.
    }

    @PostMapping
    public ResponseEntity<?> createExercise(
            @Valid @RequestBody ExerciseCreateDto exerciseCreateDto,
            Principal principal) {

        // Verificação simples de autenticação (Spring Security cuida disso de forma mais robusta)
        if (principal == null) {
            log.warn("Tentativa de criar exercício sem autenticação.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Autenticação necessária.");
        }
        log.info("Requisição recebida de {} para criar exercício: {}", principal.getName(), exerciseCreateDto.getName());

        try {
            ExerciseDto createdExercise = exerciseService.createExercise(exerciseCreateDto);
            log.info("Exercício criado com sucesso com ID: {}", createdExercise.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdExercise);
        } catch (DataIntegrityViolationException e) {
            log.warn("Falha ao criar exercício (DataIntegrityViolation): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 409 Conflict
        } catch (Exception e) {
            log.error("Erro inesperado ao criar exercício", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao processar a requisição.");
        }
    }

    // --- Endpoint DELETE para excluir ---
    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(
            @PathVariable Long exerciseId,
            Principal principal) {

        if (principal == null) {
            log.warn("Tentativa de excluir exercício ID {} sem autenticação.", exerciseId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("Requisição recebida de {} para excluir exercício ID: {}", principal.getName(), exerciseId);

        try {
            // Adicionar verificação de permissão aqui se necessário (ex: só admin pode excluir)
            exerciseService.deleteExercise(exerciseId);
            log.info("Exercício ID {} excluído com sucesso.", exerciseId);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (EntityNotFoundException e) {
            log.warn("Falha ao excluir exercício (EntityNotFound): {}", e.getMessage());
            return ResponseEntity.notFound().build(); // 404 Not Found
        } catch (Exception e) {
            log.error("Erro inesperado ao excluir exercício ID {}", exerciseId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}