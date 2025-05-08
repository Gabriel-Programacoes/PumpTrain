package com.pumptrain.pumptrain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class UserRegistrationDto {
    @NotBlank(message = "O campo de nome não pode estar em branco!")
    @Size(min = 5, max=20, message = "O campo nome deve ter pelo menos 5 caracteres!")
    private String name;

    @NotBlank(message = "O campo nome não pode estar em branco!")
    @Size(min = 5, max=50, message = "O campo nome deve ter pelo menos 5 caracteres!")
    @Email(message = "Email inválido! Tente novamente")
    private String email;

    @NotBlank(message = "O campo de senha não pode estar em branco!")
    @Size(min = 7, max=100, message = "O campo nome deve ter pelo menos 5 caracteres!")
    private String password;
}