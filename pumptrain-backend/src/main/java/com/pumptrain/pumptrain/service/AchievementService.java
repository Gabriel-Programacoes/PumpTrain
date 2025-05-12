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

        Pageable limit = PageRequest.of(0, 3);
        List<UserAchievement> recentUserAchievements = userAchievementRepository.findByUserOrderByUnlockedTimestampDesc(user, limit);

        // Usando o DTO simples 'AchievementDto' para o resumo.
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
        List<UserAchievement> userUnlockedAchievements = userAchievementRepository.findByUser(user);

        Map<Long, UserAchievement> unlockedMap = userUnlockedAchievements.stream()
                .collect(Collectors.toMap(ua -> ua.getAchievement().getId(), ua -> ua));

        List<FullAchievementDto> resultList = new ArrayList<>();

        // Pré-calcular estatísticas do usuário uma vez, se possível
        long totalCompletedWorkouts = workoutSessionRepository.countByUserAndCompletedAtIsNotNull(user);
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user);

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
                default:
                    currentProgress = isUnlocked ? targetValue : 0;
            }

            if (targetValue > 0) {
                progressPercentage = Math.min(1.0, (double) currentProgress / targetValue);
            } else if (isUnlocked) { // Para conquistas sem targetValue (ex: uma ação única), se desbloqueado, é 100%
                progressPercentage = 1.0;
                currentProgress = targetValue;
            }
            if(isUnlocked) {
                progressPercentage = 1.0;
                currentProgress = targetValue;
            }


            resultList.add(FullAchievementDto.builder()
                    .id(achievement.getId())
                    .title(achievement.getName())
                    .description(achievement.getDescription())
                    .iconName(achievement.getIconUrl())
                    .category(achievement.getCategory())
                    .rarity(achievement.getRarity())
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


    // --- Métodos Futuros para CONCEDER conquistas ---
    @Transactional
    public void checkAndAwardAchievements(User user /*, Optional<WorkoutSession> workoutSession, etc. */) {
        log.info("Verificando e concedendo conquistas para o usuário: {}", user.getEmail());
        List<Achievement> allDefinedAchievements = achievementRepository.findAll();
        long totalCompletedWorkouts = workoutSessionRepository.countByUserAndCompletedAtIsNotNull(user);
        StreakInfo userStreaks = userService.calculateStreaksBasedOnCompletion(user);

        for (Achievement achievement : allDefinedAchievements) {
            // Verifica se o usuário já desbloqueou esta conquista
            boolean alreadyUnlocked = userAchievementRepository.existsByUserAndAchievement(user, achievement);
            if (alreadyUnlocked) {
                continue; // Pula para a próxima
            }

            boolean criteriaMet = false;
            Integer targetValue = achievement.getTargetValue();
            if (targetValue == null) targetValue = 0; // Default para evitar NPE

            switch (achievement.getAchievementKey()) {
                case "FIRST_WORKOUT":
                    if (totalCompletedWorkouts >= targetValue) { // targetValue deve ser 1
                        criteriaMet = true;
                    }
                    break;
                case "TEN_WORKOUTS":
                    if (totalCompletedWorkouts >= targetValue) { // targetValue deve ser 10
                        criteriaMet = true;
                    }
                    break;
                case "STREAK_7_DAYS":
                    if (userStreaks.recordStreak() >= targetValue) { // targetValue deve ser 7
                        criteriaMet = true;
                    }
                    break;
                // Adicionar lógica para "PERFECT_MONTH" se/quando implementado
                // case "PERFECT_MONTH":
                //     int completedThisMonth = workoutSessionRepository.countByUserAndCompletedAtBetween(user, YearMonth.now().atDay(1).atStartOfDay(), YearMonth.now().atEndOfMonth().atTime(LocalTime.MAX));
                //     if (completedThisMonth >= targetValue) {
                //         criteriaMet = true;
                //     }
                //     break;
                // Adicionar outros casos aqui
            }

            if (criteriaMet) {
                UserAchievement newUserAchievement = new UserAchievement(null, user, achievement, null); // Timestamp é auto-gerado via @PrePersist
                userAchievementRepository.save(newUserAchievement);
                log.info("CONQUISTA DESBLOQUEADA! Usuário: {}, Conquista: '{}' ({})",
                        user.getEmail(), achievement.getName(), achievement.getAchievementKey());
                // Aqui você poderia disparar uma notificação, etc.
            }
        }
    }
    // Nota: O método checkAndAwardAchievements deve ser chamado em pontos estratégicos,
    // por exemplo, após um WorkoutSession ser marcado como concluído.
}