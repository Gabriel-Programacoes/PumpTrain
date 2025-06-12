import React, { useState } from "react";
import {
    Avatar, Box, IconButton, Menu, MenuItem, ListItemIcon,
    ListItemText, Divider, Typography, Button
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuth } from "../context/AuthContext";
import { getInitials } from '../utils/uiHelpers';
import { getAvatarPath } from '../utils/avatarUtils';


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

    const userInitials = getInitials(user.name);
    const avatarPath = getAvatarPath(user.avatarKey);


    return (
        <Box>
            <IconButton onClick={handleClick} size="small" aria-label="Menu do usuário">
                <Avatar
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: !avatarPath ? 'primary.dark' : undefined // Cor de fundo para iniciais
                    }}
                    src={avatarPath} // Usa o caminho do avatar se existir
                >
                    {/* Exibe iniciais somente se não houver avatarPath */}
                    {!avatarPath ? userInitials : null}
                </Avatar>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': { // Para a setinha do menu
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Perfil</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Sair</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserMenu;