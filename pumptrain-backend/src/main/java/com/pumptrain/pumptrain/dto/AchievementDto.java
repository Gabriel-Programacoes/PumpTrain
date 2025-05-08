package com.pumptrain.pumptrain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDto {
    private String achievementKey;
    private String name;
    private String description;
    private String iconUrl;
    private LocalDateTime unlockedTimestamp;
}