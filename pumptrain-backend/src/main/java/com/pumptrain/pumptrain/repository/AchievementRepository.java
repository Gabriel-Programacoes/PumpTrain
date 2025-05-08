package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    // Método para buscar por chave única, se necessário para a lógica de concessão
    Optional<Achievement> findByAchievementKey(String achievementKey);

}