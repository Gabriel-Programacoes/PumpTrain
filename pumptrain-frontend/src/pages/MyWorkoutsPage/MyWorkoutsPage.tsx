import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    InputAdornment,
    TextField,
    Chip,
    Menu,
    MenuItem,
    Button,
    useTheme,
    Fab,
    Skeleton,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress, CardActions
} from "@mui/material";
import {
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FitnessCenter as FitnessCenterIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Hooks e Tipos
import { useWorkoutsQuery } from "../../hooks/useWorkoutsQuery";
import { Workout } from "../../types/workout";
import { useDeleteWorkoutMutation } from "../../hooks/useDeleteWorkoutMutation";

// Funções utilitárias
const formatDate = (d: string | null | undefined) => d ? new Date(d+'T00:00:00Z').toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'}) : 'N/A';

// --- Styled components  ---
const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    transition: "all 0.3s ease",
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: theme.shadows[4],
        borderColor: theme.palette.primary.main,
    },
}));

const WorkoutImagePlaceholder = styled(Box)(({ theme }) => ({
    height: 140,
    overflow: "hidden",
    position: "relative",
    backgroundColor: theme.palette.action.hover,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

// --- Fim Styled components ---

// --- Componente Principal ---
const MyWorkoutsPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Estado para busca
    const [searchTerm, setSearchTerm] = useState("");

    // Estado para Menu de Ações do Card
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // Estado para Dialog de Deleção
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Hooks de dados e mutação
    const { data: workouts = [], isLoading, isError} = useWorkoutsQuery();
    const deleteMutation = useDeleteWorkoutMutation();

    // Handlers do Menu de Ações
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workout: Workout) => {
        console.log("Abrindo menu para:", workout);
        setAnchorEl(event.currentTarget);
        setSelectedWorkout(workout);
        console.log("setSelectedWorkout foi chamado com:", workout);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handlers do Dialog de Deleção
    const handleDeleteRequest = () => {
        if (selectedWorkout) {
            setOpenDeleteDialog(true);
        }
        handleMenuClose();
    };
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };
    const handleConfirmDelete = () => {
        console.log("MyWorkoutsPage: Tentando confirmar deleção. Selecionado:", selectedWorkout);
        if (selectedWorkout?.id) {
            const idToDelete = selectedWorkout.id;
            console.log("MyWorkoutsPage: ID a deletar:", idToDelete);
            deleteMutation.mutate(idToDelete, {
                onSuccess: () => {
                    console.log("MyWorkoutsPage: Mutate onSuccess (callback local) chamado para ID:", idToDelete);
                    handleCloseDeleteDialog();
                },
                onError: (error) => {
                    console.error("MyWorkoutsPage: Mutate onError (callback local) para ID:", idToDelete, error);
                    handleCloseDeleteDialog();
                }
            });
        } else {
            console.error("MyWorkoutsPage: Confirmar deleção falhou - selectedWorkout ou ID ausente.");
            handleCloseDeleteDialog();
        }
    };

    const handleViewDetails = (id: string | number) => {
        navigate(`/workouts/${id}`);
    };

    // Handler de Edição
    const handleEditRequest = () => {
        if (selectedWorkout?.id) {
            navigate(`/workouts/${selectedWorkout.id}/edit`);
        }
        handleMenuClose();
    }

    // Handler da Busca
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Filtragem (simplificada para buscar apenas pelo nome)
    const filteredWorkouts = workouts.filter((workout) =>
        (workout.name || `Treino de ${formatDate(workout.sessionDate)}`)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // Handlers de Navegação
    const navigateToCreate = () => {
        navigate('/workouts/new');
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
            {/* Header (mantido) */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    Meus Treinos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Gerencie e acompanhe seus treinos personalizados
                </Typography>
            </Box>

            {/* Search and Filter */}
            <Box sx={{ mb: 3, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar treinos por nome ou data..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{
                        flexGrow: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 1,
                            backgroundColor: theme.palette.background.default,
                            borderColor: theme.palette.divider,
                            height: 40,
                        },
                    }}
                    slotProps={{ input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{color: "text.secondary"}}/>
                                </InputAdornment>
                            ),
                        }
                    }}
                />
                <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={navigateToCreate}
                        sx={{width: 150, height: 40, borderRadius: 1 }}
                    >
                        Criar treino
                    </Button>
                </Box>
            </Box>

            {/* --- Workout Grid --- */}
            {isLoading && (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={n}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: theme.shape.borderRadius }}/>
                        </Grid>
                    ))}
                </Grid>
            )}

            {isError && (
                <Alert severity="error">Erro ao carregar treinos.</Alert>
            )}

            {!isLoading && !isError && filteredWorkouts.length === 0 && (
                <Typography sx={{ textAlign: 'center', mt: 5, fontStyle: 'italic' }}>
                    {searchTerm ? 'Nenhum treino encontrado para sua busca.' : 'Você ainda não registrou nenhum treino.'}
                </Typography>
            )}

            {!isLoading && !isError && filteredWorkouts.length > 0 && (
                <Grid container spacing={3}>
                    {filteredWorkouts.map((workout) => (
                        <Grid size={{xs: 12, sm: 6, md: 4}} key={workout.id}>
                            <WorkoutCard workout={workout} onMenuOpen={handleMenuOpen} onViewDetails={handleViewDetails} />
                        </Grid>
                    ))}
                </Grid>
            )}
            {/* --- Fim Workout Grid --- */}


            {/* Mobile FAB */}
            <Box sx={{ display: { xs: "block", sm: "none" }, position: "fixed", right: 16, bottom: 16 }}>
                <Fab color="primary" aria-label="add" onClick={navigateToCreate}>
                    <AddIcon />
                </Fab>
            </Box>

            {/* Workout Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{paper: {
                        sx: {
                            mt: 1,
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`
                        }
                    } }}
            >
                <MenuItem onClick={handleEditRequest}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Editar treino
                </MenuItem>
                <MenuItem onClick={handleDeleteRequest}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                    Excluir treino
                </MenuItem>
            </Menu>

            {/* Dialog de Confirmação */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmar</DialogTitle>
                <DialogContent><DialogContentText> Tem certeza que deseja deletar o treino "{selectedWorkout?.name}"? </DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} disabled={deleteMutation.isPending}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? <CircularProgress size={24}/> : 'Deletar'}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};


// --- Componente WorkoutCard ---
interface WorkoutCardProps {
    workout: Workout;
    onMenuOpen: (event: React.MouseEvent<HTMLElement>, workout: Workout) => void;
    onViewDetails: (id: string | number) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onMenuOpen, onViewDetails }) => {
    const theme = useTheme();
    return (
        <StyledCard>
            <WorkoutImagePlaceholder>
                <FitnessCenterIcon sx={{ fontSize: 50, color: theme.palette.primary.light }} />
            </WorkoutImagePlaceholder>
            <CardContent sx={{ p: 2, flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
                        {workout.name || `Treino`}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={(e) => onMenuOpen(e, workout)}
                        sx={{ color: "text.secondary", mt: -0.5, mr: -1 }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
                {/* Exibe data como Chip */}
                <Chip
                    label={formatDate(workout.sessionDate)}
                    size="small"
                    sx={{
                        backgroundColor: "action.selected", // Cor sutil do tema
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        mb: 2,
                    }}
                />
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => onViewDetails(workout.id)}
                >
                    Ver Detalhes
                </Button>
            </CardActions>
        </StyledCard>
    );
};

export default MyWorkoutsPage;