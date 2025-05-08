import React from 'react';
import {
    Box, List, ListItem, ListItemButton, ListItemText, Typography,
    IconButton, Toolbar, Skeleton, Alert, ListItemIcon
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Hooks e Tipos do projeto
import { useWorkoutsQuery } from '../hooks/useWorkoutsQuery';
import { Workout } from '../types/workout';
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

// Formatador de data
const formatDate = (d: string | null | undefined) => d ? dayjs(d).format('DD/MM/YY') : '';

// Props do componente
interface WorkoutListProps {
    onItemClick?: () => void;
    open?: boolean;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ onItemClick, open}) => {
    const navigate = useNavigate();
    // <<< 1. Chamar o hook para buscar os dados reais >>>
    const { data: workouts = [], isLoading, isError, error } = useWorkoutsQuery();

    // Função para navegar para detalhes
    const handleNavigate = (workoutId: string | number) => {
        navigate(`/workouts/${workoutId}`);
        onItemClick?.();
    };

    // Função para navegar para criar
    const handleCreateClick = () => {
        navigate('/workouts/new');
        onItemClick?.();
    };

    // Conteúdo a ser renderizado (Loading, Error, Lista ou Vazio)
    let listContent;
    if (isLoading) {
        // <<< 2. Tratamento do Estado de Carregamento >>>
        listContent = (
            <Box sx={{ p: 1 }}>
                <Skeleton variant="rectangular" height={40} sx={{ mb: 0.5, borderRadius: 1 }}/>
                <Skeleton variant="rectangular" height={40} sx={{ mb: 0.5, borderRadius: 1 }}/>
                <Skeleton variant="rectangular" height={40} sx={{ mb: 0.5, borderRadius: 1 }}/>
            </Box>
        );
    } else if (isError) {
        // <<< 3. Tratamento do Estado de Erro >>>
        listContent = (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ fontSize: '0.8rem' }}>
                    Erro: {error?.message || 'Falha ao carregar treinos.'}
                </Alert>
            </Box>
        );
    } else if (workouts.length === 0) {
        // <<< 4. Tratamento do Estado Vazio >>>
        listContent = (
            <Typography variant="caption" color="text.secondary" sx={{ p: 2, textAlign: 'center', display: 'block' }}>
                Nenhum treino registrado.
            </Typography>
        );
    } else {
        // <<< 5. Renderização da Lista com Dados Reais >>>
        listContent = (
            <List sx={{ p: 1 }}>
                {/* Item Estático: Dashboard
                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => handleNavigate('/dashboard')}
                        selected={location.pathname === '/dashboard'}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center', // Centraliza conteúdo qdo fechado
                            px: 2.5, // Padding horizontal
                            borderRadius: 1,
                            '&:hover': { backgroundColor: "rgba(119, 204, 136, 0.08)" },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }} >
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} />
                    </ListItemButton>
                </ListItem>

                {/* Item Estático: Exercícios (se houver)
                <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                        onClick={() => handleNavigate('/exercises')}
                        selected={location.pathname === '/exercises'}
                        sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5, borderRadius: 1, '&:hover': { backgroundColor: "rgba(119, 204, 136, 0.08)" } }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }} >
                            <FitnessCenterIcon /> Ícone diferente para Exercícios?
                        </ListItemIcon>
                        {open && <ListItemText primary="Exercícios" sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} />}
                    </ListItemButton>
                </ListItem> */}

                {/* Divisor (Opcional) */}
                {/* <Divider sx={{ my: 1 }} /> */}

                {/* Lista dinâmica de Treinos */}
                {workouts.slice(0, 10).map((workout: Workout) => ( // Limita a 10 por exemplo
                    <ListItem key={workout.id} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => handleNavigate(`/workouts/${workout.id}`)} // Navega para detalhes
                            selected={location.pathname === `/workouts/${workout.id}`} // Destaca se for a página atual
                            title={open ? '' : (workout.name || `Treino ${formatDate(workout.sessionDate)}`)} // Tooltip qdo fechado
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5, // Padding horizontal
                                borderRadius: 1,
                                '&:hover': { backgroundColor: "rgba(119, 204, 136, 0.08)" },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: 'inherit' }} >
                                <FitnessCenterIcon /> {/* Ou um ícone específico? */}
                            </ListItemIcon>
                            {/* Texto só aparece se 'open' for true */}
                            <ListItemText
                                primary={workout.name || `Treino ${formatDate(workout.sessionDate)}`}
                                sx={{ opacity: open ? 1 : 0, color: 'text.primary' }}
                                slotProps={{
                                    primary: {
                                        sx: {
                                            fontWeight: "medium",
                                            fontSize: "0.875rem",
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }
                                }}
                            />
                            {/* A data formatada à direita foi removida para simplificar */}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        );
    }
    return (
        <Box>
            <Toolbar sx={{ borderBottom: "1px solid rgba(119, 204, 136, 0.1)", minHeight: "56px !important", px: 2, display: "flex", justifyContent: "space-between" }} >
                <Typography variant="subtitle1" fontWeight="medium">
                    Meus Treinos
                </Typography>
                <IconButton size="small" onClick={handleCreateClick} sx={{ color: "primary.main", border: "1px solid rgba(119, 204, 136, 0.2)", p: 0.5 }} aria-label="Criar novo treino" >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Toolbar>
            {/* Renderiza o conteúdo da lista (Loading/Error/Lista/Vazio) */}
            {listContent}
        </Box>
    );
};

export default WorkoutList;