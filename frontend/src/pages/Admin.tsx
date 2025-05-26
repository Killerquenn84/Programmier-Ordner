import React from 'react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { secureStorage, DataSegment } from '../services/auth';
const { Configuration, OpenAIApi } = require('openai');
const Practice = require('./models/practice');

const SUPERADMIN_EMAIL = 'Killerquenn@googlemail.com';

require('dotenv').config();

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const faqExamples = [
  { q: 'Wie kann ich einen Termin buchen?', a: 'Sie können einen Termin direkt im Patientenportal buchen.' },
  { q: 'Wie bekomme ich ein Rezept?', a: 'Sie können Rezepte über das Online-Formular anfordern.' }
];
const systemPrompt = [
  'Du bist ein medizinischer Assistent.',
  ...faqExamples.map(faq => `Q: ${faq.q}\nA: ${faq.a}`)
].join('\n');

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const user = secureStorage.get('user', DataSegment.ADMIN);

  if (!user || user.email !== SUPERADMIN_EMAIL) {
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

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 400, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Super-Admin Bereich
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Hier sehen Sie alle registrierten Praxen, Abos und Zahlungen (Platzhalter).
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mb: 2 }}
          onClick={() => navigate('/security-test')}
        >
          Security-Test starten
        </Button>
        {/* Hier könnten Tabellen/Listen für Praxen, Abos, Zahlungen folgen */}
        <Typography variant="body2" color="text.secondary">
          (Weitere Admin-Funktionen können hier ergänzt werden)
        </Typography>
      </Paper>
    </Box>
  );
};

async function suspendOverdueAccounts() {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await Practice.updateMany(
    { lastPaymentDate: { $lt: fourteenDaysAgo }, status: 'active' },
    { status: 'suspended' }
  );
  console.log('Überfällige Konten wurden gesperrt.');
}

// Beispiel: alle 24h aufrufen (z. B. mit node-cron oder externem Scheduler)

export default Admin; 