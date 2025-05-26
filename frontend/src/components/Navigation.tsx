import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  CalendarToday,
  Person,
  Chat,
  Search,
  Settings,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor, logout } = useAuth();
  const { patient } = usePatient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const patientMenuItems = [
    { text: 'Termine', path: '/patient/appointments', icon: <CalendarToday /> },
    { text: 'Termin anfragen', path: '/patient/request', icon: <CalendarToday /> },
    { text: 'KI-Vorschläge', path: '/patient/ai-suggestions', icon: <Search /> },
    { text: 'Chatbot', path: '/patient/chatbot', icon: <Chat /> }
  ];

  const doctorMenuItems = [
    { text: 'Terminverwaltung', path: '/doctor/appointments', icon: <CalendarToday /> },
    { text: 'Einstellungen', path: '/doctor/settings', icon: <Settings /> }
  ];

  const menuItems = doctor ? doctorMenuItems : patientMenuItems;

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {doctor && (
          <ListItem button onClick={logout}>
            <ListItemIcon><ExitToApp /></ListItemIcon>
            <ListItemText primary="Abmelden" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Arztpraxis
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: isActive(item.path) ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                >
                  {item.text}
                </Button>
              ))}
              {doctor && (
                <Button
                  color="inherit"
                  startIcon={<ExitToApp />}
                  onClick={logout}
                >
                  Abmelden
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation; 