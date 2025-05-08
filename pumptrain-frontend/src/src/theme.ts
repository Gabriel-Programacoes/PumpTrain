import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#77cc88",
    },
    secondary: {
      main: "#fffffc",
    },
    background: {
      default: "#06070e",
      paper: "#06070e",
    },
    text: {
      primary: "#fffffc",
      secondary: "rgba(255, 255, 252, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#06070e",
          borderBottom: "1px solid rgba(119, 204, 136, 0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#06070e",
          borderRight: "1px solid rgba(119, 204, 136, 0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#06070e",
          border: "1px solid rgba(119, 204, 136, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 252, 0.2)",
          borderRadius: 4,
          height: 6,
        },
        bar: {
          backgroundColor: "#77cc88",
          borderRadius: 4,
        },
      },
    },
  },
})
