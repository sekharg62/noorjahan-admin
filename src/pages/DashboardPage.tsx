import { useEffect, useMemo, useState } from 'react';
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
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import InventoryIcon from '@mui/icons-material/Inventory';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/env';
import { getApiErrorMessage } from '../lib/apiClient';
import * as dashboardService from '../services/dashboardService';
import { getHealth } from '../services/healthService';
import type { DashboardStats } from '../types/dashboard';

type StatCardConfig = {
  key: keyof DashboardStats;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const STAT_CARDS: StatCardConfig[] = [
  { key: 'totalMenuItems', label: 'Menu items', icon: <AccountTreeIcon />, color: '#1565C0' },
  {
    key: 'totalSubmenuItems',
    label: 'Submenu items',
    icon: <SubdirectoryArrowRightIcon />,
    color: '#2E7D32',
  },
  { key: 'totalProducts', label: 'Products', icon: <InventoryIcon />, color: '#6B1D3A' },
  {
    key: 'totalProductImages',
    label: 'Product images',
    icon: <PhotoLibraryIcon />,
    color: '#C9A962',
  },
  { key: 'totalOrders', label: 'Orders', icon: <ShoppingBagIcon />, color: '#E65100' },
  { key: 'totalCustomers', label: 'Customers', icon: <PeopleIcon />, color: '#4527A0' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setStatsLoading(true);
      setStatsError(null);

      try {
        const data = await dashboardService.getDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setStatsError(getApiErrorMessage(err, 'Failed to load dashboard stats'));
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const statValues = useMemo(
    () =>
      STAT_CARDS.map((card) => ({
        ...card,
        value: stats ? String(stats[card.key]) : '—',
      })),
    [stats],
  );

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.name ?? 'Admin'}`}
        description="Live overview of your NOORJAHAN store catalog, orders, and customers."
      />

      {statsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {statsError}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statValues.map((card) => (
          <Grid key={card.key} size={{ xs: 12, sm: 6, md: 4 }}>
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
                    {statsLoading ? (
                      <CircularProgress size={22} sx={{ mt: 0.5 }} />
                    ) : (
                      <Typography variant="h5">{card.value}</Typography>
                    )}
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
