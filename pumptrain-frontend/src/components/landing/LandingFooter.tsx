import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, Stack } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';
// ... (imports dos ícones) ...
// import FacebookIcon from "@mui/icons-material/Facebook";
// import TwitterIcon from "@mui/icons-material/Twitter";
// import InstagramIcon from "@mui/icons-material/Instagram";
// import YouTubeIcon from "@mui/icons-material/YouTube";
// import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";


const LandingFooter: React.FC = () => {
    return (
        // Usar cores do tema
        <Box sx={{ bgcolor: "background.paper", color: "text.primary", borderTop: (theme) => `1px solid ${theme.palette.divider}`, pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Coluna Logo e Social */}
                    <Grid size={{xs:12, md:4}}>
                        {/* ... (Logo e descrição) ... */}
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>{/* ... */}</Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, maxWidth: 300 }}>{/* ... */}</Typography>
                        <Stack direction="row" spacing={1}>{/* ... (Ícones sociais) ... */}</Stack>
                    </Grid>

                    {/* Colunas de Links (Exemplo: 'Legal') */}
                    <Grid size={{xs:6, sm:3, md:2}}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}> Legal </Typography>
                        <Stack spacing={1}>
                            {/* <<< Trocar href por component+to para rotas internas >>> */}
                            <Link component={RouterLink} to="/terms" underline="hover" color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}> Termos </Link>
                            <Link component={RouterLink} to="/privacy" underline="hover" color="text.secondary" sx={{ "&:hover": { color: "primary.main" } }}> Privacidade </Link>
                        </Stack>
                    </Grid>

                </Grid>

                <Divider sx={{ my: 4, borderColor: "rgba(119, 204, 136, 0.1)" }} />

                {/* Copyright e links inferiores */}
                <Box sx={{ display: "flex", /* ... */ }}>
                    <Typography variant="body2" color="text.secondary"> © {new Date().getFullYear()} PumpTrain. Todos os direitos reservados. </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
                        {/* Links inferiores também precisam ser adaptados */}
                        <Link component={RouterLink} to="/terms" underline="hover" color="text.secondary" variant="body2" sx={{ "&:hover": { color: "primary.main" } }}> Termos de Serviço </Link>
                        <Link component={RouterLink} to="/privacy" underline="hover" color="text.secondary" variant="body2" sx={{ "&:hover": { color: "primary.main" } }}> Política de Privacidade </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingFooter;