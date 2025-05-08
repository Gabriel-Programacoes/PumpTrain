import { createContext, useState, useContext, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import apiClient from '../api/apiClient';
import { CircularProgress, Box } from '@mui/material';

interface AuthContextType {
    token: string | null;
    isLoading: boolean; // isLoading inicial da verificação do token
    user: User | null;
    login: (newToken: string) => Promise<User | null>; // Login busca usuário e retorna (ou null)
    logout: () => void;
    isAuthenticated: () => boolean;
    fetchUser: () => Promise<User | null>; // <<< Exportar fetchUser se necessário externamente
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Carregamento inicial
    const navigate = useNavigate();

    // Função para buscar o usuário
    const fetchUser = useCallback(async (): Promise<User | null> => {
        console.log('[AuthContext] Tentando buscar dados do usuário em /user/profile...');
        // Verifica se já existe um token no estado antes de tentar
        const currentToken = localStorage.getItem('authToken'); // Lê direto do storage aqui
        if (!currentToken) {
            console.log('[AuthContext] fetchUser: Nenhum token encontrado, abortando.');
            setToken(null); // Garante consistência
            setUser(null);
            return null;
        }
        try {
            // Assumindo que apiClient envia o token automaticamente
            const response = await apiClient.get<User>('api/user/profile');
            console.log('[AuthContext] Usuário obtido:', response.data);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error("[AuthContext] Erro ao buscar usuário em /user/profile:", error);
            // Limpa tudo se falhar (token pode ser inválido)
            setToken(null);
            setUser(null);
            localStorage.removeItem('authToken');
            return null;
        }
    }, []); // Sem dependências externas

    // useEffect para verificar token inicial e buscar usuário
    useEffect(() => {
        let isMounted = true;
        console.log('[AuthContext Effect] Verificando token...');
        setIsLoading(true);

        const checkInitialAuth = async () => {
            let foundToken: string | null = null;
            try {
                foundToken = localStorage.getItem('authToken');
                if (foundToken) {
                    console.log('[AuthContext Effect] Token encontrado. Definindo e buscando usuário...');
                    setToken(foundToken);
                    await fetchUser();
                } else {
                    console.log('[AuthContext Effect] Nenhum token encontrado.');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error("[AuthContext Effect] Erro:", error);
                setToken(null);
                setUser(null);
            } finally {
                if (isMounted) {
                    console.log('[AuthContext Effect] Verificação inicial concluída.');
                    setIsLoading(false);
                }
            }
        };
        checkInitialAuth();
        return () => { isMounted = false; }
    }, [fetchUser]);

    // handleLogin agora também busca o usuário
    const handleLogin = useCallback(async (newToken: string): Promise<User | null> => {
        console.log('[AuthContext] Realizando login, salvando token.');
        setToken(newToken);
        localStorage.setItem('authToken', newToken);
        // Busca usuário após salvar token - o fetchUser agora pega o token mais recente
        const loggedInUser = await fetchUser();
        return loggedInUser; // Retorna o usuário (ou null se falhar)
    }, [fetchUser]);

    // handleLogout limpa token e usuário
    const handleLogout = useCallback(() => {
        console.log('[AuthContext] Realizando logout...');
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        navigate('/login');
    }, [navigate]);

    // Função isAuthenticated
    const checkIsAuthenticated = useCallback((): boolean => {
        // Considera autenticado apenas se tiver token E não estiver na carga inicial
        // Ou simplesmente baseado no token se o ProtectedRoute/UI tratar isLoading
        return !!token;
    }, [token]);

    // contextValue com user e fetchUser (se precisar exportar)
    const contextValue = useMemo(
        () => ({
            token,
            isLoading,
            user,
            login: handleLogin,
            logout: handleLogout,
            isAuthenticated: checkIsAuthenticated,
            fetchUser
        }),
        [token, isLoading, user, handleLogin, handleLogout, checkIsAuthenticated, fetchUser]
    );

    // Loader inicial
    if (isLoading) {
        console.log('[AuthProvider] Verificando autenticação inicial...');
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook useAuth
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}