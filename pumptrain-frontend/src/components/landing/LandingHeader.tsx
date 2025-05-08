// src/components/LandingHeader.tsx (ou caminho similar)
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Importar RouterLink
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List,
    ListItem, ListItemButton, ListItemText, Container, useTheme, Divider
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MenuIcon from "@mui/icons-material/Menu";

const navItems = [
    { label: "Recursos", targetId: "features-section" },
    { label: "Como Funciona", targetId: "how-it-works-section" },
    { label: "FAQ", targetId: "faq-section" },
];

const LandingHeader: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        // Não precisa fechar drawer aqui, pois é navegação para outra página
    };

    const handleScrollTo = (targetId: string) => {
        const element = document.getElementById(targetId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if(mobileOpen) { // Fecha drawer só se estiver aberto (mobile)
            handleDrawerToggle();
        }
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", py: 2, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
                <FitnessCenterIcon sx={{ color: "primary.main", mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}>
                    PumpTrain
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }} onClick={() => handleScrollTo(item.targetId)}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <Divider sx={{ my: 2 }} />
                {/* Botões no Drawer */}
                <ListItem disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleNavigate('/login')}
                        sx={{ borderRadius: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
                    >
                        Entrar
                    </Button>
                    {/* SUGESTÃO: Adicionar botão de cadastro */}
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleNavigate('/register')} // <<< Navega para Cadastro
                        sx={{ borderRadius: 2, py: 1, fontWeight: 600, textTransform: 'none' }}
                    >
                        Cadastre-se
                    </Button>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar position="absolute" color="transparent" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Container maxWidth="lg">
                <Toolbar sx={{ px: { xs: 0 } }}>
                    {/* Logo/Título - Aplicado aqui */}
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <FitnessCenterIcon sx={{ color: "primary.main", mr: 1 }} />
                        <Typography
                            variant="h6"
                            component={RouterLink} // Opcional: Link para home
                            to="/"
                            sx={{
                                fontWeight: "bold",
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                color: "primary.main",
                                textDecoration: 'none'
                            }}
                        >
                            PumpTrain
                        </Typography>
                    </Box>

                    {/* Navegação Desktop */}
                    <Box sx={{ display: { xs: "none", md: "flex" } }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.label}
                                onClick={() => handleScrollTo(item.targetId)}
                                sx={{ color: "text.primary", mx: 1, "&:hover": { color: "primary.main" }, textTransform: "none", fontWeight: 500 }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {/* Botões Desktop */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, ml: 2 }}>
                        {/* SUGESTÃO: Adicionar botão de cadastro */}
                        <Button
                            variant="outlined" // Ou text
                            onClick={() => navigate('/register')}
                            sx={{ borderRadius: 2, py: 0.8, px: 3, fontWeight: 600, textTransform: 'none' }}
                        >
                            Cadastre-se
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/login')}
                            sx={{ borderRadius: 2, py: 0.8, px: 3, fontWeight: 600, textTransform: 'none' }}
                        >
                            Entrar
                        </Button>
                    </Box>

                    {/* Ícone Menu Mobile */}
                    <IconButton
                        color="inherit" aria-label="open drawer" edge="end"
                        onClick={handleDrawerToggle}
                        sx={{ display: { md: "none" }, ml: 1 }} // Adiciona margem esquerda
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </Container>

            {/* Drawer Mobile */}
            <Drawer
                variant="temporary" open={mobileOpen} onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                anchor="right"
                sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280, bgcolor: 'background.default' } }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
};

export default LandingHeader;