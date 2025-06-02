package com.pumptrain.pumptrain.dto;

import com.pumptrain.pumptrain.entity.enums.ExerciseType;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseCreateDto {

    @NotBlank(message = "O nome do exercício não pode ser vazio.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    private String name;

    @Size(max = 1000, message = "A descrição não pode exceder 1000 caracteres.")
    private String description;

    @NotBlank(message = "O grupo muscular não pode ser vazio.")
    @Size(max = 50, message = "O grupo muscular não pode exceder 50 caracteres.")
    private String muscleGroup;

    @Size(max = 200, message = "A equipamento não pode exceder 200 caracteres.")
    private String equipment;

    @NotNull(message = "O tipo do exercício é obrigatório!")
    private ExerciseType exerciseType;
}