package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.Achievement;
import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.UserAchievement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {

    // Verifica se um usuário já possui uma conquista específica
    boolean existsByUserAndAchievement(User user, Achievement achievement);

    // Conta quantas conquistas um usuário possui
    long countByUser(User user);

    // Busca todas as conquistas de um usuário (pode retornar muitas)
    List<UserAchievement> findByUser(User user);

    // Busca as N conquistas mais recentes de um usuário
    List<UserAchievement> findByUserOrderByUnlockedTimestampDesc(User user, Pageable pageable);

    // Opcional: Busca uma UserAchievement específica por usuário e chave da conquista
    Optional<UserAchievement> findByUserAndAchievementAchievementKey(User user, String achievementKey);
}