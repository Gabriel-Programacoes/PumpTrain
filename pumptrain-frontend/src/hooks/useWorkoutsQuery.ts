import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Workout } from '../types/workout';

const fetchWorkouts = async (): Promise<Workout[]> => {
    console.debug("[useWorkoutsQuery] Fetching workouts...");
    const { data } = await apiClient.get<Workout[]>('/api/workouts'); //
    return data;
};

export const useWorkoutsQuery = () => {
    return useQuery<Workout[], Error>({
        queryKey: ['workouts'], // Chave de cache para a lista de treinos
        queryFn: fetchWorkouts,
        staleTime: 5 * 60 * 1000, // Opcional: Dados frescos por 5 minutos
    });
};