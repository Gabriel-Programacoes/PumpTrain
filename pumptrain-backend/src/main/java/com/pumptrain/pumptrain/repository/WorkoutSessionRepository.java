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
     * ordenadas pela data da sessão em ordem decrescente (mais recentes primeiro).
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
     * @param startDate A data de início do intervalo (inclusiva).
     * @param endDate A data de fim do intervalo (inclusiva).
     * @return O número de sessões de treino no intervalo.
     */
    int countByUserAndSessionDateBetween(User user, LocalDate startDate, LocalDate endDate);

    /**
     * Busca os timestamps distintos de conclusão (completedAt) para as sessões de um usuário
     * que foram marcadas como concluídas, ordenados do mais recente para o mais antigo.
     * Usado principalmente para cálculo de streaks baseado na data de conclusão.
     *
     * @param user O usuário.
     * @return Uma lista de LocalDateTime representando os timestamps de conclusão únicos e ordenados.
     */
    @Query("SELECT ws.completedAt FROM WorkoutSession ws WHERE ws.user = :user AND ws.completedAt IS NOT NULL ORDER BY ws.completedAt DESC")
    List<LocalDateTime> findCompletedAtTimestampsByUserOrderByCompletedAtDesc(@Param("user") User user);


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

}