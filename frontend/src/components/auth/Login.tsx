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
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authApi, secureStorage } from '../../services/auth';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Ungültige E-Mail-Adresse')
    .required('E-Mail ist erforderlich'),
  password: yup
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .required('Passwort ist erforderlich'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      try {
        const { user, practice } = await authApi.login(values.email, values.password);
        secureStorage.set('user', user);
        secureStorage.set('practice', practice);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Anmeldung fehlgeschlagen');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Anmelden
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="E-Mail"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Anmelden'}
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/forgot-password')}
            sx={{ mr: 2 }}
          >
            Passwort vergessen?
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/register')}
          >
            Praxis registrieren
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 