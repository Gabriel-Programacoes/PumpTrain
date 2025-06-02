import { AxiosError } from 'axios';

// Interface para a resposta de erro esperada da sua API
// Ajuste conforme a estrutura real da sua API de erro
export interface BackendErrorResponse {
    message?: string; // Mensagem principal do erro
    error?: string;   // Descrição curta do erro (ex: "Bad Request")
    errors?: Array<{ field?: string; message?: string }>; // Para múltiplos erros de validação de campo
    fieldErrors?: Array<{ field: string; message: string }>; // Outro formato comum para erros de campo
    // errorCode?: string; // Um código de erro interno (opcional)
}

export const extractApiErrorMessage = (error: unknown): string => {
    let userFriendlyMessage = "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.";

    if (error instanceof AxiosError && error.response) {
        const responseData = error.response.data as BackendErrorResponse; // Type assertion aqui é mais segura após a verificação
        console.debug("[extractApiErrorMessage] Response data from AxiosError:", responseData);

        if (responseData?.message) {
            userFriendlyMessage = responseData.message;
        } else if (responseData?.error) {
            userFriendlyMessage = responseData.error;
        } else if (responseData?.fieldErrors && responseData.fieldErrors.length > 0) {
            userFriendlyMessage = responseData.fieldErrors.map(err => `${err.field}: ${err.message || 'Erro no campo'}`).join('; ');
        } else if (responseData?.errors && responseData.errors.length > 0) {
            userFriendlyMessage = responseData.errors.map(err => err.message || 'Erro desconhecido').join('; ');
        } else {
            switch (error.response.status) {
                case 400:
                    userFriendlyMessage = "Dados inválidos fornecidos. Verifique as informações e tente novamente.";
                    break;
                case 401:
                    userFriendlyMessage = "Sessão expirada ou inválida. Por favor, faça login novamente.";
                    break;
                case 403:
                    userFriendlyMessage = "Você não tem permissão para realizar esta ação.";
                    break;
                case 404:
                    userFriendlyMessage = "O recurso solicitado não foi encontrado.";
                    break;
                case 409:
                    userFriendlyMessage = "Houve um conflito com os dados fornecidos. Verifique e tente novamente.";
                    break;
                case 500:
                default:
                    userFriendlyMessage = "Ocorreu um erro interno no servidor. Tente novamente mais tarde.";
                    break;
            }
        }
    } else if (error instanceof Error) { // Depois, verificamos se é um Error genérico do JavaScript
        if (error.message.toLowerCase().includes("network error")) { // Específico para erros de rede não cobertos pelo AxiosError com response
            userFriendlyMessage = "Falha na conexão. Verifique sua internet e tente novamente.";
        } else {
            userFriendlyMessage = error.message || "Ocorreu um erro desconhecido.";
        }
    } else {
        // Se não for nem AxiosError nem Error, podemos ter uma mensagem genérica
        // ou tentar converter para string, caso seja um objeto com toString() útil.
        console.warn("[extractApiErrorMessage] Erro de tipo inesperado:", error);
        if (typeof error === 'string') {
            userFriendlyMessage = error;
        }
        // Caso contrário, a mensagem padrão inicial será usada.
    }

    // console.warn("[extractApiErrorMessage] User friendly message:", userFriendlyMessage); // Mantenha para debug se necessário
    return userFriendlyMessage;
};