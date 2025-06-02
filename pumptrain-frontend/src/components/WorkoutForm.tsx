import React, {useEffect, useMemo, useRef} from "react";
import { useForm, Controller, useFieldArray, type SubmitHandler, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dayjs from 'dayjs';

// --- Imports MUI e Icons ---
import {
    TextField,
    Button,
    Box,
    IconButton,
    Typography,
    Autocomplete,
    CircularProgress,
    FormHelperText,
    Grid,
    useTheme,
    Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// --- Outros imports ---
import { useExercisesQuery } from '../hooks/useExercisesQuery';
import { Exercise } from '../types/exercise';

// --- Schemas Zod ---
const activitySchema = z.object({
    id: z.union([z.string(), z.number()]).optional().nullable(),
    exerciseId: z.union([z.number(), z.string()]).nullable().refine(val => val !== null && val !== '', { message: 'Exercício é obrigatório.' }),
    exerciseType: z.string().optional().nullable(),

    // Campos numéricos agora usam z.number() diretamente
    sets: z.number().positive('Séries: Deve ser positivo').int('Séries: Deve ser inteiro').nullable().optional(),
    reps: z.number().positive('Repetições: Deve ser positivo').int('Repetições: Deve ser inteiro').nullable().optional(),
    weight: z.number().positive('Peso: Deve ser positivo').nullable().optional(),

    durationMinutes: z.number().positive('Duração: Deve ser positivo').int('Duração: Deve ser inteiro').nullable().optional(),
    distanceKm: z.number().positive('Distância: Deve ser positivo').nullable().optional(),
    intensity: z.number().positive('Intensidade: Deve ser positivo').int('Intensidade: Deve ser inteiro').min(1, "Intensidade: Mínimo 1").max(10, "Intensidade: Máximo 10").nullable().optional(),
    incline: z.number().min(0, "Inclinação: Mínimo 0").nullable().optional(),

    notes: z.string().max(255, 'Notas: Máximo 255 caracteres').optional().nullable(),
});

const workoutFormSchema = z.object({
    sessionDate: z.string().min(1, 'Data é obrigatória'),
    name: z.string().max(100, 'Nome: Máximo 100 caracteres').optional().nullable(),
    notes: z.string().max(500, 'Notas: Máximo 500 caracteres').optional().nullable(),
    activities: z.array(activitySchema)
        .min(1, 'Adicione pelo menos uma atividade com exercício selecionado.'),
});

export type WorkoutFormData = z.infer<typeof workoutFormSchema>;

// --- Props ---
interface WorkoutFormProps {
    initialData?: WorkoutFormData;
    onSubmit: SubmitHandler<WorkoutFormData>;
    isSubmitting?: boolean;
    submitButtonText?: string;
}

const defaultActivityValue: Omit<z.infer<typeof activitySchema>, 'id'> & { id?: string | number | undefined } = {
    exerciseId: null,
    exerciseType: null,
    sets: null, reps: null, weight: null,
    durationMinutes: null, distanceKm: null, intensity: null, incline: null,
    notes: ''
};

// Função auxiliar para converter input para número ou null
const parseInputToNumberOrNull = (value: string, allowFloat = false): number | null => {


    if (value.trim() === '') {
        console.log('[parseInputToNumberOrNull] Retornando null (input vazio ou não string)');

        return null;
    }

    let normalizedValue = value.trim();

    if (allowFloat) {
        normalizedValue = normalizedValue.replace(',', '.');

        if ((normalizedValue.match(/\./g) || []).length > 1) {
            return null;
        }
    }

    const num = allowFloat ? parseFloat(normalizedValue) : parseInt(normalizedValue, 10);

    return isNaN(num) ? null : num;
};


// --- Componente ---
export const WorkoutForm: React.FC<WorkoutFormProps> = ({
                                                            initialData,
                                                            onSubmit,
                                                            isSubmitting = false,
                                                            submitButtonText = 'Salvar Treino'
                                                        }) => {
    const theme = useTheme();
    const { data: exercisesData = [], isLoading: isLoadingExercises } = useExercisesQuery(); //

    if (initialData) {
        console.log('[WorkoutForm] Prop initialData recebida:', JSON.parse(JSON.stringify(initialData)));
        console.log('[WorkoutForm] Prop initialData.activities recebida:', JSON.parse(JSON.stringify(initialData.activities)));
    } else {
        console.log('[WorkoutForm] Prop initialData está undefined/null.');
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<WorkoutFormData>({
        resolver: zodResolver(workoutFormSchema),
        defaultValues: {
            sessionDate: new Date().toISOString().split('T')[0],
            name: '',
            notes: '',
            activities: [defaultActivityValue],
        },
    });

    const watchedActivitiesState = watch("activities");
    console.log('[WorkoutForm] Estado atual de "activities" (observado por watch):', JSON.parse(JSON.stringify(watchedActivitiesState)));

    const initialDataAppliedRef = useRef(false);

    const parsePotentiallyStringNumber = (value: string | number | null | undefined, allowFloat = false): number | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') {
            return isNaN(value) ? null : value;
        }
        if (typeof value === 'string') {
            if (value.trim() === '') return null;
            const normalizedValue = value.trim().replace(',', '.');
            // Evitar múltiplos pontos para parseFloat
            if (allowFloat && (normalizedValue.match(/\./g) || []).length > 1) {
                console.warn(`[parsePotentiallyStringNumber] Valor normalizado "${normalizedValue}" tem múltiplos pontos.`);
                return null; // Ou o valor antes do segundo ponto, ou NaN, dependendo do rigor. Null é mais seguro para o Zod.
            }
            const num = allowFloat ? parseFloat(normalizedValue) : parseInt(normalizedValue, 10);
            return isNaN(num) ? null : num;
        }

        return null;
    };

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "activities",
    });

    useEffect(() => {
        if (initialData && !initialDataAppliedRef.current) {
            if (import.meta.env.DEV) {
                console.log("[WorkoutForm useEffect - RESET] initialData.activities ANTES do map:", JSON.parse(JSON.stringify(initialData.activities)));
            }

            const activitiesForReset = (initialData.activities && initialData.activities.length > 0
                    ? initialData.activities
                    : [defaultActivityValue]
            ).map((act, idx) => {
                const processedActivity = {
                    ...defaultActivityValue, // Garante todos os campos default
                    ...act,                 // Sobrescreve com dados de act
                    // Aplica parse como segurança, caso act ainda tenha strings para números
                    sets: parsePotentiallyStringNumber(act.sets, false),
                    reps: parsePotentiallyStringNumber(act.reps, false),
                    weight: parsePotentiallyStringNumber(act.weight, true),
                    durationMinutes: parsePotentiallyStringNumber(act.durationMinutes, false),
                    distanceKm: parsePotentiallyStringNumber(act.distanceKm, true),
                    intensity: parsePotentiallyStringNumber(act.intensity, false),
                    incline: parsePotentiallyStringNumber(act.incline, true),
                    exerciseType: act.exerciseType || null, // Já tratado
                    // id e exerciseId devem vir corretamente de 'act'
                };
                if (import.meta.env.DEV) {
                    console.log(`[WorkoutForm useEffect - RESET] Atividade ${idx} processada:`, JSON.parse(JSON.stringify(processedActivity)));
                }
                return processedActivity;
            });

            if (import.meta.env.DEV) {
                console.log("[WorkoutForm useEffect - RESET] Activities após parse para reset:", JSON.parse(JSON.stringify(activitiesForReset)));
            }

            reset({
                sessionDate: initialData.sessionDate,
                name: initialData.name ?? "",
                notes: initialData.notes ?? "",
                activities: [],
            });

            replace(activitiesForReset)

            initialDataAppliedRef.current = true;
            if (import.meta.env.DEV) {
                console.log("[WorkoutForm useEffect - RESET] Formulário resetado com activitiesForReset.");
            }
        }
    }, [initialData, reset, replace]); // defaultActivityValue não precisa ser dependência aqui se for constante

    const watchedActivities = watch("activities");
    const watchedActivityIdsAndTypes = useMemo(() =>
            watchedActivities.map(act => `${act.exerciseId}-${act.exerciseType}`),
        [watchedActivities]);

    useEffect(() => {
        if (exercisesData.length === 0 || !watchedActivities || watchedActivities.length === 0) {
            return;
        }
        // console.log("[WorkoutForm useEffect - EXERCISE_TYPE_UPDATE] Verificando exerciseTypes.");

        watchedActivities.forEach((activity, index) => {
            if ((activity.exerciseType === null || activity.exerciseType === undefined) && activity.exerciseId) {
                const foundExercise = exercisesData.find(ex => ex.id === activity.exerciseId);
                const newTypeFromExerciseData = foundExercise?.exerciseType || null;
                if (newTypeFromExerciseData !== activity.exerciseType) {
                    // console.log(`[WorkoutForm useEffect - EXERCISE_TYPE_UPDATE] Atividade ${index}, ExID ${activity.exerciseId}. Definindo exerciseType para: ${newTypeFromExerciseData}.`);
                    setValue(`activities.${index}.exerciseType` as Path<WorkoutFormData>, newTypeFromExerciseData, {shouldValidate: false});
                }
            }
        });
    }, [exercisesData, watchedActivityIdsAndTypes, setValue, watchedActivities]);


    console.log('[WorkoutForm] "fields" do useFieldArray:', JSON.parse(JSON.stringify(fields)));

    const inputStyles = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            '& fieldset': { borderColor: 'rgba(119, 204, 136, 0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(119, 204, 136, 0.6)' },
            '&.Mui-focused fieldset': { borderColor: '#77cc88' },
            '&.Mui-disabled': { backgroundColor: alpha(theme.palette.common.black, 0.15) }
        },
        '& .MuiInputBase-input': {
            color: '#f0f0f0',
            '&.Mui-disabled': {
                color: alpha(theme.palette.text.secondary, 0.5),
                WebkitTextFillColor: alpha(theme.palette.text.secondary, 0.5),
            }
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(240, 240, 240, 0.7)',
            '&.Mui-disabled': { color: alpha(theme.palette.text.secondary, 0.5) }
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#77cc88' },
        '& .MuiFormHelperText-root': {
            color: 'rgba(240, 240, 240, 0.6)',
            '&.Mui-error': { color: theme.palette.error.light }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Controller
                name="sessionDate"
                control={control}
                render={({ field, fieldState }) => (
                    <DatePicker
                        label="Data do Treino"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                        disabled={isSubmitting}
                        slotProps={{
                            textField: {
                                margin: "normal",
                                fullWidth: true,
                                error: !!fieldState.error,
                                helperText: fieldState.error?.message,
                                sx: inputStyles,
                                InputLabelProps: { shrink: true }
                            }
                        }}
                    />
                )}
            />
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Nome do Treino"
                        margin="normal"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isSubmitting}
                        value={field.value ?? ''}
                        sx={inputStyles}
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
                        sx={inputStyles}
                    />
                )}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1, color: "#77cc88" }}>
                Atividades
            </Typography>
            {errors.activities && typeof errors.activities.message === 'string' && !errors.activities.root && (
                <FormHelperText error sx={{ mb: 1 }}>{errors.activities.message}</FormHelperText>
            )}
            {errors.activities?.root?.message && (
                <FormHelperText error sx={{ mb: 1 }}>{errors.activities.root.message}</FormHelperText>
            )}

            {fields.map((item, index) => {
                const activityFieldError = errors.activities?.[index];
                const currentActivityType = watch(`activities.${index}.exerciseType` as Path<WorkoutFormData>);
                console.log(`[WorkoutForm] Renderizando field ${index}, RHF ID: ${item.id}`);


                return (
                    <Box
                        key={item.id}
                        sx={{
                            pt: 2.5, pb: 1.5, position: 'relative', borderRadius: 1, px: activityFieldError ? 1 : 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: -1.5 }}>
                            <Typography variant="caption" sx={{visibility: activityFieldError?.exerciseId ? 'visible' : 'hidden', color: theme.palette.error.main, minHeight: '20px'}}>
                                {activityFieldError?.exerciseId ? errors.activities?.[index]?.exerciseId?.message || ' ' : ' '}
                            </Typography>
                            <IconButton
                                aria-label={`Remover atividade ${index + 1}`}
                                onClick={() => remove(index)}
                                sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.error.light }}}
                                size="small"
                                disabled={fields.length <= 1 || isSubmitting}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Controller
                            name={`activities.${index}.exerciseId` as Path<WorkoutFormData>}
                            control={control}
                            render={({ field: exerciseField, fieldState: { error: exerciseError } }) => (
                                <Autocomplete
                                    {...exerciseField}
                                    options={exercisesData}
                                    getOptionLabel={(option: Exercise) => option.name || ''}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    loading={isLoadingExercises}
                                    onChange={(_, data: Exercise | null) => {
                                        const newExerciseId = data ? data.id : null;
                                        const newExerciseTypeFromSelection = data?.exerciseType || null;
                                        exerciseField.onChange(newExerciseId);
                                        setValue(`activities.${index}.exerciseType` as Path<WorkoutFormData>, newExerciseTypeFromSelection, { shouldValidate: true });
                                    }}
                                    value={exercisesData.find(ex => ex.id === exerciseField.value) ?? null}
                                    disabled={isSubmitting}
                                    sx={{ mb: exerciseError ? 0 : 2 }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={`Exercício ${index + 1}`}
                                            variant="outlined" size="small" margin="dense"
                                            error={!!exerciseError}
                                            helperText={exerciseError?.message}
                                            sx={inputStyles}
                                            slotProps={{ input : {
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {isLoadingExercises ?
                                                                <CircularProgress sx={{color: "#f0f0f0"}}
                                                                                  size={20}/> : null}
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

                        {typeof currentActivityType === 'string' && currentActivityType.toLowerCase() === 'strength' && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Controller name={`activities.${index}.sets` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                    <TextField {...field} label="Séries" type="text" inputMode="numeric" variant="outlined" size="small" margin="dense"
                                               sx={{ ...inputStyles, minWidth: '70px', flexGrow: 1 }} error={!!error} helperText={error?.message}
                                               disabled={isSubmitting}
                                               value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                               onChange={(e) => {
                                                   const inputValue = e.target.value;
                                                   const numericValue = parseInputToNumberOrNull(inputValue, false);
                                                   field.onChange(numericValue);
                                               }} /> )} />
                                <Controller name={`activities.${index}.reps` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                    <TextField {...field} label="Reps" type="text" inputMode="numeric" variant="outlined" size="small" margin="dense"
                                               sx={{ ...inputStyles, minWidth: '70px', flexGrow: 1 }} error={!!error} helperText={error?.message}
                                               disabled={isSubmitting}
                                               value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                               onChange={(e) => {
                                                   const inputValue = e.target.value;
                                                   const numericValue = parseInputToNumberOrNull(inputValue, false);
                                                   field.onChange(numericValue);
                                               }} /> )} />
                                <Controller name={`activities.${index}.weight` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                    <TextField {...field} label="Peso (kg)" type="text" inputMode="decimal" variant="outlined" size="small" margin="dense"
                                               sx={{ ...inputStyles, minWidth: '90px', flexGrow: 1 }} error={!!error} helperText={error?.message}
                                               disabled={isSubmitting}
                                               value={field.value === null || field.value === undefined ? '' : String(field.value).replace('.', ',')}
                                               onChange={(e) => {
                                                   const inputValue = e.target.value;
                                                   const numericValue = parseInputToNumberOrNull(inputValue, true);
                                                   field.onChange(numericValue);
                                               }} /> )} />
                            </Box>
                        )}

                        {typeof currentActivityType === 'string' && currentActivityType.toLowerCase() === 'cardio' && (
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                                <Grid size = {{xs:6, sm: 4}}>
                                    <Controller name={`activities.${index}.durationMinutes` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                        <TextField {...field} label="Duração (min)" type="text" inputMode="numeric" variant="outlined" size="small" margin="dense" fullWidth sx={inputStyles}
                                                   error={!!error} helperText={error?.message} disabled={isSubmitting}
                                                   value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                                   onChange={(e) => {
                                                       const inputValue = e.target.value;
                                                       const numericValue = parseInputToNumberOrNull(inputValue, false);
                                                       field.onChange(numericValue);
                                                   }} /> )} />
                                </Grid>
                                <Grid size = {{xs:6, sm: 4}}>
                                    <Controller name={`activities.${index}.distanceKm` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                        <TextField {...field} label="Distância (km)" type="text" inputMode="decimal" variant="outlined" size="small" margin="dense" fullWidth sx={inputStyles}
                                                   error={!!error} helperText={error?.message} disabled={isSubmitting}
                                                   value={field.value === null || field.value === undefined ? '' : String(field.value).replace('.', ',')}
                                                   onChange={(e) => {
                                                       const inputValue = e.target.value;
                                                       const numericValue = parseInputToNumberOrNull(inputValue, true);
                                                       field.onChange(numericValue);
                                                   }} /> )} />
                                </Grid>
                                <Grid size = {{xs:6, sm: 4}}>
                                    <Controller name={`activities.${index}.intensity` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                        <TextField {...field} label="Intensidade (1-10)" type="text" inputMode="numeric" variant="outlined" size="small" margin="dense" fullWidth sx={inputStyles}
                                                   error={!!error} helperText={error?.message} disabled={isSubmitting}
                                                   value={field.value === null || field.value === undefined ? '' : String(field.value)}
                                                   onChange={(e) => {
                                                       const inputValue = e.target.value;
                                                       const numericValue = parseInputToNumberOrNull(inputValue, false);
                                                       field.onChange(numericValue);
                                                   }} /> )} />
                                </Grid>
                                <Grid size = {{xs:6, sm: 4}}>
                                    <Controller name={`activities.${index}.incline` as Path<WorkoutFormData>} control={control} render={({ field, fieldState: { error } }) => (
                                        <TextField {...field} label="Inclinação (%)" type="text" inputMode="decimal" variant="outlined" size="small" margin="dense" fullWidth sx={inputStyles}
                                                   error={!!error} helperText={error?.message} disabled={isSubmitting}
                                                   value={field.value === null || field.value === undefined ? '' : String(field.value).replace('.', ',')}
                                                   onChange={(e) => {
                                                       const inputValue = e.target.value;
                                                       const numericValue = parseInputToNumberOrNull(inputValue, true);
                                                       field.onChange(numericValue);
                                                   }} /> )} />
                                </Grid>
                            </Grid>
                        )}

                        <Controller name={`activities.${index}.notes` as Path<WorkoutFormData>} control={control} render={({ field }) => (
                            <TextField {...field} label="Notas da Atividade (Opcional)" variant="outlined" size="small" margin="dense" fullWidth multiline
                                       sx={{ ...inputStyles, mt: 1.5 }} error={!!errors.activities?.[index]?.notes} helperText={errors.activities?.[index]?.notes?.message}
                                       disabled={isSubmitting} value={field.value ?? ''} />
                        )}/>

                        {index < fields.length - 1 && (
                            <Divider sx={{ my: theme.spacing(3), borderColor: 'rgba(119, 204, 136, 0.15)' }} />
                        )}
                    </Box>
                );
            })}

            <Button type="button" startIcon={<AddCircleOutlineIcon />}
                    onClick={() => append(defaultActivityValue)}
                    sx={{ mt: 2.5, color: "#77cc88", borderColor: "rgba(119, 204, 136, 0.3)", '&:hover': { borderColor: "#77cc88", backgroundColor: "rgba(119, 204, 136, 0.05)" }}}
                    variant="outlined" disabled={isSubmitting}>
                Adicionar Atividade
            </Button>

            <Button type="submit" fullWidth variant="contained"
                    sx={{ mt: 3, mb: 2, bgcolor: "#77cc88", color: "#0a0b14", '&:hover': { bgcolor: "#66bb77" }, fontWeight: 600, py: 1.2 }}
                    disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} sx={{ color: "#0a0b14" }} /> : submitButtonText}
            </Button>
        </Box>
    );
};