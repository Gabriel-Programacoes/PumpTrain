import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Workout } from '../types/workout';
import { Activity } from '../types/activity';
import { useSnackbar } from '../context/SnackbarProvider';
import { extractApiErrorMessage } from '../utils/errorUtils'; // <<< IMPORTAR A FUNÇÃO

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
            // console.debug("[useCreateWorkoutMutation] Creating new workout:", newWorkoutData);
            return apiClient.post<Workout>('/api/workouts', newWorkoutData).then(res => res.data);
        },
        onSuccess: (createdWorkout) => {
            showSnackbar('Treino criado com sucesso!', 'success');

            // Invalida a query da lista geral para incluir o novo treino
            queryClient.invalidateQueries({ queryKey: ['workouts'] });

            queryClient.invalidateQueries({ queryKey: ['workout', 'today'] });

            // Invalida as estatísticas do usuário, pois um novo treino foi adicionado
            queryClient.invalidateQueries({ queryKey: ['userStats'] });

            queryClient.invalidateQueries({ queryKey: ['workout', createdWorkout.id] });

            console.debug("[useCreateWorkoutMutation] Workout created, relevant queries invalidated:", createdWorkout);
        },
        onError: (error) => {
            console.error("[useCreateWorkoutMutation] Error creating workout:", error);
            // Extrai a mensagem de erro amigável
            const friendlyErrorMessage = extractApiErrorMessage(error);
            showSnackbar(friendlyErrorMessage, 'error');
        },
    });
};