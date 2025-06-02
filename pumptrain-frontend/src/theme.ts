import {alpha, createTheme} from '@mui/material';
import { ptBR } from '@mui/material/locale'; // Importar localização pt-BR

const primaryColor = '#77cc88'; // Emerald
// const secondaryColor = '#06070e'; // Beauty Black
const darkBackgroundDefault = '#121212';
const darkBackgroundPaper = '#1e1e1e';
const appBarDarkBackground = '#06070e';
// const secondaryColor = '#06070e'; // Beauty Black

// Outras cores
// #f57200 = safety orange
// #1216b = oxford blue
// #fffffc = baby powder
// #7c898b = battleship gray
// #77cc88 = emerald
// #06070e = beauty black

export const createAppTheme = () =>
    createTheme(
        {
            palette: {
                mode: 'dark',
                primary: {
                    main: primaryColor,
                    // contrastText: '#06070e',
                    contrastText: '#121212',
                    // light: alpha(primaryColor, 0.8),
                    // dark: alpha(primaryColor, 0.6),
                },
                error: {
                    main: '#b11d29'
                },
                warning: {
                    main: '#f57200'
                },
                success: {
                    main: primaryColor
                },
                info: {
                    main: '#7c898b'
                },
                background: {
                    default: darkBackgroundDefault,
                    paper: darkBackgroundPaper,
                },
                text: {
                    primary: '#f0f0f0',
                    secondary: 'rgba(240, 240, 240, 0.7)',
                    disabled: 'rgba(240, 240, 240, 0.5)',
                },
                divider: 'rgba(119, 204, 136, 0.12)',
            },
            typography: {
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                h1: { fontWeight: 700, fontSize: '3rem' },
                h2: { fontWeight: 700, fontSize: '2.5rem' },
                h3: { fontWeight: 600, fontSize: '2rem' },
                h4: { fontWeight: 600, fontSize: '1.75rem' },
                h5: { fontWeight: 500, fontSize: '1.5rem' },
                h6: { fontWeight: 500, fontSize: '1.25rem' },
                button: { // Adicionado de volta se desejar
                    textTransform: 'none',
                    fontWeight: 600,
                }
            },
            shape: {
                borderRadius: 10,
            },
            components: {
                MuiAppBar: {
                    styleOverrides: {
                        root: ({ theme }) => ({
                            backgroundColor: appBarDarkBackground, // Cor escura específica para AppBar
                            color: theme.palette.text.primary, // Usa a cor de texto primária definida
                            borderBottom: `1px solid ${theme.palette.divider}`, // Usa a cor de divisor definida
                            // borderRadius: theme.shape.borderRadius, // Opcional: AppBar com borda arredondada?
                        }),
                    },
                    defaultProps: {
                        elevation: 1, // Mantido
                    }
                },
                MuiDrawer: {
                    styleOverrides: {
                        paper: ({ theme }) => ({
                            backgroundColor: theme.palette.background.paper, // Usa paper para contraste com default
                            borderRight: `1px solid ${theme.palette.divider}`,
                        })
                    }
                },
                MuiCard: { // Override para Card, se desejar consistência
                    styleOverrides: {
                        root: ({ theme }) => ({
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                        }),
                    },
                    defaultProps: {
                        elevation: 0, // Ou uma pequena elevação para dark mode
                    }
                },
                MuiButton: { // Override para Button
                    styleOverrides: {
                        root: {
                            borderRadius: 8, // Mantém seu borderRadius
                        }
                    },
                    // defaultProps: { // Exemplo
                    //  disableElevation: true,
                    // }
                },
                MuiLinearProgress: { // Mantido como estava, parece ok
                    styleOverrides: {
                        root: {
                            backgroundColor: "rgba(255, 255, 252, 0.2)",
                            borderRadius: 4,
                            height: 6,
                        },
                        bar: {
                            backgroundColor: primaryColor,
                            borderRadius: 4,
                        },
                    },
                },
                MuiTextField: { // Exemplo de override para TextField no modo escuro
                    styleOverrides: {
                        root: ({ theme }) => ({
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                },
                                '&:hover fieldset': {
                                    borderColor: alpha(theme.palette.primary.main, 0.6),
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                                // Cor de fundo para inputs se desejado
                                // backgroundColor: alpha(theme.palette.common.white, 0.05),
                            },
                            '& .MuiInputLabel-root': {
                                // color: theme.palette.text.secondary,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                // color: theme.palette.primary.main,
                            }
                        }),
                    }
                }
            },
        },
        ptBR // Localização mantida
    );