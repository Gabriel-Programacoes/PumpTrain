import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { AchievementData } from '../types/achievements';
import { useAuth } from '../context/AuthContext';

const fetchAchievements = async (): Promise<AchievementData> => {
    console.log("[useAchievementsQuery] Buscando conquistas de /api/user/achievements...");
    // Substitua pelo seu endpoint real de conquistas
    const { data } = await apiClient.get<AchievementData>('/api/user/achievements');
    return {
        unlockedCount: data.unlockedCount ?? 0,
        totalAvailable: data.totalAvailable ?? 0,
        recent: data.recent ?? [],
    };
};

export const useAchievementsQuery = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<AchievementData, Error>({
        queryKey: ['achievements'],
        queryFn: fetchAchievements,
        enabled: isAuthenticated(),
        staleTime: 1000 * 60 * 30,
    });
};