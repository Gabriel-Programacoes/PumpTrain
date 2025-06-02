import React, {useMemo} from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import type { SubmitHandler } from "react-hook-form";

// Imports MUI e Icons
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Fade,
    Breadcrumbs,
    useMediaQuery,
    useTheme,
    Tooltip,
    Zoom,
} from "@mui/material";


import {
    FitnessCenter as DumbbellIcon,
    ArrowBack as BackIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";

// Lógica e Hooks
import axios from "axios";
import { useWorkoutDetailQuery } from "../../hooks/useWorkoutDetailQuery";
import { useUpdateWorkoutMutation, type UpdateWorkoutPayload } from "../../hooks/useUpdateWorkoutMutation";
import { WorkoutForm, type WorkoutFormData } from "../../components/WorkoutForm";
import type { Activity } from "../../types/activity";

import { formatDate } from "../../utils/formatters";

// UI Helpers
import {DateChip, HeaderActions, HeaderTitle, PageHeader, StyledPaper,} from "../../utils/uiHelpers.tsx";


const EditWorkoutPage: React.FC = () => {
    const { workoutId } = useParams<{ workoutId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        data: currentWorkout,
        isLoading: isLoadingDetails,
        isError,
        error: fetchError,
    } = useWorkoutDetailQuery(workoutId);

    const updateMutation = useUpdateWorkoutMutation(workoutId);

    // Adaptação de dados para o WorkoutForm
    const initialFormData: WorkoutFormData | undefined = useMemo(() => {
        if (!currentWorkout) {
            return undefined;
        }

        console.log('[EditWorkoutPage] currentWorkout.activities (da API):', JSON.parse(JSON.stringify(currentWorkout.activities)));

        const activities = (currentWorkout.activities || []).map((actApi: Activity) => ({
            id: actApi.id,
            exerciseId: actApi.exerciseId,
            //exerciseType: null,
            sets: actApi.sets ?? null,
            reps: actApi.repetitions ?? null,
            weight: actApi.weightKg ?? null,
            notes: actApi.notes ?? "",
            durationMinutes: actApi.durationMinutes ?? null,
            distanceKm: actApi.distanceKm ?? null,
            intensity: actApi.intensity ?? null,
            incline: actApi.incline ?? null,
        }));

        console.log('[EditWorkoutPage] activities (após mapeamento inicial):', JSON.parse(JSON.stringify(activities)));

        const finalActivities = activities.length > 0
            ? activities
            : [{
                id: undefined,
                exerciseId: null,
                // exerciseType: null,
                sets: null,
                reps: null,
                weight: null,
                notes: "",
                durationMinutes: null,
                distanceKm: null,
                intensity: null,
                incline: null,
            }];

        const formDataToReturn = {
            sessionDate: currentWorkout.sessionDate.split("T")[0],
            name: currentWorkout.name ?? "",
            notes: currentWorkout.notes ?? "",
            activities: finalActivities,
        };

        console.log('[EditWorkoutPage] initialFormData.activities (para WorkoutForm):', JSON.parse(JSON.stringify(formDataToReturn.activities)));

        return formDataToReturn;
    }, [currentWorkout]);

    const handleUpdateSubmit: SubmitHandler<WorkoutFormData> = (data) => {
        const activitiesToSave: UpdateWorkoutPayload["activities"] = data.activities
            .filter((activity) => activity.exerciseId !== null && activity.exerciseId !== "")
            .map((activity) => {
                return {
                    id: activity.id ?? undefined,
                    exerciseId: activity.exerciseId!,
                    sets: activity.sets ?? null,
                    repetitions: activity.reps ?? null,
                    weightKg: activity.weight ?? null,
                    notes: activity.notes ?? null,
                    durationMinutes: activity.durationMinutes ?? null,
                    distanceKm: activity.distanceKm ?? null,
                    intensity: activity.intensity ?? null,
                    incline: activity.incline ?? null,
                };
            });

        if (activitiesToSave.length === 0 && data.activities.length > 0) {
            console.warn("WorkoutForm submeteu dados onde todas as atividades se tornaram inválidas após o filtro interno. Verifique as validações do Zod no WorkoutForm.");
            return;
        }

        const payload: UpdateWorkoutPayload = {
            sessionDate: data.sessionDate,
            name: data.name || null,
            notes: data.notes || null,
            activities: activitiesToSave,
        };

        console.log('[EditWorkoutPage] Payload ANTES de enviar para API:', JSON.parse(JSON.stringify(payload)));



        updateMutation.mutate(payload, {
            onSuccess: (updatedWorkout) => {
                navigate(`/workouts/${updatedWorkout?.id || workoutId}`);
            },
        });
    };

    // Renderização de Loading (mantida)
    if (isLoadingDetails) {
        return (
            <Fade in={true} timeout={800}>
                <Box sx={{ /* ... estilos de loading ... */ }}>
                    <CircularProgress sx={{ /* ... */ }}/>
                    <Typography sx={{ mt: 3, fontWeight: 500, opacity: 0.9 }}>Carregando dados do treino...</Typography>
                </Box>
            </Fade>
        );
    }

    // Renderização de Erro (mantida)
    if (isError) {
        // ... (seu código de tratamento de erro)
        let status: number | undefined;
        let message = "Erro desconhecido ao carregar dados.";
        if (fetchError instanceof Error) {
            message = fetchError.message;
            if (axios.isAxiosError(fetchError) && fetchError.response) {
                status = fetchError.response.status;
            }
        }
        const errorMessage =
            status === 404
                ? `Treino com ID ${workoutId} não encontrado para edição.`
                : `Erro ao carregar treino para edição: ${message}`;
        return (
            <Fade in={true} timeout={500}>
                <Box sx={{ /* ... estilos de erro ... */ }}>
                    <Alert severity="error" /* ... sx ... */ >{errorMessage}</Alert>
                    <Button component={RouterLink} to="/dashboard" /* ... sx ... */ >
                        Voltar para Dashboard
                    </Button>
                </Box>
            </Fade>
        );
    }

    // Renderização se !currentWorkout
    if (!currentWorkout) {
        return (
            <Fade in={true} timeout={500}>
                <Box sx={{ /* ... estilos 'não encontrado' ... */ }}>
                    <Alert severity="warning" /* ... sx ... */ >
                        Dados do treino não encontrados.
                    </Alert>
                    <Button component={RouterLink} to="/dashboard" /* ... sx ... */ >
                        Voltar para Dashboard
                    </Button>
                </Box>
            </Fade>
        );
    }



    return (
        <Fade in={true} timeout={500}>
            <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: 2, color: "#fffffc" }}>
                {/* Removida a tag <form> externa */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" sx={{ color: "rgba(255, 255, 252, 0.4)" }} />}
                    aria-label="breadcrumb"
                    sx={{ mb: 3, color: "rgba(255, 255, 252, 0.6)" }}
                >
                    <Typography
                        component={RouterLink}
                        to="/dashboard"
                        sx={{
                            color: "rgba(255, 255, 252, 0.6)",
                            textDecoration: "none",
                            "&:hover": { color: "#77cc88", textDecoration: "underline" },
                        }}
                    >
                        Dashboard
                    </Typography>
                    <Typography
                        component={RouterLink}
                        to={`/workouts/${workoutId}`}
                        sx={{
                            color: "rgba(255, 255, 252, 0.6)",
                            textDecoration: "none",
                            "&:hover": { color: "#77cc88", textDecoration: "underline" },
                        }}
                    >
                        Detalhes do Treino
                    </Typography>
                    <Typography color="#77cc88">Editar Treino</Typography>
                </Breadcrumbs>

                <PageHeader>
                    <HeaderTitle>
                        <Box
                            sx={{
                                bgcolor: "rgba(119, 204, 136, 0.1)",
                                p: 1.5,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <DumbbellIcon sx={{ color: "#77cc88", fontSize: isMobile ? "1.5rem" : "2rem" }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                Editar Treino
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                {currentWorkout.name && (
                                    <Tooltip title={`Nome do Treino: ${currentWorkout.name}`} placement="bottom" slots={{transition: Zoom}}>
                                        <Chip // Chip genérico estilizado para o nome do treino
                                            label={currentWorkout.name}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                backgroundColor: "rgba(119, 204, 136, 0.1)",
                                                color: "#77cc88",
                                                border: "1px solid rgba(119, 204, 136, 0.2)",
                                                fontWeight: "medium",
                                            }}
                                        />
                                    </Tooltip>
                                )}
                                <Tooltip title="Data do treino" placement="bottom" slots={{transition: Zoom}}>
                                    <DateChip
                                        label={formatDate(currentWorkout.sessionDate)}
                                        size="small"
                                        icon={<CalendarIcon fontSize="small" />}
                                    />
                                </Tooltip>
                            </Box>
                        </Box>
                    </HeaderTitle>
                    <HeaderActions>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            startIcon={<BackIcon />}
                            sx={{
                                color: "#fffffc",
                                borderColor: "rgba(255, 255, 252, 0.2)",
                                "&:hover": {
                                    borderColor: "rgba(255, 255, 252, 0.4)",
                                    backgroundColor: "#fffffc",
                                },
                            }}
                        >
                            Voltar
                        </Button>
                    </HeaderActions>
                </PageHeader>

                <StyledPaper elevation={0}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3,
                            pb: 2,
                            borderBottom: "1px solid rgba(119, 204, 136, 0.1)",
                        }}
                    >
                        <TimeIcon sx={{ color: "#77cc88" }} />
                        <Typography variant="h6" fontWeight="500">
                            Informações do Treino
                        </Typography>
                    </Box>

                    <WorkoutForm
                        initialData={initialFormData}
                        onSubmit={handleUpdateSubmit}
                        isSubmitting={updateMutation.isPending}
                        submitButtonText="Salvar Alterações"
                    />
                </StyledPaper>
            </Box>
        </Fade>
    );
};

export default EditWorkoutPage;