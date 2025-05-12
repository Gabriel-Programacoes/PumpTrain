import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, Stack, IconButton } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';

import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

const LandingFooter: React.FC = () => {
    const commonLinkSx = {
        "&:hover": { color: "primary.main" },
        textDecoration: 'none'
    };

    return (
        <Box sx={{ bgcolor: "background.paper", color: "text.primary", borderTop: (theme) => `1px solid ${theme.palette.divider}`, pt: 8, pb: 4 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    {/* Coluna Logo, Descrição e Social */}
                    <Grid size={{xs:12, md: 4}}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <FitnessCenterIcon sx={{ color: "primary.main", mr: 1.5, fontSize: '2rem' }} />
                            <Typography
                                variant="h5" // Um pouco maior para o footer
                                component="div"
                                sx={{ fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", color: "primary.main" }}
                            >
                                PumpTrain
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, maxWidth: 320 }}>
                            Sua jornada para uma vida mais saudável e um corpo mais forte começa aqui. Maximize seus resultados com PUMPTRAIN.
                        </Typography>
                        <Stack direction="row" spacing={1.5}> {/* Aumentado spacing */}
                            <IconButton aria-label="Facebook" size="medium" component="a" href="https://facebook.com" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                                <FacebookIcon />
                            </IconButton>
                            <IconButton aria-label="Twitter" size="medium" component="a" href="https://twitter.com" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                                <TwitterIcon />
                            </IconButton>
                            <IconButton aria-label="Instagram" size="medium" component="a" href="https://instagram.com" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                                <InstagramIcon />
                            </IconButton>
                            <IconButton aria-label="YouTube" size="medium" component="a" href="https://youtube.com" target="_blank" sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                                <YouTubeIcon />
                            </IconButton>
                        </Stack>
                    </Grid>

                    {/* Colunas de Links */}
                    <Grid size={{xs:6, sm:3, md: 2}}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}> {/* Cor ajustada */}
                            Produto
                        </Typography>
                        <Stack spacing={1.5}> {/* Aumentado spacing */}
                            <Link component={RouterLink} to="/features" underline="hover" color="text.secondary" sx={commonLinkSx}>Recursos</Link>
                            <Link component={RouterLink} to="/mobile-app" underline="hover" color="text.secondary" sx={commonLinkSx}>Aplicativo</Link>
                            <Link component={RouterLink} to="/integrations" underline="hover" color="text.secondary" sx={commonLinkSx}>Integrações</Link>
                        </Stack>
                    </Grid>

                    <Grid size={{xs:6, sm:3, md: 2}}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
                            Empresa
                        </Typography>
                        <Stack spacing={1.5}>
                            <Link component={RouterLink} to="/about" underline="hover" color="text.secondary" sx={commonLinkSx}>Sobre Nós</Link>
                            <Link component={RouterLink} to="/careers" underline="hover" color="text.secondary" sx={commonLinkSx}>Carreiras</Link>
                            <Link component={RouterLink} to="/blog" underline="hover" color="text.secondary" sx={commonLinkSx}>Blog</Link>
                            {/* <Link component={RouterLink} to="/press" underline="hover" color="text.secondary" sx={commonLinkSx}>Imprensa</Link> */}
                        </Stack>
                    </Grid>

                    <Grid size={{xs:6, sm:3, md: 2}}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
                            Suporte
                        </Typography>
                        <Stack spacing={1.5}>
                            <Link component={RouterLink} to="/help" underline="hover" color="text.secondary" sx={commonLinkSx}>Central de Ajuda</Link>
                            <Link component={RouterLink} to="/contact" underline="hover" color="text.secondary" sx={commonLinkSx}>Contato</Link>
                            <Link component={RouterLink} to="/faq" underline="hover" color="text.secondary" sx={commonLinkSx}>FAQ</Link>
                            {/* <Link component={RouterLink} to="/community" underline="hover" color="text.secondary" sx={commonLinkSx}>Comunidade</Link> */}
                        </Stack>
                    </Grid>

                    <Grid size={{xs:6, sm:3, md: 2}}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
                            Legal
                        </Typography>
                        <Stack spacing={1.5}>
                            <Link component={RouterLink} to="/terms" underline="hover" color="text.secondary" sx={commonLinkSx}>Termos</Link>
                            <Link component={RouterLink} to="/privacy" underline="hover" color="text.secondary" sx={commonLinkSx}>Privacidade</Link>
                            <Link component={RouterLink} to="/cookies" underline="hover" color="text.secondary" sx={commonLinkSx}>Cookies</Link>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderColor: (theme) => theme.palette.divider }} /> {/* Usar cor do tema */}

                {/* Copyright e links inferiores */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: "center", // Centraliza verticalmente no mobile
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: {xs: 'center', sm: 'left'} }}> {/* Centraliza texto no mobile */}
                        © {new Date().getFullYear()} PumpTrain. Todos os direitos reservados.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mt: { xs: 2, sm: 0 } }}>
                        <Link component={RouterLink} to="/terms" underline="hover" color="text.secondary" variant="body2" sx={commonLinkSx}> Termos de Serviço </Link>
                        <Link component={RouterLink} to="/privacy" underline="hover" color="text.secondary" variant="body2" sx={commonLinkSx}> Política de Privacidade </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingFooter;