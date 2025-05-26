import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" color="error" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Seite nicht gefunden
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Zur Startseite</Button>
      </Paper>
    </Box>
  );
};

export default NotFound; 