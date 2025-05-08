import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Workout } from '../types/workout';
import { Activity } from '../types/activity';
import { useSnackbar } from '../context/SnackbarProvider';

export interface UpdateWorkoutPayload {
    sessionDate: string;
    name: string | null;
    notes: string | null;
    activities: Array<Omit<Activity, 'id' | 'exerciseName'> & { id?: string | number }>;
}

export const useUpdateWorkoutMutation = (workoutId: string | number | undefined) => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    // Tipos Genéricos: <TData, TError, TVariables, TContext>
    // TData: Tipo retornado pela API (ex: Workout atualizado)
    // TError: Tipo do erro
    // TVariables: Tipo do payload enviado para mutationFn (UpdateWorkoutPayload)
    return useMutation<Workout, Error, UpdateWorkoutPayload>({
        mutationFn: (updatedWorkoutData) => {
            if (!workoutId) {
                return Promise.reject(new Error("ID do treino inválido para atualização."));
            }
            console.debug(`[useUpdateWorkoutMutation] Updating workout ID: ${workoutId}`, updatedWorkoutData);
            return apiClient.put<Workout>(`/api/workouts/${workoutId}`, updatedWorkoutData).then(res => res.data);
        },
        onSuccess: (updatedWorkout) => {
            showSnackbar('Treino atualizado com sucesso!', 'success');

            // Invalida queries para forçar recarregamento dos dados atualizados
            // 1. Query da lista geral de treinos
            queryClient.invalidateQueries({ queryKey: ['workouts'] });

            // 2. Query específica dos detalhes deste treino
            queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });

            console.debug("[useUpdateWorkoutMutation] Workout updated:", updatedWorkout);
        },
        onError: (error) => {
            console.error("Error updating workout:", error);
            showSnackbar(`Erro ao atualizar treino: ${error.message}`, 'error');
        },
    });
};