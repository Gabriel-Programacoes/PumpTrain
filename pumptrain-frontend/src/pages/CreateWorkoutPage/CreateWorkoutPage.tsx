import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { styled } from "@mui/material/styles"

// MUI Components
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Stack,
    Autocomplete,
    CircularProgress,
    List,
    IconButton,
    Grid,
    Card,
    CardContent,
    InputAdornment,
    Chip,
} from "@mui/material"


import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Icons
import {
    FitnessCenter as DumbbellIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    AccessTime as TimeIcon,
    Notes as NotesIcon,
} from "@mui/icons-material"

// Hooks, Tipos, etc.
import { useExercisesQuery } from '../../hooks/useExercisesQuery'
import { useCreateWorkoutMutation } from '../../hooks/useCreateWorkoutMutation'
import { Exercise } from '../../types/exercise'
import { Activity } from '../../types/activity'
import dayjs, { Dayjs } from 'dayjs'

// --- Componentes estilizados ---

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: "#0a0b14",
    borderRadius: theme.shape.borderRadius,
    border: "1px solid rgba(119, 204, 136, 0.1)",
    color: "#fffffc",
}))

const ActivityCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: "#0a0b14",
    border: "1px solid rgba(119, 204, 136, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        borderColor: "rgba(119, 204, 136, 0.3)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
}))

const StyledChip = styled(Chip)<{ chipType?: 'strength' | 'cardio' | string | undefined }>(({chipType }) => {
    let color = "#77cc88"
    if (chipType === 'strength') color = "#cc7777";
    else if (chipType === 'cardio') color = "#77aabb";

    return {
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: "medium",
        border: `1px solid ${color}40`,
    }
})

// --- Tipos ---
interface CurrentActivityState {
    exercise: Exercise | null
    sets: string
    reps: string
    durationMinutes: string
    distanceKm: string
    intensityLevel: string
    inclinePercent: string
    caloriesBurned: string
    weight: string
    notes: string
}

// --- Componente principal ---
const CreateWorkoutPage: React.FC = () => {
    const navigate = useNavigate()
    const { data: exercises, isLoading: isLoadingExercises } = useExercisesQuery()
    const createWorkout = useCreateWorkoutMutation()
    // const theme = useTheme(); // Available if needed

    const [sessionDate, setSessionDate] = useState<Dayjs | null>(dayjs())
    const [workoutName, setWorkoutName] = useState<string>('')
    const [workoutNotes, setWorkoutNotes] = useState<string>('')

    type DisplayActivity = Omit<Activity, 'id' | 'workoutSessionId'> & { exerciseName: string, exerciseType?: 'strength' | 'cardio' | string };
    const [addedActivities, setAddedActivities] = useState<DisplayActivity[]>([])

    const initialActivityState: CurrentActivityState = {
        exercise: null,
        sets: '',
        reps: '',
        weight: '',
        notes: '',
        durationMinutes: '',
        distanceKm: '',
        intensityLevel: '',
        inclinePercent: '',
        caloriesBurned: ''
    }
    const [currentActivity, setCurrentActivity] = useState<CurrentActivityState>(initialActivityState)

    const handleAddActivity = () => {
        if (!currentActivity.exercise || !sessionDate) {
            console.error("Selecione um exercício e data")
            return
        }
        const newActivity: DisplayActivity = {
            exerciseId: currentActivity.exercise.id,
            exerciseName: currentActivity.exercise.name,
            exerciseType: currentActivity.exercise.exerciseType,
            sets: currentActivity.sets ? parseInt(currentActivity.sets, 10) : null,
            repetitions: currentActivity.reps ? parseInt(currentActivity.reps, 10) : null,
            weightKg: currentActivity.weight ? parseFloat(currentActivity.weight) : null,
            durationMinutes: currentActivity.durationMinutes ? parseInt(currentActivity.durationMinutes, 10) : null,
            distanceKm: currentActivity.distanceKm ? parseFloat(currentActivity.distanceKm) : null,
            intensityLevel: currentActivity.intensityLevel ? parseInt(currentActivity.intensityLevel, 10) : null,
            inclinePercent: currentActivity.inclinePercent ? parseFloat(currentActivity.inclinePercent) : null,
            notes: currentActivity.notes || null,
        }
        setAddedActivities(prev => [...prev, newActivity])
        setCurrentActivity(initialActivityState)
    }

    const handleRemoveActivity = (indexToRemove: number) => {
        setAddedActivities(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleSubmitWorkout = (event: React.FormEvent) => {
        event.preventDefault()
        if (!sessionDate || addedActivities.length === 0) {
            console.error("Selecione data e adicione pelo menos uma atividade.")
            return
        }
        const payload = {
            sessionDate: sessionDate.format('YYYY-MM-DD'),
            name: workoutName || null,
            notes: workoutNotes || null,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            activities: addedActivities.map(({ exerciseName, exerciseType, ...rest }) => rest),
        }
        createWorkout.mutate(payload, {
            onSuccess: () => {
                navigate('/dashboard')
            }
        })
    }

    const adornmentIconColor = "#77cc88";

    return (
        <Container maxWidth="md" sx={{ py: 4, color: "#fffffc" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <DumbbellIcon sx={{ color: "#77cc88", mr: 1.5, fontSize: "2.5rem" }} />
                <Typography variant="h4" fontWeight="bold" component="h1" sx={{ color: "#fffffc" }}>
                    Registrar Novo Treino
                </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmitWorkout} noValidate>
                <StyledPaper elevation={0} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: "#77cc88", mb: 2 }}>
                        Informações Gerais
                    </Typography>
                    <Stack spacing={2.5}>
                        <DatePicker
                            label="Data do Treino"
                            value={sessionDate}
                            onChange={(newValue) => setSessionDate(newValue)}
                            format="DD/MM/YYYY"
                            sx={{ maxWidth: 250 }}
                            slotProps={{
                                textField: {
                                    required: true,
                                    variant: "outlined",
                                    InputProps: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TimeIcon sx={{ color: adornmentIconColor }} />
                                            </InputAdornment>
                                        ),
                                    },
                                },
                            }}
                        />
                        <TextField
                            label="Nome do Treino"
                            required
                            fullWidth
                            variant="outlined"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="Ex: Treino de Hoje"
                            slotProps={{ input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DumbbellIcon sx={{color: adornmentIconColor}}/>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                        <TextField
                            label="Notas Gerais (Opcional)"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={3}
                            value={workoutNotes}
                            onChange={(e) => setWorkoutNotes(e.target.value)}
                            placeholder="Alguma observação sobre o treino em geral?"
                            slotProps={{ input: {
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{mt: -7}}>
                                            <NotesIcon sx={{color: adornmentIconColor}}/>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                    </Stack>
                </StyledPaper>

                <StyledPaper elevation={0} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: "#77cc88", mb: 2 }}>
                        Adicionar Atividade
                    </Typography>
                    <Autocomplete
                        options={exercises || []}
                        getOptionLabel={(option) => option.name}
                        value={currentActivity.exercise}
                        onChange={(_event, newValue: Exercise | null) => {
                            console.log("Exercício Selecionado:", newValue); // LINHA DE DEPURAÇÃO
                            setCurrentActivity(() => ({ ...initialActivityState, exercise: newValue }))
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={isLoadingExercises}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Exercício"
                                variant="outlined"
                                placeholder="Digite para buscar um exercício"
                                slotProps={{ input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingExercises ? <CircularProgress sx={{color: adornmentIconColor}}
                                                                                        size={20}/> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }
                                }}
                            />
                        )}
                        sx={{ mb: 2 }}
                    />

                    {currentActivity.exercise && currentActivity.exercise.exerciseType?.toLowerCase() === 'strength' && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs:12, sm:4, md:4}}> {/* Using 'size' prop as requested */}
                                <TextField label="Séries" type="number" fullWidth variant="outlined" size="small" value={currentActivity.sets}
                                           onChange={(e) => setCurrentActivity(prev => ({ ...prev, sets: e.target.value }))}
                                           slotProps={{ htmlInput: { min: 0 } }} /> {/* Using slotProps.htmlInput */}
                            </Grid>
                            <Grid size={{ xs:12, sm:4, md:4}}> {/* Using 'size' prop */}
                                <TextField label="Repetições" type="number" fullWidth variant="outlined" size="small" value={currentActivity.reps}
                                           onChange={(e) => setCurrentActivity(prev => ({ ...prev, reps: e.target.value }))}
                                           slotProps={{ htmlInput: { min: 0 } }} /> {/* Using slotProps.htmlInput */}
                            </Grid>
                            <Grid size={{ xs:12, sm:4, md:4}}> {/* Using 'size' prop */}
                                <TextField label="Peso (kg)" type="number" fullWidth variant="outlined" size="small" value={currentActivity.weight}
                                           onChange={(e) => setCurrentActivity(prev => ({ ...prev, weight: e.target.value }))}
                                           slotProps={{ htmlInput: { step: 0.25, min: 0 } }} /> {/* Using slotProps.htmlInput */}
                            </Grid>
                        </Grid>
                    )}

                    {currentActivity.exercise && currentActivity.exercise.exerciseType?.toLowerCase() === 'cardio' && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{xs:6, sm:6, md:3}}>
                                <TextField
                                    label="Duração (min)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={currentActivity.durationMinutes}
                                    onChange={(e) => setCurrentActivity(prev => ({ ...prev, durationMinutes: e.target.value }))}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Grid>
                            <Grid size={{xs:6, sm:6, md:3}}>
                                <TextField
                                    label="Distância (km)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={currentActivity.distanceKm}
                                    onChange={(e) => setCurrentActivity(prev => ({ ...prev, distanceKm: e.target.value }))}
                                    slotProps={{ htmlInput: { step: 0.1, min: 0 } }}
                                />
                            </Grid>
                            <Grid size={{xs:6, sm:6, md:3}}>
                                <TextField
                                    label="Intensidade (1-10)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={currentActivity.intensityLevel}
                                    onChange={(e) => setCurrentActivity(prev => ({ ...prev, intensityLevel: e.target.value }))}
                                    slotProps={{ htmlInput: { min: 1, max: 10, step: 1 } }}
                                />
                            </Grid>
                            <Grid size={{xs:6, sm:6, md:3}}>
                                <TextField
                                    label="Inclinação (%)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    value={currentActivity.inclinePercent}
                                    onChange={(e) => setCurrentActivity(prev => ({ ...prev, inclinePercent: e.target.value }))}
                                    slotProps={{ htmlInput: { step: 0.5, min: 0 } }}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {currentActivity.exercise && (
                        <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                            <Grid size={{xs:12, sm:8, md:9}} > {/* Standard Grid item for this section */}
                                <TextField label="Notas da Atividade (Opcional)" fullWidth variant="outlined" size="small" multiline rows={2}
                                           value={currentActivity.notes}
                                           onChange={(e) => setCurrentActivity(prev => ({ ...prev, notes: e.target.value }))}
                                           placeholder="Ex: Cadência controlada, observações..."
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:4, md:3}}  sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddActivity}
                                    disabled={!currentActivity.exercise}
                                    fullWidth
                                    sx={{ bgcolor: "#77cc88", "&:hover": { bgcolor: "#66bb77" }, height: '56px' }}
                                >
                                    Adicionar
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </StyledPaper>

                {addedActivities.length > 0 && (
                    <StyledPaper elevation={0} sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ color: "#77cc88", mb: 2 }}>
                            Atividades Adicionadas ({addedActivities.length})
                        </Typography>
                        <List dense sx={{padding: 0}}>
                            {addedActivities.map((activity, index) => (
                                <React.Fragment key={index}>
                                    <ActivityCard variant="outlined">
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                <Typography variant="subtitle1" fontWeight="medium" sx={{ color: "#fafafa" }}>
                                                    {activity.exerciseName}
                                                </Typography>
                                                <StyledChip
                                                    label={activity.exerciseType ? activity.exerciseType.charAt(0).toUpperCase() + activity.exerciseType.slice(1) : 'Detalhe'}
                                                    size="small"
                                                    chipType={activity.exerciseType}
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, whiteSpace: 'pre-wrap' }}>
                                                {
                                                    (activity.exerciseType?.toLowerCase() === 'strength')
                                                        ? `Séries: ${activity.sets ?? '-'} | Reps: ${activity.repetitions ?? '-'} | Peso: ${activity.weightKg ?? '-'} kg`
                                                        : (activity.exerciseType?.toLowerCase() === 'cardio')
                                                            ? `Duração: ${activity.durationMinutes ?? '-'} min | Dist: ${activity.distanceKm ?? '-'} km ${activity.intensityLevel ? `| Int: ${activity.intensityLevel}` : ''} ${activity.inclinePercent ? `| Incl: ${activity.inclinePercent}%` : ''}`
                                                            : ''
                                                }
                                            </Typography>
                                            {activity.notes && (
                                                <Typography variant="caption" display="block" sx={{ color: "text.disabled", fontStyle: 'italic' }}>
                                                    Nota: {activity.notes}
                                                </Typography>
                                            )}
                                            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveActivity(index)} sx={{ color: "#cc7777", "&:hover": { color: "#dd6666" } }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </CardContent>
                                    </ActivityCard>
                                </React.Fragment>
                            ))}
                        </List>
                    </StyledPaper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={addedActivities.length === 0 || createWorkout.isPending || !sessionDate}
                        sx={{ bgcolor: "#77cc88", "&:hover": { bgcolor: "#66bb77" }, color: "#0a0b14", fontWeight: 'bold' }}
                    >
                        {createWorkout.isPending ? <CircularProgress size={24} sx={{color: "#0a0b14"}} /> : 'Salvar Treino'}
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}

export default CreateWorkoutPage