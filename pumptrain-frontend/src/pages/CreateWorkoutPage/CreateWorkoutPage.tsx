import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Grid from '@mui/material/Grid';

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

// Hooks, Tipos, etc.
import { useExercisesQuery } from '../../hooks/useExercisesQuery';
import { useCreateWorkoutMutation } from '../../hooks/useCreateWorkoutMutation';
import { Exercise } from '../../types/exercise';
import { Activity } from '../../types/activity';
import dayjs, { Dayjs } from 'dayjs';

// Tipo para o estado da atividade sendo adicionada
interface CurrentActivityState {
    exercise: Exercise | null;
    sets: string; // Usar string para inputs, converter depois
    reps: string;
    weight: string;
    notes: string;
}

const CreateWorkoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: exercises, isLoading: isLoadingExercises } = useExercisesQuery();
    const createWorkout = useCreateWorkoutMutation();

    // Estados do Formulário Principal
    const [sessionDate, setSessionDate] = useState<Dayjs | null>(dayjs()); // Data atual como padrão
    const [workoutName, setWorkoutName] = useState<string>('');
    const [workoutNotes, setWorkoutNotes] = useState<string>('');

    // Estado para a lista de atividades adicionadas a este treino
    type DisplayActivity = Omit<Activity, 'id'> & { exerciseName: string };
    const [addedActivities, setAddedActivities] = useState<DisplayActivity[]>([]);

    // Estado para a atividade sendo configurada atualmente
    const initialActivityState: CurrentActivityState = { exercise: null, sets: '', reps: '', weight: '', notes: '' };
    const [currentActivity, setCurrentActivity] = useState<CurrentActivityState>(initialActivityState);

    // Handler para adicionar a atividade atual à lista
    const handleAddActivity = () => {
        if (!currentActivity.exercise || !sessionDate) {
            // TODO: Mostrar erro com Snackbar?
            console.error("Selecione um exercício e data");
            return;
        }
        const newActivity: DisplayActivity = {
            exerciseId: currentActivity.exercise.id,
            exerciseName: currentActivity.exercise.name, // Guarda nome para exibição
            sets: currentActivity.sets ? parseInt(currentActivity.sets, 10) : null,
            repetitions: currentActivity.reps ? parseInt(currentActivity.reps, 10) : null,
            weightKg: currentActivity.weight ? parseFloat(currentActivity.weight) : null,
            notes: currentActivity.notes || null,
        };
        setAddedActivities(prev => [...prev, newActivity]);
        setCurrentActivity(initialActivityState); // Limpa formulário da atividade
    };

    // Handler para remover uma atividade da lista
    const handleRemoveActivity = (indexToRemove: number) => {
        setAddedActivities(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Handler para submeter o formulário do treino
    const handleSubmitWorkout = (event: React.FormEvent) => {
        event.preventDefault();
        if (!sessionDate || addedActivities.length === 0) {
            // TODO: Mostrar erro com Snackbar
            console.error("Selecione data e adicione pelo menos uma atividade.");
            return;
        }

        // Prepara o payload para a API
        const payload = {
            sessionDate: sessionDate.format('YYYY-MM-DD'), // Formata data
            name: workoutName || null,
            notes: workoutNotes || null,
            // Mapeia as atividades para remover o exerciseName antes de enviar

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            activities: addedActivities.map(({ exerciseName, ...rest }) => rest),
        };

        createWorkout.mutate(payload, {
            onSuccess: () => {
                // Navega para o dashboard após sucesso
                navigate('/dashboard');
            }
        });
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
                Registrar Novo Treino
            </Typography>

            <Box component="form" onSubmit={handleSubmitWorkout} noValidate>
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
                    <Stack spacing={2}>
                        <DatePicker
                            label="Data do Treino"
                            value={sessionDate}
                            onChange={(newValue) => setSessionDate(newValue)}
                            format="DD/MM/YYYY" // Formato de exibição
                            sx={{ maxWidth: 250 }} // Limita largura
                            slotProps={{ textField: { required: true } }}
                        />
                        <TextField
                            label="Nome do Treino"
                            fullWidth
                            required
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                        />
                        <TextField
                            label="Notas Gerais (Opcional)"
                            fullWidth
                            multiline
                            rows={3}
                            value={workoutNotes}
                            onChange={(e) => setWorkoutNotes(e.target.value)}
                        />
                    </Stack>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Adicionar Atividade</Typography>
                    <Autocomplete
                        options={exercises || []} // Lista de exercícios da API
                        getOptionLabel={(option) => option.name} // O que mostrar na lista
                        value={currentActivity.exercise}
                        onChange={(_event, newValue) => {
                            setCurrentActivity(prev => ({ ...prev, exercise: newValue }));
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={isLoadingExercises} // Mostra indicador de loading
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Exercício"
                                    slotProps={{
                                            input: {...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoadingExercises ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                                }
                                            }}
                            />
                        )}
                        sx={{ mb: 2 }}
                    />
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size ={{xs: 6, sm: 3}}>
                            <TextField label="Séries" type="number" fullWidth value={currentActivity.sets} onChange={(e) => setCurrentActivity(prev => ({ ...prev, sets: e.target.value }))}
                                       slotProps= {{
                                            htmlInput: {min: 0}
                            }}
                            />
                        </Grid>
                        <Grid size ={{xs: 6, sm: 3}}>
                            <TextField label="Repetições" type="number" fullWidth value={currentActivity.reps} onChange={(e) => setCurrentActivity(prev => ({ ...prev, reps: e.target.value }))}
                                       slotProps= {{
                                            htmlInput: {min: 0}
                            }}
                            />
                        </Grid>
                        <Grid size ={{xs: 6, sm: 3}}>
                            <TextField label="Peso (kg)" type="number" fullWidth value={currentActivity.weight} onChange={(e) => setCurrentActivity(prev => ({ ...prev, weight: e.target.value }))}
                                       slotProps= {{
                                            htmlInput: {step: 0.5, min: 0}
                            }}
                            />
                        </Grid>
                        <Grid display={"flex"} alignItems={"center"} size = {{xs: 12, sm: 3}}>
                            <Button
                                variant="outlined"
                                startIcon={<AddCircleOutlineIcon />}
                                onClick={handleAddActivity}
                                disabled={!currentActivity.exercise}
                                fullWidth
                            >
                                Adicionar
                            </Button>
                        </Grid>
                        <Grid size ={{xs: 12}}>
                            <TextField label="Notas da Atividade (Opcional)" fullWidth multiline value={currentActivity.notes} onChange={(e) => setCurrentActivity(prev => ({ ...prev, notes: e.target.value }))}/>
                        </Grid>
                    </Grid>
                </Paper>

                {addedActivities.length > 0 && (
                    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Atividades Adicionadas</Typography>
                        <List dense>
                            {addedActivities.map((activity, index) => (
                                <React.Fragment key={index}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveActivity(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={activity.exerciseName}
                                            secondary={`Séries: ${activity.sets ?? '-'} | Reps: ${activity.repetitions ?? '-'} | Peso: ${activity.weightKg ?? '-'} kg ${activity.notes ? `| Nota: ${activity.notes}` : ''}`}
                                        />
                                    </ListItem>
                                    {index < addedActivities.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={addedActivities.length === 0 || createWorkout.isPending || !sessionDate} // Desabilita se não tiver data/atividades ou estiver salvando
                    >
                        {createWorkout.isPending ? <CircularProgress size={24} color="inherit"/> : 'Salvar Treino'}
                    </Button>
                </Box>

            </Box>
        </Container>
    );
};

export default CreateWorkoutPage;