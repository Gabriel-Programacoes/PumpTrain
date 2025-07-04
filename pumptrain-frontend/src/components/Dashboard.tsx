import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, CardHeader, LinearProgress,
    Avatar, Stack, Button, Container, Skeleton, Alert, CardActionArea
} from "@mui/material";
import {
    LocalFireDepartment as FireIcon, ChevronRight as ChevronRightIcon
} from "@mui/icons-material";
import Grid from '@mui/material/Grid';


// Hooks e Tipos
import { useUserStatsQuery } from '../hooks/useUserStatsQuery';
import { useAchievementsQuery } from '../hooks/useAchievementsQuery';
import { useTodaysWorkoutQuery } from '../hooks/useTodaysWorkoutQuery';
import { TodaysWorkoutCard } from './TodaysWorkoutCard';

import { formatTimeMinutes } from '../utils/formatters'; // Ajuste o caminho
import { mapIconNameToComponent } from '../utils/uiHelpers';

// --- Componente Dashboard Principal ---
const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // --- Hooks de Dados ---
    const { data: statsData, isLoading: isLoadingStats, isError: isStatsError } = useUserStatsQuery();
    const { data: achievementsData, isLoading: isLoadingAchievements, isError: isAchievementsError } = useAchievementsQuery();
    const { data: todaysWorkout, isLoading: isLoadingToday, isError: isErrorToday } = useTodaysWorkoutQuery();

    // Handler de navegação
    const navigateToWorkoutsList = () => navigate('/workouts');
    const navigateToCreateWorkout = () => navigate('/workouts/new');

    // Estado de erro combinado para o Stats Grid
    const hasStatOrAchievementError = isStatsError || isAchievementsError;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold"> Meu Painel </Typography>
                    <Typography variant="body2" color="text.secondary"> Acompanhe sua jornada fitness </Typography>
                </Box>
                <Button variant="contained" onClick={navigateToCreateWorkout}> Registrar Novo Treino </Button>
            </Box>

            {/* Card: Streak Section & Contadores */}
            <Card variant="outlined" sx={{ mb: 4, overflow: "hidden" }}>
                <CardContent sx={{ p: 0 }}>
                    <Grid container>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}><FireIcon sx={{ color: "primary.main" }} /><Typography variant="h6">Sequência Atual</Typography></Box>
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>
                                    <Typography variant="h3" fontWeight="bold">{isLoadingStats ? <Skeleton width={60} /> : statsData?.currentStreak ?? 0}</Typography>
                                    <Typography variant="body2" color="text.secondary"> dias consecutivos </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">Seu recorde: {isLoadingStats ? <Skeleton width={40} /> : statsData?.recordStreak ?? 0} dias</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ backgroundColor: 'rgba(119, 204, 136, 0.05)' }}>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid size={6}><Typography variant="body2" color="text.secondary"> Este mês </Typography><Typography variant="h5" fontWeight="bold">{isLoadingStats ? <Skeleton width={40} /> : statsData?.workoutsThisMonth ?? 0}</Typography><Typography variant="caption" color="text.secondary"> treinos </Typography></Grid>
                                    <Grid size={6}><Typography variant="body2" color="text.secondary"> Total </Typography><Typography variant="h5" fontWeight="bold">{isLoadingStats ? <Skeleton width={60} /> : statsData?.workoutsTotal ?? 0}</Typography><Typography variant="caption" color="text.secondary"> treinos </Typography></Grid>
                                </Grid>
                                <Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="caption">Meta mensal</Typography>
                                        <Typography variant="caption">{isLoadingStats ? '-/-' : `${statsData?.workoutsThisMonth ?? 0}/${statsData?.monthlyGoalTarget ?? '-'}`}</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={isLoadingStats || !statsData?.monthlyGoalTarget ? 0 : Math.min(100, ((statsData.workoutsThisMonth / statsData.monthlyGoalTarget) * 100))} />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>



            {hasStatOrAchievementError && ( <Alert severity="warning" sx={{ mb: 3 }}>Falha ao carregar algumas estatísticas.</Alert> )}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card Calorias */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        {/* Card Calorias */}
                        <CardHeader title="Calorias Queimadas" slotProps={{title: {
                                variant: "subtitle1",
                                fontWeight: 'medium'
                            } }} />
                        <CardContent>
                            {isLoadingStats ? <Skeleton height={40} width="70%" /> :
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary">{statsData?.caloriesThisWeek?.toLocaleString('pt-BR') ?? 0}</Typography>
                                </Box>
                            }
                            <Typography variant="caption" color="text.secondary"> Esta semana </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                        {/* Card Tempo de Treino*/}
                        <CardHeader title="Tempo de Treino" slotProps={{title: {
                                variant: "subtitle1",
                                fontWeight: 'medium'
                            } }} />
                        <CardContent>
                            {isLoadingStats ? <Skeleton height={40} width="50%" /> :
                                <Typography variant="h4" fontWeight="bold" color="primary">{formatTimeMinutes(statsData?.timeThisMonthMinutes)}</Typography>
                            }
                            <Typography variant="caption" color="text.secondary"> Este mês </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                    <CardActionArea
                        component={RouterLink}
                        to="/achievements/all"
                        sx={{ height: '100%', display: 'block', textDecoration: 'none', borderRadius: 1 }}
                    >
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardHeader title="Conquistas" slotProps={{title: {
                                    variant: "subtitle1",
                                    fontWeight: 'medium'
                                } }} />
                            <CardContent>
                                {isLoadingAchievements ? <Skeleton height={40} width="60%" /> :
                                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                        <Typography variant="h4" fontWeight="bold" color="primary"> {achievementsData?.unlockedCount ?? 0} </Typography>
                                        <Typography variant="body1" color="text.secondary"> de {achievementsData?.totalAvailable ?? 0} </Typography>
                                    </Box>
                                }
                                <Stack direction="row" spacing={1} sx={{ mt: 1, minHeight: 32 }}>
                                    {isLoadingAchievements ? <> <Skeleton variant="circular" width={32} height={32} /> <Skeleton variant="circular" width={32} height={32} /> </> :
                                        achievementsData?.recent?.slice(0, 3).map((ach) => (
                                            <Avatar key={ach.id} title={ach.name} sx={{ width: 64, height: 64, bgcolor: "primary.light" }}>
                                                {mapIconNameToComponent(ach.iconName)}
                                            </Avatar>
                                        ))
                                    }
                                </Stack>
                            </CardContent>
                        </Card>
                    </CardActionArea>
                </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold"> Treino do Dia </Typography>
                    <Button onClick={navigateToWorkoutsList} endIcon={<ChevronRightIcon />} sx={{ color: "primary.main", textTransform: "none" }}> Ver Lista Completa </Button>
                </Box>
                {isLoadingToday && ( <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} /> )}
                {!isLoadingToday && isErrorToday && ( <Alert severity="error">Não foi possível carregar o treino de hoje.</Alert> )}
                {!isLoadingToday && !isErrorToday && todaysWorkout && ( <TodaysWorkoutCard workout={todaysWorkout} /> )}
                {!isLoadingToday && !isErrorToday && !todaysWorkout && (
                    <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Typography color="text.secondary"> Nenhum treino planejado para hoje. Bom descanso! </Typography>
                            <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={navigateToCreateWorkout}> Registrar um Treino </Button>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Container>
    );
};

export default Dashboard;