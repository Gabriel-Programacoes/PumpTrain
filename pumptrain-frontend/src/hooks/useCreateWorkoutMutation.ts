import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Workout } from '../types/workout';
import { Activity } from '../types/activity';
import { useSnackbar } from '../context/SnackbarProvider';


export interface CreateWorkoutPayload {
    sessionDate: string;
    name: string | null;
    notes: string | null;
    activities: Omit<Activity, 'id' | 'exerciseName'>[];
}

export const useCreateWorkoutMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<Workout, Error, CreateWorkoutPayload>({
        mutationFn: (newWorkoutData) => {
            console.debug("[useCreateWorkoutMutation] Creating new workout:", newWorkoutData);
            return apiClient.post<Workout>('/api/workouts', newWorkoutData).then(res => res.data); //
        },
        onSuccess: (createdWorkout) => {
            showSnackbar('Treino criado com sucesso!', 'success');
            // Invalida a query da lista para incluir o novo treino
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
            console.debug("[useCreateWorkoutMutation] Workout created:", createdWorkout);
        },
        onError: (error) => {
            console.error("Error creating workout:", error);
            showSnackbar(`Erro ao criar treino: ${error.message}`, 'error');
        },
    });
};