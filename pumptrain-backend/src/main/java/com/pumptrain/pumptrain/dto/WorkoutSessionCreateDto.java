package com.pumptrain.pumptrain.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.Valid;

@Data
public class WorkoutSessionCreateDto {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate sessionDate;

    @Size(max = 1000, message = "Notas não podem exceder 1000 caracteres!")
    private String notes;

    @NotBlank(message = "O nome do treino não pode ser vazio.")
    @Size(min = 1, max = 100, message = "Nome do treino deve ter entre 1 e 100 caracteres.")
    private String name;

    @Valid
    private List<ActivityLogDto> activities;
}