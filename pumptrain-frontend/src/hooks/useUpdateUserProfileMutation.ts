import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { User } from '../types/user';
import { useSnackbar } from '../context/SnackbarProvider';
import { AxiosError } from 'axios';

type UpdateProfilePayload = Partial<Omit<User, 'id'>>;

interface ApiErrorDetail {
    field?: string;
    message?: string;
}

interface BackendErrorResponse {
    message?: string;
    error?: string;
    errors: ApiErrorDetail[];
    fieldErrors?: Array<{field: string; message: string}>;
}



export const useUpdateUserProfileMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<User, Error, UpdateProfilePayload>({
        mutationFn: async (updatedProfileData) => {
            console.log("[useUpdateUserProfileMutation] Atualizando perfil:", updatedProfileData);
            // Use PUT ou PATCH conforme sua API. '/user/profile' é um exemplo de endpoint.
            const { data } = await apiClient.put<User>('/api/user/profile', updatedProfileData);
            return data; // Retorna os dados do usuário atualizados pela API (se houver)
        },
        onSuccess: (updatedUser) => { // updatedUser são os dados retornados pela API
            showSnackbar('Perfil atualizado com sucesso!', 'success');

            // --- Atualização Automática da UI ---
            // 1. Invalidar a query do perfil para forçar o useUserProfileQuery a buscar dados frescos
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });

            console.debug("[useUpdateUserProfileMutation] Perfil atualizado, query 'userProfile' invalidada.", updatedUser);
        },
        onError: (error) => {
            // console.error("Erro ao atualizar perfil:", error);
            let userFriendlyMessage = "Ocorreu um erro ao atualizar o perfil. Tente novamente.";

            if (error instanceof AxiosError && error.response) {
                const responseData = error.response.data as BackendErrorResponse;
                // Tenta pegar a mensagem mais específica do backend
                if (responseData?.message) {
                    userFriendlyMessage = responseData.message;
                } else if (responseData?.error) {
                    userFriendlyMessage = responseData.error;
                } else if (responseData?.errors && responseData.errors.length > 0) {
                    // Se houver múltiplos erros, pode pegar o primeiro ou concatenar
                    userFriendlyMessage = responseData.errors.map(err => err.message).join(' ');
                } else if (responseData?.fieldErrors && responseData.fieldErrors.length > 0) {
                    userFriendlyMessage = responseData.fieldErrors.map(err => `${err.field}: ${err.message}`).join('; ');
                } else if (error.response.status === 401) {
                    userFriendlyMessage = "Sessão expirada ou inválida. Faça login novamente.";
                    // Potencialmente deslogar o usuário aqui ou o interceptor já faz isso
                } else if (error.response.status === 403) {
                    userFriendlyMessage = "Você não tem permissão para realizar esta ação.";
                } else if (error.response.status >= 500) {
                    userFriendlyMessage = "Erro no servidor. Por favor, tente novamente mais tarde.";
                }
            } else if (error.message.includes("Network Error")) {
                userFriendlyMessage = "Falha na conexão. Verifique sua internet.";
            }

            showSnackbar(userFriendlyMessage, 'error');
        },
    });
};