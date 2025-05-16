import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { useSnackbar } from '../context/SnackbarProvider';
import {Exercise} from "../types/exercise.ts";

export const useDeleteExerciseMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<void, Error, string | number>({
        mutationFn: (exerciseId) => {
            return apiClient.delete(`/api/exercises/${exerciseId}`);
        },
        onSuccess: (_data, exerciseId) => {
            showSnackbar('Exercício excluído com sucesso!', 'success');
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
             queryClient.setQueryData(['exercises'], (oldData: Exercise[] | undefined) =>
               oldData ? oldData.filter(ex => ex.id !== exerciseId) : []
             );
        },
        onError: (error) => {
            showSnackbar(`Erro ao excluir exercício: ${error.message}`, 'error');
        },
    });
};