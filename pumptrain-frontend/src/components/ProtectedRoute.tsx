import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated()) {
        // Se não está autenticado, redireciona para /login
        // Passa a localização atual (location.pathname) no estado 'from'
        // para que a página de login possa redirecionar de volta após o sucesso.
        console.log('[ProtectedRoute] Usuário não autenticado, redirecionando para /login');
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Se está autenticado, renderiza o conteúdo da rota aninhada (definida onde <ProtectedRoute> é usado)
    // O <Outlet /> é um placeholder do react-router-dom para renderizar rotas filhas
    console.log('[ProtectedRoute] Usuário autenticado, renderizando Outlet.');
    return <Outlet />;
} // Fechamento correto da função

export default ProtectedRoute;