import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  LinearProgress,
  Avatar,
  Chip,
  Stack,
  Button,
} from "@mui/material"
import {
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  FitnessCenter as DumbbellIcon,
  CalendarToday as CalendarIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material"

interface Workout {
  date: string
  title: string
  duration: string
  calories: number
  exercises: number
  completed: boolean
}

const workouts: Workout[] = [
  {
    date: "Hoje, 10:30",
    title: "Treino de Pernas",
    duration: "45 min",
    calories: 320,
    exercises: 6,
    completed: true,
  },
  {
    date: "Ontem, 18:15",
    title: "Treino de Peito e Tríceps",
    duration: "55 min",
    calories: 450,
    exercises: 8,
    completed: true,
  },
  {
    date: "22/04, 07:00",
    title: "Cardio Intenso",
    duration: "30 min",
    calories: 280,
    exercises: 4,
    completed: true,
  },
]

const WorkoutCard = ({ workout }: { workout: Workout }) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "rgba(119, 204, 136, 0.1)", color: "primary.main" }}>
            <DumbbellIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {workout.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: "0.75rem", color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                {workout.date}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {workout.duration}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              duração
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {workout.calories}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              kcal
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {workout.exercises}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              exercícios
            </Typography>
          </Box>
        </Box>

        <Avatar
          sx={{
            display: { xs: "flex", md: "none" },
            bgcolor: "rgba(119, 204, 136, 0.05)",
            color: "primary.main",
            width: 32,
            height: 32,
          }}
        >
          <ChevronRightIcon fontSize="small" />
        </Avatar>
      </CardContent>
    </Card>
  )
}

const Dashboard = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Meu painel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Acompanhe sua jornada fitness
          </Typography>
        </Box>
      </Box>

      {/* Streak Section */}
      <Card variant="outlined" sx={{ mb: 4, overflow: "hidden" }}>
        <CardContent sx={{ p: 0 }}>
          <Grid container>
            <Grid size={{xs: 12, md: 6}} >
              <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <FireIcon sx={{ color: "primary.main" }} />
                  <Typography variant="h6">Sequência de Treinos</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>
                  <Typography variant="h3" fontWeight="bold">
                    12
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    dias consecutivos
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Seu recorde: 15 dias
                </Typography>
              </Box>
            </Grid>
            <Grid size={{xs: 12, md: 6}} sx={{ bgcolor: "rgba(119, 204, 136, 0.05)" }}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      Este mês
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      18
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      treinos
                    </Typography>
                  </Grid>
                  <Grid size={{xs: 6}}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      156
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      treinos
                    </Typography>
                  </Grid>
                </Grid>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption">Meta mensal</Typography>
                    <Typography variant="caption">18/25</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={72} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, md: 4}}>
          <Card variant="outlined">
            <CardHeader title="Calorias Queimadas" titleTypographyProps={{ variant: "subtitle2" }} />
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography variant="h5" fontWeight="bold">
                  8,540
                </Typography>
                <Chip
                  label="+12%"
                  size="small"
                  sx={{
                    bgcolor: "transparent",
                    color: "primary.main",
                    height: "auto",
                    fontSize: "0.75rem",
                    fontWeight: "medium",
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Esta semana
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Card variant="outlined">
            <CardHeader title="Tempo Total" titleTypographyProps={{ variant: "subtitle2" }} />
            <CardContent>
              <Typography variant="h5" fontWeight="bold">
                12h 30m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Card variant="outlined">
            <CardHeader title="Conquistas" titleTypographyProps={{ variant: "subtitle2" }} />
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography variant="h5" fontWeight="bold">
                  7
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  de 12
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.main" }}>
                  <TrophyIcon sx={{ fontSize: 14, color: "#06070e" }} />
                </Avatar>
                <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.main" }}>
                  <FireIcon sx={{ fontSize: 14, color: "#06070e" }} />
                </Avatar>
                <Avatar sx={{ width: 24, height: 24, bgcolor: "primary.main" }}>
                  <DumbbellIcon sx={{ fontSize: 14, color: "#06070e" }} />
                </Avatar>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "rgba(6, 7, 14, 0.1)",
                    border: "1px solid rgba(119, 204, 136, 0.2)",
                  }}
                >
                  <Typography variant="caption" fontWeight="medium">
                    +4
                  </Typography>
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Workouts */}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Treinos Recentes
          </Typography>
          <Button endIcon={<ChevronRightIcon />} sx={{ color: "primary.main", textTransform: "none" }}>
            Ver todos
          </Button>
        </Box>

        {workouts.map((workout, index) => (
          <WorkoutCard key={index} workout={workout} />
        ))}
      </Box>
    </Box>
  )
}

export default Dashboard
