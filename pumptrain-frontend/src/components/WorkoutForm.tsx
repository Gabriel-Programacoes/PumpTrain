import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- Imports MUI e Icons ---
import {
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
    Paper,
    Autocomplete,
    CircularProgress,
    FormHelperText,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// --- Outros imports ---
import { useExercisesQuery } from '../hooks/useExercisesQuery';
import { Exercise } from '../types/exercise';

// --- Schemas Zod ---
const activitySchema = z.object({
    id: z.union([z.string(), z.number()]).optional().nullable(),
    exerciseId: z.union([z.number(), z.string()]).nullable().refine(val => val !== null && val !== '', { message: 'Exercício é obrigatório para salvar a atividade' }),
    sets: z.number().positive('Deve ser positivo').int('Deve ser inteiro').optional().nullable(),
    reps: z.number().positive('Deve ser positivo').int('Deve ser inteiro').optional().nullable(),
    weight: z.number().positive('Deve ser positivo').optional().nullable(),

    durationMinutes: z.number().positive('Deve ser positivo').int('Deve ser inteiro').optional().nullable(),
    distanceKm: z.number().positive('Deve ser positivo').optional().nullable(),
    intensityLevel: z.number().positive('Deve ser positivo').int('Deve ser inteiro').min(1).max(10).optional().nullable(),
    inclinePercent: z.number().min(0).optional().nullable(),

    notes: z.string().max(255, 'Máximo 255 caracteres').optional().nullable(),
});

const workoutFormSchema = z.object({
    sessionDate: z.string().min(1, 'Data é obrigatória'),
    name: z.string().max(100, 'Máximo 100 caracteres').optional().nullable(),
    notes: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
    activities: z.array(activitySchema)
        .refine(activities => activities.some(act => act.exerciseId !== null && act.exerciseId !== ''), {
            message: 'Adicione pelo menos uma atividade completa (com exercício selecionado).',
        }),
});

export type WorkoutFormData = z.infer<typeof workoutFormSchema>;

// --- Props ---
interface WorkoutFormProps {
    initialData?: WorkoutFormData;
    onSubmit: SubmitHandler<WorkoutFormData>;
    isSubmitting?: boolean;
    submitButtonText?: string;
}

// --- Componente ---
export const WorkoutForm: React.FC<WorkoutFormProps> = ({
                                                            initialData,
                                                            onSubmit,
                                                            isSubmitting = false,
                                                            submitButtonText = 'Salvar Treino'
                                                        }) => {
    const { data: exercisesData = [], isLoading: isLoadingExercises } = useExercisesQuery();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<WorkoutFormData>({
        resolver: zodResolver(workoutFormSchema),
        defaultValues: initialData ? initialData : {
            sessionDate: new Date().toISOString().split('T')[0],
            name: '',
            notes: '',
            activities: [{ exerciseId: null, sets: null, reps: null, weight: null, notes: ''}],
        },
    });

    useEffect(() => {
        if (initialData) {
            // Garante que activities seja um array, mesmo se initialData.activities for null/undefined
            const activitiesToSet = initialData.activities && initialData.activities.length > 0
                ? initialData.activities
                : [{ exerciseId: null, sets: null, reps: null, weight: null, notes: '' }];

            reset({ ...initialData, activities: activitiesToSet });
        }
    }, [initialData, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "activities",
    });

    const handleNumericChange = (value: string | number | null | undefined): number | null => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            {/* Campos Data, Nome, Notas */}
            <Controller
                name="sessionDate"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Data do Treino"
                        type="date"
                        margin="normal"
                        fullWidth
                        slotProps={{inputLabel: {shrink: true} }}
                        error={!!errors.sessionDate}
                        helperText={errors.sessionDate?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Nome do Treino (Opcional)"
                        margin="normal"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                    />
                )}
            />
            <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Notas (Opcional)"
                        margin="normal"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                    />
                )}
            />

            {/* --- Lista de Atividades --- */}
            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Atividades</Typography>
            {errors.activities?.message && !errors.activities?.root?.message && ( // Exibe msg geral se não houver erro específico no root
                <FormHelperText error sx={{ mb: 1 }}>{errors.activities.message}</FormHelperText>
            )}
            {errors.activities?.root?.message && ( // Exibe msg do refine
                <FormHelperText error sx={{ mb: 1 }}>{errors.activities.root.message}</FormHelperText>
            )}

            {fields.map((item, index) => (
                <Paper key={item.id} sx={{ p: 2, mb: 2, position: 'relative', border: errors.activities?.[index] ? '1px solid red' : undefined }}>
                    <IconButton
                        aria-label={`Remover atividade ${index + 1}`}
                        onClick={() => remove(index)} // <<< Chama a função remove do useFieldArray com o índice atual
                        sx={{
                            position: 'absolute',
                            top: -1,
                            right: 0,
                            color: 'text.secondary'
                        }}
                        size="small"
                        // Desabilita se for a última linha ou se o form estiver submetendo
                        disabled={fields.length <= 1 || isSubmitting}
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>

                    {/* Campo Exercício */}
                    <Controller
                        name={`activities.${index}.exerciseId`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <Autocomplete
                                {...field}
                                options={exercisesData}
                                getOptionLabel={(option: Exercise) => option.name || ''}
                                isOptionEqualToValue={(option, value) => typeof value === 'number' && option.id === value}
                                loading={isLoadingExercises}
                                onChange={(_, data) => field.onChange(data ? data.id : null)}
                                value={exercisesData.find(ex => ex.id === field.value) ?? null}
                                disabled={isSubmitting}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={`Exercício ${index + 1}`}
                                        margin="dense"
                                        error={!!error}
                                        helperText={error?.message}
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
                            />
                        )}
                    />

                    {/* Campos Séries, Repetições, Peso, Notas */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {/* Séries */}
                        <Controller
                            name={`activities.${index}.sets`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Séries" type="number" margin="dense" sx={{ minWidth: '60px', flexGrow: 1 }}
                                    error={!!error} helperText={error?.message} disabled={isSubmitting}
                                    onChange={(e) => field.onChange(handleNumericChange(e.target.value))}
                                    value={field.value ?? ''}
                                    slotProps={{htmlInput: { min: 1, step: 1 }}}
                                />
                            )}
                        />
                        {/* Reps */}
                        <Controller
                            name={`activities.${index}.reps`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Reps" type="number" margin="dense" sx={{ minWidth: '60px', flexGrow: 1 }}
                                    error={!!error} helperText={error?.message} disabled={isSubmitting}
                                    onChange={(e) => field.onChange(handleNumericChange(e.target.value))}
                                    value={field.value ?? ''}
                                    slotProps={{htmlInput: { min: 1, step: 1 }}}
                                />
                            )}
                        />
                        {/* Peso */}
                        <Controller
                            name={`activities.${index}.weight`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    label="Peso (kg)" type="number" margin="dense" sx={{ minWidth: '80px', flexGrow: 1 }}
                                    error={!!error} helperText={error?.message} disabled={isSubmitting}
                                    onChange={(e) => field.onChange(handleNumericChange(e.target.value))}
                                    value={field.value ?? ''}
                                    slotProps={{htmlInput: { min: 0, step: 0.25 }}}
                                />
                            )}
                        />
                    </Box>
                    {/* Notas Atividade */}
                    <Controller
                        name={`activities.${index}.notes`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <TextField
                                {...field}
                                label="Notas da Atividade (Opcional)" margin="dense" fullWidth multiline size="small" sx={{mt: 1}}
                                error={!!error} helperText={error?.message} disabled={isSubmitting}
                                value={field.value ?? ''}
                            />
                        )}
                    />
                </Paper>
            ))}

            {/* Botão Adicionar Atividade */}
            <Button type="button" startIcon={<AddCircleOutlineIcon />} onClick={() => append({ id: undefined, exerciseId: null, sets: null, reps: null, weight: null, notes: '' })} sx={{ mt: 1 }} disabled={isSubmitting} >
                Adicionar Atividade
            </Button>

            {/* Botão de Submissão */}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isSubmitting} >
                {isSubmitting ? <CircularProgress size={24} color="inherit"/> : submitButtonText}
            </Button>
        </Box>
    );
};

// export default WorkoutForm; // Descomentar se necessário