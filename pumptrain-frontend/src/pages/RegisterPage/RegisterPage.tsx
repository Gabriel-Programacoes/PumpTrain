import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { AxiosError } from 'axios';
import { useSnackbar } from '../../context/SnackbarProvider';

// MUI Imports
import {
    Box, Container, Typography, TextField, Button, Grid, Link, Checkbox, FormControlLabel,
    Paper, IconButton, InputAdornment, useMediaQuery, useTheme,
    CircularProgress, Stepper, Step, StepLabel, Stack, FormHelperText, FormControl, FormLabel
} from "@mui/material";
import { styled } from "@mui/material/styles";
// Ícones necessários
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// --- Componentes Estilizados  ---
const RegisterContainer = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    position: "relative",
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    "&::before": {
        content: '""', position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, hsla(135, 50%, 55%, 0.08) 0%, hsla(0, 0%, 0%, 0) 70%)`
            : `radial-gradient(circle, hsla(135, 50%, 55%, 0.1) 0%, hsla(0, 0%, 100%, 0) 70%)`,
        zIndex: 0,
        [theme.breakpoints.down("md")]: { width: "100%", opacity: 0.5 },
    },
}));

interface RegisterApiErrorResponse {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
    fieldErrors?: Array<{ field: string; message: string }>; // Importante para erros de validação do backend
}

// --- Componente Principal ---
const RegisterPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { login } = useAuth(); // Usar contexto para auto-login
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const { showSnackbar } = useSnackbar();

    // Estados do formulário (adaptados para os campos necessários pelo backend)
    const [formData, setFormData] = useState({
        name: "", // Campo 'name' único como esperado pelo backend DTO
        email: "",
        password: "",
        confirmPassword: "", // Necessário para validação frontend
        agreeTerms: false,
    });

    // Estados de erro (adaptados)
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: "",
    });

    // Estados funcionais (da base funcional)
    const [activeStep, setActiveStep] = useState(0); // Mantém o Stepper da v1
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword] = useState(false); // Para o campo de confirmação
    // const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const steps = ["Informações da Conta", "Finalizar"]; // Simplificado para 2 passos

    // Handle Change Genérico
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Limpa o erro específico ao digitar
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        // Limpa erro geral ao começar a digitar qualquer campo
        // if (submitError) setSubmitError(null);
    };

    // Funções de Toggle de Senha
    const handleTogglePassword = () => setShowPassword(!showPassword);
// Validação

    const validateStep0 = (): boolean => {
        let isValid = true;
        const newErrors = { name: "", email: "", password: "", confirmPassword: "", agreeTerms: "" }; // Reinicia erros do passo
        // setSubmitError(null);

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório.';
            isValid = false;
        } else if (formData.name.trim().length < 5) { // Exemplo: validação de tamanho mínimo (alinhar com DTO backend se necessário)
            newErrors.name = 'Nome deve ter pelo menos 5 caracteres.'; // sugere min 5
            isValid = false;
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Por favor, insira um email válido.';
            isValid = false;
        }
        if (!formData.password || formData.password.length < 7) { // Alinhado com DTO backend
            newErrors.password = 'A senha deve ter pelo menos 7 caracteres.';
            isValid = false;
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha.';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem.';
            isValid = false;
        }
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Você deve aceitar os termos.';
            isValid = false;
        }

        setErrors(newErrors); // Atualiza os erros para o passo atual
        return isValid;
    };

    // Navegação do Stepper
    const handleNext = () => {
        if (activeStep === 0) {
            if (validateStep0()) {
                setActiveStep(1); // Avança para o passo de finalização/revisão
            }
        } else if (activeStep === 1) {
            // No último passo, chama o submit final
            handleSubmitForm();
        }
    };
// Submit Final
    const handleSubmitForm = async () => {
        // Validação final
        if (!validateStep0()) {
            setActiveStep(0); // Volta para o passo com erros se chegou aqui de alguma forma
            return;
        }

        setIsLoading(true);
        // setSubmitError(null);

        // Payload SOMENTE com os dados esperados pelo backend
        const payload = {
            name: formData.name.trim(),
            email: formData.email,
            password: formData.password,
        };
        // console.log('[RegisterPage] Enviando payload para /auth/register:', payload);

        try {
            // Tenta registrar
            await apiClient.post('/auth/register', payload);
            // console.log('[RegisterPage] Registro API OK.');
            showSnackbar('Registro realizado com sucesso! Tentando login automático...', 'success');


            // Tenta fazer login automaticamente após registro
            // console.log('[RegisterPage] Tentando auto-login...');
            try {
                const loginResponse = await apiClient.post<{ token: string }>('/auth/login', {
                    email: payload.email,
                    password: payload.password, // Usa a senha que acabou de ser registrada
                });
                const receivedToken = loginResponse.data.token;
                if (receivedToken) {
                    //console.log('[RegisterPage] Auto-login OK. Token recebido.');
                    await login(receivedToken); // Salva token no contexto
                    // showSnackbar('Login automático bem-sucedido!', 'success'); // Opcional
                    navigate('/dashboard'); // Redireciona para o dashboard
                } else {
                    // Pouco provável, mas caso login não retorne token
                    // console.warn('[RegisterPage] Auto-login retornou sem token. Redirecionando para login manual.');
                    showSnackbar('Registro bem-sucedido! Faça o login para continuar.', 'info');
                    navigate('/login');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (loginError) {
                // Se o auto-login falhar (não deveria, mas pode acontecer)
                // console.error("[RegisterPage] Falha no auto-login após registro:", loginError);
                showSnackbar('Registro realizado com sucesso! Faça o login para continuar.', 'info');
                navigate('/login'); // Envia para a página de login
            }

        } catch (error) {
            // console.error("[RegisterPage] Falha na chamada API de registro:", error);
            setIsLoading(false); // Para o loading no erro
            setActiveStep(0); // Volta pro primeiro passo onde estão os campos com erro potencial

            let errorMessage = 'Falha no registro. Tente novamente.';
            if (error instanceof AxiosError && error.response) {
                const responseData = error.response.data as RegisterApiErrorResponse;
                if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.error) {
                    errorMessage = responseData.error;
                } else if (error.response.status === 409) { // Email já existe
                    errorMessage = responseData?.message || 'Este email já está cadastrado.';
                } else if (error.response.status === 400) { // Erros de validação
                    if (responseData?.fieldErrors && responseData.fieldErrors.length > 0) {
                        errorMessage = responseData.fieldErrors.map(fe => `${fe.field}: ${fe.message}`).join('; ');
                    } else {
                        errorMessage = responseData?.message || responseData?.error || 'Erro nos dados fornecidos.';
                    }
                } else if (error.response.status >= 500) {
                    errorMessage = "Erro no servidor. Por favor, tente novamente mais tarde.";
                }
            } else if (error instanceof Error && error.message.includes("Network Error")) {
                errorMessage = "Falha na conexão. Verifique sua internet.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            showSnackbar(errorMessage, 'error');
            // setSubmitError(userFriendlyMessage); // Manter se quiser exibir no formulário também
        }
    };

    // Renderiza o conteúdo do passo atual do Stepper
    const renderStepContent = (step: number) => {
        switch (step) {
            case 0: // Informações da Conta
                return (
                    <>
                        <FormControl fullWidth margin="normal">
                            <FormLabel htmlFor="name" sx={{ mb: 0.5 }}></FormLabel>
                            <TextField
                                required fullWidth id="name" name="name" label="Nome completo"
                                autoComplete="name" autoFocus
                                value={formData.name} onChange={handleChange}
                                error={!!errors.name} helperText={errors.name}
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <FormLabel htmlFor="email" sx={{ mb: 0.5 }}></FormLabel>
                            <TextField
                                required fullWidth id="email" name="email" label="Email"
                                type="email" autoComplete="email"
                                value={formData.email} onChange={handleChange}
                                error={!!errors.email} helperText={errors.email}
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <FormLabel htmlFor="password" sx={{ mb: 0.5 }}></FormLabel>
                            <TextField
                                required fullWidth name="password" label="Crie uma senha"
                                type={showPassword ? "text" : "password"} id="password"
                                autoComplete="new-password"
                                value={formData.password} onChange={handleChange}
                                error={!!errors.password} helperText={errors.password}
                                disabled={isLoading}
                                slotProps={{
                                    input: { // <<< Alvo: O slot do componente Input subjacente (OutlinedInput, etc.)
                                        endAdornment: ( // <<< Prop passada para o componente 'input'
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleTogglePassword}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOffIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}}
                            />
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <FormLabel htmlFor="confirmPassword" sx={{ mb: 0.5 }}></FormLabel>
                            <TextField
                                required fullWidth name="confirmPassword" label="Confirme sua senha"
                                type={showConfirmPassword ? "text" : "password"} id="confirmPassword"
                                autoComplete="new-password"
                                value={formData.confirmPassword} onChange={handleChange}
                                error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl required error={!!errors.agreeTerms} sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={<Checkbox name="agreeTerms" color="primary" checked={formData.agreeTerms} onChange={handleChange} disabled={isLoading} />}
                                label={
                                    <Typography variant="body2">
                                        Eu concordo com os{" "}
                                        <Link href="#" target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main" }}>Termos de Serviço</Link>
                                        {" "}e{" "}
                                        <Link href="#" target="_blank" rel="noopener noreferrer" sx={{ color: "primary.main" }}>Política de Privacidade</Link>
                                    </Typography>
                                }
                            />
                            {!!errors.agreeTerms && <FormHelperText>{errors.agreeTerms}</FormHelperText>}
                        </FormControl>
                    </>
                );
            case 1: // Passo de Finalização/Revisão (Pode mostrar um resumo ou só o botão)
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" gutterBottom>Quase lá!</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Revise suas informações no passo anterior, se necessário. Clique abaixo para finalizar seu cadastro.
                        </Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <RegisterContainer>
            <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: '100vh' }}>
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    {/* Coluna Esquerda (Ilustração) */}
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
                                    <Typography variant="h4" component="div" sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}>
                                        PumpTrain
                                    </Typography>
                                </Box>
                                <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
                                    Comece sua jornada fitness hoje!
                                </Typography>
                                <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, maxWidth: "90%" }}>
                                    Crie sua conta e tenha acesso a treinos personalizados, acompanhamento de progresso e muito mais.
                                </Typography>
                                <Box component="img" src="https://via.placeholder.com/400x350?text=Fitness+Illustration+2" // Placeholder
                                     alt="Register Illustration" sx={{ maxWidth: "100%", height: "auto", borderRadius: 4, opacity: 0.9 }} />
                            </Box>
                        </Grid>
                    )}

                    {/* Coluna Direita (Formulário) */}
                    <Grid size={{xs: 12, sm: 10, md: 6, lg:5}}  sx={{ zIndex: 1 }}>
                        <Paper
                            elevation={isMobile ? 0 : 3}
                            sx={{ p: 4, borderRadius: 3, backgroundColor: theme.palette.mode === 'dark' ? "rgba(10, 10, 20, 0.7)" : "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(10px)", border: `1px solid ${theme.palette.divider}` }}
                        >
                            {/* Logo Mobile */}
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

                            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
                                Criar Conta
                            </Typography>

                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {/* Conteúdo do Passo Atual */}
                            <Box component="div" sx={{ mt: 2, mb: 2 }}> {/* Usar div em vez de form aqui */}
                                {renderStepContent(activeStep)}
                            </Box>

                            {/* Botões de Navegação do Stepper */}
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={isLoading}
                                    sx={{ borderRadius: 2, px: 4 }}
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit"/> : (activeStep === steps.length - 1 ? 'Finalizar Cadastro' : 'Continuar')}
                                </Button>
                            </Stack>

                            {/* Link para Login */}
                            {activeStep === 0 && (
                                <Box sx={{ textAlign: "center", mt: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Já tem uma conta?{" "}
                                        <Link component={RouterLink} to="/login" sx={{ color: "primary.main", fontWeight: 600, "&:hover": { textDecoration: "underline" } }}>
                                            Entrar
                                        </Link>
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
            {/* Snackbar removido */}
        </RegisterContainer>
    );
};

export default RegisterPage;