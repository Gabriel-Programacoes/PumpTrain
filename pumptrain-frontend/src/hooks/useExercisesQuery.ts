import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Exercise } from '../types/exercise';

const fetchExercises = async (): Promise<Exercise[]> => {
    console.debug("[useExercisesQuery] Fetching exercises...");
    const { data } = await apiClient.get<Exercise[]>('/api/exercises');
    return data;
};

export const useExercisesQuery = () => {
    return useQuery<Exercise[], Error>({
        queryKey: ['exercises'], // Chave de cache para exercícios
        queryFn: fetchExercises,
        staleTime: Infinity, // Exercícios raramente mudam, cache longo
        gcTime: Infinity,    // Manter em cache "para sempre" enquanto app rodar
    });
};