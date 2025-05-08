package com.pumptrain.pumptrain.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSessionDto {
    private String name;
    private Long id;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;
    private List<ActivityLogDto> activities;
    private LocalDateTime completedAt;
}