import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RepeatIcon from  '@mui/icons-material/Repeat';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import CheckCircleOutlineIcon from  '@mui/icons-material/CheckCircleOutline';

// Hooks, Tipos, etc.
import { useWorkoutDetailQuery } from '../../hooks/useWorkoutDetailQuery';
import { useDeleteWorkoutMutation } from '../../hooks/useDeleteWorkoutMutation';
import { Activity } from '../../types/activity';
import {useCompleteWorkoutMutation} from "../../hooks/useCompleteWorkoutMutation.ts";

// Formatador de data
const formatDate = (
    dateString: string | null | undefined,
    formatPattern: string = 'DD/MM/YYYY HH:mm' // Define um formato padrão
): string => {
    if (!dateString) {
        console.warn("formatDate: Recebeu string de data vazia ou nula.");
        return 'Data inválida';
    }
    try {
        const date = dayjs(dateString); // dayjs lida bem com 'YYYY-MM-DD' da API
        if (!date.isValid()) {
            console.warn("formatDate: Data inválida criada a partir da string:", dateString);
            return 'Data inválida';
        }
        // Usa o formatPattern recebido ou o padrão
        return date.format(formatPattern);
    } catch (e) {
        console.error("Erro inesperado ao formatar data:", dateString, e);
        return 'Erro na data';
    }
};

const WorkoutDetailPage: React.FC = () => {
    const { workoutId } = useParams<{ workoutId: string }>();
    const navigate = useNavigate();
    // const { showSnackbar } = useSnackbar(); Usar apenas se necessário (ex: botão editar)
    const { data: workout, isLoading, isError, error } = useWorkoutDetailQuery(workoutId);
    const deleteMutation = useDeleteWorkoutMutation();
    const completeWorkoutMutation = useCompleteWorkoutMutation();


    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleDeleteClick = () => setOpenDeleteDialog(true);
    const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);
    const handleConfirmDelete = () => {
        if (workoutId) {
            deleteMutation.mutate(workoutId, {
                onSuccess: () => {
                    handleCloseDeleteDialog(); // Fecha dialog no sucesso
                    navigate('/dashboard');
                }
            });
        } else {
            console.warn("Tentativa de deletar sem workoutId");
            handleCloseDeleteDialog();
        }
    };

    const handleEditClick = () => {
        if (workoutId) {
            navigate(`/workouts/${workoutId}/edit`);
        }
    };

    const handleMarkAsCompleted = () => {
        if (workoutId && workout && !workout.completedAt) {
            completeWorkoutMutation.mutate(workoutId, {})
        }
    }

    if (isLoading) {
        return ( <Container maxWidth="md" sx={{ textAlign: 'center', mt: 4 }}> <CircularProgress /> </Container> );
    }

    if (isError) {
        let status: number | undefined;
        let message: string = 'Erro desconhecido ao carregar treino.';
        if (error instanceof Error) {
            message = error.message;
            if (axios.isAxiosError(error) && error.response) {
                status = error.response.status;
            }
        }
        const errorMessage = status === 404
            ? `Treino com ID ${workoutId} não encontrado.`
            : `Erro ao carregar treino: ${message}`;
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{errorMessage}</Alert>
                <Button component={RouterLink} to="/dashboard" sx={{ mt: 2 }}> Voltar </Button>
            </Container>
        );
    }

    if (!workout) {
        return ( <Container maxWidth="md" sx={{ mt: 4 }}> <Alert severity="warning">Dados do treino não encontrados.</Alert> </Container> );
    }

    // Renderização Principal
    return (
        <Container maxWidth="md">
            {/* 1. Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 2, mb: 2 }}>
                {/* Ajuste 'to' se sua lista principal de treinos for em /dashboard */}
                <Link component={RouterLink} underline="hover" color="inherit" to="/dashboard"> Meus Treinos </Link>
                <Typography color="text.primary">
                    {workout.name || `Treino de ${formatDate(workout.sessionDate, 'DD/MM/YYYY')}`}
                </Typography>
            </Breadcrumbs>

            {/* 2. Cabeçalho do Treino */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', // Alterado para flex-start para melhor alinhamento vertical
                    flexDirection: { xs: 'column', sm: 'row' }, // Empilha em telas pequenas
                    gap: 2 // Espaço entre título/info e botões
                }}>
                    <Box sx={{flexGrow: 1}}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {workout.name || 'Detalhes do Treino'}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Planejado para: {formatDate(workout.sessionDate, 'DD/MM/YYYY')}
                        </Typography>
                        {/* Exibir Status de Conclusão */}
                        {workout.completedAt ? (
                            <Chip
                                icon={<CheckCircleOutlineIcon />}
                                label={`Concluído em: ${formatDate(workout.completedAt)}`}
                                color="success"
                                variant="outlined"
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        ) : (
                            <Chip
                                label="Pendente"
                                color="warning"
                                variant="outlined"
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        )}
                    </Box>
                    <Stack direction={{xs: 'column', sm: 'row' }} spacing={1} sx={{ width: {xs: '100%', sm: 'auto'} }}> {/* Stack ocupa largura total em xs */}
                        {/* Botão Marcar como Concluído */}
                        {!workout.completedAt && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={handleMarkAsCompleted}
                                disabled={completeWorkoutMutation.isPending}
                                fullWidth // Opcional: para ocupar largura em mobile se empilhado
                            >
                                {completeWorkoutMutation.isPending ? <CircularProgress size={24} color="inherit"/> : 'Marcar Concluído'}
                            </Button>
                        )}
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditClick} fullWidth> Editar</Button>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteClick} disabled={deleteMutation.isPending} fullWidth> Deletar </Button>
                    </Stack>
                </Box>
                {workout.notes && (
                    <>
                        <Divider sx={{ my: 2 }}/>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{workout.notes}</Typography>
                    </>
                )}
            </Paper>

            {/* 3. Lista de Atividades */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}> Exercícios do Treino </Typography>
            {workout.activities && workout.activities.length > 0 ? (
                <List disablePadding>
                    {workout.activities.map((activity: Activity, index) => (
                        <Paper variant="outlined" sx={{ mb: 2, p: 2 }} key={activity.id ?? index}>
                            <Typography variant="h6" component="div" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <FitnessCenterIcon sx={{ mr: 1, color: 'primary.main' }} />
                                {/* Exibe ID do exercício. Implementar busca de nome será uma melhoria futura. */}
                                {` ${activity.exerciseName}`}
                            </Typography>
                            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mb: activity.notes ? 1 : 0, alignItems: 'center' }}>
                                {/* Usando ícones padrão (RepeatIcon, MonitorWeightIcon) */}
                                {activity.sets != null && <Chip icon={<RepeatIcon />} label={`Séries: ${activity.sets}`} size="small" variant="outlined" />}
                                {activity.repetitions != null && <Chip icon={<RepeatIcon />} label={`Reps: ${activity.repetitions}`} size="small" variant="outlined" />}
                                {activity.weightKg != null && <Chip icon={<MonitorWeightIcon />} label={`Peso: ${activity.weightKg} kg`} size="small" variant="outlined" />}
                            </Stack>
                            {activity.notes && ( <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}> <i>Nota: {activity.notes}</i> </Typography> )}
                        </Paper>
                    ))}
                </List>
            ) : ( <Typography sx={{ mt: 2 }}>Nenhuma atividade registrada.</Typography> )}

            {/* Dialog de Confirmação de Deleção (Mantido) */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} aria-labelledby="delete-dialog-title">
                <DialogTitle id="delete-dialog-title">Confirmar Deleção</DialogTitle>
                <DialogContent><DialogContentText> Tem certeza que deseja deletar este treino? Esta ação não pode ser desfeita. </DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={deleteMutation.isPending}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? <CircularProgress size={24} color="inherit"/> : 'Deletar'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default WorkoutDetailPage;