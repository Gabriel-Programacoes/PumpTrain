import React from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { SubmitHandler } from 'react-hook-form';
import { Container, Typography, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';

import { useWorkoutDetailQuery } from '../../hooks/useWorkoutDetailQuery';
import { useUpdateWorkoutMutation, UpdateWorkoutPayload } from '../../hooks/useUpdateWorkoutMutation';
import { WorkoutForm, WorkoutFormData } from '../../components/WorkoutForm';
import { Activity } from '../../types/activity';

const EditWorkoutPage: React.FC = () => {
    const { workoutId } = useParams<{ workoutId: string }>();
    const navigate = useNavigate();

    // 1. Buscar dados atuais do treino
    const { data: currentWorkout, isLoading: isLoadingDetails, isError, error } = useWorkoutDetailQuery(workoutId);

    // 2. Obter a mutação de atualização
    const updateMutation = useUpdateWorkoutMutation(workoutId);

    // Definir tipo auxiliar para o payload
    type PayloadActivity = Omit<Activity, 'id' | 'exerciseName'> & { id?: string | number };

    // 3. Função de submit que será passada para o WorkoutForm
    const handleUpdateSubmit: SubmitHandler<WorkoutFormData> = (data) => {
        console.log("Dados do formulário para ATUALIZAR:", data);

        const activitiesToSave: PayloadActivity[] = data.activities
            .filter(activity => activity.exerciseId !== null && activity.exerciseId !== '')
            .map((activity): PayloadActivity => {
                const safeExerciseId = activity.exerciseId!;
                return {
                    id: activity.id ?? undefined, // Passa o id se existir
                    exerciseId: safeExerciseId,
                    sets: activity.sets ?? null,
                    repetitions: activity.reps ?? null,
                    weightKg: activity.weight ?? null,
                    notes: activity.notes ?? null,
                };
            });

        if (activitiesToSave.length === 0 && data.activities.length > 0) {
            console.error("Nenhuma atividade válida restante após filtro.");
            return;
        }

        const payload: UpdateWorkoutPayload = {
            sessionDate: data.sessionDate,
            name: data.name || null,
            notes: data.notes || null,
            activities: activitiesToSave,
        };

        console.log("Payload de ATUALIZAÇÃO:", payload);

        updateMutation.mutate(payload, {
            onSuccess: (updatedWorkout) => {
                navigate(`/workouts/${updatedWorkout?.id || workoutId}`);
            }
        });
    };

    // --- Renderização ---

    if (isLoadingDetails) {
        return <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}> <CircularProgress /> </Container>;
    }

    // Tratamento de erro
    if (isError) {
        let status: number | undefined;
        let message: string = 'Erro desconhecido ao carregar dados.'; // Mensagem padrão

        if (error instanceof Error) { // Verifica se é um objeto Error
            message = error.message;

            // Verifica se é um erro específico do Axios com uma resposta
            if (axios.isAxiosError(error) && error.response) {
                status = error.response.status;
            }
        }
        const errorMessage = status === 404
            ? `Treino com ID ${workoutId} não encontrado para edição.`
            : `Erro ao carregar treino para edição: ${message}`;

        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{errorMessage}</Alert>
                <Button component={RouterLink} to="/dashboard" sx={{ mt: 2 }}> Voltar </Button>
            </Container>
        );
    }

    if (!currentWorkout) {
        return <Container maxWidth="md" sx={{ mt: 4 }}> <Alert severity="warning">Dados não encontrados.</Alert> </Container>;
    }

    // Adapta os dados da API para o formato esperado pelo formulário (WorkoutFormData)
    const initialFormData: WorkoutFormData = {
        sessionDate: currentWorkout.sessionDate.split('T')[0],
        name: currentWorkout.name ?? '',
        notes: currentWorkout.notes ?? '',
        activities: (currentWorkout.activities || []).map((act: Activity) => ({
            id: act.id,
            exerciseId: act.exerciseId,
            sets: act.sets ?? null,
            repetitions: act.repetitions ?? null,
            weightKg: act.weightKg ?? null,
            notes: act.notes ?? '',
        })),
    };
    // Garante pelo menos uma linha vazia se não houver atividades
    if (initialFormData.activities.length === 0) {
        initialFormData.activities = [{ id: undefined, exerciseId: null, sets: null, reps: null, weight: null, notes: '' }];
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" component="h1" sx={{ mt: 2, mb: 3 }}>
                Editar Treino
            </Typography>
            <WorkoutForm
                initialData={initialFormData}
                onSubmit={handleUpdateSubmit}
                isSubmitting={updateMutation.isPending}
                submitButtonText="Salvar Alterações"
            />
        </Container>
    );
};

export default EditWorkoutPage;