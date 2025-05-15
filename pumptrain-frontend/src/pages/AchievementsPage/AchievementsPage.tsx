// src/pages/AchievementsPage/AchievementsPage.tsx (Completo com correção da Barra de Progresso)
import React, { useState, useMemo } from "react";
import {
    Box, Typography, Card, CardContent, Grid, Chip, LinearProgress,
    Avatar, Container, Tabs, Tab, Divider, Button,
    useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
    DialogActions, Skeleton, Alert, alpha
} from "@mui/material";
import {
    EmojiEvents as TrophyIcon,
    CalendarMonth as CalendarIcon,
    Lock as LockIcon,
    Share as ShareIcon,
    Celebration as CelebrationIcon,
} from "@mui/icons-material";

// Hooks e Tipos
import { useAllAchievementsQuery } from '../../hooks/useAllAchievementsQuery';
import { FullAchievement } from "../../types/achievements";

// Utilitários
import { a11yProps, mapIconNameToComponent } from "../../utils/uiHelpers";
import { getRarityColor } from "../../utils/styleHelpers";
import { formatDate } from "../../utils/formatters";

// --- Componente AchievementCard ---
interface AchievementCardProps {
    achievement: FullAchievement;
    onSelect: (achievement: FullAchievement) => void;
}
const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onSelect }) => {
    const theme = useTheme();

    // Lógica da Barra de Progresso
    const hasProgressData = achievement.current != null && achievement.total != null && achievement.total > 0;
    const progressPercentage = hasProgressData
        ? Math.min(100, (achievement.current! / achievement.total!) * 100)
        : achievement.progress ?? 0; // Fallback para o campo progress (0-100)

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%", display: 'flex', flexDirection: 'column',
                cursor: "pointer", transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: theme.shadows[4], borderColor: 'primary.main' },
                position: "relative", overflow: "visible",
                opacity: achievement.unlocked ? 1 : 0.65,
                backgroundColor: achievement.unlocked ? alpha(theme.palette.primary.main, 0.05) : undefined,
            }}
            onClick={() => onSelect(achievement)}
        >
            {!achievement.unlocked && (
                <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1, borderRadius: 'inherit' }}>
                    <LockIcon sx={{ fontSize: 32, color: "rgba(255, 255, 252, 0.5)" }} />
                </Box>
            )}
            <Box sx={{ position: "absolute", top: -12, right: 12, zIndex: 2 }}>
                {/* Removido XP conforme solicitado anteriormente */}
                {/* <Chip label={`${achievement.xp} XP`} size="small" ... /> */}
            </Box>
            <CardContent sx={{ p: {xs: 2, sm: 3}, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: achievement.unlocked ? "primary.main" : theme.palette.action.disabledBackground, color: achievement.unlocked ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.action.disabled, mr: 2, width: 48, height: 48, fontSize: '1.5rem' }} >
                        {mapIconNameToComponent(achievement.iconName)}
                    </Avatar>
                    <Box sx={{flexGrow: 1}}> <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}> {achievement.title} </Typography> <Chip label={achievement.rarity} size="small" sx={{ bgcolor: getRarityColor(achievement.rarity), color: theme.palette.getContrastText(getRarityColor(achievement.rarity)), textTransform: "uppercase", fontSize: "0.6rem", fontWeight: "bold", height: 20, }}/> </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px', flexGrow: 1 }}> {achievement.description} </Typography>

                {/* Exibição da Barra de Progresso CORRIGIDA */}
                {hasProgressData && !achievement.unlocked && (
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Progresso</Typography>
                            <Typography variant="caption" color="text.secondary">{achievement.current}/{achievement.total}</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: "action.disabledBackground",
                                "& .MuiLinearProgress-bar": {
                                    bgcolor: "primary.light" // Ou theme.palette.primary.main
                                },
                            }}
                        />
                    </Box>
                )}
                {/* Fim Exibição da Barra de Progresso */}

                {achievement.unlocked && achievement.date && ( <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}><CalendarIcon sx={{ fontSize: 14, color: "text.secondary", mr: 0.5 }} /><Typography variant="caption" color="text.secondary">Conquistado em {formatDate(achievement.date, 'DD/MM/YY')}</Typography></Box> )}
            </CardContent>
        </Card>
    );
};
// --- Fim AchievementCard ---


// --- Componente AchievementDialog ---
const AchievementDialog = ({ open, achievement, onClose }: { open: boolean; achievement: FullAchievement | null; onClose: () => void }) => {
    const theme = useTheme();
    if (!achievement) return null;

    // Lógica da Barra de Progresso para o Dialog
    const hasProgressData = achievement.current != null && achievement.total != null && achievement.total > 0;
    const progressPercentage = hasProgressData
        ? Math.min(100, (achievement.current! / achievement.total!) * 100)
        : achievement.progress ?? 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "background.paper", backgroundImage: "radial-gradient(circle at top right, rgba(119, 204, 136, 0.05), transparent 70%)", border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius } }} >
            <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                <Avatar sx={{ bgcolor: achievement.unlocked ? "primary.main" : theme.palette.action.disabledBackground, color: achievement.unlocked ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.action.disabled, width: 80, height: 80, mx: "auto", mb: 2, boxShadow: achievement.unlocked ? `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}` : "none", fontSize: '2.5rem' }} >
                    {mapIconNameToComponent(achievement.iconName)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">{achievement.title}</Typography>
                <Chip label={achievement.rarity} size="small" sx={{ bgcolor: getRarityColor(achievement.rarity), color: theme.palette.getContrastText(getRarityColor(achievement.rarity)), textTransform: "uppercase", fontSize: "0.6rem", fontWeight: "bold", height: 20, mt: 1, }} />
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
                <Typography variant="body1" sx={{ textAlign: "center", mb: 3, color: 'text.secondary' }}>{achievement.description}</Typography>
                <Divider sx={{ my: 2, borderColor: "divider" }} />
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{xs: 6}}> <Typography variant="caption" color="text.secondary">Categoria</Typography> <Typography variant="body2" fontWeight="medium">{achievement.category}</Typography> </Grid>
                    {/* Removido XP do Dialog */}
                    {/* <Grid size={{xs: 6}}> <Typography variant="caption" color="text.secondary">Pontos XP</Typography> <Typography variant="body2" fontWeight="medium">{achievement.xp} XP</Typography> </Grid> */}
                </Grid>

                {/* Exibição da Barra de Progresso no Dialog CORRIGIDA */}
                {hasProgressData && !achievement.unlocked && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Progresso</Typography>
                            <Typography variant="caption" color="text.secondary">{achievement.current}/{achievement.total}</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            sx={{ height: 8, borderRadius: 1, bgcolor: "action.disabledBackground", "& .MuiLinearProgress-bar": { bgcolor: "primary.light" } }}/>
                    </Box>
                )}
                {/* Fim Exibição da Barra de Progresso no Dialog */}

                {achievement.unlocked ? (
                    <Box sx={{ textAlign: "center", mt: 3 }}> <CelebrationIcon sx={{ color: "primary.main", fontSize: 32, mb: 1 }} /> <Typography variant="body2" color="text.secondary">Você conquistou esta realização em {achievement.date ? formatDate(achievement.date, 'DD/MM/YY') : 'data não registrada'}!</Typography> </Box>
                ) : (
                    <Box sx={{ textAlign: "center", mt: 3 }}> <LockIcon sx={{ color: "text.disabled", fontSize: 32, mb: 1 }} /> <Typography variant="body2" color="text.secondary">Continue treinando para desbloquear!</Typography> </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0, justifyContent: "center" }}>
                {achievement.unlocked && ( <Button variant="outlined" startIcon={<ShareIcon />} sx={{ borderColor: "primary.main", color: "primary.main", "&:hover": { borderColor: "primary.dark", bgcolor: alpha(theme.palette.primary.main, 0.1) } }} > Compartilhar </Button> )}
                <Button variant="contained" onClick={onClose} sx={{ "&:hover": { bgcolor: "primary.dark" } }} > Fechar </Button>
            </DialogActions>
        </Dialog>
    );
};
// --- Fim AchievementDialog ---


// --- Componente Principal da Página ---
const AchievementsPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedAchievement, setSelectedAchievement] = useState<FullAchievement | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const { data: allAchievementsData = [], isLoading, isError, error } = useAllAchievementsQuery();

    // Memoizar para evitar recálculos desnecessários
    const filteredAchievements = useMemo(() => {
        if (isLoading || isError) return [];
        switch (tabValue) {
            case 0: return allAchievementsData;
            case 1: return allAchievementsData.filter((a) => a.unlocked);
            case 2: return allAchievementsData.filter((a) => !a.unlocked);
            case 3: return allAchievementsData.filter((a) => !a.unlocked && a.current != null && a.total != null && a.total > 0 && (a.current / a.total * 100) > 0 && (a.current / a.total * 100) < 100);
            default: return allAchievementsData;
        }
    }, [allAchievementsData, tabValue, isLoading, isError]);

    const stats = useMemo(() => {
        if (isLoading || isError || !Array.isArray(allAchievementsData)) {
            return { total: 0, unlocked: 0 }; // Removido xpTotal
        }
        return {
            total: allAchievementsData.length,
            unlocked: allAchievementsData.filter((a) => a.unlocked).length,
            // xpTotal: allAchievementsData.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0), // Removido XP
        };
    }, [allAchievementsData, isLoading, isError]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
    const handleAchievementSelect = (achievement: FullAchievement) => { setSelectedAchievement(achievement); setDialogOpen(true); };
    const handleDialogClose = () => setDialogOpen(false);

    // --- Renderização com Loading/Error States ---
    if (isLoading) {
        // ... (Seu JSX de Skeleton como antes) ...
        return <Container maxWidth="lg" sx={{ py: 4 }}> {/* ... Skeletons ... */} </Container>;
    }
    if (isError) {
        return <Container maxWidth="lg" sx={{ py: 4 }}><Alert severity="error">Erro ao carregar conquistas: {error instanceof Error ? error.message : 'Erro desconhecido'}</Alert></Container>;
    }
    // --- Fim Loading/Error States ---

    // const filteredAchievements = getFilteredAchievements(); // Chamado pelo useMemo agora

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: {xs:3, md:6}, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Conquistas</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Acompanhe seu progresso e desbloqueie recompensas</Typography>
                {/* Estatísticas Resumidas (Removido Card de XP) */}
                <Grid container spacing={2} justifyContent="center" sx={{ mt: 2, mb: 4 }}>
                    <Grid size={{xs:12, sm: 6, md:4}}><Card variant="outlined" sx={{bgcolor:"action.hover", height:'100%'}}><CardContent sx={{textAlign: 'center', py:2}}><TrophyIcon sx={{fontSize:32, color:"primary.main", mb:0.5}}/><Typography variant="h6" fontWeight="bold">{isLoading ? <Skeleton width={50} sx={{mx:'auto'}}/> : `${stats.unlocked}/${stats.total}`}</Typography><Typography variant="caption" color="text.secondary">Desbloqueadas</Typography></CardContent></Card></Grid>
                    {/* O Card de XP foi removido, ajustar o grid se necessário ou adicionar outro stat */}
                    <Grid size={{xs:12, sm: 6, md:4}}><Card variant="outlined" sx={{bgcolor:"action.hover", height:'100%'}}><CardContent sx={{textAlign: 'center', py:2}}><LockIcon sx={{fontSize:32, color:"primary.main", mb:0.5}}/><Typography variant="h6" fontWeight="bold">{isLoading ? <Skeleton width={30} sx={{mx:'auto'}}/> : (stats.total - stats.unlocked)}</Typography><Typography variant="caption" color="text.secondary">Restantes</Typography></CardContent></Card></Grid>
                </Grid>
                {/* Barra de progresso geral */}
                {(stats.total > 0 || isLoading) && (
                    <Box sx={{ px: { xs: 0, md: 8 }, mb: 4 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography variant="body2" color="text.secondary">Progresso Geral</Typography><Typography variant="body2" color="text.secondary">{isLoading ? <Skeleton width={30}/> : `${Math.round((stats.unlocked / (stats.total || 1)) * 100)}%`}</Typography></Box>
                        <LinearProgress variant="determinate" value={isLoading ? 0 : (stats.unlocked / (stats.total || 1)) * 100} sx={{ height: 8, borderRadius: 1, bgcolor: "action.hover" }}/>
                    </Box>
                )}
            </Box>

            {/* Filtros (Tabs) */}
            <Box sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant={isMobile ? "scrollable" : "fullWidth"} scrollButtons="auto" allowScrollButtonsMobile centered={!isMobile}>
                    <Tab label="Todas" {...a11yProps(0)} />
                    <Tab label="Desbloqueadas" {...a11yProps(1)} />
                    <Tab label="Bloqueadas" {...a11yProps(2)} />
                    <Tab label="Em Progresso" {...a11yProps(3)} />
                </Tabs>
            </Box>

            {/* Grade de conquistas */}
            <Grid container spacing={3}>
                {!isLoading && filteredAchievements.length === 0 ? (
                    <Grid size={12}><Typography sx={{textAlign: 'center', p:3, fontStyle: 'italic'}}>Nenhuma conquista encontrada para este filtro.</Typography></Grid>
                ) : (
                    filteredAchievements.map((achievement) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                            <AchievementCard achievement={achievement} onSelect={handleAchievementSelect} />
                        </Grid>
                    ))
                )}
                {isLoading && [...Array(6)].map((_, i) => (
                    <Grid size={{xs: 12, sm:6, md:4}} key={`skel-ach-${i}`}><Skeleton variant="rounded" height={220} /></Grid>
                ))}
            </Grid>

            <AchievementDialog open={dialogOpen} achievement={selectedAchievement} onClose={handleDialogClose} />
        </Container>
    );
};

export default AchievementsPage;