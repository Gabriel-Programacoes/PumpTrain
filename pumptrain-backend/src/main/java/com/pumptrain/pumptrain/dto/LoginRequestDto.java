package com.pumptrain.pumptrain.dto;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data

public class LoginRequestDto {
    @NotBlank @Email private String email;
    @NotBlank private String password;
}
