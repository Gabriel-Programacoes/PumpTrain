export interface Achievement {
    id: string | number;
    name: string;
    iconName?: string;
    description?: string;
    // Outros campos relevantes, como data de desbloqueio
}

export interface AchievementData {
    unlockedCount: number;
    totalCount: number;
    recent?: Achievement[]; // Lista das últimas conquistas desbloqueadas, por exemplo
}