package com.pumptrain.pumptrain.mapper;

import com.pumptrain.pumptrain.dto.UserProfileDto;
import com.pumptrain.pumptrain.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring") // Integra com Spring
public interface UserMapper {

    // Mapeia automaticamente User -> UserProfileDto pelos nomes iguais
    // Não mapeia 'password' ou outros campos não presentes no DTO
    UserProfileDto toUserProfileDto(User user);
}