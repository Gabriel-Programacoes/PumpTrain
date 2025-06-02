package com.pumptrain.pumptrain.dto;

import com.pumptrain.pumptrain.entity.enums.ExerciseType;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {
    private Long id;

    @NotNull(message = "ID do exercício (exerciseId) é obrigatório.")
    private Long exerciseId; // ID do exercício realizado

    private String exerciseName; // Nome do exercício

    private ExerciseType exerciseType;

    @Min(value = 1, message = "Número de séries (sets) deve ser maior que zero.")
    private Integer sets;

    @Size(max = 100, message = "O campo de repetições (repetitions) não pode exceder 100 caracteres!")
    private String repetitions; // Ex: "12, 10, 8"

    @Size(max = 100, message = "O campo de peso (weightKg) não pode exceder 100 caracteres!")
    private String weightKg;    // Ex: "50, 55, 60"

    @Column
    @Min(value = 1, message = "A duração em minutos (durationMinutes) deve ser maior que zero.")
    private Integer durationMinutes;

    @Column
    @DecimalMin(value = "0.0", inclusive = false, message = "A distância em quilômetros (distanceKm) deve ser maior que zero.")
    private Double distanceKm;

    @Column
    @Min(value = 1, message = "Intensidade deve ser no mínimo 1")
    @Max(value = 10, message = "A intensidade pode ser no máximo 10")
    private Integer intensity;

    @Column
    @Min(value = 0, message = "A inclinação deve ser no mínimo 0")
    @Max(value = 100, message = "A inclinação pode ser no máximo 100")
    private Integer incline;

    @Size(max = 500, message = "As notas (notes) não podem exceder 500 caracteres.")
    private String notes;


    private LocalDateTime activityTimestamp;

    // Construtor adicional sem ID e timestamp (útil para criação)
    public ActivityLogDto(Long exerciseId, String exerciseName, ExerciseType exerciseType, Integer sets, String repetitions, String weightKg, Integer durationMinutes, Double distanceKm, Integer intensity, Integer incline, String notes) {
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.exerciseType = exerciseType;
        this.sets = sets;
        this.repetitions = repetitions;
        this.weightKg = weightKg;
        this.durationMinutes = durationMinutes;
        this.distanceKm = distanceKm;
        this.intensity = intensity;
        this.incline = incline;
        this.notes = notes;
    }
}