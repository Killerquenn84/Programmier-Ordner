import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import QRCode from 'qrcode.react';
import axios from 'axios';

interface TwoFactorAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['2FA aktivieren', 'QR-Code scannen', 'Code verifizieren'];

  const handleSetup = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/2fa/setup');
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setActiveStep(1);
    } catch (err) {
      setError('Fehler beim Einrichten der 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      await axios.post('/api/auth/2fa/verify', { code: verificationCode });
      onSuccess();
    } catch (err) {
      setError('Ungültiger Verifizierungscode');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Zwei-Faktor-Authentifizierung aktivieren
            </Typography>
            <Typography color="text.secondary" paragraph>
              Erhöhen Sie die Sicherheit Ihres Kontos durch die Aktivierung der Zwei-Faktor-Authentifizierung.
              Sie benötigen dafür eine Authenticator-App wie Google Authenticator oder Microsoft Authenticator.
            </Typography>
            <Button
              variant="contained"
              onClick={handleSetup}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : '2FA aktivieren'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR-Code scannen
            </Typography>
            <Typography color="text.secondary" paragraph>
              Scannen Sie den QR-Code mit Ihrer Authenticator-App oder geben Sie den Code manuell ein.
            </Typography>
            <Box sx={{ my: 3 }}>
              <QRCode value={qrCode} size={200} />
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Manueller Code:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                p: 1,
                borderRadius: 1
              }}
            >
              {secret}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              sx={{ mt: 3 }}
            >
              Weiter
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom>
              Code verifizieren
            </Typography>
            <Typography color="text.secondary" paragraph>
              Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
            </Typography>
            <TextField
              fullWidth
              label="Verifizierungscode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Abbrechen
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verifizieren'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}
    </Paper>
  );
};

export default TwoFactorAuth; 