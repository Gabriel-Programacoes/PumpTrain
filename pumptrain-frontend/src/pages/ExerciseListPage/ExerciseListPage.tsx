import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import apiClient from '../../api/apiClient';
import { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext'; // Importar para verificar login

// MUI Imports
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';


import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Interfaces (Ajuste conforme sua API)
interface Exercise {
    id: string | number;
    name: string;
    description?: string;
    muscleGroup?: string;
    equipment: string;
}
interface SnackbarState { open: boolean; message: string; severity: 'success' | 'error'; }

// --- Componente ---
const ExerciseListPage: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Hook para verificar autenticação

    // Estados da Lista
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null); // Erro ao buscar lista

    // Estados para Adicionar Exercício
    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [newExercise, setNewExercise] = useState({ name: '', description: '', muscleGroup: '' , equipment: ''});
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [addError, setAddError] = useState<string | null>(null); // Erro no dialog de adicionar

    // Estados para Excluir Exercício
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Estado para Snackbar (notificações)
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

    // --- Fetch Inicial ---
    useEffect(() => {
        fetchExercisesData();
    }, []);

    const fetchExercisesData = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const response = await apiClient.get<Exercise[]>('/api/exercises');
            setExercises(response.data);
        } catch (err: unknown) {
            // Lógica de tratamento de erro (similar às outras páginas)
            console.error("[ExerciseListPage] Erro ao buscar exercícios:", err);
            let errorMsg = "Falha ao carregar a lista de exercícios.";
            if (err instanceof AxiosError && err.response) {
                errorMsg = err.response.data?.message || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setFetchError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers Adicionar Exercício ---
    const handleOpenAddDialog = () => { setOpenAddDialog(true); };
    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewExercise({ name: '', description: '', muscleGroup: '', equipment: '' }); // Limpa form
        setAddError(null); // Limpa erro do dialog
    };
    const handleNewExerciseChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setNewExercise(prev => ({ ...prev, [name]: value }));
    };
    const handleAddExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Limpa erros anteriores
        setAddError(null); // Limpa erro específico do dialog também

        // --- Validação Client-Side Atualizada ---
        // Verifica os campos que são OBRIGATÓRIOS antes de enviar
        if (!newExercise.name.trim() || !newExercise.equipment.trim()) {
            setAddError('Nome e Equipamento campos obrigatórios.'); // Mostra erro no Dialog
            // Não iniciar o loading se a validação falhar
            return; // Interrompe a execução da função
        }
        // ----------------------------------------

        // Se passou na validação, inicia o processo de envio
        setIsAdding(true);

        try {
            const payload = {
                name: newExercise.name.trim(),
                description: newExercise.description.trim() || null,
                muscleGroup: newExercise.muscleGroup.trim() || null,
                equipment: newExercise.equipment.trim() || null, // Mantido do seu código
            };
            console.log("[ExerciseListPage] Enviando payload para /api/exercises:", payload); // Log do payload

            const response = await apiClient.post<Exercise>('/api/exercises', payload);

            // Sucesso
            setExercises(prev => [response.data, ...prev]);
            setSnackbar({ open: true, message: 'Exercício adicionado com sucesso!', severity: 'success' });
            handleCloseAddDialog(); // Fecha o dialog e limpa o form

        } catch (err: unknown) {
            console.error("[ExerciseListPage] Erro ao adicionar exercício:", err);
            let errorMsg = "Falha ao adicionar exercício.";
            if (err instanceof AxiosError && err.response) {
                errorMsg = err.response.data?.message || `Erro da API (${err.response.status})`;

            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setAddError(errorMsg); // Mostra erro no Dialog

        } finally {
            // Finaliza o estado de loading independentemente do resultado
            setIsAdding(false);
        }
    };

    // --- Handlers Excluir Exercício ---
    const handleOpenDeleteDialog = (exercise: Exercise) => {
        setExerciseToDelete(exercise);
        setOpenDeleteDialog(true);
    };
    const handleCloseDeleteDialog = () => {
        if(isDeleting) return;
        setOpenDeleteDialog(false);
        setTimeout(() => setExerciseToDelete(null), 150);
    };
    const handleDeleteExerciseSubmit = async () => {
        if (!exerciseToDelete) return;
        setIsDeleting(true);
        try {
            await apiClient.delete(`/api/exercises/${exerciseToDelete.id}`);
            setExercises(prev => prev.filter(ex => ex.id !== exerciseToDelete.id)); // Remove da lista
            setSnackbar({ open: true, message: 'Exercício excluído com sucesso!', severity: 'success' });
            handleCloseDeleteDialog();
        } catch (err: unknown) {
            console.error("[ExerciseListPage] Erro ao excluir exercício:", err);
            let errorMsg = "Falha ao excluir exercício.";
            if (err instanceof AxiosError && err.response) {
                errorMsg = err.response.data?.message || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setSnackbar({ open: true, message: errorMsg, severity: 'error' }); // Mostra erro no snackbar
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Handler Snackbar ---
    const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // --- Renderização ---
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Exercícios Disponíveis
                </Typography>
                {/* Botão Adicionar visível apenas se logado */}
                {isAuthenticated() && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}>
                        Novo Exercício
                    </Button>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
            ) : fetchError ? (
                <Alert severity="error" sx={{ mt: 2 }}>{fetchError}</Alert>
            ) : exercises.length === 0 ? (
                <Typography sx={{ textAlign: 'center', mt: 4 }}>Nenhum exercício encontrado.</Typography>
            ) : (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    {exercises.map((exercise, index) => (
                        <React.Fragment key={exercise.id}>
                            <ListItem
                                alignItems="flex-start"
                                // Botão Excluir visível apenas se logado
                                secondaryAction={ isAuthenticated() && (
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(exercise)} disabled={isDeleting}>
                                        <DeleteIcon />
                                    </IconButton>
                                )
                                }
                            >
                                <ListItemText
                                    primary={
                                        <React.Fragment>
                                            {exercise.name}
                                            {exercise.muscleGroup && (
                                                <Chip label={exercise.muscleGroup} size="small" sx={{ ml: 1.5 }} />
                                            )}
                                        </React.Fragment>
                                    }
                                    secondary={exercise.description || 'Sem descrição disponível.'}
                                />
                            </ListItem>
                            {index < exercises.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            )}

            {/* --- Dialog Adicionar Exercício --- */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
                <DialogTitle>Adicionar Novo Exercício</DialogTitle>
                <Box component="form" onSubmit={handleAddExerciseSubmit}>
                    <DialogContent>
                        {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
                        <TextField autoFocus margin="dense" id="name" name="name" label="Nome do Exercício" type="text" fullWidth variant="outlined" value={newExercise.name} onChange={handleNewExerciseChange} required disabled={isAdding}/>
                        <TextField margin="dense" id="description" name="description" label="Descrição" type="text" fullWidth multiline rows={3} variant="outlined" value={newExercise.description} onChange={handleNewExerciseChange} disabled={isAdding}/>
                        <TextField margin="dense" id="muscleGroup" name="muscleGroup" label="Grupo Muscular" type="text" fullWidth variant="outlined" value={newExercise.muscleGroup} onChange={handleNewExerciseChange} disabled={isAdding}/>
                        <TextField margin="dense" id="equipment" name="equipment" label="Equipamento" type="text" fullWidth variant="outlined" value={newExercise.equipment} onChange={handleNewExerciseChange} disabled={isAdding}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog} disabled={isAdding}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={isAdding}>
                            {isAdding ? <CircularProgress size={24} /> : 'Salvar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* --- Dialog Confirmar Exclusão --- */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    {/* Usando DialogContentText que estava comentado antes */}
                    <DialogContentText>
                        Tem certeza que deseja excluir o exercício "{exerciseToDelete?.name}"?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>Cancelar</Button>
                    <Button onClick={handleDeleteExerciseSubmit} color="error" disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={24} /> : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- Snackbar --- */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </Container>
    );
};

export default ExerciseListPage;