import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import AppToaster from './components/toast/AppToaster';
import { AuthProvider } from './contexts/AuthContext';
import { AppThemeProvider } from './contexts/ThemeModeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <AppToaster />
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  </StrictMode>,
);
