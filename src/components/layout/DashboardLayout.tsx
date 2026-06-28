import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'sonner';
import { BRAND_NAME, BRAND_SUBTITLE } from '../../config/env';
import { STORAGE_KEYS } from '../../constants/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeModeContext';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 72;

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Products', path: '/products', icon: <InventoryIcon /> },
  { label: 'Menu & Submenu', path: '/menu-submenu', icon: <AccountTreeIcon /> },
  { label: 'Banners', path: '/banners', icon: <ViewCarouselIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

function readSidebarCollapsed(): boolean {
  return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
}

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readSidebarCollapsed());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const isCollapsed = !isMobile && sidebarCollapsed;
  const drawerWidth = isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out', {
      description: 'You have been logged out successfully.',
    });
    navigate('/login', { replace: true });
  };

  const drawerTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  });

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          px: isCollapsed ? 1 : 2.5,
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          minHeight: 64,
        }}
      >
        {isCollapsed ? (
          <Tooltip title={BRAND_NAME} placement="right">
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
              {BRAND_NAME.charAt(0)}
            </Avatar>
          </Tooltip>
        ) : (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="primary.main" noWrap>
              {BRAND_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {BRAND_SUBTITLE}
            </Typography>
          </Box>
        )}
        {!isMobile && !isCollapsed && (
          <Tooltip title="Collapse sidebar">
            <IconButton size="small" onClick={toggleSidebar} aria-label="Collapse sidebar">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          const button = (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                px: isCollapsed ? 1 : 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 0 : 40,
                  justifyContent: 'center',
                  color: selected ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          );

          return isCollapsed ? (
            <Tooltip key={item.path} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: isCollapsed ? 1.5 : 2 }}>
        {isCollapsed ? (
          <Stack sx={{ alignItems: 'center' }}>
            <Tooltip title={`${user?.name ?? 'Admin'} — ${user?.email ?? ''}`} placement="right">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </Avatar>
            </Tooltip>
            <Tooltip title="Expand sidebar" placement="right">
              <IconButton
                size="small"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                sx={{ mt: 1 }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          transition: drawerTransition,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen((open) => !open)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {!isMobile && (
            <Tooltip title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <IconButton
                edge="start"
                onClick={toggleSidebar}
                sx={{ mr: 1 }}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {navItems.find((item) =>
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path),
            )?.label ?? 'Dashboard'}
          </Typography>

          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
              <IconButton onClick={toggleTheme} color="inherit" aria-label="Toggle theme">
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Sign out">
              <IconButton onClick={handleLogout} color="inherit" aria-label="Sign out">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          transition: drawerTransition,
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: isMobile ? DRAWER_WIDTH : drawerWidth,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              overflowX: 'hidden',
              transition: drawerTransition,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          transition: drawerTransition,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
