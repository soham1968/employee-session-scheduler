import React from 'react';
import ReactDOM from 'react-dom/client';  // Use 'react-dom/client' instead of 'react-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme(); // Optional: Customize your MUI theme here

// This is the new way of rendering in React 18
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
