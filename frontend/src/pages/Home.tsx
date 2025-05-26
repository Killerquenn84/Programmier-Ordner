import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Willkommen im Healthcare SaaS System
        </Typography>
        <Typography variant="body1">
          Dies ist die Startseite Ihrer Anwendung. Nutzen Sie das Menü, um zu den verschiedenen Modulen zu navigieren.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home; 