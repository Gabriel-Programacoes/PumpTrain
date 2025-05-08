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
import dayjs from 'dayjs'; // Importar dayjs

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
                title="🔥 Treino do Dia"
                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
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
                <Typography variant="subtitle1" gutterBottom sx={{fontWeight: 'medium'}}> Atividades: </Typography>
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
                                                {activity.sets != null && <Chip label={`${activity.sets} séries`} size="small" sx={{height: 20, fontSize: '0.7rem'}}/>}
                                                {activity.repetitions != null && <Chip label={`${activity.repetitions} reps`} size="small" sx={{height: 20, fontSize: '0.7rem'}}/>}
                                                {activity.weightKg != null && <Chip label={`${activity.weightKg} kg`} size="small" sx={{height: 20, fontSize: '0.7rem'}}/>}
                                                {activity.notes && <Chip icon={<NotesIcon/>} label="Nota" size="small" sx={{height: 20, fontSize: '0.7rem'}} title={activity.notes} />}
                                            </Stack>
                                        }
                                        primaryTypographyProps={{fontWeight: 'medium', fontSize: '0.9rem'}}
                                    />
                                </ListItem>
                                <Divider light component="li" />
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