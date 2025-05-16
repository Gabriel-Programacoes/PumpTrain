import React, { useState, useMemo, ChangeEvent, FormEvent } from "react";

import {
    Box, Typography, Card, CardContent, Grid, Chip, Pagination,
    Container, Tabs, Tab, useMediaQuery, useTheme, TextField,
    InputAdornment, FormControl, Select, MenuItem as SelectMenuItem,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress,
    alpha,
    IconButton,
    SelectChangeEvent,
    FormLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { AxiosError } from 'axios';

// Hooks e Tipos
import { useExercisesQuery } from '../../hooks/useExercisesQuery';
import { useCreateExerciseMutation } from '../../hooks/useCreateExerciseMutation';
import { useDeleteExerciseMutation } from '../../hooks/useDeleteExerciseMutation';
import { Exercise } from "../../types/exercise";
import { useAuth } from "../../context/AuthContext";
import { a11yProps, TabPanelProps } from "../../utils/uiHelpers";

// Interface para a resposta de erro da API
interface ApiErrorResponse {
    timestamp?: string; status?: number; error?: string;
    message?: string; path?: string;
    fieldErrors?: Array<{ field: string; message: string }>;
}

// --- Componente TabPanel  ---
function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return ( <div role="tabpanel" hidden={value !== index} id={`exercise-tabpanel-${index}`} aria-labelledby={`exercise-tab-${index}`} {...other}> {value === index && <Box sx={{ pt: 3, px: {xs: 0, sm: 1} }}>{children}</Box>} </div> );
}
// --- Fim TabPanel ---

// --- Dados Estáticos para Filtros ---
const muscleGroups = ["Todos", "Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio", "Outro"];
const exerciseTypes = [
    { value: "all", label: "Todos os Tipos" },
    { value: "strength", label: "Força" },
    { value: "cardio", label: "Cardio" },
    { value: "flexibility", label: "Flexibilidade" },
];
// --- Fim Dados Estáticos para Filtros ---

// --- Componente ExerciseCard ---
interface ExerciseCardProps {
    exercise: Exercise;
    onDeleteRequest: (exercise: Exercise) => void;
    onClick?: (exercise: Exercise) => void;
}
const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onDeleteRequest }) => {
    const theme = useTheme();
    const { isAuthenticated } = useAuth();

    const getTypeColor = (type?: string): string => {
        switch (type?.toLowerCase()) {
            case "strength": return theme.palette.error.main;
            case "cardio": return theme.palette.info.main;
            case "flexibility": return theme.palette.success.main;
            default: return theme.palette.grey[700];
        }
    };
    const getTypeLabel = (type?: string): string => {
        switch (type?.toLowerCase()) {
            case "strength": return "Força";
            case "cardio": return "Cardio";
            case "flexibility": return "Flexibilidade";
            default: return type || "Geral";
        }
    };

    return (
        <Card
            sx={{
                height: "100%", display: "flex", flexDirection: "column", borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[6], borderColor: theme.palette.primary.main }
            }}
            // onClick={() => onClick?.(exercise)} // Se implementar visualização de detalhes
        >
            <Box
                sx={{
                    height: 180,
                    backgroundImage: `url(${exercise.imageUrl || `https://via.placeholder.com/300x180/${theme.palette.background.paper.replace('#','')}/${theme.palette.primary.main.replace('#','')}?text=${encodeURIComponent(exercise.name)}`})`,
                    backgroundSize: "cover", backgroundPosition: "center", position: "relative",
                    borderTopLeftRadius: theme.shape.borderRadius, borderTopRightRadius: theme.shape.borderRadius
                }}
            >
                {exercise.type && (
                    <Chip label={getTypeLabel(exercise.type)} size="small"
                          sx={{ position: "absolute", top: 12, right: 12,
                              backgroundColor: alpha(getTypeColor(exercise.type), 0.7),
                              color: theme.palette.getContrastText(getTypeColor(exercise.type)),
                              fontWeight: "bold", borderRadius: "4px" }} />
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom noWrap title={exercise.name}>
                    {exercise.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grupo: {exercise.muscleGroup}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2, flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {exercise.description || "Sem descrição."}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "auto", pt:1 }}>
                    {exercise.equipment && (<Chip label={exercise.equipment} size="small" variant="outlined" /> )}
                </Box>
                {isAuthenticated() && (
                    <Box sx={{mt: 1.5, display: 'flex', justifyContent: 'flex-end'}}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteRequest(exercise); }} color="error" aria-label={`Deletar ${exercise.name}`} title="Deletar">
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
// --- Fim ExerciseCard ---


// --- Componente Principal ---
const ExerciseListPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const { isAuthenticated } = useAuth();

    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: allExercises = [], isLoading: isLoadingExercises, isError: isFetchError, error: fetchErrorData } = useExercisesQuery();
    const createExerciseMutation = useCreateExerciseMutation();
    const deleteExerciseMutation = useDeleteExerciseMutation();

    const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
    const [newExerciseData, setNewExerciseData] = useState<Partial<Omit<Exercise, 'id'>>>({
        name: '', description: '', muscleGroup: 'Outro', equipment: '', type: 'strength', imageUrl: ''
    });
    const [addDialogError, setAddDialogError] = useState<string | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

    const exercisesPerPage = 12;

    const filteredExercises = useMemo(() => {
        if (!allExercises) return [];
        return allExercises.filter((exercise) => {
            const nameMatch = exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
            const groupMatch = selectedMuscleGroup === "all" || exercise.muscleGroup === selectedMuscleGroup;
            const currentTabValue = exerciseTypes[tabValue]?.value;
            const typeMatch = currentTabValue === "all" || exercise.type?.toLowerCase() === currentTabValue.toLowerCase();
            return nameMatch && groupMatch && typeMatch;
        });
    }, [allExercises, searchTerm, selectedMuscleGroup, tabValue]);

    const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
    const currentExercisesOnPage = useMemo(() => {
        const indexOfLastExercise = currentPage * exercisesPerPage;
        const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
        return filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
    }, [filteredExercises, currentPage, exercisesPerPage]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { setTabValue(newValue); setCurrentPage(1); };
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setSearchTerm(event.target.value); setCurrentPage(1); };
    const handleMuscleGroupChange = (event: SelectChangeEvent<string>) => { setSelectedMuscleGroup(event.target.value as string); setCurrentPage(1); };
    const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => { setCurrentPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); };

    const handleOpenAddDialog = () => { setOpenAddDialog(true); setAddDialogError(null); };
    const handleCloseAddDialog = () => { setOpenAddDialog(false); setNewExerciseData({ name: '', description: '', muscleGroup: 'Outro', equipment: '', type: 'strength', imageUrl: '' }); };
    const handleNewExerciseDataChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const { name, value } = event.target as { name?: string; value: unknown };
        if (name) {
            setNewExerciseData(prev => ({ ...prev, [name]: value as string }));
        }
    };

    const handleAddExerciseSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!newExerciseData.name?.trim() || !newExerciseData.muscleGroup?.trim()) {
            setAddDialogError('Nome e Grupo Muscular são obrigatórios.'); return;
        }
        createExerciseMutation.mutate(newExerciseData as Omit<Exercise, 'id'>, {
            onSuccess: () => handleCloseAddDialog(),
            onError: (err) => {
                const axiosErr = err as AxiosError<ApiErrorResponse>;
                setAddDialogError(axiosErr.response?.data?.message || axiosErr.message || "Erro ao criar exercício");
            }
        });
    };

    const handleOpenDeleteDialog = (exercise: Exercise) => { setExerciseToDelete(exercise); setOpenDeleteDialog(true); };
    const handleCloseDeleteDialog = () => { if(deleteExerciseMutation.isPending) return; setOpenDeleteDialog(false); setTimeout(() => setExerciseToDelete(null), 150);};
    const handleDeleteExerciseSubmit = async () => {
        if (!exerciseToDelete) return;
        deleteExerciseMutation.mutate(exerciseToDelete.id, {
            onSuccess: () => handleCloseDeleteDialog(),
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}> Biblioteca de Exercícios </Typography>
                    <Typography variant="body2" color="text.secondary"> Explore e gerencie os exercícios </Typography>
                </Box>
                {isAuthenticated() && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddDialog}> Novo Exercício </Button>
                )}
            </Box>

            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: isTablet && !isAuthenticated() ? 12 : 7, lg: isAuthenticated() ? 8: 9 }}>
                        <TextField fullWidth placeholder="Buscar por nome..." value={searchTerm} onChange={handleSearchChange}
                                   slotProps={{ input:
                                           {startAdornment: (
                                               <InputAdornment
                                                   position="start">
                                                   <SearchIcon
                                               sx={{color: "text.secondary"}}/>
                                               </InputAdornment>),
                                       }}}
                                   sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }, }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3, lg: isAuthenticated() ? 2 : 3 }}>
                        <FormControl fullWidth>
                            <Select value={selectedMuscleGroup} onChange={handleMuscleGroupChange} displayEmpty sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.action.hover, 0.5) }} >
                                {muscleGroups.map((group) => ( <SelectMenuItem key={group} value={group === "Todos" ? "all" : group}>{group}</SelectMenuItem> ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="exercise tabs" variant={isMobile ? "scrollable" : "fullWidth"} scrollButtons={isMobile ? "auto" : false}
                      sx={{ "& .MuiTab-root": {color: "text.secondary", "&.Mui-selected": { color: "primary.main", fontWeight: "bold" }}, "& .MuiTabs-indicator": { backgroundColor: "primary.main" } }} >
                    {exerciseTypes.map((type, index) => ( <Tab key={type.value} label={type.label} {...a11yProps(index)} /> ))}
                </Tabs>
            </Box>

            {isLoadingExercises ? (
                <Grid container spacing={3}>
                    {Array.from(new Array(exercisesPerPage)).map((_, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`skel-${index}`}>
                            {/* Skeleton do Card */}
                        </Grid>
                    ))}
                </Grid>
            ) : isFetchError ? (
                <Alert severity="error">{(fetchErrorData as Error)?.message || "Erro ao buscar exercícios."}</Alert>
            ) : (
                <>
                    {exerciseTypes.map((type, index) => (
                        <TabPanel key={type.value} value={tabValue} index={index}>
                            {currentExercisesOnPage.length > 0 ? (
                                <Grid container spacing={{xs: 2, sm: 3}}>
                                    {currentExercisesOnPage.map((exercise) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exercise.id}>
                                            <ExerciseCard exercise={exercise} onDeleteRequest={handleOpenDeleteDialog} />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 8 }}>
                                    <FitnessCenterIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary"> Nenhum exercício encontrado </Typography>
                                    <Typography variant="body2" color="text.secondary"> Tente ajustar seus filtros ou termos de busca </Typography>
                                </Box>
                            )}
                        </TabPanel>
                    ))}
                    {!isLoadingExercises && filteredExercises.length > exercisesPerPage && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb:2 }}>
                            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size={isTablet ? "small" : "medium"} />
                        </Box>
                    )}
                </>
            )}

            {/* Dialog Adicionar Exercício */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
                <DialogTitle>Adicionar Novo Exercício</DialogTitle>
                <Box component="form" onSubmit={handleAddExerciseSubmit}>
                    <DialogContent>
                        {addDialogError && <Alert severity="error" sx={{ mb: 2 }}>{addDialogError}</Alert>}
                        <TextField autoFocus margin="dense" name="name" label="Nome do Exercício" fullWidth value={newExerciseData.name || ''} onChange={handleNewExerciseDataChange} required disabled={createExerciseMutation.isPending} />
                        <TextField margin="dense" name="muscleGroup" label="Grupo Muscular" fullWidth value={newExerciseData.muscleGroup || ''} onChange={handleNewExerciseDataChange} required disabled={createExerciseMutation.isPending} />
                        <TextField margin="dense" name="equipment" label="Equipamento" fullWidth value={newExerciseData.equipment || ''} onChange={handleNewExerciseDataChange} disabled={createExerciseMutation.isPending} />
                        <TextField margin="dense" name="description" label="Descrição" fullWidth multiline rows={3} value={newExerciseData.description || ''} onChange={handleNewExerciseDataChange} disabled={createExerciseMutation.isPending} />
                        <FormControl fullWidth margin="dense" disabled={createExerciseMutation.isPending}>
                            <FormLabel component="legend" sx={{fontSize: '0.8rem', mb: 0.5}}>Tipo de Exercício</FormLabel>
                            <Select name="type" value={newExerciseData.type || 'strength'} onChange={handleNewExerciseDataChange as never /* TODO: Type Select onChange properly */}>
                                {exerciseTypes.filter(et => et.value !== 'all').map(et => <SelectMenuItem key={et.value} value={et.value}>{et.label}</SelectMenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField margin="dense" name="imageUrl" label="URL da Imagem" type="url" fullWidth value={newExerciseData.imageUrl || ''} onChange={handleNewExerciseDataChange} disabled={createExerciseMutation.isPending} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog} disabled={createExerciseMutation.isPending}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={createExerciseMutation.isPending}> {createExerciseMutation.isPending ? <CircularProgress size={24} /> : 'Salvar'} </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Dialog Confirmar Exclusão */}
            {exerciseToDelete && (
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogContent> <Typography>Tem certeza que deseja excluir o exercício "{exerciseToDelete.name}"?</Typography> </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} disabled={deleteExerciseMutation.isPending}>Cancelar</Button>
                        <Button onClick={handleDeleteExerciseSubmit} color="error" disabled={deleteExerciseMutation.isPending}> {deleteExerciseMutation.isPending ? <CircularProgress size={24} /> : 'Excluir'} </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default ExerciseListPage;