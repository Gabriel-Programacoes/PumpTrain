package com.pumptrain.pumptrain.dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class UserStatsDto {
    private long workoutsTotal;
    private int workoutsThisMonth;
    private int currentStreak;
    private int recordStreak;
}
