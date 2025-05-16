package com.pumptrain.pumptrain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Column(length = 1000) 
    private String notes;

    @Column(nullable = true)
    private LocalDateTime completedAt;

    // --- Relacionamento com ActivityLog ---
    @OneToMany(
            mappedBy = "workoutSession", // Indica que o campo 'workoutSession' na classe ActivityLog gerencia este lado da relação
            cascade = CascadeType.ALL,   // Se salvar/deletar uma Session, salva/deleta as Activities junto
            orphanRemoval = true,        // Se remover uma Activity da lista 'activities' e salvar a Session, a Activity é removida do BD
            fetch = FetchType.LAZY         // LAZY: Carregar a lista de atividades só quando explicitamente pedido (getActivities())
    )
    private List<ActivityLog> activities = new ArrayList<>(); // Lista das atividades feitas nesta sessão

    // Métodos auxiliares
    public void addActivity(ActivityLog activity) {
        if (activity != null) {
            if (this.activities == null) {
                this.activities = new ArrayList<>();
            }
            this.activities.add(activity);
            activity.setWorkoutSession(this); // <<< Linha crucial para a relação bidirecional
        }
    }

    public void removeActivity(ActivityLog activity) {
        if (activity != null && this.activities != null) { // Garante que 'activity' e a coleção 'activities' não são nulas
            boolean removed = this.activities.remove(activity);
            if (removed) { // Apenas define workoutSession como null se realmente foi removido da lista
                activity.setWorkoutSession(null);
            }
        }
    }

    @Transient
    public boolean isCompleted() {
        return this.completedAt != null;
    }
}