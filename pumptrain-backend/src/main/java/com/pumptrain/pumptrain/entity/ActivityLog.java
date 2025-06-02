package com.pumptrain.pumptrain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Relacionamento com Exercise ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise; // Qual exercício foi feito

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession; // Qual exercício foi feito

    // --- Métricas ---

    @Column // Número de séries
    private Integer sets;

    @Column(length = 100) // Repetições por série
    private String repetitions;

    @Column(length = 100) // Peso por série  - Armazenar como String dá flexibilidade
    private String weightKg;

    @Column // Duração em minutos
    private Integer durationMinutes;

    @Column // Distância em KM
    private Double distanceKm;

    @Column
    private Integer intensity; // Intensidade específica desta atividade

    @Column
    private Integer incline;   // Inclinação específica desta atividade

    @Column(length = 500) // Notas específicas sobre esta atividade
    private String notes;

    @Column(nullable = false, updatable = false) // Timestamp de quando a atividade foi registrada/concluída
    private LocalDateTime activityTimestamp;

    // Define o timestamp automaticamente antes de persistir
    @PrePersist
    protected void onCreate() {
        this.activityTimestamp = LocalDateTime.now();
    }
}