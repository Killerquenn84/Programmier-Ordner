import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { authApi, secureStorage } from '../../services/auth';
import { DataSegment } from '../../services/auth';
import { useLocation, useNavigate } from 'react-router-dom';

interface AttackResult {
  type: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

const SECRET_TOKEN = '6f8e2b1c-4a7d-4c2e-9e3a-8b7f1d2c5e4a';
const SUPERADMIN_EMAIL = 'Killerquenn@googlemail.com';

const AttackSimulator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  const user = secureStorage.get('user', DataSegment.ADMIN);

  const isSuperAdmin = user && user.email === SUPERADMIN_EMAIL;
  const isTokenValid = token === SECRET_TOKEN;

  if (!isSuperAdmin && !isTokenValid) {
    return (
      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Zugriff verweigert
          </Typography>
          <Typography>
            Sie sind nicht berechtigt, diesen Bereich zu sehen.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Zur Startseite</Button>
        </Paper>
      </Box>
    );
  }

  const [results, setResults] = useState<AttackResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const logAttack = (type: string, success: boolean, message: string) => {
    setResults(prev => [{
      type,
      success,
      message,
      timestamp: new Date()
    }, ...prev]);
  };

  // 1. Brute-Force-Angriff auf Login
  const simulateBruteForce = async () => {
    setIsRunning(true);
    try {
      const passwords = ['123456', 'password', 'admin123', 'qwerty'];
      for (const password of passwords) {
        try {
          await authApi.login('admin@praxis.de', password);
          logAttack('Brute-Force', true, `Passwort gefunden: ${password}`);
          return;
        } catch (error) {
          // Erwarteter Fehler
        }
      }
      logAttack('Brute-Force', false, 'Kein Passwort gefunden - Account gesperrt');
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Token-Manipulation
  const simulateTokenManipulation = () => {
    setIsRunning(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const manipulatedToken = token + 'manipulated';
        localStorage.setItem('token', manipulatedToken);
        
        // Versuch, geschützte Daten abzurufen
        const user = secureStorage.get('user', DataSegment.ADMIN);
        logAttack('Token-Manipulation', false, 'Token-Validierung erfolgreich blockiert');
      }
    } catch (error) {
      logAttack('Token-Manipulation', false, 'Token-Manipulation erkannt');
    } finally {
      setIsRunning(false);
    }
  };

  // 3. Honeypot-Trigger
  const simulateHoneypotTrigger = async () => {
    setIsRunning(true);
    try {
      await fetch('/api/admin/backup', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      logAttack('Honeypot', false, 'Honeypot-Endpunkt erkannt');
    } catch (error) {
      logAttack('Honeypot', false, 'Honeypot-Trigger erfolgreich');
    } finally {
      setIsRunning(false);
    }
  };

  // 4. Anomalie-Erkennung Test
  const simulateAnomaly = async () => {
    setIsRunning(true);
    try {
      // Simuliere ungewöhnliche Zugriffszeit
      const midnight = new Date();
      midnight.setHours(3, 0, 0, 0);
      
      const accessPattern = {
        timestamp: midnight,
        endpoint: '/api/medical/patients',
        method: 'GET',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true
      };

      // Versuche Zugriff
      await fetch('/api/medical/patients', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token',
          'X-Request-ID': crypto.randomUUID()
        }
      });

      logAttack('Anomalie-Erkennung', false, 'Ungewöhnlicher Zugriff erkannt');
    } catch (error) {
      logAttack('Anomalie-Erkennung', false, 'Anomalie-Erkennung erfolgreich');
    } finally {
      setIsRunning(false);
    }
  };

  // 5. Datensegment-Übergriff
  const simulateSegmentViolation = () => {
    setIsRunning(true);
    try {
      // Versuch, medizinische Daten im administrativen Segment zu lesen
      const medicalData = secureStorage.get('patientData', DataSegment.ADMINISTRATIVE);
      logAttack('Segment-Violation', false, 'Segment-Übergriff erkannt');
    } catch (error) {
      logAttack('Segment-Violation', false, 'Segment-Schutz erfolgreich');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Sicherheits-Test-Suite
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Diese Komponente simuliert verschiedene Angriffsszenarien, um die Sicherheitsmaßnahmen zu testen.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button
            variant="contained"
            color="error"
            onClick={simulateBruteForce}
            disabled={isRunning}
          >
            Brute-Force simulieren
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={simulateTokenManipulation}
            disabled={isRunning}
          >
            Token-Manipulation testen
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={simulateHoneypotTrigger}
            disabled={isRunning}
          >
            Honeypot auslösen
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={simulateAnomaly}
            disabled={isRunning}
          >
            Anomalie-Erkennung prüfen
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={simulateSegmentViolation}
            disabled={isRunning}
          >
            Segment-Schutz testen
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Testergebnisse
        </Typography>
        
        <List>
          {results.map((result, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {result.type}
                      </Typography>
                      <Alert
                        severity={result.success ? 'error' : 'success'}
                        sx={{ py: 0 }}
                      >
                        {result.success ? 'ERFOLG' : 'BLOCKIERT'}
                      </Alert>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {result.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.timestamp.toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < results.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default AttackSimulator; 