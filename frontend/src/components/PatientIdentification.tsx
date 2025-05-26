import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box, Alert, Grid } from '@mui/material';
import axios from 'axios';

interface PatientIdentificationProps {
  onIdentificationSuccess: (patientData: any) => void;
}

const PatientIdentification: React.FC<PatientIdentificationProps> = ({ onIdentificationSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: ''
    },
    phoneNumber: '',
    email: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/patient/identify', formData);
      onIdentificationSuccess(response.data.patient);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Patienten-Identifikation
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Vorname"
              name="firstName"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nachname"
              name="lastName"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Geburtsdatum"
              name="birthDate"
              type="date"
              fullWidth
              value={formData.birthDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Telefonnummer"
              name="phoneNumber"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="E-Mail (optional)"
              name="email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Adresse
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <TextField
              label="Straße"
              name="address.street"
              fullWidth
              value={formData.address.street}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Hausnummer"
              name="address.houseNumber"
              fullWidth
              value={formData.address.houseNumber}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Postleitzahl"
              name="address.postalCode"
              fullWidth
              value={formData.address.postalCode}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Stadt"
              name="address.city"
              fullWidth
              value={formData.address.city}
              onChange={handleChange}
              required
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
            {loading ? 'Wird verarbeitet...' : 'Identifizieren'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PatientIdentification; 