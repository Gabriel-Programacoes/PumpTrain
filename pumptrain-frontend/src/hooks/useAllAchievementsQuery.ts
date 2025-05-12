// src/hooks/useAllAchievementsQuery.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { FullAchievement } from '../types/achievements';
import { useAuth } from '../context/AuthContext';

const fetchAllAchievements = async (): Promise<FullAchievement[]> => {
    const { data } = await apiClient.get<FullAchievement[]>('/api/user/achievements/all'); // SEU ENDPOINT
    return data ?? [];
};

export const useAllAchievementsQuery = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<FullAchievement[], Error>({
        queryKey: ['allAchievements'],
        queryFn: fetchAllAchievements,
        enabled: isAuthenticated(),
        staleTime: 1000 * 60 * 15, // 15 minutos
    });
};