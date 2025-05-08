import React, { useState } from "react";
import {
    Avatar, Box, IconButton, Menu, MenuItem, ListItemIcon,
    ListItemText, Divider, Typography, Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuth } from "../context/AuthContext";

// Função auxiliar para gerar iniciais
const getInitials = (name: string = ""): string => {
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const UserMenu: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    // <<< Desestrutura user (minúsculo), logout e isAuthenticated >>>
    const { user, logout, isAuthenticated } = useAuth();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        logout(); // Chama logout do contexto
        handleClose();
    };

    const handleProfile = () => { navigate('/profile'); handleClose(); };
    const handleSettings = () => { navigate('/settings'); handleClose(); };

    // <<< Chama isAuthenticated() como função e verifica se user existe >>>
    if (!isAuthenticated() || !user) {
        // Mostra botões de Login/Register
        return (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                <Button color="inherit" component={RouterLink} to="/login">Entrar</Button>
                <Button variant="contained" component={RouterLink} to="/register">Registrar</Button>
            </Box>
        );
    }

    // Se chegou aqui, está autenticado e temos 'user'
    const userInitials = getInitials(user.name); // Usa user.name

    return (
        <Box>
            <IconButton onClick={handleClick} size="small" sx={{ /* ... */ }} aria-label="Menu do usuário" >
                {/* Usa user.avatarUrl ou userInitials */}
                <Avatar
                    sx={{ width: 32, height: 32, /* ... */ }}
                    src={user.avatarUrl || undefined} // <<< Usa user.avatarUrl se existir
                >
                    {!user.avatarUrl ? userInitials : null}
                </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} /* ... */>
                {/* Mostra user.name e user.email */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Configurações</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Sair</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserMenu;