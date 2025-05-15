import { useMemo } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Typography, Container } from '@mui/material';

// Provedores e Tema
import { createAppTheme } from './theme';
import { SnackbarProvider } from './context/SnackbarProvider';
import { AuthProvider } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// Componentes de Layout e Páginas
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import MyWorkoutsPage from './pages/MyWorkoutsPage/MyWorkoutsPage';
import ExerciseListPage from './pages/ExerciseListPage/ExerciseListPage';
import CreateWorkoutPage from './pages/CreateWorkoutPage/CreateWorkoutPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage/WorkoutDetailPage';
import EditWorkoutPage from './pages/EditWorkoutPage/EditWorkoutPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import AchievementsPage from './pages/AchievementsPage/AchievementsPage';


import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';

// Componente NotFound simples
const NotFound = () => (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h4" gutterBottom>Página não encontrada (404)</Typography>
        <RouterLink to="/">Voltar para o Início</RouterLink>
    </Container>
);

function App() {
    const theme = useMemo(() => createAppTheme(), []);

    return (
        // Ordem dos Provedores mantida
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                        <CssBaseline enableColorScheme />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />

                            <Route element={<Layout/>}>
                                <Route path="/exercises" element={<ExerciseListPage />} />

                                <Route element={<ProtectedRoute />}>
                                    <Route path="/dashboard" element={<Dashboard/>} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/workouts" element={<MyWorkoutsPage />} />
                                    <Route path="/workouts/new" element={<CreateWorkoutPage />} />
                                    <Route path="/workouts/:workoutId" element={<WorkoutDetailPage />} />
                                    <Route path="/workouts/:workoutId/edit" element={<EditWorkoutPage />} />
                                    <Route path="/achievements/all" element={<AchievementsPage />} />

                                </Route>
                                <Route path="*" element={<NotFound />} />
                            </Route>

                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                        </Routes>
                    </LocalizationProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;