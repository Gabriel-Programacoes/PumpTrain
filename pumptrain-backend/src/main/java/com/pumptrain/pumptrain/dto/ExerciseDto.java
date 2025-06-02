package com.pumptrain.pumptrain.dto;

import com.pumptrain.pumptrain.entity.enums.ExerciseType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ExerciseDto {
    private Long id;
    private String name;
    private String description;
    private String muscleGroup;
    private String equipment;
    private ExerciseType exerciseType;
}
