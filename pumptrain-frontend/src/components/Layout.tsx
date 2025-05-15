import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CssBaseline from '@mui/material/CssBaseline';


import { useAuth } from '../context/AuthContext';
import MainNavigation from './MainNavigation';
import UserMenu from './UserMenu';

const Layout: React.FC = () => {
    const { isAuthenticated } = useAuth();

    // Destino do logo condicional
    const logoTargetPath = isAuthenticated() ? '/dashboard' : '/';

    // Renderização principal
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    {/* Logo/Título */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" component="div" noWrap>
                            <RouterLink to={logoTargetPath} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                <FitnessCenterIcon sx={{ color: "primary.main", mr: 1 }} />
                                PumpTrain
                            </RouterLink>
                        </Typography>
                        {/* Navegação Principal continua aqui */}
                        {isAuthenticated() && <MainNavigation />}
                    </Box>

                    {/* UserMenu no final */}
                    <UserMenu />
                </Toolbar>
            </AppBar>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: { xs: '56px', sm: '64px' },
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;