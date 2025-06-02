import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, alpha } from "@mui/material/styles";
import {
    Typography, TextField, Button, Box, Stack,
    Autocomplete, CircularProgress, IconButton, Grid,
    InputAdornment, Chip, useMediaQuery, Fade, Divider,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    FitnessCenter as DumbbellIcon, Add as AddIcon, Delete as DeleteIcon,
    Save as SaveIcon, AccessTime as TimeIcon, Notes as NotesIcon, ArrowBack as BackIcon,
    Repeat as RepeatIcon, MonitorWeight as MonitorWeightIcon,
    DirectionsRun as DirectionsRunIcon, Whatshot as WhatshotIcon, TrendingUp as TrendingUpIcon, CalendarToday as CalendarIcon
} from "@mui/icons-material";

import { useExercisesQuery } from '../../hooks/useExercisesQuery';
import { useCreateWorkoutMutation, type CreateWorkoutPayload } from '../../hooks/useCreateWorkoutMutation';
import { Exercise } from '../../types/exercise';
import type { Activity } from '../../types/activity';
import dayjs, { Dayjs } from 'dayjs';
import {ActivityEntryBox, HeaderActions, HeaderTitle, PageHeader, StyledChipDetail, StyledPaper } from '../../utils/uiHelpers.tsx';

// --- Tipos ---
interface CurrentActivityState {
    exercise: Exercise | null;
    sets: string; reps: string; weight: string; notes: string;
    durationMinutes: string; distanceKm: string; intensity: string;
    incline: string;
}

type DisplayActivity = Omit<Activity, 'id' | 'workoutSessionId' | 'exerciseName'> & {
    exerciseName: string,
    exerciseType?: Exercise['exerciseType']
};


const CreateWorkoutPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { data: exercises = [], isLoading: isLoadingExercises } = useExercisesQuery();
    const createWorkoutMutation = useCreateWorkoutMutation();

    const [sessionDate, setSessionDate] = useState<Dayjs | null>(dayjs());
    const [workoutName, setWorkoutName] = useState<string>('');
    const [workoutNotes, setWorkoutNotes] = useState<string>('');
    const [addedActivities, setAddedActivities] = useState<DisplayActivity[]>([]);

    const initialActivityState: CurrentActivityState = {
        exercise: null, sets: '', reps: '', weight: '', notes: '',
        durationMinutes: '', distanceKm: '', intensity: '',
        incline: ''
    };
    const [currentActivity, setCurrentActivity] = useState<CurrentActivityState>(initialActivityState);

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            '& fieldset': { borderColor: 'rgba(119, 204, 136, 0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(119, 204, 136, 0.6)' },
            '&.Mui-focused fieldset': { borderColor: '#77cc88' },
            '&.Mui-disabled': { backgroundColor: alpha(theme.palette.common.black, 0.15) }
        },
        '& .MuiInputBase-input': { color: '#f0f0f0', '&.Mui-disabled': { color: alpha(theme.palette.text.secondary, 0.5), WebkitTextFillColor: alpha(theme.palette.text.secondary, 0.5),}},
        '& .MuiInputLabel-root': { color: 'rgba(240, 240, 240, 0.7)', '&.Mui-disabled': { color: alpha(theme.palette.text.secondary, 0.5) } },
        '& .MuiInputLabel-root.Mui-focused': { color: '#77cc88' },
        '& .MuiFormHelperText-root': { color: 'rgba(240, 240, 240, 0.6)', '&.Mui-error': { color: theme.palette.error.light }}
    };


    const adornmentIconColor = "rgba(119, 204, 136, 0.7)";

    const handleAddActivity = () => {
        if (!currentActivity.exercise) {
            console.error("Selecione um exercício.");
            return;
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
            intensity: currentActivity.intensity ? parseInt(currentActivity.intensity, 10) : null,
            incline: currentActivity.incline ? parseFloat(currentActivity.incline) : null,
            notes: currentActivity.notes || null,
        };
        setAddedActivities(prev => [...prev, newActivity]);
        setCurrentActivity(initialActivityState);
    };

    const handleRemoveActivity = (indexToRemove: number) => {
        setAddedActivities(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmitWorkout = (event: React.FormEvent) => {
        event.preventDefault();
        if (!sessionDate || addedActivities.length === 0) {
            console.error("Selecione data e adicione pelo menos uma atividade.");
            return;
        }
        const payload: CreateWorkoutPayload = {
            sessionDate: sessionDate.format('YYYY-MM-DD'),
            name: workoutName || null,
            notes: workoutNotes || null,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            activities: addedActivities.map(({ exerciseName, exerciseType, ...rest }) => ({ ...rest })),
        };

        console.log('[CreateWorkoutPage] Payload ANTES de enviar para API:', JSON.parse(JSON.stringify(payload)));


        createWorkoutMutation.mutate(payload, {
            onSuccess: () => { navigate('/dashboard'); }
        });
    };

    return (
        <Fade in={true} timeout={500}>
            <Box sx={{maxWidth: 1200, mx: "auto", py: 4, px: 2, color: "#fffffc"}}>
                <PageHeader>
                    <HeaderTitle>
                        <Box sx={{
                            bgcolor: "rgba(119, 204, 136, 0.1)",
                            p: 1.5,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <DumbbellIcon sx={{color: "#77cc88", fontSize: isMobile ? "1.5rem" : "2rem"}}/>
                        </Box>
                        <Typography variant="h4" fontWeight="bold">
                            Registrar Novo Treino
                        </Typography>
                    </HeaderTitle>
                    <HeaderActions>
                        <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<BackIcon/>}
                                sx={{
                                    color: "#fffffc",
                                    borderColor: "rgba(255, 255, 252, 0.2)",
                                    "&:hover": {
                                        borderColor: "rgba(255, 255, 252, 0.4)",
                                        backgroundColor: "rgba(255, 255, 252, 0.05)"
                                    }
                                }}>
                            Voltar
                        </Button>
                    </HeaderActions>
                </PageHeader>

                <StyledPaper elevation={0}>
                    <Box component="form" onSubmit={handleSubmitWorkout} noValidate>
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 3,
                            pb: 2,
                            borderBottom: "1px solid rgba(119, 204, 136, 0.1)"
                        }}>
                            <TimeIcon sx={{color: "#77cc88"}}/>
                            <Typography variant="h6" fontWeight="500">Informações Gerais</Typography>
                        </Box>
                        <Stack spacing={2.5} sx={{mb: 4}}>
                            <DatePicker
                                label="Data do Treino" value={sessionDate}
                                onChange={(newValue) => setSessionDate(newValue)}
                                format="DD/MM/YYYY"
                                sx={{maxWidth: {xs: '100%', sm: 280}, ...inputStyles}}
                                slotProps={{
                                    textField: {
                                        required: true, variant: "outlined", size: "small",
                                        InputProps: {
                                            startAdornment: (<InputAdornment position="start"><CalendarIcon
                                                sx={{color: adornmentIconColor}}/></InputAdornment>)
                                        },
                                    },
                                }}
                            />
                            <TextField label="Nome do Treino" required fullWidth variant="outlined" size="small"
                                       value={workoutName} onChange={(e) => setWorkoutName(e.target.value)}
                                       placeholder="Ex: Treino de Peito e Tríceps" sx={inputStyles}
                                       slotProps={{ input : {
                                               startAdornment: (<InputAdornment position="start"><DumbbellIcon
                                                   sx={{color: adornmentIconColor}}/></InputAdornment>)
                                           }
                                       }}
                            />
                            <TextField label="Notas Gerais (Opcional)" fullWidth variant="outlined" size="small"
                                       multiline rows={3} value={workoutNotes}
                                       onChange={(e) => setWorkoutNotes(e.target.value)}
                                       placeholder="Alguma observação sobre o treino em geral?" sx={inputStyles}
                                       slotProps={{ input: {
                                               startAdornment: (<InputAdornment position="start" sx={{
                                                   pt: 1,
                                                   alignSelf: 'flex-start'
                                               }} ><NotesIcon sx={{color: adornmentIconColor}}/></InputAdornment>
                                               )
                                           }
                                       }}
                            />
                        </Stack>

                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2.5,
                            pb: 2,
                            borderBottom: "1px solid rgba(119, 204, 136, 0.1)"
                        }}>
                            <AddIcon sx={{color: "#77cc88"}}/>
                            <Typography variant="h6" fontWeight="500">Adicionar Atividade</Typography>
                        </Box>

                        <Autocomplete
                            options={exercises || []}
                            getOptionLabel={(option: Exercise) => option.name}
                            value={currentActivity.exercise}
                            onChange={(_event, newValue: Exercise | null) => {
                                setCurrentActivity(() => ({...initialActivityState, exercise: newValue}));
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            loading={isLoadingExercises}
                            renderInput={(params) => (
                                <TextField {...params} label="Exercício" variant="outlined" size="small"
                                           placeholder="Digite para buscar um exercício"
                                           sx={{...inputStyles, mb: currentActivity.exercise ? 1 : 2}}
                                           slotProps={{ input: {
                                                   ...params.InputProps,
                                                   endAdornment: (<> {isLoadingExercises ?
                                                       <CircularProgress sx={{color: "#f0f0f0"}}
                                                                         size={20}/> : null} {params.InputProps.endAdornment} </>),
                                               }
                                           }}/>
                            )}
                        />

                        {currentActivity.exercise && currentActivity.exercise.exerciseType?.toLowerCase() === 'strength' && (
                            <Grid container spacing={2} sx={{mb: 2, mt: 0.5}}>
                                <Grid size={{xs: 12, sm: 4, md: 4}}>
                                    <TextField label="Séries" type="number" fullWidth variant="outlined" size="small"
                                               value={currentActivity.sets}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   sets: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}} slotProps={{htmlInput: {min: 0}}}/>
                                </Grid>
                                <Grid size={{xs: 12, sm: 4, md: 4}}>
                                    <TextField label="Repetições" type="number" fullWidth variant="outlined"
                                               size="small" value={currentActivity.reps}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   reps: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}} slotProps={{htmlInput: {min: 0}}}/>
                                </Grid>
                                <Grid size={{xs: 12, sm: 4, md: 4}}>
                                    <TextField label="Peso (kg)" type="number" fullWidth variant="outlined" size="small"
                                               value={currentActivity.weight}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   weight: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}}
                                               slotProps={{htmlInput: {step: 0.25, min: 0}}}/>
                                </Grid>
                            </Grid>
                        )}

                        {currentActivity.exercise && currentActivity.exercise.exerciseType?.toLowerCase() === 'cardio' && (
                            <Grid container spacing={2} sx={{mb: 2, mt: 0.5}}>
                                <Grid size={{xs: 6, sm: 6, md: 3}}>
                                    <TextField label="Duração (min)" type="number" fullWidth variant="outlined"
                                               size="small" value={currentActivity.durationMinutes}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   durationMinutes: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}} slotProps={{htmlInput: {min: 0}}}/>
                                </Grid>
                                <Grid size={{xs: 6, sm: 6, md: 3}}>
                                    <TextField label="Distância (km)" type="number" fullWidth variant="outlined"
                                               size="small" value={currentActivity.distanceKm}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   distanceKm: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}}
                                               slotProps={{htmlInput: {step: 0.1, min: 0}}}/>
                                </Grid>
                                <Grid size={{xs: 6, sm: 6, md: 3}}>
                                    <TextField label="Intensidade (1-10)" type="number" fullWidth variant="outlined"
                                               size="small" value={currentActivity.intensity}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   intensity: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}}
                                               slotProps={{htmlInput: {min: 1, max: 10, step: 1}}}/>
                                </Grid>
                                <Grid size={{xs: 6, sm: 6, md: 3}}>
                                    <TextField label="Inclinação (%)" type="number" fullWidth variant="outlined"
                                               size="small" value={currentActivity.incline}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   incline: e.target.value
                                               }))}
                                               sx={{...inputStyles, width: '100%'}}
                                               slotProps={{htmlInput: {step: 0.5, min: 0}}}/>
                                </Grid>
                            </Grid>
                        )}

                        {currentActivity.exercise && (
                            <Grid container spacing={2} alignItems="flex-end" sx={{mb: 2}}>
                                <Grid size={{xs: 12}}>
                                    <TextField label="Notas da Atividade (Opcional)" fullWidth variant="outlined"
                                               size="small" multiline rows={2}
                                               value={currentActivity.notes}
                                               onChange={(e) => setCurrentActivity(prev => ({
                                                   ...prev,
                                                   notes: e.target.value
                                               }))}
                                               placeholder="Ex: Cadência controlada, observações..."
                                               sx={inputStyles}
                                    />
                                </Grid>
                                <Grid size={{xs: 12, sm: "auto"}}>
                                    <Button variant="contained" startIcon={<AddIcon/>} onClick={handleAddActivity}
                                            disabled={!currentActivity.exercise} fullWidth={isMobile}
                                            sx={{
                                                bgcolor: "#77cc88",
                                                "&:hover": {bgcolor: "#66bb77"},
                                                color: "#0a0b14",
                                                height: '40px'
                                            }}>
                                        Adicionar
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {addedActivities.length > 0 && (
                            <>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                    mt: 4,
                                    pb: 2,
                                    borderBottom: "1px solid rgba(119, 204, 136, 0.1)"
                                }}>
                                    <DumbbellIcon sx={{color: "#77cc88"}}/>
                                    <Typography variant="h6" fontWeight="500"> Atividades Adicionadas
                                        ({addedActivities.length}) </Typography>
                                </Box>
                                {addedActivities.map((activity, index) => (
                                    <ActivityEntryBox key={index}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1.5
                                        }}>
                                            <Typography variant="subtitle1" fontWeight="medium"
                                                        sx={{color: "#fafafa", flexGrow: 1, mr: 1}}>
                                                {activity.exerciseName}
                                            </Typography>
                                            <Chip
                                                label={activity.exerciseType ? activity.exerciseType.charAt(0).toUpperCase() + activity.exerciseType.slice(1) : 'Geral'}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(theme.palette.primary.main, activity.exerciseType === 'strength' ? 0.3 : activity.exerciseType === 'cardio' ? 0.2 : 0.1),
                                                    color: theme.palette.primary.light,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    flexShrink: 0
                                                }}
                                            />
                                            <IconButton edge="end" aria-label="delete"
                                                        onClick={() => handleRemoveActivity(index)}
                                                        sx={{
                                                            color: "#cc7777",
                                                            "&:hover": {color: alpha("#dd6666", 0.8)},
                                                            ml: 1,
                                                            p: 0.5
                                                        }}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{mb: 0.5}}>
                                            {activity.exerciseType?.toLowerCase() === 'strength' && (
                                                <>
                                                    {activity.sets != null && (<StyledChipDetail icon={<RepeatIcon/>}
                                                                                                 label={`Séries: ${activity.sets}`}
                                                                                                 variant="outlined"
                                                                                                 size="small"/>)}
                                                    {activity.repetitions != null && (
                                                        <StyledChipDetail icon={<DumbbellIcon/>}
                                                                          label={`Reps: ${activity.repetitions}`}
                                                                          variant="outlined" size="small"/>)}
                                                    {activity.weightKg != null && (
                                                        <StyledChipDetail icon={<MonitorWeightIcon/>}
                                                                          label={`Peso: ${activity.weightKg} kg`}
                                                                          variant="outlined" size="small"/>)}
                                                </>
                                            )}
                                            {activity.exerciseType?.toLowerCase() === 'cardio' && (
                                                <>
                                                    {activity.durationMinutes != null && (
                                                        <StyledChipDetail icon={<TimeIcon/>}
                                                                          label={`Tempo: ${activity.durationMinutes} min`}
                                                                          variant="outlined" size="small"/>)}
                                                    {activity.distanceKm != null && (
                                                        <StyledChipDetail icon={<DirectionsRunIcon/>}
                                                                          label={`Dist.: ${activity.distanceKm} km`}
                                                                          variant="outlined" size="small"/>)}
                                                    {activity.intensity != null && (
                                                        <StyledChipDetail icon={<WhatshotIcon/>}
                                                                          label={`Int.: ${activity.intensity}`}
                                                                          variant="outlined" size="small"/>)}
                                                    {activity.incline != null && (
                                                        <StyledChipDetail icon={<TrendingUpIcon/>}
                                                                          label={`Incl.: ${activity.incline}%`}
                                                                          variant="outlined" size="small"/>)}
                                                </>
                                            )}
                                            {activity.notes && (<StyledChipDetail icon={<NotesIcon/>} label="Nota"
                                                                                  title={activity.notes}
                                                                                  variant="outlined" size="small"/>)}
                                        </Stack>

                                        {index < addedActivities.length - 1 && (
                                            <Divider
                                                sx={{mt: theme.spacing(2.5), borderColor: 'rgba(119, 204, 136, 0.1)'}}/>
                                        )}
                                    </ActivityEntryBox>
                                ))}
                            </>
                        )}

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: addedActivities.length > 0 ? 3 : 4,
                            pt: 3,
                            borderTop: addedActivities.length > 0 ? "1px solid rgba(119, 204, 136, 0.1)" : "none"
                        }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={createWorkoutMutation.isPending ?
                                    <CircularProgress size={20} color="inherit"/> : <SaveIcon/>}
                                disabled={addedActivities.length === 0 || createWorkoutMutation.isPending || !sessionDate}
                                sx={{
                                    bgcolor: "#77cc88",
                                    "&:hover": {bgcolor: "#66bb77"},
                                    color: "#0a0b14",
                                    fontWeight: 'bold',
                                    py: 1.2,
                                    px: 3
                                }}
                            >
                                {createWorkoutMutation.isPending ? 'Salvando...' : 'Salvar Treino'}
                            </Button>
                        </Box>
                    </Box>
                </StyledPaper>
            </Box>
        </Fade>
    );
}

export default CreateWorkoutPage;
