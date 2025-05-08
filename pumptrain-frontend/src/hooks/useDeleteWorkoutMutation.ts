import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { useSnackbar } from '../context/SnackbarProvider';

export const useDeleteWorkoutMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<void, Error, string | number>({ // Define tipos: Retorno, Erro, Input (ID)
        mutationFn: (workoutId) => {
            console.debug(`[useDeleteWorkoutMutation] Deleting workout ID: ${workoutId}`);
            return apiClient.delete(`/api/workouts/${workoutId}`); //
        },
        onSuccess: (_data, workoutId) => {
            showSnackbar('Treino deletado com sucesso!', 'success');

            // Invalida a query da lista para forçar a atualização
            queryClient.invalidateQueries({ queryKey: ['workouts'] });

            queryClient.removeQueries({ queryKey: ['workout', workoutId] });
            console.debug(`[useDeleteWorkoutMutation] Workout ID ${workoutId} deleted. Queries invalidated.`);
        },
        onError: (error) => {
            console.error("Error deleting workout:", error);
            showSnackbar(`Erro ao deletar treino: ${error.message}`, 'error');
        },
    });
};