import React from 'react';

import { useNavigate } from 'react-router-dom';

import {

    Box, Typography, Card, CardContent, CardHeader, LinearProgress,

    Avatar, Stack, Button, Container, Skeleton, Alert, CardActionArea

} from "@mui/material";

import {

    LocalFireDepartment as FireIcon, EmojiEvents as TrophyIcon,

    FitnessCenter as DumbbellIcon, CalendarToday as CalendarIcon,

    ChevronRight as ChevronRightIcon, Star as StarIcon // Adicionado StarIcon

} from "@mui/icons-material";

import Grid from '@mui/material/Grid';

import dayjs from 'dayjs';

import isError from 'axios';



// Hooks e Tipos

import { useWorkoutsQuery } from '../hooks/useWorkoutsQuery';

import { useUserStatsQuery } from '../hooks/useUserStatsQuery';

import { useAchievementsQuery } from '../hooks/useAchievementsQuery'; // <<< Hook de Conquistas

import { Workout } from '../types/workout';

// UserStats é inferido, AchievementData é inferido



// Formatador de data

const formatDate = (d: string | null | undefined, format = 'DD/MM/YYYY') => d ? dayjs(d).format(format) : 'N/A';



// Função para formatar o tempo de minutos para "Xh Ym"

const formatTimeMinutes = (totalMinutes: number | undefined | null): string => {

    if (totalMinutes == null || totalMinutes === 0) return "0m";

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    let result = "";

    if (hours > 0) result += `${hours}h `;

    if (minutes > 0 || hours === 0) result += `${minutes}m`;

    return result.trim();

};



// Função para mapear nome do ícone para componente MUI Icon

const mapIconNameToComponent = (iconName?: string): React.ReactNode => {

    switch (iconName) {

        case 'LocalFireDepartment': return <FireIcon fontSize='small' sx={{color: 'background.default'}} />;

        case 'FitnessCenter': return <DumbbellIcon fontSize='small' sx={{color: 'background.default'}} />;

        case 'Star': return <StarIcon fontSize='small' sx={{color: 'background.default'}} />;

        case 'Trophy': return <TrophyIcon fontSize='small' sx={{color: 'background.default'}} />;

        case 'CalendarMonth': return <CalendarIcon fontSize='small' sx={{color: 'background.default'}} />;

// Adicione mais casos para outros ícones que sua API possa retornar

        default: return <StarIcon fontSize='small' sx={{color: 'background.default'}} />;

    }

};



// --- Componente WorkoutCard (mantido como antes) ---

interface RealWorkoutCardProps { workout: Workout; }

const RealWorkoutCard = ({ workout }: RealWorkoutCardProps) => {

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



// --- Componente Dashboard Principal ---

const Dashboard: React.FC = () => {

    const navigate = useNavigate();

    const { data: workouts = [], isLoading: isLoadingWorkouts, isError: isWorkoutsError } = useWorkoutsQuery();

    const { data: statsData, isLoading: isLoadingStats, isError: isStatsError } = useUserStatsQuery();

    const { data: achievementsData, isLoading: isLoadingAchievements, isError: isAchievementsError } = useAchievementsQuery();



    const recentWorkouts = workouts.slice(0, 3);



    const navigateToWorkoutsList = () => navigate('/workouts');

    const navigateToCreateWorkout = () => navigate('/workouts/new');





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



            {/* Streak Section */}

            <Card variant="outlined" sx={{ mb: 4, overflow: "hidden" }}>

                <CardContent sx={{ p: 0 }}>

                    <Grid container>

                        <Grid size={{ xs: 12, md: 6 }}>

                            <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>

                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}><FireIcon sx={{ color: "primary.main" }} /><Typography variant="h6">Sequência Atual</Typography></Box>

                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>

                                    <Typography variant="h3" fontWeight="bold">

                                        {isLoadingStats ? <Skeleton width={60} /> : statsData?.currentStreak ?? 0}

                                    </Typography>

                                    <Typography variant="body2" color="text.secondary"> dias consecutivos </Typography>

                                </Box>

                                <Typography variant="body2" color="text.secondary">

                                    Seu recorde: {isLoadingStats ? <Skeleton width={40} /> : statsData?.recordStreak ?? 0} dias

                                </Typography>

                            </Box>

                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }} sx={{ backgroundColor: 'rgba(119, 204, 136, 0.05)' }}>

                            <Box sx={{ p: 3 }}>

                                <Grid container spacing={2} sx={{ mb: 2 }}>

                                    <Grid size={6}>

                                        <Typography variant="body2" color="text.secondary"> Este mês </Typography>

                                        <Typography variant="h5" fontWeight="bold">{isLoadingStats ? <Skeleton width={40} /> : statsData?.workoutsThisMonth ?? 0}</Typography>

                                        <Typography variant="caption" color="text.secondary"> treinos </Typography>

                                    </Grid>

                                    <Grid size={6}>

                                        <Typography variant="body2" color="text.secondary"> Total </Typography>

                                        <Typography variant="h5" fontWeight="bold">{isLoadingStats ? <Skeleton width={60} /> : statsData?.workoutsTotal ?? 0}</Typography>

                                        <Typography variant="caption" color="text.secondary"> treinos </Typography>

                                    </Grid>

                                </Grid>

                                <Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>

                                        <Typography variant="caption">Meta mensal</Typography>

                                        <Typography variant="caption">

                                            {isLoadingStats ? '-/-' : `${statsData?.workoutsThisMonth ?? 0}/${statsData?.monthlyGoalTarget ?? 25}`}

                                        </Typography>

                                    </Box>

                                    <LinearProgress variant="determinate"

                                                    value={isLoadingStats || !(statsData?.monthlyGoalTarget) ? 0 : Math.min(100, (((statsData?.workoutsThisMonth ?? 0) / (statsData.monthlyGoalTarget || 1)) * 100))} />

                                </Box>

                            </Box>

                        </Grid>

                    </Grid>

                </CardContent>

            </Card>



            {/* Stats Grid */}

            {(isStatsError || isAchievementsError) && (

                <Alert severity="error" sx={{ mb: 3 }}>Falha ao carregar algumas estatísticas.</Alert>

            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>

                {/* Card Calorias */}

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                    <Card variant="outlined" sx={{ height: '100%' }}>

                        <CardHeader title="Calorias Queimadas" slotProps={{ title: {variant: "subtitle1", fontWeight: 'medium'} }} />

                        <CardContent>

                            {isLoadingStats ? <Skeleton height={40} width="70%" /> :

                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>

                                    <Typography variant="h4" fontWeight="bold" color="primary">

                                        {statsData?.caloriesThisWeek?.toLocaleString('pt-BR') ?? 0}

                                    </Typography>

                                </Box>

                            }

                            <Typography variant="caption" color="text.secondary"> Esta semana </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                {/* Card Tempo Total */}

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>

                    <Card variant="outlined" sx={{ height: '100%' }}>

                        <CardHeader title="Tempo de Treino" slotProps={{ title: {variant: "subtitle1", fontWeight: 'medium'} }} />

                        <CardContent>

                            {isLoadingStats ? <Skeleton height={40} width="50%" /> :

                                <Typography variant="h4" fontWeight="bold" color="primary">

                                    {formatTimeMinutes(statsData?.timeThisMonthMinutes)}

                                </Typography>

                            }

                            <Typography variant="caption" color="text.secondary"> Este mês </Typography>

                        </CardContent>

                    </Card>

                </Grid>

                {/* Card Conquistas */}

                <Grid size={{ xs: 12, sm: 12, md: 4 }}> {/* Ocupa mais espaço em sm se for o último da linha */}

                    <Card variant="outlined" sx={{ height: '100%' }}>

                        <CardHeader title="Conquistas" slotProps={{ title: {variant: "subtitle1", fontWeight: 'medium'} }} />
                        <CardContent>
                            {isLoadingAchievements ? <Skeleton height={40} width="60%" /> :
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                                    <Typography variant="h4" fontWeight="bold" color="primary"> {achievementsData?.unlockedCount ?? 0} </Typography>
                                    <Typography variant="body1" color="text.secondary"> de {achievementsData?.totalCount ?? 0} </Typography>
                                </Box>
                            }
                            <Stack direction="row" spacing={1} sx={{ mt: 1, minHeight: 32 }}> {/* Garante altura mínima */}
                                {isLoadingAchievements ? (
                                    <> <Skeleton variant="circular" width={32} height={32} /> <Skeleton variant="circular" width={32} height={32} /> </>
                                ) : (
                                    achievementsData?.recent?.slice(0, 3).map((ach) => (
                                        <Avatar key={ach.id} title={ach.name} sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                                            {mapIconNameToComponent(ach.iconName)}
                                        </Avatar>
                                    ))
                                )}
                                {(achievementsData?.unlockedCount ?? 0) > (achievementsData?.recent?.length ?? 0) && (achievementsData?.recent?.length ?? 0) < 3 && achievementsData?.recent && achievementsData.recent.length > 0 && (
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: "action.hover" }}><Typography variant="caption" fontWeight="medium">+{ (achievementsData?.unlockedCount ?? 0) - achievementsData.recent.length}</Typography></Avatar>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* Recent Workouts */}
            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold"> Treino do dia </Typography>
                    {/* Botão funcional */}
                    <Button onClick={navigateToWorkoutsList} endIcon={<ChevronRightIcon />} sx={{ color: "primary.main", textTransform: "none" }}>
                        Ver todos
                    </Button>
                </Box>
                {isLoadingWorkouts && (

                    <Stack spacing={2}>

                        <Skeleton variant="rectangular" height={70} />

                        <Skeleton variant="rectangular" height={70} />

                        <Skeleton variant="rectangular" height={70} />

                    </Stack>

                )}

                {isWorkoutsError && (

                    <Alert severity="warning">Não foi possível carregar os treinos recentes.</Alert>

                )}

                {!isLoadingWorkouts && !isWorkoutsError && recentWorkouts.length === 0 && (

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>

                        Nenhum treino recente para mostrar.

                    </Typography>

                )}

                {!isLoadingWorkouts && !isError && recentWorkouts.length > 0 && (

                    recentWorkouts.map((workout) => (

                        <RealWorkoutCard key={workout.id} workout={workout} /> // Usa o card adaptado

                    ))

                )}

            </Box>

        </Container>

    );

};



export default Dashboard;