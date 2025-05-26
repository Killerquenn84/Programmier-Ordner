import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, doctor, logout } = useAuth();
  const { isIdentified, patient, setPatient } = usePatient();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePatientLogout = () => {
    setPatient(null);
    navigate('/patient-identification');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Arztpraxis-Terminverwaltung
          </Typography>
          
          {isAuthenticated && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Dr. {doctor?.lastName}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Abmelden
              </Button>
            </>
          )}
          
          {isIdentified && !isAuthenticated && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {patient?.firstName} {patient?.lastName}
              </Typography>
              <Button color="inherit" onClick={handlePatientLogout}>
                Abmelden
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Arztpraxis-Terminverwaltung
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout; 