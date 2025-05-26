import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box, Alert, Grid } from '@mui/material';
import { usePatient } from '../contexts/PatientContext';
import axios from 'axios';

const PatientAppointmentRequest: React.FC = () => {
  const { patient } = usePatient();
  const [formData, setFormData] = useState({
    arztId: '',
    datum: '',
    uhrzeit: '',
    kommentar: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient) {
      setError('Bitte identifizieren Sie sich zuerst als Patient');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('/api/appointments', {
        ...formData,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientGeburtsdatum: patient.birthDate
      });
      
      setSuccess('Terminanfrage erfolgreich gesendet');
      setFormData({
        arztId: '',
        datum: '',
        uhrzeit: '',
        kommentar: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Terminanfrage
        </Typography>
        <Alert severity="warning">
          Bitte identifizieren Sie sich zuerst als Patient, um einen Termin anzufragen.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Terminanfrage
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Arzt-ID"
              name="arztId"
              fullWidth
              value={formData.arztId}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Datum"
              name="datum"
              type="date"
              fullWidth
              value={formData.datum}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Uhrzeit"
              name="uhrzeit"
              type="time"
              fullWidth
              value={formData.uhrzeit}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Kommentar (optional)"
              name="kommentar"
              fullWidth
              multiline
              rows={3}
              value={formData.kommentar}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Wird gesendet...' : 'Termin anfragen'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PatientAppointmentRequest; 