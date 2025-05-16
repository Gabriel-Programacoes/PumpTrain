import axios, {AxiosError, InternalAxiosRequestConfig} from "axios";

interface ApiErrorResponse {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
    fieldErrors?: Array<{ field: string; message: string }>;
}

const apiClient = axios.create({
    baseURL: "http://localhost:9971",
    headers: {
        "Content-Type": "application/json"
    }
});

// ------- Interceptor de requisição -------
// É executado antes de cada requisição
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem("authToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.debug("[API CLIENT] Adicionando token Bearer ao header");
        } else {
            console.debug("[API CLIENT] Token não encontrado");
        }
        return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
        console.error("[API CLIENT] Erro no interceptor de requisição: ", error)
        return Promise.reject(error);
    }
);

// --------- Interceptor de resposta ---------
// É executado após cada requisição
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError<ApiErrorResponse>): Promise<AxiosError> => {
        const originalRequest = error.config;

        if (error.response) {
            console.error(`[API CLIENT] Erro ${error.response.status} na resposta para ${originalRequest?.url}: `, error.response.data);
        } else if (error.request) {
            console.error(`[API CLIENT] Erro sem resposta para ${originalRequest?.url}: `, error.request);
        } else {
            console.error(`[API CLIENT] Erro ao fazer requisição para ${originalRequest?.url}: `, error.message);
        }

        // Tratamento para erro 401
        // Ignora o tratamento se a requisição original já foi uma tentativa de login
        if (error.response && error.response.status === 401 && originalRequest?.url !== "/auth/login") {
            console.warn("[API CLIENT] Erro 401 detectado! Token pode ser inválido ou estar expirado!");
            localStorage.removeItem("authToken")
            console.log("[API CLIENT] Token removido do local Storage devido a erro 401.");
            }

        return Promise.reject(error);
    }
);

export default apiClient;