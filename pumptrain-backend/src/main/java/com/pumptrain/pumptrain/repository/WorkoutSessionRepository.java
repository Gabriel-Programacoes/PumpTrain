package com.pumptrain.pumptrain.repository;

import com.pumptrain.pumptrain.entity.User;
import com.pumptrain.pumptrain.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    /**
     * Encontra todas as sessões de treino para um usuário específico,
     * ordenadas pela data da sessão em ordem decrescente
     *
     * @param user O usuário cujas sessões devem ser buscadas.
     * @return Uma lista de WorkoutSession ordenadas.
     */
    List<WorkoutSession> findByUserOrderBySessionDateDesc(User user);

    /**
     * Conta o número total de sessões de treino registradas para um usuário específico.
     *
     * @param user O usuário.
     * @return O número total de sessões de treino.
     */
    long countByUser(User user);

    /**
     * Conta o número de sessões de treino para um usuário específico dentro de um
     * intervalo de datas de sessão (sessionDate).
     *
     * @param user O usuário.
     * @param startDate A data de início do intervalo
     * @param endDate A data de fim do intervalo
     * @return O número de sessões de treino no intervalo
     */

    /**
     * Conta o número de sessões de treino concluídas por um usuário dentro de um intervalo de timestamps.
     * Usado para calcular treinos concluídos no mês atual para conquistas como "PERFECT_MONTH".
     *
     * @param user O usuário.
     * @param startDateTime O timestamp de início do intervalo (inclusivo).
     * @param endDateTime O timestamp de fim do intervalo (inclusivo).
     * @return O número de sessões de treino concluídas no intervalo.
     */
    @Query("SELECT COUNT(ws) FROM WorkoutSession ws WHERE ws.user = :user AND ws.completedAt IS NOT NULL AND ws.completedAt >= :startDateTime AND ws.completedAt <= :endDateTime")
    int countByUserAndCompletedAtBetween(@Param("user") User user, @Param("startDateTime") LocalDateTime startDateTime, @Param("endDateTime") LocalDateTime endDateTime);

    /**
     * Busca sessões de treino para um usuário em uma data específica que ainda não foram concluídas
     * (completedAt é nulo). Ordena pelo ID decrescente para obter a mais recente criada
     * naquele dia, caso haja múltiplas sessões planejadas.
     *
     * @param user O usuário.
     * @param sessionDate A data específica (geralmente, a data de hoje).
     * @return Lista de WorkoutSession não concluídas para o dia especificado.
     */
    List<WorkoutSession> findByUserAndSessionDateAndCompletedAtIsNullOrderByIdDesc(User user, LocalDate sessionDate);

    /**
     * Conta o número de sessões de treino concluídas (completedAt IS NOT NULL)
     * para um usuário específico.
     *
     * @param user O usuário.
     * @return O número de sessões de treino concluídas.
     */
    @Query("SELECT COUNT(ws) FROM WorkoutSession ws WHERE ws.user = :user AND ws.completedAt IS NOT NULL")
    long countByUserAndCompletedAtIsNotNull(@Param("user") User user);

}