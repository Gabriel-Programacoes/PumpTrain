package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserOrderBySessionDateDesc(User user);
    /**
     * Conta o número total de sessões de treino para um usuário específico.
     */
    long countByUser(User user); // Retorna long

    /**
     * Conta o número de sessões de treino para um usuário dentro de um intervalo de datas.
     */
    int countByUserAndSessionDateBetween(User user, LocalDate startDate, LocalDate endDate);


    @Query("SELECT ws.completedAt FROM WorkoutSession ws WHERE ws.user = :user AND ws.completedAt IS NOT NULL ORDER BY ws.completedAt DESC")
    List<LocalDateTime> findCompletedAtTimestampsByUserOrderByCompletedAtDesc(@Param("user") User user);
}