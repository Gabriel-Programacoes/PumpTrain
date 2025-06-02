// src/components/TodaysWorkoutCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardHeader, Skeleton, List,
    ListItem, ListItemIcon, ListItemText, Chip, Divider, Button, Stack
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotesIcon from '@mui/icons-material/Notes';
import { useExercisesQuery } from '../hooks/useExercisesQuery';
import { WorkoutDetails } from '../types/workout';
import dayjs from 'dayjs';
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TimerIcon from "@mui/icons-material/Timer";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import RepeatIcon from "@mui/icons-material/Repeat"; // Importar dayjs

// Formatador de data (pode vir de utils)
const formatDate = (d: string | null | undefined, format = 'DD/MM/YYYY HH:mm') => d ? dayjs(d).format(format) : 'N/A';

interface TodaysWorkoutCardProps {
    workout: WorkoutDetails;
}

export const TodaysWorkoutCard: React.FC<TodaysWorkoutCardProps> = ({ workout }) => {
    const navigate = useNavigate();
    const { data: exercises = [], isLoading: isLoadingExercises } = useExercisesQuery();

    const exerciseMap = React.useMemo(() => {
        const map = new Map<string | number, string>();
        exercises.forEach(ex => map.set(ex.id, ex.name));
        return map;
    }, [exercises]);

    const viewDetails = () => navigate(`/workouts/${workout.id}`);

    return (
        <Card variant="outlined">
            <CardHeader
                title="🔥 BORA BOTAR PRA MOER!!"
                slotProps={{ title: {variant: 'h6', fontWeight: 'bold'} }}
                action={
                    workout.completedAt ? (
                        <Chip icon={<CheckCircleOutlineIcon fontSize="small" />} label="Concluído" color="success" size="small" variant="outlined" />
                    ) : ( <Chip label="Pendente" color="warning" size="small" variant="outlined" /> )
                }
            />
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {workout.name || `Treino de ${formatDate(workout.sessionDate, 'DD/MM/YYYY')}`}
                </Typography>
                {workout.notes && ( <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}> {workout.notes} </Typography> )}
                <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium'}}> Exercícios: </Typography>
                {isLoadingExercises ? ( <Skeleton variant="rectangular" height={60} /> ) : (
                    <List dense disablePadding sx={{mb: 1}}>
                        {workout.activities.map((activity) => (
                            <React.Fragment key={activity.id}>
                                <ListItem disableGutters sx={{py: 0.5}}>
                                    <ListItemIcon sx={{minWidth: 32}}><FitnessCenterIcon color="primary" fontSize="small" /></ListItemIcon>
                                    <ListItemText
                                        primary={exerciseMap.get(activity.exerciseId) || `Exercício ID: ${activity.exerciseId}`}
                                        secondary={
                                            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{mt: 0.5}}>
                                                {activity.sets != null && <Chip icon={<FitnessCenterIcon />} label={`Séries: ${activity.sets}`} size="small" variant="outlined" />}
                                                {activity.repetitions != null && <Chip icon={<RepeatIcon />} label={`Repetições: ${activity.repetitions}`} size="small" variant="outlined" />}
                                                {activity.weightKg != null && <Chip icon={<FitnessCenterIcon/>} label={`Peso: ${activity.weightKg} kg`} size="small" variant="outlined"/>}
                                                {activity.notes && <Chip icon={<NotesIcon/>} label={`${activity.notes}`} size="small" variant="outlined" />}

                                                {activity.durationMinutes != null && <Chip icon={<TimerIcon />} label={`Tempo: ${activity.durationMinutes} min`} size="small" variant="outlined" />}
                                                {activity.distanceKm != null && <Chip icon={<DirectionsRunIcon />} label={`Distância: ${activity.distanceKm} km`} size="small" variant="outlined" />}
                                                {activity.intensity != null && <Chip icon={<WhatshotIcon />} label={`Intensidade: ${activity.intensity}`} size="small" variant="outlined" />}
                                                {activity.incline != null && <Chip icon={<TrendingUpIcon />} label={`Inclinação: ${activity.incline}%`} size="small" variant="outlined" />}
                                            </Stack>
                                        }
                                        slotProps={{primary: {fontWeight: 'medium', fontSize: '0.9rem'}}}
                                    />
                                </ListItem>
                                <Divider sx={{opacity : "0.6"}} component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
                <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
                    <Button size="small" onClick={viewDetails}>Ver Detalhes / Concluir</Button>
                </Box>
            </CardContent>
        </Card>
    );
};