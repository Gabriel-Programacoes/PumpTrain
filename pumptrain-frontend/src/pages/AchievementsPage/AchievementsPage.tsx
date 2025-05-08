"use client"

import type React from "react"

import { useState } from "react"
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    LinearProgress,
    Avatar,
    Container,
    Tabs,
    Tab,
    Divider,
    Button,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material"
import {
    EmojiEvents as TrophyIcon,
    LocalFireDepartment as FireIcon,
    FitnessCenter as DumbbellIcon,
    DirectionsRun as RunIcon,
    Whatshot as HotstreakIcon,
    CalendarMonth as CalendarIcon,
    Timer as TimerIcon,
    Bolt as BoltIcon,
    Favorite as HeartIcon,
    Star as StarIcon,
    Lock as LockIcon,
    Share as ShareIcon,
    Celebration as CelebrationIcon,
} from "@mui/icons-material"

// Tipos
interface Achievement {
    id: number
    title: string
    description: string
    icon: React.ReactNode
    category: string
    unlocked: boolean
    progress?: number
    total?: number
    current?: number
    date?: string
    rarity: "comum" | "raro" | "épico" | "lendário"
    xp: number
}

// Componente de card de conquista
const AchievementCard = ({
                             achievement,
                             onSelect,
                         }: { achievement: Achievement; onSelect: (achievement: Achievement) => void }) => {
    const theme = useTheme()
    useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 20px rgba(119, 204, 136, 0.15)",
                },
                position: "relative",
                overflow: "visible",
                opacity: achievement.unlocked ? 1 : 0.7,
            }}
            onClick={() => onSelect(achievement)}
        >
            {!achievement.unlocked && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(6, 7, 14, 0.7)",
                        zIndex: 1,
                        borderRadius: 1,
                    }}
                >
                    <LockIcon sx={{ fontSize: 32, color: "rgba(255, 255, 252, 0.3)" }} />
                </Box>
            )}

            <Box
                sx={{
                    position: "absolute",
                    top: -16,
                    right: 16,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Chip
                    label={`${achievement.xp} XP`}
                    size="small"
                    sx={{
                        bgcolor: "rgba(119, 204, 136, 0.2)",
                        color: "primary.main",
                        fontWeight: "bold",
                        border: "1px solid rgba(119, 204, 136, 0.3)",
                    }}
                />
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: achievement.unlocked ? "primary.main" : "rgba(119, 204, 136, 0.2)",
                            color: achievement.unlocked ? "#06070e" : "rgba(119, 204, 136, 0.5)",
                            mr: 2,
                            width: 48,
                            height: 48,
                        }}
                    >
                        {achievement.icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {achievement.title}
                        </Typography>
                        <Chip
                            label={achievement.rarity}
                            size="small"
                            sx={{
                                bgcolor: getRarityColor(achievement.rarity),
                                color: "#06070e",
                                textTransform: "uppercase",
                                fontSize: "0.6rem",
                                fontWeight: "bold",
                                height: 20,
                            }}
                        />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {achievement.description}
                </Typography>

                {achievement.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Progresso
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {achievement.current}/{achievement.total}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={achievement.progress}
                            sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: "rgba(255, 255, 252, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                    bgcolor: achievement.unlocked ? "primary.main" : "rgba(119, 204, 136, 0.5)",
                                },
                            }}
                        />
                    </Box>
                )}

                {achievement.unlocked && achievement.date && (
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: "text.secondary", mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                            Conquistado em {achievement.date}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}

// Componente de diálogo de detalhes da conquista
const AchievementDialog = ({
                               open,
                               achievement,
                               onClose,
                           }: {
    open: boolean
    achievement: Achievement | null
    onClose: () => void
}) => {
    if (!achievement) return null

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "#06070e",
                    backgroundImage: "radial-gradient(circle at top right, rgba(119, 204, 136, 0.1), transparent 70%)",
                    border: "1px solid rgba(119, 204, 136, 0.1)",
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                <Avatar
                    sx={{
                        bgcolor: achievement.unlocked ? "primary.main" : "rgba(119, 204, 136, 0.2)",
                        color: achievement.unlocked ? "#06070e" : "rgba(119, 204, 136, 0.5)",
                        width: 80,
                        height: 80,
                        mx: "auto",
                        mb: 2,
                        boxShadow: achievement.unlocked ? "0 0 20px rgba(119, 204, 136, 0.4)" : "none",
                    }}
                >
                    {achievement.icon}
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                    {achievement.title}
                </Typography>
                <Chip
                    label={achievement.rarity}
                    size="small"
                    sx={{
                        bgcolor: getRarityColor(achievement.rarity),
                        color: "#06070e",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                        height: 20,
                        mt: 1,
                    }}
                />
            </DialogTitle>
            <DialogContent sx={{ pb: 4 }}>
                <Typography variant="body1" sx={{ textAlign: "center", mb: 3 }}>
                    {achievement.description}
                </Typography>

                <Divider sx={{ my: 2, borderColor: "rgba(119, 204, 136, 0.1)" }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{xs: 6}} >
                        <Typography variant="caption" color="text.secondary">
                            Categoria
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {achievement.category}
                        </Typography>
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <Typography variant="caption" color="text.secondary">
                            Pontos XP
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                            {achievement.xp} XP
                        </Typography>
                    </Grid>
                </Grid>

                {achievement.progress !== undefined && (
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Progresso
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {achievement.current}/{achievement.total}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={achievement.progress}
                            sx={{
                                height: 8,
                                borderRadius: 1,
                                bgcolor: "rgba(255, 255, 252, 0.1)",
                                "& .MuiLinearProgress-bar": {
                                    bgcolor: achievement.unlocked ? "primary.main" : "rgba(119, 204, 136, 0.5)",
                                },
                            }}
                        />
                    </Box>
                )}

                {achievement.unlocked ? (
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <CelebrationIcon sx={{ color: "primary.main", fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Você conquistou esta realização em {achievement.date}!
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: "center", mt: 3 }}>
                        <LockIcon sx={{ color: "rgba(255, 255, 252, 0.3)", fontSize: 32, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Continue treinando para desbloquear esta conquista!
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
                {achievement.unlocked && (
                    <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        sx={{
                            borderColor: "rgba(119, 204, 136, 0.5)",
                            color: "primary.main",
                            "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: "rgba(119, 204, 136, 0.1)",
                            },
                        }}
                    >
                        Compartilhar
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: "primary.main",
                        color: "#06070e",
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                    }}
                >
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

// Função para obter a cor com base na raridade
const getRarityColor = (rarity: string) => {
    switch (rarity) {
        case "comum":
            return "rgba(255, 255, 252, 0.8)"
        case "raro":
            return "#77cc88"
        case "épico":
            return "#9966ff"
        case "lendário":
            return "#ffcc33"
        default:
            return "rgba(255, 255, 252, 0.8)"
    }
}

// Componente principal da página de conquistas
const Achievements = () => {
    const [tabValue, setTabValue] = useState(0)
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))

    // Lista de conquistas
    const achievements: Achievement[] = [
        {
            id: 1,
            title: "Primeiro Passo",
            description: "Complete seu primeiro treino no aplicativo",
            icon: <DumbbellIcon />,
            category: "Iniciante",
            unlocked: true,
            date: "10/04/2023",
            rarity: "comum",
            xp: 50,
        },
        {
            id: 2,
            title: "Sequência Iniciante",
            description: "Complete 7 dias consecutivos de treino",
            icon: <HotstreakIcon />,
            category: "Sequência",
            unlocked: true,
            progress: 100,
            total: 7,
            current: 7,
            date: "17/04/2023",
            rarity: "comum",
            xp: 100,
        },
        {
            id: 3,
            title: "Sequência Dedicada",
            description: "Complete 30 dias consecutivos de treino",
            icon: <FireIcon />,
            category: "Sequência",
            unlocked: false,
            progress: 40,
            total: 30,
            current: 12,
            rarity: "raro",
            xp: 300,
        },
        {
            id: 4,
            title: "Maratonista",
            description: "Acumule 100km de corrida",
            icon: <RunIcon />,
            category: "Cardio",
            unlocked: false,
            progress: 65,
            total: 100,
            current: 65,
            rarity: "raro",
            xp: 250,
        },
        {
            id: 5,
            title: "Mestre do Tempo",
            description: "Acumule 50 horas de treino",
            icon: <TimerIcon />,
            category: "Volume",
            unlocked: true,
            progress: 100,
            total: 50,
            current: 50,
            date: "02/05/2023",
            rarity: "raro",
            xp: 250,
        },
        {
            id: 6,
            title: "Queimador de Calorias",
            description: "Queime 10.000 calorias em treinos",
            icon: <BoltIcon />,
            category: "Volume",
            unlocked: true,
            progress: 100,
            total: 10000,
            current: 10000,
            date: "15/05/2023",
            rarity: "raro",
            xp: 200,
        },
        {
            id: 7,
            title: "Explorador de Exercícios",
            description: "Experimente 20 exercícios diferentes",
            icon: <DumbbellIcon />,
            category: "Diversidade",
            unlocked: true,
            progress: 100,
            total: 20,
            current: 20,
            date: "22/04/2023",
            rarity: "comum",
            xp: 150,
        },
        {
            id: 8,
            title: "Coração de Ferro",
            description: "Mantenha sua frequência cardíaca na zona alvo por 60 minutos acumulados",
            icon: <HeartIcon />,
            category: "Cardio",
            unlocked: false,
            progress: 75,
            total: 60,
            current: 45,
            rarity: "raro",
            xp: 200,
        },
        {
            id: 9,
            title: "Levantador de Peso",
            description: "Levante um total acumulado de 10.000kg em exercícios",
            icon: <DumbbellIcon />,
            category: "Força",
            unlocked: false,
            progress: 82,
            total: 10000,
            current: 8200,
            rarity: "raro",
            xp: 250,
        },
        {
            id: 10,
            title: "Desafio Superado",
            description: "Complete um desafio semanal",
            icon: <TrophyIcon />,
            category: "Desafios",
            unlocked: true,
            date: "28/04/2023",
            rarity: "comum",
            xp: 100,
        },
        {
            id: 11,
            title: "Mestre dos Desafios",
            description: "Complete 10 desafios semanais",
            icon: <StarIcon />,
            category: "Desafios",
            unlocked: false,
            progress: 30,
            total: 10,
            current: 3,
            rarity: "épico",
            xp: 400,
        },
        {
            id: 12,
            title: "Sequência Lendária",
            description: "Complete 100 dias consecutivos de treino",
            icon: <TrophyIcon />,
            category: "Sequência",
            unlocked: false,
            progress: 12,
            total: 100,
            current: 12,
            rarity: "lendário",
            xp: 1000,
        },
        {
            id: 13,
            title: "Atleta Completo",
            description: "Realize treinos em todas as categorias disponíveis",
            icon: <StarIcon />,
            category: "Diversidade",
            unlocked: false,
            progress: 60,
            total: 5,
            current: 3,
            rarity: "épico",
            xp: 350,
        },
        {
            id: 14,
            title: "Madrugador",
            description: "Complete 10 treinos antes das 7h da manhã",
            icon: <CalendarIcon />,
            category: "Hábitos",
            unlocked: false,
            progress: 40,
            total: 10,
            current: 4,
            rarity: "raro",
            xp: 200,
        },
        {
            id: 15,
            title: "Consistência Perfeita",
            description: "Complete todos os treinos planejados por 4 semanas seguidas",
            icon: <TrophyIcon />,
            category: "Consistência",
            unlocked: false,
            progress: 25,
            total: 4,
            current: 1,
            rarity: "épico",
            xp: 500,
        },
    ]

    // Filtrar conquistas com base na aba selecionada
    const getFilteredAchievements = () => {
        switch (tabValue) {
            case 0: // Todas
                return achievements
            case 1: // Desbloqueadas
                return achievements.filter((a) => a.unlocked)
            case 2: // Bloqueadas
                return achievements.filter((a) => !a.unlocked)
            case 3: // Em progresso
                return achievements.filter((a) => !a.unlocked && a.progress && a.progress > 0)
            default:
                return achievements
        }
    }

    // Estatísticas de conquistas
    const stats = {
        total: achievements.length,
        unlocked: achievements.filter((a) => a.unlocked).length,
        xpTotal: achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0),
    }

    // Manipuladores de eventos
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    }

    const handleAchievementSelect = (achievement: Achievement) => {
        setSelectedAchievement(achievement)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Cabeçalho */}
            <Box sx={{ mb: 6, textAlign: "center" }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    Conquistas
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Acompanhe seu progresso e desbloqueie recompensas
                </Typography>

                {/* Estatísticas */}
                <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
                    <Grid size={{xs: 6, md:4}}>
                        <Card variant="outlined" sx={{ bgcolor: "rgba(119, 204, 136, 0.05)" }}>
                            <CardContent sx={{ textAlign: "center", py: 3 }}>
                                <TrophyIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.unlocked}/{stats.total}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Conquistas Desbloqueadas
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{xs: 6, md:4}}>
                        <Card variant="outlined" sx={{ bgcolor: "rgba(119, 204, 136, 0.05)" }}>
                            <CardContent sx={{ textAlign: "center", py: 3 }}>
                                <StarIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.xpTotal}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    XP Total Ganho
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{xs: 6, md:4}}>
                        <Card variant="outlined" sx={{ bgcolor: "rgba(119, 204, 136, 0.05)" }}>
                            <CardContent sx={{ textAlign: "center", py: 3 }}>
                                <LockIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.total - stats.unlocked}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Conquistas Restantes
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Barra de progresso geral */}
                <Box sx={{ px: { xs: 0, md: 8 }, mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Progresso Geral
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {Math.round((stats.unlocked / stats.total) * 100)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(stats.unlocked / stats.total) * 100}
                        sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: "rgba(255, 255, 252, 0.1)",
                        }}
                    />
                </Box>
            </Box>

            {/* Filtros */}
            <Box sx={{ mb: 4, borderBottom: 1, borderColor: "rgba(119, 204, 136, 0.1)" }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{
                        "& .MuiTab-root": {
                            color: "text.secondary",
                            "&.Mui-selected": {
                                color: "primary.main",
                            },
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: "primary.main",
                        },
                    }}
                >
                    <Tab label="Todas" />
                    <Tab label="Desbloqueadas" />
                    <Tab label="Bloqueadas" />
                    <Tab label="Em Progresso" />
                </Tabs>
            </Box>

            {/* Grade de conquistas */}
            <Grid container spacing={3}>
                {getFilteredAchievements().map((achievement) => (
                    <Grid size={{xs: 12, md:4, sm:6}} key={achievement.id}>
                        <AchievementCard achievement={achievement} onSelect={handleAchievementSelect} />
                    </Grid>
                ))}
            </Grid>

            {/* Diálogo de detalhes */}
            <AchievementDialog open={dialogOpen} achievement={selectedAchievement} onClose={handleDialogClose} />
        </Container>
    )
}

export default Achievements
