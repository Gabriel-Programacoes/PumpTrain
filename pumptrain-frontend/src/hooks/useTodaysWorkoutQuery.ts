// src/hooks/useTodaysWorkoutQuery.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { WorkoutDetails } from '../types/workout';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';

// Busca o treino de hoje
const fetchTodaysWorkout = async (): Promise<WorkoutDetails | null> => {
    console.log("[useTodaysWorkoutQuery] Buscando /api/workouts/today...");
    try {
        const { data } = await apiClient.get<WorkoutDetails>('/api/workouts/today');
        return data;
    } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response && axiosError.response.status === 404) {
            console.log("[useTodaysWorkoutQuery] Nenhum treino encontrado para hoje (404).");
            return null; // Retorna null se não houver treino hoje
        }
        console.error("[useTodaysWorkoutQuery] Erro:", error);
        throw error; // Lança outros erros
    }
};

export const useTodaysWorkoutQuery = () => {
    const { isAuthenticated } = useAuth();

    return useQuery<WorkoutDetails | null, Error>({
        queryKey: ['workout', 'today'], // Chave de cache
        queryFn: fetchTodaysWorkout,
        enabled: isAuthenticated(),
        staleTime: 1000 * 60 * 5, // 5 min
        retry: (failureCount, error) => {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.status === 404) return false;
            return failureCount < 3;
        },
    });
};