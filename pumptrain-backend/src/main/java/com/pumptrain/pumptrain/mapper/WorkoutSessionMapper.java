package com.pumptrain.pumptrain.mapper;

import com.pumptrain.pumptrain.dto.WorkoutSessionDto;
import com.pumptrain.pumptrain.entity.WorkoutSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

// Informa ao MapStruct para usar o ActivityLogMapper para mapear a lista de atividades
@Mapper(componentModel = "spring", uses = {ActivityLogMapper.class})
public interface WorkoutSessionMapper {

    // Mapeia WorkoutSession para WorkoutSessionDto, incluindo a lista de activities
    WorkoutSessionDto toDto(WorkoutSession workoutSession);

    // Mapeia lista de sessões
    List<WorkoutSessionDto> toDto(List<WorkoutSession> sessions);

    // Se precisar mapear DTO -> Entidade (ex: para criação/atualização)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true) // Definido manualmente
    @Mapping(target = "activities", ignore = true) // Gerenciado separadamente
    WorkoutSession toEntity(WorkoutSessionDto workoutSessionDto);

}