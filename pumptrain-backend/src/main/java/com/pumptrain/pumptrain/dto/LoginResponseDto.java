package com.pumptrain.pumptrain.dto;


import lombok.*;

@Data @RequiredArgsConstructor
public class LoginResponseDto {
    private final String token;
}
