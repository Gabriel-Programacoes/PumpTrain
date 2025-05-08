import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { UserStats } from '../types/stats';
import { useAuth } from '../context/AuthContext';

const fetchUserStats = async (): Promise<UserStats> => {
    console.log("[useUserStatsQuery] Buscando estatísticas de /api/user/stats...");
    const { data } = await apiClient.get<UserStats>('/api/user/stats');
    // Aplicar fallbacks para todos os campos esperados
    return {
        workoutsTotal: data.workoutsTotal ?? 0,
        workoutsThisMonth: data.workoutsThisMonth ?? 0,
        currentStreak: data.currentStreak ?? 0,
        recordStreak: data.recordStreak ?? 0,
        caloriesThisWeek: data.caloriesThisWeek ?? 0,
        timeThisMonthMinutes: data.timeThisMonthMinutes ?? 0,
        monthlyGoalTarget: data.monthlyGoalTarget ?? 25, // Exemplo de meta padrão
    };
};

export const useUserStatsQuery = () => {
    const { isAuthenticated } = useAuth();
    return useQuery<UserStats, Error>({
        queryKey: ['userStats'],
        queryFn: fetchUserStats,
        enabled: isAuthenticated(),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};