import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface BasicDataProps {
  patientId?: string;
}

const validationSchema = yup.object({
  firstName: yup.string().required('Vorname ist erforderlich'),
  lastName: yup.string().required('Nachname ist erforderlich'),
  dateOfBirth: yup.date().required('Geburtsdatum ist erforderlich'),
  insuranceNumber: yup
    .string()
    .matches(/^[A-Z]\d{10}$/, 'Versichertennummer muss im Format A1234567890 sein')
    .required('Versichertennummer ist erforderlich'),
  address: yup.string().required('Adresse ist erforderlich'),
  phone: yup.string().required('Telefonnummer ist erforderlich'),
  email: yup.string().email('Ungültige E-Mail-Adresse'),
});

const BasicData: React.FC<BasicDataProps> = ({ patientId }) => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      insuranceNumber: '',
      address: '',
      phone: '',
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // TODO: API-Aufruf zum Speichern der Daten
    },
  });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Stammdaten
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="Vorname"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="Nachname"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="dateOfBirth"
              name="dateOfBirth"
              label="Geburtsdatum"
              type="date"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="insuranceNumber"
              name="insuranceNumber"
              label="Versichertennummer"
              value={formik.values.insuranceNumber}
              onChange={formik.handleChange}
              error={formik.touched.insuranceNumber && Boolean(formik.errors.insuranceNumber)}
              helperText={formik.touched.insuranceNumber && formik.errors.insuranceNumber}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="address"
              name="address"
              label="Adresse"
              value={formik.values.address}
              onChange={formik.handleChange}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Telefon"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="E-Mail"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            color="primary"
            variant="contained"
            type="submit"
            sx={{ minWidth: 120 }}
          >
            Speichern
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default BasicData; 