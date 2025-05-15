export interface Achievement {
    id: string | number;
    name: string;
    iconName?: string;
}

export interface AchievementData {
    unlockedCount: number;
    totalAvailable: number;
    recent?: Achievement[]; // Lista das últimas conquistas desbloqueadas, por exemplo
}

export interface FullAchievement {
    id: number;
    title: string;
    description: string;
    iconName: string; // Mapeado para o componente ReactNode no frontend
    category: string;
    unlocked: boolean;
    progress?: number;
    total?: number;
    current?: number; // Se diferente de progress
    date?: string; // Data de desbloqueio
    rarity: "comum" | "raro" | "épico" | "lendário";
}