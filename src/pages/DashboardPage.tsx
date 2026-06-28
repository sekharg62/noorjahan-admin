import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getHealth } from '../services/healthService';
import { API_URL } from '../config/env';

type StatCard = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
};

const statCards: StatCard[] = [
  { label: 'Products', value: '—', icon: <InventoryIcon />, color: '#6B1D3A' },
  { label: 'Menu & Submenu', value: '—', icon: <AccountTreeIcon />, color: '#1565C0' },
  { label: 'Banners', value: '—', icon: <ViewCarouselIcon />, color: '#C9A962' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const health = await getHealth();
        if (!cancelled) setApiStatus(health.success ? 'ok' : 'error');
      } catch {
        if (!cancelled) setApiStatus('error');
      }
    }

    void checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.name ?? 'Admin'}`}
        description="Overview of your NOORJAHAN store. Connect the backend API to see live data."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: `${card.color}14`,
                      color: card.color,
                      display: 'flex',
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h5">{card.value}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
            System status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                API ({API_URL})
              </Typography>
              {apiStatus === 'loading' && <CircularProgress size={18} />}
              {apiStatus === 'ok' && <Chip label="Connected" color="success" size="small" />}
              {apiStatus === 'error' && <Chip label="Unreachable" color="error" size="small" />}
            </Box>
          </Box>

          {apiStatus === 'error' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Start the backend with <code>npm run dev</code> in the <code>backend</code> folder
              and ensure <code>CORS_ORIGIN</code> includes this app&apos;s URL.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
