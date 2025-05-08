package com.pumptrain.pumptrain.controller;

import com.pumptrain.pumptrain.dto.ActivityLogDto;
import com.pumptrain.pumptrain.service.WorkoutSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api")
public class ActivityLogController {

    private final WorkoutSessionService workoutSessionService;

    @Autowired
    public ActivityLogController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    @PostMapping("/sessions/{sessionId}/activities")
    public ResponseEntity<?> addActivityToSession(@PathVariable Long sessionId,
                                                  @Valid @RequestBody ActivityLogDto activityDto,
                                                  Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de adicionar atividade à sessão ID {} sem autenticação.", sessionId);
            // Considerar lançar exceção para o GlobalExceptionHandler tratar como 401/403
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso não autorizado.");
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para adicionar atividade à sessão ID: {} para usuário: {}", sessionId, userEmail);
        log.debug("Dados da atividade recebida: {}", activityDto);

        // Validações específicas (lançam exceção para o handler global)
        if (activityDto.getId() != null) {
            throw new IllegalArgumentException("ID da atividade não deve ser fornecido na criação.");
        }
        if (activityDto.getExerciseId() == null) {
            throw new IllegalArgumentException("ID do exercício é obrigatório.");
        }

        // Chama o serviço (exceções tratadas globalmente)
        ActivityLogDto createdActivity = workoutSessionService.addActivityToSession(sessionId, activityDto, userEmail);
        log.info("Atividade ID: {} adicionada com sucesso à sessão ID: {} para usuário: {}", createdActivity.getId(), sessionId, userEmail);

        // Retorna 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(createdActivity);
    }


    @PutMapping("/activities/{activityId}")
    public ResponseEntity<?> updateActivityLog(@PathVariable Long activityId,
                                               @Valid @RequestBody ActivityLogDto activityDto,
                                               Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de atualizar atividade ID {} sem autenticação.", activityId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado.");
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para atualizar atividade ID: {} para usuário: {}", activityId, userEmail);
        log.debug("Dados recebidos para atualização da atividade {}: {}", activityId, activityDto);

        // Chama o serviço diretamente. Exceções (NotFound, Forbidden, etc.) serão tratadas globalmente.
        ActivityLogDto updatedActivity = workoutSessionService.updateActivityLog(activityId, activityDto, userEmail);

        log.info("Atividade ID: {} atualizada com sucesso para usuário: {}", activityId, userEmail);
        return ResponseEntity.ok(updatedActivity); // Retorna 200 OK com a atividade atualizada
    }

    @DeleteMapping("/activities/{activityId}")
    public ResponseEntity<Void> deleteActivityLog(@PathVariable Long activityId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de excluir atividade ID {} sem autenticação.", activityId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para excluir atividade ID: {} para usuário: {}", activityId, userEmail);

        // Chama o serviço diretamente. Exceções (NotFound, Forbidden, etc.) serão tratadas globalmente.
        workoutSessionService.deleteActivityLog(activityId, userEmail);

        log.info("Atividade ID: {} excluída com sucesso para usuário: {}", activityId, userEmail);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content (sucesso sem corpo)
    }
}