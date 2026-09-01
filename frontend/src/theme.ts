import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#C98282",
      light: "#E8B6A7",
      dark: "#A96868",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#D9A18E",
      light: "#F3C6B5",
      dark: "#B97968",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#FFF7F3",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#3E3030",
      secondary: "#756765",
    },

    divider: "#F0DFDA",

    success: {
      main: "#6E9B7B",
    },

    error: {
      main: "#C96F6F",
    },

    warning: {
      main: "#D59A62",
    },
  },

  typography: {
    fontFamily:
      '"Inter", "Roboto", "Arial", sans-serif',

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 700,
    },

    h6: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  shape: {
    borderRadius: 12,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "linear-gradient(135deg, #FFF8F4 0%, #FFF3EF 48%, #FCEDE8 100%)",
          minHeight: "100vh",
        },

        "#root": {
          minHeight: "100vh",
        },

        "*": {
          boxSizing: "border-box",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border:
            "1px solid rgba(224, 193, 184, 0.42)",
          boxShadow:
            "0 5px 24px rgba(104, 73, 67, 0.07)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "9px 18px",
        },

        containedPrimary: {
          background:
            "linear-gradient(135deg, #C98282, #D99A8A)",
          boxShadow:
            "0 7px 18px rgba(201, 130, 130, 0.22)",

          "&:hover": {
            background:
              "linear-gradient(135deg, #B87474, #C98B7D)",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 11,

          "&:hover .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#D9A1A1",
            },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#C98282",
            },
        },

        notchedOutline: {
          borderColor: "#E7D8D3",
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 11,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;