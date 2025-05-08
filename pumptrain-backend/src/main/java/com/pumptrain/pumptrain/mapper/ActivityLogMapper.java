package com.pumptrain.pumptrain.mapper;

import com.pumptrain.pumptrain.dto.ActivityLogDto;
import com.pumptrain.pumptrain.entity.ActivityLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ActivityLogMapper {

    ActivityLogMapper INSTANCE = Mappers.getMapper(ActivityLogMapper.class);

    /**
     * Mapeia a Entidade ActivityLog para ActivityLogDto.
     * Campos com nomes idênticos (como weightKg, repetitions, notes, etc.)
     * são mapeados automaticamente pelo MapStruct.
     */
    @Mapping(source = "exercise.id", target = "exerciseId")
    @Mapping(source = "exercise.name", target = "exerciseName")
    ActivityLogDto toDto(ActivityLog activityLog);

    /**
     * Mapeia ActivityLogDto para a Entidade ActivityLog.
     * Usado principalmente na criação/atualização.
     * Campos com nomes idênticos (como weightKg, repetitions, notes, etc.)
     * são mapeados automaticamente pelo MapStruct.
     * Campos-alvo especificados são ignorados pois são tratados manualmente/automaticamente.
     */
    @Mapping(target = "id", ignore = true) // ID é gerado pelo banco ou vem do path
    @Mapping(target = "exercise", ignore = true) // Definido manualmente no serviço buscando pelo exerciseId
    @Mapping(target = "workoutSession", ignore = true) // Definido manualmente no serviço
    @Mapping(target = "activityTimestamp", ignore = true) // Definido por @PrePersist
    ActivityLog toEntity(ActivityLogDto activityLogDto);

    /**
     * Mapeia uma lista de Entidades para uma lista de DTOs.
     */
    List<ActivityLogDto> toDto(List<ActivityLog> activityLogs);
}