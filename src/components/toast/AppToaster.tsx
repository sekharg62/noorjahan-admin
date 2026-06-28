import { Toaster as SonnerToaster } from 'sonner';
import { useThemeMode } from '../../contexts/ThemeModeContext';

export default function AppToaster() {
  const { mode } = useThemeMode();

  return (
    <SonnerToaster
      theme={mode}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }}
    />
  );
}
