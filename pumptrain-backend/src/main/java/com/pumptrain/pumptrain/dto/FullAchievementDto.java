package com.pumptrain.pumptrain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FullAchievementDto {
    private Long id;
    private String title;
    private String description;
    private String iconName;
    private String category;
    private String rarity;

    private boolean unlocked;       // Se o usuário desbloqueou
    private double progress;        // Progresso percentual (0.0 a 1.0)
    private Integer total;          // Mapeado de Achievement.targetValue (objetivo para completar)
    private Integer current;        // Progresso atual do usuário (ex: 7 de 10 treinos)
    private LocalDateTime date;     // Data de desbloqueio (de UserAchievement.unlockedTimestamp)
}