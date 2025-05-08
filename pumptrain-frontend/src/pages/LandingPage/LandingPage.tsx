import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import FeatureCard from '../../components/landing/FeatureCard';
import TestimonialCard from '../../components/landing/TestimonialCard';
import FaqAccordion from '../../components/landing/FaqAccordion';

// --- Styled Components ---

const HeroSection = styled(Box)(({ theme }) => ({
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        width: "50%",
        height: "100%",
        background: `radial-gradient(circle, ${theme.palette.primary.main}1A 0%, ${theme.palette.background.default}00 70%)`,
        zIndex: 0,
        [theme.breakpoints.down("md")]: {
            width: "80%",
            opacity: 0.5,
        },
    },
}));

const GradientText = styled(Typography)(({ theme }) => ({
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, #5DDFB3 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textFillColor: "transparent",
    display: 'inline',
}));

// --- Componente LandingPage ---
const LandingPage: React.FC = () => {
    const navigate = useNavigate(); // Hook para navegação
    const theme = useTheme(); // Hook para acessar o tema

    // Handlers para navegação dos botões principais
    const handleStartNow = () => {
        navigate('/register');
    };

    const handleLearnMore = () => {
        const featuresSection = document.getElementById('features-section');
        featuresSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        // Usar bgcolor do tema
        <Box sx={{ bgcolor: "background.default", color: "text.primary", overflow: 'hidden' }}>
            {/* Cabeçalho */}
            <LandingHeader />

            {/* Hero Section */}
            <HeroSection>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{xs: 12, md: 6}} sx={{ zIndex: 1 }}>
                            {/* Conteúdo Hero... */}
                            <Box sx={{ mb: 4 }}>
                                {/* ... (Typography Overline, h2, body1) ... */}
                                <Typography variant="overline" sx={{ color: "primary.main", letterSpacing: 2, fontWeight: 600 }}>
                                    TRANSFORME SEU CORPO
                                </Typography>
                                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, mt: 1 }}>
                                    Treine com <GradientText as="span">inteligência</GradientText>, alcance resultados
                                </Typography>
                                <Typography variant="body1" sx={{ color: "text.secondary", mb: 4, maxWidth: "90%" }}>
                                    PumpTrain é a plataforma de treino que combina tecnologia e ciência para maximizar seus resultados.
                                    Acompanhe seu progresso, mantenha-se motivado e alcance seus objetivos fitness.
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleStartNow}
                                        sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                                    >
                                        Começar Agora
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={handleLearnMore}
                                        sx={{ borderRadius: 2, py: 1.5, px: 4, fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                                    >
                                        Saiba Mais
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}} sx={{ zIndex: 1, textAlign: { xs: 'center', md: 'left'} }}>
                            {/* Imagem Hero */}
                            <Box
                                component="img"
                                src="/images/hero-placeholder.png"
                                alt="PumpTrain App Dashboard"
                                sx={{
                                    width: "100%",
                                    maxWidth: '600px',
                                    height: "auto",
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[10],
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </HeroSection>

            {/* Features Section */}
            <Box id="features-section" sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    {/* ... (Conteúdo da Seção Features com FeatureCard) ... */}
                    <Box sx={{ textAlign: "center", mb: 8 }}>
                        <Typography variant="overline" sx={{ color: "primary.main", letterSpacing: 2, fontWeight: 600 }}>
                            RECURSOS
                        </Typography>
                        <Typography variant="h3" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
                            Tudo que você precisa para alcançar seus objetivos
                        </Typography>
                        {/* ... (resto do texto) ... */}
                    </Box>
                    <Grid container spacing={4}>
                        {/* ... (Grid items com FeatureCard) ... */}
                        <Grid size={{xs: 12, md: 4}}> <FeatureCard icon={<LocalFireDepartmentIcon />} title="Acompanhamento de Sequência" description="..." /> </Grid>
                        <Grid size={{xs: 12, md: 4}}> <FeatureCard icon={<BarChartIcon />} title="Análise de Progresso" description="..." /> </Grid>
                        <Grid size={{xs: 12, md: 4}}> <FeatureCard icon={<EmojiEventsIcon />} title="Sistema de Conquistas" description="..." /> </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* How It Works Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.action.hover }}> {/* Usar cor do tema */}
                <Container maxWidth="lg">
                    {/* ... (Conteúdo da Seção How It Works) ... */}
                    <Box sx={{ textAlign: "center", mb: 8 }}>
                        {/* ... Títulos ... */}
                    </Box>
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{xs: 12, md: 6}}>
                            <Box component="img" src="/images/app-placeholder.png" alt="App Interface" sx={{ width: "100%", /* ... */ }}/>
                        </Grid>
                        <Grid size={{xs: 12, md: 6}}>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Testimonials Section */}
            <Box sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    {/* ... (Conteúdo da Seção Testimonials com TestimonialCard) ... */}
                    <Box sx={{ textAlign: "center", mb: 8 }}>{/* ... Títulos ... */}</Box>
                    <Grid container spacing={4}>
                        <Grid size={{xs: 12, md: 4}}> <TestimonialCard name="Carlos Silva" role="..." image="/images/user1.jpg" quote="..." /> </Grid>
                        <Grid size={{xs: 12, md: 4}}> <TestimonialCard name="Ana Oliveira" role="..." image="/images/user2.jpg" quote="..." /> </Grid>
                        <Grid size={{xs: 12, md: 4}}> <TestimonialCard name="Pedro Santos" role="..." image="/images/user3.jpg" quote="..." /> </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* FAQ Section */}
            <Box sx={{ py: { xs: 6, md: 10 } }}>
                <Container maxWidth="lg">
                    {/* ... (Conteúdo da Seção FAQ com FaqAccordion) ... */}
                    <Box sx={{ textAlign: "center", mb: 8 }}>{/* ... Títulos ... */}</Box>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid size={{xs: 12, md: 8}}>
                            {/* Passar as perguntas/respostas reais */}
                            <FaqAccordion faqs={[ { question: "Q1?", answer: "A1" }, /* ... */ ]} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: theme.palette.action.hover }}> {/* Usar cor do tema */}
                <Container maxWidth="md">
                    {/* ... (Conteúdo da Seção CTA) ... */}
                    <Box sx={{ textAlign: "center", p: { xs: 3, sm: 6 }, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                        {/* ... Icon, Typography ... */}
                        <Button variant="contained" size="large" onClick={handleStartNow} /* <<< Conectado */ sx={{ /* ... */ }}>
                            Começar Agora — É Grátis
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Rodapé */}
            <LandingFooter />
        </Box>
    );
};

export default LandingPage;