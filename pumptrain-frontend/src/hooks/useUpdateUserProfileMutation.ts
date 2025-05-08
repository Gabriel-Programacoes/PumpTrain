import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { User } from '../types/user';
import { useSnackbar } from '../context/SnackbarProvider';

// Tipo do payload que a API de atualização espera
// Pode ser Partial<User> se você envia apenas campos modificados (PATCH)
// Ou um DTO específico se você envia todos os campos (PUT)
// Vamos usar Partial<User> como exemplo genérico
type UpdateProfilePayload = Partial<Omit<User, 'id'>>;

export const useUpdateUserProfileMutation = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();

    return useMutation<User, Error, UpdateProfilePayload>({ // <TData, TError, TVariables>
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
            console.error("Erro ao atualizar perfil:", error);
            // Tentar exibir uma mensagem de erro mais específica da API, se possível
            let message = `Erro ao atualizar perfil: ${error.message}`;
            // @ts-expect-error Acesso seguro à resposta do erro Axios
            const responseData = error?.response?.data;
            if (typeof responseData === 'object' && responseData !== null && 'message' in responseData && typeof responseData.message === 'string') {
                message = responseData.message;
            }
            showSnackbar(message, 'error');
        },
    });
};