// src/hooks/useAchievementsSummaryQuery.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { AchievementsSummary } from '../types/achievements'; // <<< Usa o novo tipo
import { useAuth } from '../context/AuthContext';

const fetchAchievementsSummary = async (): Promise<AchievementsSummary> => {
    console.log("[useAchievementsSummaryQuery] Buscando resumo de conquistas...");
    // Use o endpoint que retorna o objeto de resumo
    const { data } = await apiClient.get<AchievementsSummary>('/api/user/achievements'); // Ou o endpoint correto
    return { // Aplicar fallbacks
        unlockedCount: data.unlockedCount ?? 0,
        totalAvailable: data.totalAvailable ?? 0,
        recentAchievements: data.recentAchievements ?? [],
    };
};

export const useAchievementsSummaryQuery = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<AchievementsSummary, Error>({
        queryKey: ['achievementsSummary'], // Chave de cache para o resumo
        queryFn: fetchAchievementsSummary,
        enabled: isAuthenticated(),
        staleTime: 1000 * 60 * 15,
    });
};