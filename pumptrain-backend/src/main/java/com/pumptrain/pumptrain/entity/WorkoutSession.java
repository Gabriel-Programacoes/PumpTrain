package com.pumptrain.pumptrain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "workout_sessions")
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    // --- Relacionamento com User ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 100)
    private String name;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column // Hora de início
    private LocalTime startTime;

    @Column // Hora de fim
    private LocalTime endTime;

    @Column(length = 1000) // Notas gerais sobre a sessão
    private String notes;

    @Column(nullable = true)
    private LocalDateTime completedAt;

    // --- Relacionamento com ActivityLog ---
    // Uma WorkoutSession tem muitas ActivityLog
    @OneToMany(
            mappedBy = "workoutSession", // Indica que o campo 'workoutSession' na classe ActivityLog gerencia este lado da relação
            cascade = CascadeType.ALL,   // Se salvar/deletar uma Session, salva/deleta as Activities junto
            orphanRemoval = true,        // Se remover uma Activity da lista 'activities' e salvar a Session, a Activity é removida do BD
            fetch = FetchType.LAZY         // LAZY: Carregar a lista de atividades só quando explicitamente pedido (getActivities())
    )
    private List<ActivityLog> activities = new ArrayList<>(); // Lista das atividades feitas nesta sessão

    // Métodos auxiliares
    public void addActivity(ActivityLog activity) {
        activities.add(activity);
        activity.setWorkoutSession(this);
    }

    public void removeActivity(ActivityLog activity) {
        activities.remove(activity);
        activity.setWorkoutSession(null);
    }

    @Transient
    public boolean isCompleted() {
        return this.completedAt != null;
    }
}