import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';
import { User } from '../types/user';
import { useAuth } from '../context/AuthContext';

const fetchUserProfile = async (): Promise<User> => {
    console.log("[useUserProfileQuery] Buscando perfil de /user/profile...");
    const { data } = await apiClient.get<User>('/api/user/profile');
    return data;
};

export const useUserProfileQuery = () => {
    const { isAuthenticated } = useAuth();

    return useQuery<User, Error>({
        queryKey: ['userProfile'], // Chave de cache
        queryFn: fetchUserProfile,
        enabled: isAuthenticated(), // Só busca se autenticado
        staleTime: 1000 * 60 * 5,  // Dados frescos por 5 min
    });
};