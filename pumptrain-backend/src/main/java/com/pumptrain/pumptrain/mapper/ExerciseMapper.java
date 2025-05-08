package com.pumptrain.pumptrain.mapper;

import com.pumptrain.pumptrain.dto.ExerciseCreateDto;
import com.pumptrain.pumptrain.dto.ExerciseDto;
import com.pumptrain.pumptrain.entity.Exercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ExerciseMapper {

    // Mapeia Exercise para ExerciseDto.
    // O MapStruct mapeará campos com nomes iguais automaticamente.
    ExerciseDto toDto(Exercise exercise);

    // Gera implementações para listas automaticamente
    List<ExerciseDto> toDto(List<Exercise> exercises);

    @Mapping(target = "id", ignore = true)
    Exercise toEntity(ExerciseCreateDto exerciseCreateDto);
}