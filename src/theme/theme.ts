import { createTheme, type PaletteMode } from '@mui/material/styles';

const brandColors = {
  primary: {
    main: '#6B1D3A',
    light: '#8F3A5C',
    dark: '#4A1228',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#C9A962',
    light: '#D9C48A',
    dark: '#A88B42',
    contrastText: '#1A1A1A',
  },
};

export function createAppTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      ...(mode === 'light'
        ? {
            background: {
              default: '#F7F5F2',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#1A1A1A',
              secondary: '#5C5C5C',
            },
          }
        : {
            background: {
              default: '#121212',
              paper: '#1E1E1E',
            },
            text: {
              primary: '#F5F5F5',
              secondary: '#B0B0B0',
            },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}
