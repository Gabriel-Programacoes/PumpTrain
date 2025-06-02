import React, { useState, useMemo, ChangeEvent } from "react";

import {
    Box, Typography, Card, CardContent, Grid, Chip, Pagination,
    Container, Tabs, Tab, useMediaQuery, useTheme, TextField,
    InputAdornment, FormControl, Select, MenuItem as SelectMenuItem,
    Alert, CircularProgress,
    alpha,
    IconButton,
    SelectChangeEvent,
    Button, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import DeleteIcon from "@mui/icons-material/Delete";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Hooks e Tipos
import { useExercisesQuery } from '../../hooks/useExercisesQuery';
import { useDeleteExerciseMutation } from '../../hooks/useDeleteExerciseMutation';
import { Exercise } from "../../types/exercise";
import { useAuth } from "../../context/AuthContext";
import { a11yProps, TabPanelProps } from "../../utils/uiHelpers";

// --- Componente TabPanel ---
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

// --- FUNÇÕES AUXILIARES PARA IMAGENS E MAPAS ---
const normalizeStringForFilename = (str: string): string => {
    if (!str) return 'default-key';
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[/\\?%*:|"<>(),]/g, '');
};

const basePath = '/assets/images/';
const ultimateDefaultLocalImage = `${basePath}default-exercise.png`;


// --- Componente ExerciseCard ---
interface ExerciseCardProps {
    exercise: Exercise;
    onDeleteRequest: (exercise: Exercise) => void;
}
const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onDeleteRequest }) => {
    const theme = useTheme();
    const { isAuthenticated } = useAuth();

    const getTypeColor = (type?: string): string => {
        const lowerType = type?.toLowerCase();
        switch (lowerType) {
            case "strength": return theme.palette.error.main;
            case "cardio": return theme.palette.info.main;
            case "flexibility": return theme.palette.success.main;
            default: return theme.palette.grey[700];
        }
    };
    const getTypeLabel = (type?: string): string => {
        const lowerType = type?.toLowerCase();
        switch (lowerType) {
            case "strength": return "Força";
            case "cardio": return "Cardio";
            case "flexibility": return "Flexibilidade";
            default: return type || "Geral";
        }
    };

    const getSmallExerciseTypeIcon = (exerciseType?: string) => {
        const type = exerciseType?.toLowerCase();
        const iconColor = getTypeColor(exerciseType);
        switch (type) {
            case "strength":
                return <FitnessCenterIcon sx={{ color: iconColor, mr: 1, fontSize: '1.25rem' }} />;
            case "cardio":
                return <DirectionsRunIcon sx={{ color: iconColor, mr: 1, fontSize: '1.25rem' }} />;
            case "flexibility":
                return <SelfImprovementIcon sx={{ color: iconColor, mr: 1, fontSize: '1.25rem' }} />;
            default:
                return <HelpOutlineIcon sx={{ color: iconColor, mr: 1, fontSize: '1.25rem' }} />;
        }
    };

// Chave: exercicio-normalizado. Valor: Nome exato do arquivo + extensão.
    const exerciseNameImageMap: { [key: string]: string } = {
        'supino-reto-com-barra': 'supino-reto.png',
        'corrida-na-esteira': 'esteira.png',
        'agachamento-livre-com-barra': 'agachamento-livre.png',
        'levantamento-terra': 'levantamento-terra.png',
        'rosca-direta-com-barra': 'rosca-direta.png',
        'desenvolvimento-militar-com-barra': 'desenvolvimento-militar.png',
        'barra-fixa-pull-up': 'barra-fixa.png',
        'afundo-lunge': 'afundo.png',
        'prancha-abdominal-plank': 'prancha.png',
        'bicicleta-ergometrica': 'bicicleta.png',
        'remada-curvada-com-barra': 'remada-curvada.png',
        'triceps-testa-com-barra': 'triceps-testa.png',
        'pular-corda': 'corda.png',
        'flexao-de-braco-push-up': 'flexao.png',
        'eliptico-transport': 'eliptico.png',
    };

// Função para buscar imagem baseada APENAS no NOME do exercício
    const getExercisePreviewImagePathByName = (
        exerciseName?: string | null
    ): string => {
        // console.log(`[getExercisePreviewImagePathByName] Tentando para o nome: ${exerciseName}`);

        if (!exerciseName || exerciseName.trim() === '') {
            // console.log(`[getExercisePreviewImagePathByName] Nome não fornecido, usando imagem default: ${ultimateDefaultLocalImage}`);
            return ultimateDefaultLocalImage;
        }

        const normalizedExerciseName = normalizeStringForFilename(exerciseName);

        if (exerciseNameImageMap[normalizedExerciseName]) {
            const imageName = exerciseNameImageMap[normalizedExerciseName];
            // console.log(`[getExercisePreviewImagePathByName] Nome '${normalizedExerciseName}' mapeado para imagem: ${imageName}`);
            return `${basePath}${imageName}`;
        }

        // console.log(`[getExercisePreviewImagePathByName] Nome de exercício '${normalizedExerciseName}' não mapeado, usando imagem default: ${ultimateDefaultLocalImage}`);
        return ultimateDefaultLocalImage;
    };

    const imagePath = getExercisePreviewImagePathByName(exercise.name);

    return (
        <Card
            sx={{
                height: "100%", display: "flex", flexDirection: "column", borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[6], borderColor: theme.palette.primary.main }
            }}
        >
            <Box
                sx={{
                    height: 180,
                    backgroundImage: `url(${imagePath})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundColor: alpha(theme.palette.action.hover, 0.1),
                    position: "relative",
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                }}
            >
                {exercise.exerciseType && (
                    <Chip
                        label={getTypeLabel(exercise.exerciseType)}
                        size="small"
                        sx={{
                            position: "absolute", top: 12, right: 12,
                            backgroundColor: alpha(getTypeColor(exercise.exerciseType), 0.85),
                            color: theme.palette.getContrastText(getTypeColor(exercise.exerciseType)),
                            fontWeight: "bold", borderRadius: "4px",
                        }}
                    />
                )}
            </Box>
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getSmallExerciseTypeIcon(exercise.exerciseType)}
                    <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom noWrap title={exercise.name}>
                        {exercise.name}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grupo: {exercise.muscleGroup}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 2, flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {exercise.description || "Sem descrição."}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: "auto", pt:1 }}>
                    {/* Chip para Equipamento */}
                    {exercise.equipment && (
                        <Chip label={exercise.equipment} size="small" variant="outlined" />
                    )}
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
    const deleteExerciseMutation = useDeleteExerciseMutation();

    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

    const exercisesPerPage = 12;

    const filteredExercises = useMemo(() => {
        if (!allExercises) return [];
        return allExercises.filter((exercise) => {
            const nameMatch = exercise.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
            const groupMatch = selectedMuscleGroup === "all" || exercise.muscleGroup === selectedMuscleGroup;
            const currentTabValue = exerciseTypes[tabValue]?.value;
            const typeMatch = currentTabValue === "all" || exercise.exerciseType?.toLowerCase() === currentTabValue.toLowerCase();
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
    const handleMuscleGroupChange = (event: SelectChangeEvent
    ) => { setSelectedMuscleGroup(event.target.value as string); setCurrentPage(1); };
    const handlePageChange = (_event: ChangeEvent<unknown>, value: number) => { setCurrentPage(value); window.scrollTo({ top: 0, behavior: "smooth" }); };

    const handleOpenDeleteDialog = (exercise: Exercise) => { setExerciseToDelete(exercise); setOpenDeleteDialog(true); };
    const handleCloseDeleteDialog = () => { if(deleteExerciseMutation.isPending) return; setOpenDeleteDialog(false); setTimeout(() => setExerciseToDelete(null), 150);};
    const handleDeleteExerciseSubmit = async () => {if (!exerciseToDelete) return; deleteExerciseMutation.mutate(exerciseToDelete.id, {onSuccess: () => handleCloseDeleteDialog(),});};

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 3, textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}> Biblioteca de Exercícios </Typography>
                <Typography variant="body2" color="text.secondary"> Explore e gerencie seus exercícios </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{xs: 12, md: 8, lg: 9}}>
                        <TextField
                            fullWidth
                            placeholder="Buscar por nome..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            slotProps={{ input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{color: "text.secondary"}}/>
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                        />
                    </Grid>
                    <Grid size={{xs: 12, md: 4, lg: 3}}>
                        <FormControl fullWidth>
                            <Select value={selectedMuscleGroup} onChange={handleMuscleGroupChange} displayEmpty sx={{ borderRadius: 1, bgcolor: alpha(theme.palette.background.default, 0.5) }} >
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
                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={`skel-${index}`}>
                            <Skeleton variant="rounded" sx={{ height: 340, borderRadius: 1 }}/>
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
                                        <Grid size={{xs: 12, sm: 6, md: 4, lg: 3}} key={exercise.id}>
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


            {isAuthenticated() && exerciseToDelete && (
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