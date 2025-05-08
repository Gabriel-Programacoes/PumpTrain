// src/hooks/useCompleteWorkoutMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { useSnackbar } from '../context/SnackbarProvider';
import { WorkoutDetails } from '../types/workout'; // Usaremos para o tipo de retorno da API

export const useCompleteWorkoutMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    // TData: Tipo retornado pela API (WorkoutDetails atualizado)
    // TError: Tipo do erro (Error)
    // TVariables: Tipo do que passamos para mutate (workoutId)
    // TContext: Tipo do contexto de mutação (não usado aqui)
    return useMutation<WorkoutDetails, Error, string | number>({
        mutationFn: async (workoutId) => {
            console.log(`[useCompleteWorkoutMutation] Marcando treino ID: ${workoutId} como concluído...`);
            // Assumindo endpoint POST /api/workouts/{workoutId}/complete
            // Se sua API retornar o treino atualizado, ótimo.
            const { data } = await apiClient.post<WorkoutDetails>(`/api/workouts/${workoutId}/complete`);
            return data;
        },
        onSuccess: (_data, workoutId) => {
            showSnackbar('Treino marcado como concluído!', 'success');

            // Invalidar queries para forçar recarregamento dos dados atualizados
            queryClient.invalidateQueries({ queryKey: ['workouts'] }); // Lista geral de treinos
            queryClient.invalidateQueries({ queryKey: ['workout', workoutId] }); // Detalhes deste treino
            queryClient.invalidateQueries({ queryKey: ['userStats'] }); // <<< MUITO IMPORTANTE: Para atualizar a sequência

            console.debug(`[useCompleteWorkoutMutation] Treino ID ${workoutId} concluído. Queries invalidadas.`);
        },
        onError: (error) => {
            console.error("Erro ao marcar treino como concluído:", error);
            showSnackbar(`Erro: ${error.message}`, 'error');
        },
    });
};