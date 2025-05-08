import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient'; //
import { WorkoutDetails } from '../types/workout'; //

const fetchWorkoutDetails = async (workoutId: string): Promise<WorkoutDetails> => {
    if (!workoutId || workoutId === 'undefined' || workoutId === 'null') {
        throw new Error('ID do treino inválido para busca.');
    }
    console.debug(`[useWorkoutDetailQuery] Fetching details for workout ID: ${workoutId}`);
    const { data } = await apiClient.get<WorkoutDetails>(`/api/workouts/${workoutId}`); //
    return data;
};

export const useWorkoutDetailQuery = (workoutId: string | undefined) => {
    return useQuery<WorkoutDetails, Error>({
        queryKey: ['workout', workoutId], // Chave inclui ID específico
        queryFn: () => fetchWorkoutDetails(workoutId!),
        // Habilita apenas se workoutId for válido
        enabled: !!workoutId && workoutId !== 'undefined' && workoutId !== 'null',
    });
};