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

    // --- Relacionamento com WorkoutSession ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    // --- Relacionamento com Exercise ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise; // Qual exercício foi feito

    // --- Métricas ---

    @Column // Número de séries
    private Integer sets;

    @Column(length = 100) // Repetições por série (ex: "12,10,8" ou "15")
    private String repetitions;

    @Column(length = 100) // Peso por série (ex: "50,55,60" ou "20") - Armazenar como String dá flexibilidade
    private String weightKg;

    @Column // Duração em minutos (para cardio ou exercícios cronometrados)
    private Integer durationMinutes;

    @Column // Distância em KM (para cardio)
    private Double distanceKm;

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