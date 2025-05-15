package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.FullAchievementDto;
import com.pumptrain.pumptrain.dto.UserAchievementsDto;
import com.pumptrain.pumptrain.entity.Achievement;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.UserAchievement;
import com.pumptrain.pumptrain.repository.AchievementRepository;
import com.pumptrain.pumptrain.repository.UserAchievementRepository;
import com.pumptrain.pumptrain.repository.UserRepository;
import com.pumptrain.pumptrain.repository.WorkoutSessionRepository;
import com.pumptrain.pumptrain.service.UserService.StreakInfo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.Comparator;

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

        // Pré-calcular estatísticas do usuário uma vez para evitar chamadas repetidas no loop
        long totalCompletedWorkouts = workoutSessionRepository.countByUserAndCompletedAtIsNotNull(user);
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user);

        YearMonth currentYMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentYMonth.atEndOfMonth().atTime(LocalTime.MAX);

        int completedWorkoutsThisMonth = workoutSessionRepository.countByUserAndCompletedAtBetween(user, startOfMonth, endOfMonth);

        log.debug("Valores base para getAllAchievementsWithUserStatus - Usuário: {}", userEmail);
        log.debug("- totalCompletedWorkouts: {}", totalCompletedWorkouts);
        log.debug("- userStreaks.recordStreak(): {}", userStreaks.recordStreak());
        log.debug("- completedWorkoutsThisMonth ({}): {}", currentYMonth.toString(), completedWorkoutsThisMonth);

        List<FullAchievementDto> resultList = new ArrayList<>();

        for (Achievement achievement : allDefinedAchievements) {
            UserAchievement userAchievement = unlockedMap.get(achievement.getId());
            boolean isUnlocked = userAchievement != null;
            LocalDateTime unlockedDate = isUnlocked ? userAchievement.getUnlockedTimestamp() : null;

            int calculatedCurrentProgress = 0;
            double progressPercentage = 0.0;
            int targetValue = achievement.getTargetValue() != null ? achievement.getTargetValue() : 0;

            // Lógica de cálculo de progresso baseada no achievementKey
            switch (achievement.getAchievementKey()) {
                case "FIRST_WORKOUT":
                    calculatedCurrentProgress = (int) Math.min(totalCompletedWorkouts, targetValue);
                    break;
                case "TEN_WORKOUTS":
                    calculatedCurrentProgress = (int) Math.min(totalCompletedWorkouts, targetValue);
                    break;
                case "STREAK_7_DAYS":
                    calculatedCurrentProgress = Math.min(userStreaks.recordStreak(), targetValue);
                    break;
                case "PERFECT_MONTH":
                    calculatedCurrentProgress = Math.min(completedWorkoutsThisMonth, targetValue);
                    log.debug("  PERFECT_MONTH: calculatedCurrentProgress ({}) baseado em completedWorkoutsThisMonth ({}) e targetValue ({})",
                            calculatedCurrentProgress, completedWorkoutsThisMonth, targetValue);
                    break;
                default:
                    calculatedCurrentProgress = isUnlocked ? targetValue : 0;
            }

            // Calcula a porcentagem de progresso
            int finalCurrentValue;
            if (isUnlocked) {
                progressPercentage = 1.0;
                finalCurrentValue = targetValue;
            } else {
                if (targetValue > 0) {
                    progressPercentage = Math.min(1.0, (double) calculatedCurrentProgress / targetValue);
                } else {
                    progressPercentage = 0.0;
                }
                finalCurrentValue = calculatedCurrentProgress;
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
                    .current(finalCurrentValue)
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
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user);

        YearMonth currentYMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentYMonth.atEndOfMonth().atTime(LocalTime.MAX);
        int completedWorkoutsThisMonth = workoutSessionRepository.countByUserAndCompletedAtBetween(user, startOfMonth, endOfMonth);

        log.debug("Valores para verificação de conquistas - Usuário: {}", user.getEmail());
        log.debug("- Verificando totalCompletedWorkouts: {}", totalCompletedWorkouts);
        log.debug("- Verificando userStreaks.recordStreak(): {}", userStreaks.recordStreak());
        log.debug("- Verificando completedWorkoutsThisMonth ({}): {}", currentYMonth.toString(), completedWorkoutsThisMonth);

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

                case "PERFECT_MONTH":
                    log.info("  PERFECT_MONTH: Checando se completedWorkoutsThisMonth ({}) >= targetValue ({})", completedWorkoutsThisMonth, targetValue);
                    if (completedWorkoutsThisMonth >= targetValue) criteriaMet = true;
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