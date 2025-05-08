package com.pumptrain.pumptrain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAchievementsDto {
    private long unlockedCount;
    private long totalAvailable;
    private List<AchievementDto> recentAchievements;
}