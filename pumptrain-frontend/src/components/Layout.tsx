// src/components/Layout.tsx (Simplificado SEM Drawer)
import React from 'react'; // Removido useState
import { Outlet, Link as RouterLink } from 'react-router-dom';
// Removidos imports de styled, useTheme, Theme, CSSObject, MuiDrawer, Divider, Icons de toggle (Menu, Chevron)
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar'; // Usar AppBar padrão do MUI
import Toolbar from '@mui/material/Toolbar';
// Removido IconButton se não for mais usado (ex: para toggle de tema no UserMenu)
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CssBaseline from '@mui/material/CssBaseline';

// Removido useLocation se não for mais usado

import { useAuth } from '../context/AuthContext'; // Verifique o caminho
import MainNavigation from './MainNavigation';   // Verifique o caminho
import UserMenu from './UserMenu';             // Verifique o caminho

// Usar React.FC diretamente se não houver props
const Layout: React.FC = () => {
    // Removidos states e handlers do Drawer: mobileOpen, desktopDrawerOpen, handle...
    const { isAuthenticated } = useAuth(); // Pega apenas isAuthenticated

    // Destino do logo condicional
    const logoTargetPath = isAuthenticated() ? '/dashboard' : '/';

    // Renderização principal
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}> {/* Usa column direction */}
            <CssBaseline />
            {/* AppBar padrão, sem props 'open' ou sx de width/ml condicionais */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}> {/* zIndex pode ser simplificado se não houver drawer */}
                <Toolbar>
                    {/* Logo/Título */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" component="div" noWrap>
                            <RouterLink to={logoTargetPath} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <FitnessCenterIcon sx={{ color: "primary.main", mr: 1 }} />
                                PumpTrain
                            </RouterLink>
                        </Typography>
                        {/* Navegação Principal continua aqui (se autenticado) */}
                        {isAuthenticated() && <MainNavigation />}
                    </Box>

                    {/* UserMenu no final (não passa mais toggleColorMode se foi removido) */}
                    <UserMenu />
                </Toolbar>
            </AppBar>
            <Box
                component="main"
                sx={{
                    flexGrow: 1, // Para ocupar o espaço restante
                    p: 3, // Padding
                    mt: { xs: '56px', sm: '64px' }, // Margem Topo para compensar AppBar fixa
                    // Nenhuma outra margem ou largura necessária aqui
                }}
            >
                <Outlet /> {/* Renderiza o conteúdo da página atual */}
            </Box>
        </Box>
    );
};

export default Layout;