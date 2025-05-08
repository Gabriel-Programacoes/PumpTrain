import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent,
    Avatar, CardActionArea
} from "@mui/material";
import {
    FitnessCenter as DumbbellIcon,
    CalendarToday as CalendarIcon,
    ChevronRight as ChevronRightIcon
} from "@mui/icons-material";
import dayjs from 'dayjs';
import { Workout } from '../types/workout';

// Formatador de data
const formatDate = (d: string | null | undefined, format = 'DD/MM/YYYY') => d ? dayjs(d).format(format) : 'N/A';

interface RealWorkoutCardProps { workout: Workout; }

const RealWorkoutCard: React.FC<RealWorkoutCardProps> = ({ workout }) => {
    const navigate = useNavigate();
    const handleCardClick = () => navigate(`/workouts/${workout.id}`);

    return (
        <CardActionArea onClick={handleCardClick} sx={{ display: 'block', textDecoration: 'none', mb: 2 }}>
            <Card variant="outlined">
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "rgba(119, 204, 136, 0.1)", color: "primary.main" }}><DumbbellIcon /></Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="medium" noWrap>{workout.name || `Treino`}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">{formatDate(workout.sessionDate, 'DD MMM')}</Typography>
                            </Box>
                        </Box>
                    </Box>
                    <ChevronRightIcon sx={{ color: 'text.secondary', display: { xs: 'block', md: 'none'} }} />
                </CardContent>
            </Card>
        </CardActionArea>
    );
};

export default RealWorkoutCard; // <<< Exportar