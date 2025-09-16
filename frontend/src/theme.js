import { createTheme } from "@mui/material/styles";

// Azul del footer (Material UI: #0d1b2a)
const primaryBlue = "#0d1b2a";

const theme = createTheme({
  palette: {
    primary: {
      main: primaryBlue,
      contrastText: "#fff",
    },
    secondary: {
      main: "#1b263b", // Un azul más claro para contraste
      contrastText: "#fff",
    },
    background: {
      default: "#f4f6fa",
      paper: "#fff",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: primaryBlue,
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
  },
});

export default theme;
