'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
    palette: {
        primary: {
            main: '#4338ca', // Indigo 700 (matching Tailwind)
            light: '#6366f1', // Indigo 500
            dark: '#312e81', // Indigo 900
            contrastText: '#fff',
        },
        secondary: {
            main: '#ec4899', // Pink 500
            light: '#f472b6',
            dark: '#db2777',
            contrastText: '#fff',
        },
        background: {
            default: '#f9fafb', // Gray 50
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray 900
            secondary: '#6b7280', // Gray 500
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: '12px',
                },
            },
        },
    },
});

export default theme;
