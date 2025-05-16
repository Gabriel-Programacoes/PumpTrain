import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { Exercise } from '../types/exercise';
import { useSnackbar } from '../context/SnackbarProvider';

// Payload para criar um exercício
type CreateExercisePayload = Omit<Exercise, 'id'>;

export const useCreateExerciseMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<Exercise, Error, CreateExercisePayload>({
        mutationFn: async (newExerciseData) => {
            const { data } = await apiClient.post<Exercise>('/api/exercises', newExerciseData);
            return data;
        },
        onSuccess: (createdExercise) => {
            showSnackbar('Exercício criado com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            // Opcional: adicionar ao cache para atualização otimista
             queryClient.setQueryData(['exercises'], (oldData: Exercise[] | undefined) =>
               oldData ? [createdExercise, ...oldData] : [createdExercise]
             );
        },
        onError: (error) => {
            showSnackbar(`Erro ao criar exercício: ${error.message}`, 'error');
        },
    });
};