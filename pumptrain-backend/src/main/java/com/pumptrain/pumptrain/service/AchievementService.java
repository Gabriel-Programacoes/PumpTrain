package com.pumptrain.pumptrain.service;

import com.pumptrain.pumptrain.dto.AchievementDto;
import com.pumptrain.pumptrain.dto.UserAchievementsDto;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.UserAchievement;
import com.pumptrain.pumptrain.repository.AchievementRepository;
import com.pumptrain.pumptrain.repository.UserAchievementRepository;
import com.pumptrain.pumptrain.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor // Lombok para injeção via construtor
public class AchievementService {

    private final UserRepository userRepository;
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    @Transactional(readOnly = true)
    public UserAchievementsDto getUserAchievements(String userEmail) {
        log.info("Buscando conquistas para usuário: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + userEmail));

        long unlockedCount = userAchievementRepository.countByUser(user);
        long totalAvailable = achievementRepository.count();

        // Busca as 3 mais recentes, por exemplo
        Pageable limit = PageRequest.of(0, 3);
        List<UserAchievement> recentUserAchievements = userAchievementRepository.findByUserOrderByUnlockedTimestampDesc(user, limit);

        List<AchievementDto> recentAchievementsDto = recentUserAchievements.stream()
                .map(ua -> new AchievementDto( // Mapeamento manual simples
                        ua.getAchievement().getAchievementKey(),
                        ua.getAchievement().getName(),
                        ua.getAchievement().getDescription(),
                        ua.getAchievement().getIconUrl(),
                        ua.getUnlockedTimestamp()
                ))
                .collect(Collectors.toList());

        log.debug("Retornando DTO de conquistas para {}: Desbloq={}, Total={}, Recentes={}",
                userEmail, unlockedCount, totalAvailable, recentAchievementsDto.size());

        return new UserAchievementsDto(unlockedCount, totalAvailable, recentAchievementsDto);
    }

    // --- Métodos Futuros ---
    // @Transactional
    // public void checkAndAwardAchievements(User user /*, outros dados relevantes como WorkoutSession */) {
    //     log.debug("Verificando conquistas para usuário ID: {}", user.getId());
    //
    //     // 1. Buscar todas as definições de Achievement
    //     List<Achievement> allAchievements = achievementRepository.findAll();
    //
    //     // 2. Para cada Achievement, verificar se o usuário já a possui
    //     for (Achievement achievement : allAchievements) {
    //         boolean alreadyUnlocked = userAchievementRepository.existsByUserAndAchievement(user, achievement);
    //         if (!alreadyUnlocked) {
    //             // 3. Se não possui, verificar o critério da conquista
    //             boolean criteriaMet = checkCriteria(user, achievement/*, outros dados */);
    //             if (criteriaMet) {
    //                 // 4. Se critério cumprido, criar e salvar UserAchievement
    //                 UserAchievement userAchievement = new UserAchievement(null, user, achievement, null); // Timestamp é auto-gerado
    //                 userAchievementRepository.save(userAchievement);
    //                 log.info("Conquista '{}' ({}) desbloqueada para usuário {}!",
    //                          achievement.getName(), achievement.getAchievementKey(), user.getEmail());
    //                 // Opcional: Gerar notificação para o usuário
    //             }
    //         }
    //     }
    // }
    //
    // private boolean checkCriteria(User user, Achievement achievement /*, outros dados */) {
    //     // Lógica complexa baseada no achievement.getAchievementKey()
    //     // Ex: buscar contagem de treinos, streaks, etc., e comparar com o critério
    //     switch (achievement.getAchievementKey()) {
    //         case "FIRST_WORKOUT":
    //              // Verificar se workoutSessionRepository.countByUser(user) >= 1 (ou se acabou de salvar o primeiro)
    //              return workoutSessionRepository.countByUser(user) >= 1; // Simplista, melhor acionar após salvar o primeiro
    //         case "TEN_WORKOUTS":
    //              return workoutSessionRepository.countByUser(user) >= 10;
    //         case "STREAK_7_DAYS":
    //              StreakInfo streaks = calculateStreaks(user); // Precisaria chamar o método de UserService (refatorar?)
    //              return streaks.recordStreak() >= 7;
    //         // ... outros casos ...
    //         default: return false;
    //     }
    // }

    // Se a lógica de streak for necessária aqui, talvez precise ser extraída para um
    // componente/serviço compartilhado ou o AchievementService precisaria chamar o UserService.
    // private record StreakInfo(int currentStreak, int recordStreak) {} // Duplicado de UserService
    // private StreakInfo calculateStreaks(User user) { /* ... lógica ... */ return null;} // Duplicado

}