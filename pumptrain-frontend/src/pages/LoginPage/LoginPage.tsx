import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { AxiosError } from 'axios';

// MUI Imports
import {
    Box, Container, Typography, TextField, Button, Grid, Link,
    Divider, Paper, IconButton, InputAdornment, useMediaQuery, useTheme,
    CircularProgress, FormLabel, FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AppleIcon from "@mui/icons-material/Apple";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useSnackbar} from "../../context/SnackbarProvider.tsx";

// --- Componentes Estilizados  ---
const LoginContainer = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        width: "50%",
        height: "100%",
        background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, hsla(135, 50%, 55%, 0.08) 0%, hsla(0, 0%, 0%, 0) 70%)`
            : `radial-gradient(circle, hsla(135, 50%, 55%, 0.1) 0%, hsla(0, 0%, 100%, 0) 70%)`,
        zIndex: 0,
        [theme.breakpoints.down("md")]: {
            width: "100%",
            opacity: 0.5,
        },
    },
}));

const SocialButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: "transparent",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

// --- Componente Principal ---

const LoginPage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showSnackbar } = useSnackbar();

    // Estados
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Funções
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const validateForm = (): boolean => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');
        // setSubmitError(null);

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Por favor, insira um email válido.');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Por favor, insira a senha.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres.');
            isValid = false;
        }
        return isValid;
    };

    // Submit
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        // setSubmitError(null);

        try {
            // console.log(`[LoginPage] Enviando credenciais para /auth/login`);
            const response = await apiClient.post<{ token: string }>('/auth/login', {
                email: email,
                password: password,
            });
            const receivedToken = response.data.token;

            if (receivedToken) {
                // console.log(`[LoginPage] Login API OK. Token recebido.`);
                await login(receivedToken);

                showSnackbar('Login bem-sucedido! Redirecionando...', 'success');

                // console.log(`[LoginPage] Redirecionando para /dashboard...`);
                navigate('/dashboard'); // Navega após sucesso
            } else {
                throw new Error('Resposta da API não continha um token.');
            }
        } catch (error) {
            // console.error("[LoginPage] Falha na chamada API de login:", error);
            setIsLoading(false);
            let errorMessage = 'Falha no login. Verifique sua conexão e tente novamente.';

            if (error instanceof AxiosError) {
                const responseData = error.response?.data;
                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = responseData?.message || responseData?.error || 'Email ou senha inválidos.';
                    } else if (error.response.status === 400) {
                        const fieldErrors = responseData?.fieldErrors;
                        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                            errorMessage = `Erro de validação: ${fieldErrors.join(', ')}`;
                        } else {
                            errorMessage = responseData?.message || responseData?.error || 'Requisição inválida.';
                        }
                    } else {
                        errorMessage = `Erro do servidor (${error.response.status}). Tente mais tarde.`;
                    }
                } else if (error.request) {
                    errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
                } else {
                    errorMessage = error.message || 'Erro ao preparar requisição de login.';
                }
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = 'Ocorreu um erro inesperado durante o login.';
            }
            showSnackbar(errorMessage, 'error')

            // setSubmitError(errorMessage);
        }
    };

    // --- JSX ---
    return (
        <LoginContainer>
            <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: '100vh' }}>
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    {/* Coluna da esquerda - Visível apenas em telas maiores */}
                    {!isMobile && (
                        <Grid size={{xs: 12, md: 6} } sx={{ zIndex: 1 }}>
                            <Box sx={{ p: 4 }}>
                                <Box
                                    component={RouterLink}
                                    to="/"
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 4,
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <FitnessCenterIcon sx={{ color: "primary.main", fontSize: 40, mr: 1 }} />
                                    <Typography
                                        variant="h4" component="div"
                                        sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}
                                    >
                                        PumpTrain
                                    </Typography>
                                </Box>
                                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                                    Bem-vindo de volta!
                                </Typography>
                                <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, maxWidth: "90%" }}>
                                    Continue sua jornada fitness e acompanhe seu progresso. Estamos felizes em tê-lo de volta.
                                </Typography>
                                <Box
                                    component="img"
                                    src="https://via.placeholder.com/400x300?text=Fitness+Illustration"
                                    alt="Login Illustration"
                                    sx={{ maxWidth: "100%", height: "auto", borderRadius: 4, opacity: 0.9 }}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* Coluna da direita - Formulário de login */}
                    <Grid size={{xs: 12, sm: 10, md: 6, lg: 5} } sx={{ zIndex: 1 }}>
                        <Paper
                            elevation={isMobile ? 0 : 3} // Sem elevação no mobile se preferir
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                backgroundColor: theme.palette.mode === 'dark' ? "rgba(10, 10, 20, 0.7)" : "rgba(255, 255, 255, 0.8)",
                                backdropFilter: "blur(10px)",
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            {/* Logo em dispositivos móveis */}
                            {isMobile && (
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 4 }}>
                                    <FitnessCenterIcon sx={{ color: "primary.main", fontSize: 32, mr: 1 }} />
                                    <Typography variant="h5" component="div" sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }} >
                                        PumpTrain
                                    </Typography>
                                </Box>
                            )}

                            {/* Botão para voltar para a LandingPage*/}
                            <IconButton component={RouterLink} to="/" sx={{ position: 'absolute', top: 16, left: 16 }}><ArrowBackIcon /></IconButton>

                            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1, textAlign: isMobile ? "center" : "center"}} >
                                Entrar
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: isMobile ? "center" : "center" }} >
                                Entre com suas credenciais para acessar sua conta
                            </Typography>

                            {/* FORMULÁRIO com lógica da segunda versão */}
                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                {/* {submitError && ( // Removido Alert para usar Snackbar
                                    <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
                                )} */}
                                <FormControl fullWidth sx={{ mb: 1 }}>
                                    <FormLabel htmlFor="email" sx={{ mb: 0.5 }}></FormLabel>
                                    <TextField
                                        required fullWidth id="email" name="email" label="Email"
                                        autoComplete="email" autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        error={!!emailError}
                                        helperText={emailError}
                                        disabled={isLoading}
                                    />
                                </FormControl>

                                <FormControl fullWidth sx={{ mb: 1 }}>
                                    <FormLabel htmlFor="password" sx={{ mb: 0.5 }}></FormLabel>
                                    <TextField
                                        required fullWidth name="password" label="Senha"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="••••••"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={!!passwordError}
                                        helperText={passwordError}
                                        disabled={isLoading}
                                        slotProps={{ input: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleTogglePassword}
                                                            edge="end"
                                                            size="small"
                                                        >
                                                            {showPassword ? <VisibilityOffIcon fontSize="small"/> :
                                                                <VisibilityIcon fontSize="small"/>}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                    />
                                </FormControl>

                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2 }}>
                                </Box>

                                <Button type="submit" fullWidth variant="contained" disabled={isLoading}
                                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: "none", fontSize: "1rem", mb: 2 }}>
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                                </Button>
                                {/* FIM DO FORMULÁRIO com lógica */}

                                <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                                    <Divider sx={{ flexGrow: 1 }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}> ou continue com </Typography>
                                    <Divider sx={{ flexGrow: 1 }} />
                                </Box>

                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid size={{xs:4}} >
                                        <SocialButton fullWidth startIcon={<GoogleIcon />} disabled={isLoading}> Google </SocialButton>
                                    </Grid>
                                    <Grid size={{xs:4}}>
                                        <SocialButton fullWidth startIcon={<FacebookIcon />} disabled={isLoading}> Facebook </SocialButton>
                                    </Grid>
                                    <Grid size={{xs:4}}>
                                        <SocialButton fullWidth startIcon={<AppleIcon />} disabled={isLoading}> Apple </SocialButton>
                                    </Grid>
                                </Grid>

                                <Box sx={{ textAlign: "center" }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Não tem uma conta?{" "}
                                        <Link component={RouterLink} to="/register"
                                              sx={{ color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                                            Cadastre-se
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </LoginContainer>
    );
};

export default LoginPage;