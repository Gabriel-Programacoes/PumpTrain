package com.pumptrain.pumptrain.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserProfileUpdateDto {

    @NotBlank(message = "O campo de nome não pode estar em branco!")
    @Size(min = 5, max = 100, message = "O nome deve ter entre 5 e 100 caracteres!")
    private String name;

    @Min(value = 1, message="A idade deve ser um valor positivo.")
    @Max(value = 80, message="Idade inválida.")
    @Column
    private Integer age;

    @Min(value = 1, message="Altura deve ser um valor positivo (em cm).")
    @Max(value = 300, message="Altura inválida (em cm).")
    @Column
    private Integer height;


    @DecimalMin(value = "0.1", message="Peso deve ser um valor positivo (em kg).")
    @DecimalMax(value ="1000.0", message="Peso inválido (em kg).")
    @Column
    private Double weight;
}