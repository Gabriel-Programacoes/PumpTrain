package com.pumptrain.pumptrain.controller;

import com.pumptrain.pumptrain.dto.ActivityLogDto;
import com.pumptrain.pumptrain.dto.WorkoutSessionCreateDto;
import com.pumptrain.pumptrain.dto.WorkoutSessionDto;
import com.pumptrain.pumptrain.service.WorkoutSessionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
// ---------------------------------------------

@Slf4j
@RestController
@RequestMapping("/api/workouts")
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    @Autowired
    public WorkoutSessionController(WorkoutSessionService workoutSessionService) {
        this.workoutSessionService = workoutSessionService;
    }

    // --- Métodos de Sessão ---

    @PostMapping
    public ResponseEntity<?> createWorkoutSession(
            @Valid @RequestBody WorkoutSessionCreateDto createDto,
            Principal principal) {

        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de criar sessão sem autenticação.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso não autorizado.");
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para criar sessão de treino para usuário: {}", userEmail);
        log.info("Controller: DTO recebido para criar sessão: {}", createDto);

        try {
            WorkoutSessionDto createdSession = workoutSessionService.createWorkoutSession(createDto, userEmail);
            log.info("Sessão de treino criada com ID: {} para usuário: {}", createdSession.getId(), userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (EntityNotFoundException e) {
            log.warn("Falha ao criar sessão: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            log.warn("Falha ao criar sessão: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao criar sessão", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno no servidor.");
        }
    }

    @GetMapping
    public ResponseEntity<List<WorkoutSessionDto>> getMyWorkoutSessions(Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de listar sessões sem autenticação.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para listar sessões de treino do usuário: {}", userEmail);
        List<WorkoutSessionDto> sessions = workoutSessionService.getWorkoutSessionsForUser(userEmail);
        log.debug("Encontradas {} sessões para o usuário {}", sessions.size(), userEmail);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<WorkoutSessionDto> getWorkoutSessionById(@PathVariable Long sessionId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de buscar sessão ID {} sem autenticação.", sessionId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para buscar detalhes da sessão ID: {} para usuário: {}", sessionId, userEmail);
        WorkoutSessionDto sessionDetails = workoutSessionService.getWorkoutSessionDetails(sessionId, userEmail);
        log.debug("Detalhes da sessão ID {} encontrados para usuário {}", sessionId, userEmail);
        return ResponseEntity.ok(sessionDetails);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteWorkoutSession(@PathVariable Long sessionId, Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de excluir sessão ID {} sem autenticação.", sessionId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para excluir sessão ID: {} para usuário: {}", sessionId, userEmail);
        workoutSessionService.deleteWorkoutSession(sessionId, userEmail);
        log.info("Sessão ID: {} excluída com sucesso para usuário: {}", sessionId, userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workoutId}/activities") // Mapeia POST para /api/workouts/{ID_DO_TREINO}/activities
    public ResponseEntity<?> addActivityToWorkout(
            @PathVariable Long workoutId,           // Pega o ID do treino da URL
            @Valid @RequestBody ActivityLogDto activityDto, // Pega os dados da nova atividade do corpo
            Principal principal) {                 // Verifica usuário logado

        // Validação de segurança
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa não autenticada de adicionar atividade à sessão {}", workoutId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Autenticação necessária.");
        }
        String userEmail = principal.getName();
        log.info("Controller: Req para add atividade à sessão ID {} por {}", workoutId, userEmail);
        log.debug("Controller: Activity DTO recebido: {}", activityDto);

        try {
            // Chama o método do serviço
            ActivityLogDto createdActivity = workoutSessionService.addActivityToSession(workoutId, activityDto, userEmail);
            log.info("Controller: Atividade adicionada com ID {} à sessão {}", createdActivity.getId(), workoutId);
            // Retorna 201 Created com a atividade criada
            return ResponseEntity.status(HttpStatus.CREATED).body(createdActivity);

        } catch (EntityNotFoundException e) { // Captura erros específicos se o serviço os lançar
            log.warn("Falha ao add atividade à sessão {} ({}): {}", workoutId, e.getClass().getSimpleName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); // 404 se sessão/exercício não encontrado
        } catch (AccessDeniedException e) {
            log.warn("Falha ao add atividade à sessão {} (AccessDenied): {}", workoutId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage()); // 403 Forbidden
        } catch (Exception e) {
            log.error("Erro inesperado ao add atividade à sessão {}", workoutId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno ao adicionar atividade.");
        }
    }

    // ===> MÉ TO DO PARA EDITAR <===
    @PutMapping("/{sessionId}") // Mapeia para PUT /api/workouts/{ID}
    public ResponseEntity<?> updateWorkoutSession(
            @PathVariable Long sessionId,
            @Valid @RequestBody WorkoutSessionDto updateDto,
            Principal principal) {

        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa de atualizar sessão ID {} sem autenticação.", sessionId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso não autorizado.");
        }
        String userEmail = principal.getName();
        log.info("Requisição recebida para atualizar sessão ID: {} para usuário: {}", sessionId, userEmail);
        log.debug("Dados recebidos para atualização: {}", updateDto);

        // Validação básica de ID
        if (!sessionId.equals(updateDto.getId())) {
            log.warn("ID do path ({}) não corresponde ao ID do DTO ({}) na atualização.", sessionId, updateDto.getId());
        }


        // Chama o novo método no serviço
        WorkoutSessionDto updatedSession = workoutSessionService.updateWorkoutSession(sessionId, updateDto, userEmail);

        log.info("Sessão ID: {} atualizada com sucesso para usuário: {}", sessionId, userEmail);
        return ResponseEntity.ok(updatedSession); // Retorna 200 OK com a sessão atualizada
        // Exceções (NotFound, Forbidden, Validation) serão tratadas pelo GlobalExceptionHandler
    }


    @PostMapping("/{workoutId}/complete") // POST /api/workouts/{ID}/complete
    public ResponseEntity<?> completeWorkoutSession(
            @PathVariable Long workoutId,
            Principal principal) {

        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa não autenticada de completar sessão {}", workoutId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Autenticação necessária.");
        }
        String userEmail = principal.getName();
        log.info("Requisição para completar sessão ID {} por {}", workoutId, userEmail);

        // Chama o serviço para marcar como concluído
        // Exceções (NotFound, Forbidden, IllegalState) serão tratadas pelo GlobalExceptionHandler
        WorkoutSessionDto completedSession = workoutSessionService.markWorkoutAsComplete(workoutId, userEmail);

        log.info("Sessão ID {} marcada como concluída.", workoutId);
        // Retorna 200 OK com a sessão atualizada (incluindo completedAt)
        return ResponseEntity.ok(completedSession);
    }

    @GetMapping("/today") // Rota: GET /api/workouts/today
    public ResponseEntity<WorkoutSessionDto> getWorkoutOfTheDay(Principal principal) {
        if (principal == null || principal.getName() == null) {
            log.warn("Tentativa não autenticada de buscar treino do dia.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String userEmail = principal.getName();
        log.info("Requisição GET recebida para /today do usuário: {}", userEmail);

        Optional<WorkoutSessionDto> workoutDtoOpt = workoutSessionService.getWorkoutOfTheDay(userEmail);

        // Se encontrou, retorna 200 OK com o DTO. Se não, retorna 204 No Content.
        return workoutDtoOpt
                .map(ResponseEntity::ok) // Se presente, retorna 200 OK com o DTO
                .orElseGet(() -> ResponseEntity.noContent().build()); // Se ausente, retorna 204
    }
}