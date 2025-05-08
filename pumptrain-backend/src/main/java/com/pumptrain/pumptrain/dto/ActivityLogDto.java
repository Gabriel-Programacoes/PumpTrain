package com.pumptrain.pumptrain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {
    private Long id;

    @NotNull(message = "ID do exercício (exerciseId) é obrigatório.")
    private Long exerciseId; // ID do exercício realizado

    private String exerciseName; // Nome do exercício

    @Min(value = 1, message = "Número de séries (sets) deve ser maior que zero.")
    private Integer sets;

    @Size(max = 100, message = "O campo de repetições (repetitions) não pode exceder 100 caracteres!")
    private String repetitions; // Ex: "12, 10, 8"

    @Size(max = 100, message = "O campo de peso (weightKg) não pode exceder 100 caracteres!")
    private String weightKg;    // Ex: "50, 55, 60"

    @Min(value = 1, message = "A duração em minutos (durationMinutes) deve ser maior que zero.")
    private Integer durationMinutes;

    @DecimalMin(value = "0.0", inclusive = false, message = "A distância em quilômetros (distanceKm) deve ser maior que zero.")
    private Double distanceKm;

    @Size(max = 500, message = "As notas (notes) não podem exceder 500 caracteres.")
    private String notes;

    private LocalDateTime activityTimestamp;

    // Construtor adicional sem ID e timestamp (útil para criação)
    public ActivityLogDto(Long exerciseId, String exerciseName, Integer sets, String repetitions, String weightKg, Integer durationMinutes, Double distanceKm, String notes) {
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.sets = sets;
        this.repetitions = repetitions;
        this.weightKg = weightKg;
        this.durationMinutes = durationMinutes;
        this.distanceKm = distanceKm;
        this.notes = notes;
    }
}