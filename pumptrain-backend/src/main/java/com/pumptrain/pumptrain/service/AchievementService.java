package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.FullAchievementDto;
// import com.pumptrain.pumptrain.dto.AchievementDto; // Importação do DTO simples, usado no resumo
import com.pumptrain.pumptrain.dto.UserAchievementsDto;
import com.pumptrain.pumptrain.entity.Achievement;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.UserAchievement;
import com.pumptrain.pumptrain.repository.AchievementRepository;
import com.pumptrain.pumptrain.repository.UserAchievementRepository;
import com.pumptrain.pumptrain.repository.UserRepository;
import com.pumptrain.pumptrain.repository.WorkoutSessionRepository;
import com.pumptrain.pumptrain.service.UserService.StreakInfo; // Assumindo que StreakInfo foi tornado público/acessível
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public UserAchievementsDto getUserAchievementsSummary(String userEmail) {
        log.info("Buscando resumo de conquistas para usuário: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userEmail));

        long unlockedCount = userAchievementRepository.countByUser(user);
        long totalAvailable = achievementRepository.count();

        Pageable limit = PageRequest.of(0, 3); // Exemplo: buscar as 3 mais recentes
        List<UserAchievement> recentUserAchievements = userAchievementRepository.findByUserOrderByUnlockedTimestampDesc(user, limit);

        // Usando o DTO simples 'com.pumptrain.pumptrain.dto.AchievementDto' para o resumo.
        List<com.pumptrain.pumptrain.dto.AchievementDto> recentAchievementsDto = recentUserAchievements.stream()
                .map(ua -> new com.pumptrain.pumptrain.dto.AchievementDto(
                        ua.getAchievement().getAchievementKey(),
                        ua.getAchievement().getName(),
                        ua.getAchievement().getDescription(),
                        ua.getAchievement().getIconUrl(),
                        ua.getUnlockedTimestamp()
                ))
                .collect(Collectors.toList());

        log.debug("Retornando DTO de resumo de conquistas para {}: Desbloq={}, Total={}, Recentes={}",
                userEmail, unlockedCount, totalAvailable, recentAchievementsDto.size());

        return new UserAchievementsDto(unlockedCount, totalAvailable, recentAchievementsDto);
    }

    @Transactional(readOnly = true)
    public List<FullAchievementDto> getAllAchievementsWithUserStatus(String userEmail) {
        log.info("Buscando todas as conquistas com status para o usuário: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userEmail));

        List<Achievement> allDefinedAchievements = achievementRepository.findAll();
        // Otimização: Buscar uma vez e colocar em um Map para consulta rápida
        Map<Long, UserAchievement> unlockedMap = userAchievementRepository.findByUser(user).stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

        List<FullAchievementDto> resultList = new ArrayList<>();

        // Pré-calcular estatísticas do usuário uma vez para evitar chamadas repetidas no loop
        long totalCompletedWorkouts = workoutSessionRepository.countByUserAndCompletedAtIsNotNull(user);
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user); // Assumindo que este método existe e é acessível

        for (Achievement achievement : allDefinedAchievements) {
            UserAchievement userAchievement = unlockedMap.get(achievement.getId());
            boolean isUnlocked = userAchievement != null;
            LocalDateTime unlockedDate = isUnlocked ? userAchievement.getUnlockedTimestamp() : null;

            int currentProgress = 0;
            double progressPercentage = 0.0;
            int targetValue = achievement.getTargetValue() != null ? achievement.getTargetValue() : 0;

            // Lógica de cálculo de progresso baseada no achievementKey
            switch (achievement.getAchievementKey()) {
                case "FIRST_WORKOUT":
                    currentProgress = (int) Math.min(totalCompletedWorkouts, targetValue);
                    break;
                case "TEN_WORKOUTS":
                    currentProgress = (int) Math.min(totalCompletedWorkouts, targetValue);
                    break;
                case "STREAK_7_DAYS":
                    currentProgress = Math.min(userStreaks.recordStreak(), targetValue);
                    break;
                // Adicionar outros casos aqui conforme novas conquistas com lógica de progresso são definidas
                default:
                    // Se desbloqueado e sem lógica de progresso específica, considera completo
                    currentProgress = isUnlocked ? targetValue : 0;
            }

            // Calcula a porcentagem de progresso
            if (targetValue > 0) {
                progressPercentage = Math.min(1.0, (double) currentProgress / targetValue);
            } else if (isUnlocked) { // Para conquistas sem targetValue (ex: uma ação única que só tem desbloqueado/não)
                progressPercentage = 1.0;
                // Se targetValue é 0, mas está desbloqueado, currentProgress pode ser 0 ou 1 (representando o "ato" de desbloquear)
                // Para consistência visual, se targetValue é 0, e está desbloqueado, current pode ser 1 e total 1.
                // No entanto, se targetValue é usado para exibir "X de Y", e Y é 0, pode ser confuso.
                // A lógica atual com targetValue = 0 e isUnlocked = true fará progressPercentage = 1.0, currentProgress = 0.
                // Vamos ajustar para que, se desbloqueado, current seja igual a target
            }

            // Garante que se estiver desbloqueado, o progresso seja 100% e current seja igual ao total
            if (isUnlocked) {
                progressPercentage = 1.0;
                currentProgress = targetValue; // Se targetValue é 0, current será 0. Se é >0, será o target.
            }

            resultList.add(FullAchievementDto.builder()
                    .id(achievement.getId())
                    .title(achievement.getName())
                    .description(achievement.getDescription())
                    .iconName(achievement.getIconUrl())
                    .category(achievement.getCategory())
                    .rarity(achievement.getRarity())
                    // XP foi removido
                    .unlocked(isUnlocked)
                    .progress(progressPercentage)
                    .total(targetValue)
                    .current(currentProgress)
                    .date(unlockedDate)
                    .build());
        }
        log.debug("Total de {} FullAchievementDto's preparados para {}", resultList.size(), userEmail);
        return resultList;
    }

    @Transactional
    public void checkAndAwardAchievements(User user) {
        log.info("Verificando e concedendo conquistas para o usuário: {}", user.getEmail());
        List<Achievement> allDefinedAchievements = achievementRepository.findAll();
        long totalCompletedWorkouts = workoutSessionRepository.countByUserAndCompletedAtIsNotNull(user);
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user); // Chamada ao método refatorado

        // Logs de depuração para os valores base que serão usados nas verificações
        log.info("Valores para verificação de conquistas - Usuário: {}", user.getEmail());
        log.info("- totalCompletedWorkouts: {}", totalCompletedWorkouts);
        log.info("- userStreaks.recordStreak(): {}", userStreaks.recordStreak());
        log.info("- userStreaks.currentStreak(): {}", userStreaks.currentStreak()); // Embora não usado diretamente nos critérios atuais

        for (Achievement achievement : allDefinedAchievements) {
            boolean alreadyUnlocked = userAchievementRepository.existsByUserAndAchievement(user, achievement);
            if (alreadyUnlocked) {
                log.trace("Conquista '{}' ({}) já desbloqueada para {}. Pulando.", achievement.getName(), achievement.getAchievementKey(), user.getEmail());
                continue;
            }

            boolean criteriaMet = false;
            Integer targetValue = achievement.getTargetValue();
            if (targetValue == null) targetValue = 0; // Garante que targetValue não é nulo para comparações

            log.info("Verificando conquista: '{}' ({}), Target: {}", achievement.getName(), achievement.getAchievementKey(), targetValue);

            switch (achievement.getAchievementKey()) {
                case "FIRST_WORKOUT":
                    log.info("  FIRST_WORKOUT: Checando se totalCompletedWorkouts ({}) >= targetValue ({})", totalCompletedWorkouts, targetValue);
                    if (totalCompletedWorkouts >= targetValue) {
                        criteriaMet = true;
                    }
                    break;
                case "TEN_WORKOUTS":
                    log.info("  TEN_WORKOUTS: Checando se totalCompletedWorkouts ({}) >= targetValue ({})", totalCompletedWorkouts, targetValue);
                    if (totalCompletedWorkouts >= targetValue) {
                        criteriaMet = true;
                    }
                    break;
                case "STREAK_7_DAYS":
                    log.info("  STREAK_7_DAYS: Checando se userStreaks.recordStreak() ({}) >= targetValue ({})", userStreaks.recordStreak(), targetValue);
                    if (userStreaks.recordStreak() >= targetValue) {
                        criteriaMet = true;
                    }
                    break;
                // Adicionar outros casos para "PERFECT_MONTH", etc.
            }

            log.debug("  CriteriaMet para '{}': {}", achievement.getAchievementKey(), criteriaMet);

            if (criteriaMet) {
                UserAchievement newUserAchievement = new UserAchievement(null, user, achievement, null); // Timestamp é auto-gerado
                userAchievementRepository.save(newUserAchievement);
                log.info("CONQUISTA DESBLOQUEADA! Usuário: {}, Conquista: '{}' ({})",
                        user.getEmail(), achievement.getName(), achievement.getAchievementKey());
                // Potencialmente disparar notificação para o usuário aqui
            }
        }
    }
}