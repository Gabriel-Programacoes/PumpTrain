package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    // ^-- Gerencia ActivityLog, ID é Long
    // --- Exemplo de Método de Busca Customizado ---
    // Busca todas as atividades de uma sessão de treino específica, ordenadas pelo timestamp.
    // Note que buscamos pelo ID da sessão de treino.
    List<ActivityLog> findByWorkoutSessionIdOrderByActivityTimestampAsc(Long workoutSessionId);
}