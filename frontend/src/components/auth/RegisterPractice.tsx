import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/auth';

const validationSchema = yup.object({
  // Praxis-Daten
  name: yup.string().required('Praxisname ist erforderlich'),
  address: yup.string().required('Adresse ist erforderlich'),
  phone: yup.string().required('Telefonnummer ist erforderlich'),
  email: yup
    .string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  licenseNumber: yup.string().required('Lizenznummer ist erforderlich'),

  // Admin-Daten
  firstName: yup.string().required('Vorname ist erforderlich'),
  lastName: yup.string().required('Nachname ist erforderlich'),
  adminEmail: yup
    .string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: yup
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .required('Passwort ist erforderlich'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwörter stimmen nicht überein')
    .required('Passwortbestätigung ist erforderlich'),
});

const steps = ['Praxis-Daten', 'Administrator-Daten', 'Bestätigung'];

const RegisterPractice: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      // Praxis-Daten
      name: '',
      address: '',
      phone: '',
      email: '',
      licenseNumber: '',

      // Admin-Daten
      firstName: '',
      lastName: '',
      adminEmail: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      try {
        // Praxis registrieren
        const practice = await authApi.registerPractice({
          name: values.name,
          address: values.address,
          phone: values.phone,
          email: values.email,
          licenseNumber: values.licenseNumber,
        });

        // Admin-Benutzer registrieren
        await authApi.registerUser({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.adminEmail,
          password: values.password,
          role: 'admin',
        });

        navigate('/login', {
          state: { message: 'Registrierung erfolgreich. Bitte melden Sie sich an.' },
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Praxisname"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="address"
              name="address"
              label="Adresse"
              value={formik.values.address}
              onChange={formik.handleChange}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Telefon"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Praxis-E-Mail"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="licenseNumber"
              name="licenseNumber"
              label="Lizenznummer"
              value={formik.values.licenseNumber}
              onChange={formik.handleChange}
              error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
              helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
              disabled={isLoading}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="Vorname"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="Nachname"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="adminEmail"
              name="adminEmail"
              label="E-Mail"
              value={formik.values.adminEmail}
              onChange={formik.handleChange}
              error={formik.touched.adminEmail && Boolean(formik.errors.adminEmail)}
              helperText={formik.touched.adminEmail && formik.errors.adminEmail}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Passwort"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Passwort bestätigen"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={isLoading}
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Praxis-Daten
            </Typography>
            <Typography>
              <strong>Name:</strong> {formik.values.name}
            </Typography>
            <Typography>
              <strong>Adresse:</strong> {formik.values.address}
            </Typography>
            <Typography>
              <strong>Telefon:</strong> {formik.values.phone}
            </Typography>
            <Typography>
              <strong>E-Mail:</strong> {formik.values.email}
            </Typography>
            <Typography>
              <strong>Lizenznummer:</strong> {formik.values.licenseNumber}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Administrator-Daten
            </Typography>
            <Typography>
              <strong>Name:</strong> {formik.values.firstName} {formik.values.lastName}
            </Typography>
            <Typography>
              <strong>E-Mail:</strong> {formik.values.adminEmail}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Praxis registrieren
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || isLoading}
              onClick={handleBack}
            >
              Zurück
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Registrieren'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isLoading}
              >
                Weiter
              </Button>
            )}
          </Box>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/login')}
          >
            Bereits registriert? Anmelden
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPractice; 