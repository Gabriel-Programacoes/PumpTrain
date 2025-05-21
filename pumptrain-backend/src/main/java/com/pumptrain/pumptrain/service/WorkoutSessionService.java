package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.ActivityLogDto;
import com.pumptrain.pumptrain.dto.WorkoutSessionCreateDto;
import com.pumptrain.pumptrain.dto.WorkoutSessionDto;
import com.pumptrain.pumptrain.entity.ActivityLog;
import com.pumptrain.pumptrain.entity.Exercise;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.WorkoutSession;
import com.pumptrain.pumptrain.mapper.ActivityLogMapper;
import com.pumptrain.pumptrain.mapper.WorkoutSessionMapper;
import com.pumptrain.pumptrain.repository.ActivityLogRepository;
import com.pumptrain.pumptrain.repository.ExerciseRepository;
import com.pumptrain.pumptrain.repository.UserRepository;
import com.pumptrain.pumptrain.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    ActivityLogRepository activityLogRepository;
    private final ExerciseRepository exerciseRepository;
    private final ActivityLogMapper activityLogMapper;
    private final WorkoutSessionMapper workoutSessionMapper;
    private final AchievementService achievementService;

    @Transactional
    public WorkoutSessionDto createWorkoutSession(WorkoutSessionCreateDto createDto, String userEmail) {
        log.info("Tentando criar nova sessão de treino para usuário: {}", userEmail);
        log.debug("Service Create - DTO Recebido: {}", createDto);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    log.warn("Falha ao criar sessão: Usuário {} não encontrado.", userEmail);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + userEmail);
                });
        log.debug("Usuário {} encontrado para criação da sessão.", userEmail);

        WorkoutSession newSession = new WorkoutSession();
        newSession.setUser(user);
        newSession.setSessionDate(createDto.getSessionDate() != null ? createDto.getSessionDate() : LocalDate.now());
        newSession.setName(createDto.getName());
        newSession.setNotes(createDto.getNotes());


        if (createDto.getActivities() != null && !createDto.getActivities().isEmpty()) {
            log.debug("Processando {} atividades do DTO para adicionar à nova sessão.", createDto.getActivities().size());

            for (ActivityLogDto activityDto : createDto.getActivities()) {

                Exercise exercise = exerciseRepository.findById(activityDto.getExerciseId())
                        .orElseThrow(() -> {
                            log.warn("Falha ao adicionar atividade: Exercício ID {} não encontrado.", activityDto.getExerciseId());
                            return new EntityNotFoundException("Exercício não encontrado com ID: " + activityDto.getExerciseId());
                        });
                log.trace("Exercício ID {} (Nome: '{}') encontrado para a atividade.", exercise.getId(), exercise.getName());
                ActivityLog activityEntity = activityLogMapper.toEntity(activityDto);
                activityEntity.setExercise(exercise);
                newSession.addActivity(activityEntity);

                log.debug("Entidade ActivityLog com Exercise '{}' adicionada à coleção da newSession.", exercise.getName());
            }
            log.info("{} atividades processadas e adicionadas à coleção da newSession.", newSession.getActivities().size());
        } else {
            log.debug("Nenhuma atividade recebida no DTO para a nova sessão.");
        }

        WorkoutSession savedSession = workoutSessionRepository.save(newSession);
        log.info("Sessão de treino ID {} e suas {} atividades salvas com sucesso para usuário {}",
                savedSession.getId(), savedSession.getActivities() != null ? savedSession.getActivities().size() : 0, userEmail);

        return workoutSessionMapper.toDto(savedSession);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSessionDto> getWorkoutSessionsForUser(String userEmail) {
        log.info("Buscando sessões de treino para usuário: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com email: " + userEmail));

        List<WorkoutSession> sessions = workoutSessionRepository.findByUserOrderBySessionDateDesc(user);
        log.debug("Encontradas {} sessões para usuário {}", sessions.size(), userEmail);
        // O WorkoutSessionMapper agora mapeará a lista de Exercise para List<ExerciseDto>
        return workoutSessionMapper.toDto(sessions);
    }

    @Transactional(readOnly = true)
    public WorkoutSessionDto getWorkoutSessionDetails(Long sessionId, String userEmail) {
        log.info("Buscando detalhes da sessão ID {} para usuário {}", sessionId, userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    log.warn("Falha ao buscar detalhes da sessão ID {}: Usuário {} não encontrado.", sessionId, userEmail);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + userEmail);
                });

        // Busca a sessão. Se as atividades forem LAZY, elas serão carregadas
        // quando acessadas pela primeira vez dentro desta transação.
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.warn("Falha ao buscar detalhes: Sessão de treino ID {} não encontrada.", sessionId);
                    return new EntityNotFoundException("Sessão de treino não encontrada com ID: " + sessionId);
                });
        log.debug("Sessão ID {} encontrada.", sessionId);

        // Verificação de permissão
        if (!session.getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou acessar sessão ID {} que pertence a outro usuário (ID: {}).",
                    userEmail, sessionId, session.getUser().getId());
            throw new AccessDeniedException("Usuário não autorizado a acessar esta sessão de treino.");
        }
        log.debug("Verificação de permissão OK para sessão ID {} e usuário {}", sessionId, userEmail);

        // --- LOGS DE DEPURAÇÃO ---

        log.debug("---- Verificando valores da entidade ANTES do mapeamento para DTO ----");
        // Acessar session.getActivities() pode disparar o carregamento LAZY se ainda não ocorreu
        if (session.getActivities() != null && !session.getActivities().isEmpty()) {
            for (ActivityLog activityEntity : session.getActivities()) {
                // Log dos valores diretamente da entidade recuperada do banco
                log.debug("  [ANTES] Activity ID {}: Reps='{}', Peso='{}'",
                        activityEntity.getId(),
                        activityEntity.getRepetitions(),
                        activityEntity.getWeightKg());
            }
        } else {
            log.debug("  [ANTES] Nenhuma atividade encontrada na entidade Session.");
        }
        log.debug("--------------------------------------------------------------------");


        // Chama o mapper para converter a entidade para DTO
        WorkoutSessionDto dto = workoutSessionMapper.toDto(session);


        log.debug("---- Verificando valores do DTO APÓS o mapeamento ----");
        if (dto.getActivities() != null && !dto.getActivities().isEmpty()) {
            for (ActivityLogDto activityDto : dto.getActivities()) {
                // Log dos valores do DTO após o mapeamento ter sido feito
                log.debug("  [APOS] Activity DTO ID {}: Reps='{}', Peso='{}'",
                        activityDto.getId(),
                        activityDto.getRepetitions(),
                        activityDto.getWeightKg());
            }
        } else {
            log.debug("  [APOS] Nenhuma atividade encontrada no DTO.");
        }
        log.debug("---------------------------------------------------------");

        return dto;
    }

    @Transactional
    public WorkoutSessionDto updateWorkoutSession(Long sessionId, WorkoutSessionDto updateDto, String userEmail) {
        log.info("Tentando atualizar sessão ID {} para usuário {}", sessionId, userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com email: " + userEmail));

        WorkoutSession existingSession = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão de treino não encontrada com ID: " + sessionId));
        log.debug("Sessão ID {} encontrada para atualização.", sessionId);

        if (!existingSession.getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou atualizar sessão ID {} que pertence a outro usuário (ID: {}).",
                    userEmail, sessionId, existingSession.getUser().getId());
            throw new AccessDeniedException("Usuário não autorizado a atualizar esta sessão de treino.");
        }

        // Atualizar campos da Sessão Principal
        existingSession.setName(updateDto.getName());
        existingSession.setSessionDate(updateDto.getSessionDate());
        existingSession.setStartTime(updateDto.getStartTime());
        existingSession.setEndTime(updateDto.getEndTime());
        existingSession.setNotes(updateDto.getNotes());
        // Não alterar completedAt aqui, isso é feito por markWorkoutAsComplete
        log.debug("Campos principais da sessão ID {} atualizados.", sessionId);

        List<ActivityLog> oldActivities = new ArrayList<>(existingSession.getActivities());
        for (ActivityLog oldActivity : oldActivities) {
            existingSession.removeActivity(oldActivity);
        }
        // Neste ponto, orphanRemoval=true (na entidade WorkoutSession) cuidará de deletar
        // as ActivityLogs antigas do banco quando a sessão for salva.
        log.debug("Atividades existentes removidas da sessão ID {} usando o método removeActivity.", sessionId);

        // 2. Adicionar as novas atividades (vindas do DTO) à coleção
        if (updateDto.getActivities() != null && !updateDto.getActivities().isEmpty()) {
            log.debug("Processando {} novas atividades do DTO para sessão ID {}", updateDto.getActivities().size(), sessionId);
            for (ActivityLogDto activityDto : updateDto.getActivities()) {

                Exercise exercise = exerciseRepository.findById(activityDto.getExerciseId())
                        .orElseThrow(() -> {
                            log.warn("Falha ao adicionar atividade na atualização: Exercício ID {} não encontrado.", activityDto.getExerciseId());
                            return new EntityNotFoundException("Exercício não encontrado com ID: " + activityDto.getExerciseId());
                        });

                ActivityLog newActivityEntity = activityLogMapper.toEntity(activityDto);
                newActivityEntity.setExercise(exercise); // Associa o exercício

                existingSession.addActivity(newActivityEntity);
                log.trace("Nova entidade ActivityLog (Ex ID {}) adicionada à sessão ID {}", exercise.getId(), sessionId);
            }
            log.debug("{} novas atividades adicionadas à sessão ID {}", existingSession.getActivities().size(), sessionId);
        } else {
            log.debug("Nenhuma atividade fornecida no DTO de atualização para sessão ID {}", sessionId);
        }
        // --- FIM DA ATUALIZAÇÃO DAS ATIVIDADES ---

        WorkoutSession savedSession = workoutSessionRepository.save(existingSession);
        log.info("Sessão ID {} atualizada com sucesso, incluindo atividades.", savedSession.getId());

        return workoutSessionMapper.toDto(savedSession);
    }

    @Transactional
    public void deleteWorkoutSession(Long sessionId, String userEmail) {
        log.info("Tentando excluir sessão ID {} para usuário {}", sessionId, userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com email: " + userEmail));

        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão de treino não encontrada com ID: " + sessionId));
        log.debug("Sessão ID {} encontrada para exclusão.", sessionId);

        if (!session.getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou excluir sessão ID {} de outro usuário.", userEmail, sessionId);
            throw new AccessDeniedException("Usuário não autorizado a excluir esta sessão de treino.");
        }

        workoutSessionRepository.delete(session);
        log.info("Sessão de treino ID {} excluída com sucesso por usuário {}", sessionId, userEmail);
    }

    public ActivityLogDto addActivityToSession(Long sessionId, ActivityLogDto activityDto, String userEmail) {
        log.info("Tentando adicionar atividade à sessão EXISTENTE ID {} para usuário {}", sessionId, userEmail);
        log.debug("Dados da atividade recebida: {}", activityDto);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    log.warn("Falha ao adicionar atividade à sessão ID {}: Usuário {} não encontrado.", sessionId, userEmail);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + userEmail);
                });

        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.warn("Falha ao adicionar atividade: Sessão de treino ID {} não encontrada.", sessionId);
                    return new EntityNotFoundException("Sessão de treino não encontrada com ID: " + sessionId);
                });
        log.debug("Sessão ID {} encontrada para adicionar atividade.", sessionId);

        if (!session.getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou adicionar atividade à sessão ID {} que pertence a outro usuário (ID: {}).",
                    userEmail, sessionId, session.getUser().getId());
            throw new AccessDeniedException("Usuário não autorizado a adicionar atividade a esta sessão.");
        }
        log.debug("Verificação de permissão OK para adicionar atividade à sessão ID {} por usuário {}", sessionId, userEmail);

        Exercise exercise = exerciseRepository.findById(activityDto.getExerciseId())
                .orElseThrow(() -> {
                    log.warn("Falha ao adicionar atividade: Exercício ID {} não encontrado.", activityDto.getExerciseId());
                    return new EntityNotFoundException("Exercício não encontrado com ID: " + activityDto.getExerciseId());
                });
        log.debug("Exercício ID {} encontrado para adicionar à atividade.", activityDto.getExerciseId());

        ActivityLog newActivity = activityLogMapper.toEntity(activityDto);
        newActivity.setWorkoutSession(session);
        newActivity.setExercise(exercise);

        ActivityLog savedActivity = activityLogRepository.save(newActivity);

        log.info("Atividade salva com ID {} para sessão ID {}", savedActivity.getId(), sessionId);

        return activityLogMapper.toDto(savedActivity);
    }

    @Transactional
    public ActivityLogDto updateActivityLog(Long activityId, ActivityLogDto activityDto, String userEmail) {
        log.info("Tentando atualizar atividade ID {} para usuário {}", activityId, userEmail);
        log.debug("Dados recebidos para atualização da atividade {}: {}", activityId, activityDto);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    log.warn("Falha ao atualizar atividade ID {}: Usuário {} não encontrado.", activityId, userEmail);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + userEmail);
                });

        ActivityLog activityLog = activityLogRepository.findById(activityId)
                .map(activity -> {
                    // Força o carregamento da sessão se for LAZY
                    activity.getWorkoutSession().getId();
                    return activity;
                })
                .orElseThrow(() -> {
                    log.warn("Falha ao atualizar: Registro de atividade ID {} não encontrado.", activityId);
                    return new EntityNotFoundException("Registro de atividade não encontrado com ID: " + activityId);
                });
        log.debug("Atividade ID {} encontrada para atualização.", activityId);

        // Verificação de permissão
        if (!activityLog.getWorkoutSession().getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou atualizar atividade ID {} que pertence a outro usuário (ID: {}).",
                    userEmail, activityId, activityLog.getWorkoutSession().getUser().getId());
            throw new AccessDeniedException("Usuário não autorizado a modificar esta atividade.");
        }
        log.debug("Verificação de permissão OK para atualizar atividade ID {} por usuário {}", activityId, userEmail);

        // Atualiza os campos da entidade existente
        log.debug("Atualizando campos da atividade ID {}", activityId);
        activityLog.setSets(activityDto.getSets());
        activityLog.setRepetitions(activityDto.getRepetitions());
        activityLog.setWeightKg(activityDto.getWeightKg());
        activityLog.setDurationMinutes(activityDto.getDurationMinutes());
        activityLog.setDistanceKm(activityDto.getDistanceKm());
        activityLog.setNotes(activityDto.getNotes());
        // Se o exerciseId mudar, precisa buscar o novo exercício e atualizar a referência
        if (activityDto.getExerciseId() != null && !activityDto.getExerciseId().equals(activityLog.getExercise().getId())) {
            Exercise newExercise = exerciseRepository.findById(activityDto.getExerciseId())
                    .orElseThrow(() -> new EntityNotFoundException("Exercício não encontrado com ID: " + activityDto.getExerciseId()));
            activityLog.setExercise(newExercise);
            log.debug("Referência de exercício atualizada para ID {}", newExercise.getId());
        }


        ActivityLog updatedActivity = activityLogRepository.save(activityLog);
        log.info("Atividade ID {} atualizada com sucesso por usuário {}", activityId, userEmail);

        return activityLogMapper.toDto(updatedActivity);
    }

    @Transactional
    public void deleteActivityLog(Long activityId, String userEmail) {
        log.info("Tentando excluir atividade ID {} para usuário {}", activityId, userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    log.warn("Falha ao excluir atividade ID {}: Usuário {} não encontrado.", activityId, userEmail);
                    return new EntityNotFoundException("Usuário não encontrado com email: " + userEmail);
                });

        ActivityLog activityLog = activityLogRepository.findById(activityId)
                // Garante que a sessão seja carregada para verificar permissão
                .map(activity -> {
                    activity.getWorkoutSession().getId();
                    return activity;
                })
                .orElseThrow(() -> {
                    log.warn("Falha ao excluir: Registro de atividade ID {} não encontrado.", activityId);
                    return new EntityNotFoundException("Registro de atividade não encontrado com ID: " + activityId);
                });
        log.debug("Atividade ID {} encontrada para exclusão.", activityId);

        // Verificação de permissão
        if (!activityLog.getWorkoutSession().getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou excluir atividade ID {} que pertence a outro usuário (ID: {}).",
                    userEmail, activityId, activityLog.getWorkoutSession().getUser().getId());
            throw new AccessDeniedException("Usuário não autorizado a excluir esta atividade.");
        }
        log.debug("Verificação de permissão OK para excluir atividade ID {} por usuário {}", activityId, userEmail);

        // Exclui a atividade do repositório
        activityLogRepository.delete(activityLog);
        log.info("Atividade ID {} excluída com sucesso por usuário {}", activityId, userEmail);
    }

    @Transactional
    public WorkoutSessionDto markWorkoutAsComplete(Long sessionId, String userEmail) {
        log.info("Tentando marcar treino ID {} como concluído para usuário {}", sessionId, userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userEmail));

        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão de treino não encontrada com ID: " + sessionId));

        if (!session.getUser().getId().equals(user.getId())) {
            log.warn("Acesso negado: Usuário {} tentou marcar treino ID {} de outro usuário.", userEmail, sessionId);
            throw new AccessDeniedException("Usuário não autorizado a modificar esta sessão de treino.");
        }

        if (session.getCompletedAt() != null) {
            log.warn("Treino ID {} já estava marcado como concluído em {}. Nenhuma alteração feita.", sessionId, session.getCompletedAt());
            return workoutSessionMapper.toDto(session); // Retorna o estado atual
        }

        session.setCompletedAt(LocalDateTime.now());
        log.debug("Definindo completedAt para {} na sessão ID {}", session.getCompletedAt(), sessionId);

        WorkoutSession savedSession = workoutSessionRepository.save(session);
        log.info("Treino ID {} marcado como concluído com sucesso.", sessionId);

        try {
            log.info(">>> PRESTES A CHAMAR achievementService.checkAndAwardAchievements para usuário {} <<<", user.getEmail());
            achievementService.checkAndAwardAchievements(user); // Passa o objeto User
            log.info(">>> achievementService.checkAndAwardAchievements CHAMADO com sucesso <<<");
        } catch (Exception e) {
            log.error("Erro ao verificar/conceder conquistas para o usuário {} após completar treino ID {}: {}",
                    user.getEmail(), savedSession.getId(), e.getMessage(), e);
        }
        return workoutSessionMapper.toDto(savedSession);
    }

    @Transactional(readOnly = true)
    public Optional<WorkoutSessionDto> getWorkoutOfTheDay(String userEmail) {
        log.info("Buscando 'Treino do Dia' para usuário {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userEmail));

        LocalDate today = LocalDate.now();
        log.debug("Buscando treinos para usuário ID {} na data {}", user.getId(), today);

        List<WorkoutSession> workoutsForToday = workoutSessionRepository
                .findByUserAndSessionDateAndCompletedAtIsNullOrderByIdDesc(user, today);

        if (workoutsForToday.isEmpty()) {
            log.info("Nenhum treino não concluído encontrado para hoje para o usuário {}", userEmail);
            return Optional.empty();
        } else {
            WorkoutSession workoutOfTheDay = workoutsForToday.getFirst();
            log.info("Treino do Dia encontrado (ID: {}) para usuário {}", workoutOfTheDay.getId(), userEmail);
            return Optional.of(workoutSessionMapper.toDto(workoutOfTheDay));
        }
    }
}