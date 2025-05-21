package com.pumptrain.pumptrain.mapper;

import com.pumptrain.pumptrain.dto.ActivityLogDto;
import com.pumptrain.pumptrain.entity.ActivityLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ActivityLogMapper {


    @Mapping(source = "exercise.id", target = "exerciseId")
    @Mapping(source = "exercise.name", target = "exerciseName")
    @Mapping(source = "exercise.exerciseType", target = "exerciseType")
    ActivityLogDto toDto(ActivityLog activityLog);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exercise", ignore = true)
    @Mapping(target = "workoutSession", ignore = true)
    @Mapping(target = "activityTimestamp", ignore = true)
    ActivityLog toEntity(ActivityLogDto activityLogDto);

    List<ActivityLogDto> toDto(List<ActivityLog> activityLogs);
}