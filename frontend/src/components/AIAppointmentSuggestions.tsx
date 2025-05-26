import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import axios from 'axios';
import { usePatient } from '../contexts/PatientContext';

const AIAppointmentSuggestions: React.FC = () => {
  const { patient } = usePatient();
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setPreferredDates([...preferredDates, date]);
    }
  };

  const handleTimeChange = (time: Date | null) => {
    if (time) {
      const timeString = time.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setPreferredTimes([...preferredTimes, timeString]);
    }
  };

  const removeDate = (index: number) => {
    const newDates = [...preferredDates];
    newDates.splice(index, 1);
    setPreferredDates(newDates);
  };

  const removeTime = (index: number) => {
    const newTimes = [...preferredTimes];
    newTimes.splice(index, 1);
    setPreferredTimes(newTimes);
  };

  const getSuggestions = async () => {
    if (!patient) {
      setError('Bitte identifizieren Sie sich zuerst als Patient.');
      return;
    }

    if (preferredDates.length === 0 || preferredTimes.length === 0) {
      setError('Bitte wählen Sie mindestens einen bevorzugten Tag und eine bevorzugte Uhrzeit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/suggest-appointments', {
        arztId: '123', // Hier sollte die tatsächliche Arzt-ID verwendet werden
        preferredDates: preferredDates.map(date => date.toISOString().split('T')[0]),
        preferredTimes,
        patientName: patient.name
      });

      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError('Fehler bei der Generierung der Terminvorschläge. Bitte versuchen Sie es später erneut.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        KI-gestützte Terminvorschläge
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Bevorzugte Tage
          </Typography>
          <DatePicker
            label="Datum auswählen"
            onChange={handleDateChange}
            sx={{ mr: 2 }}
          />
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {preferredDates.map((date, index) => (
              <Chip
                key={index}
                label={date.toLocaleDateString('de-DE')}
                onDelete={() => removeDate(index)}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Bevorzugte Uhrzeiten
          </Typography>
          <TimePicker
            label="Uhrzeit auswählen"
            onChange={handleTimeChange}
            sx={{ mr: 2 }}
          />
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {preferredTimes.map((time, index) => (
              <Chip
                key={index}
                label={time}
                onDelete={() => removeTime(index)}
              />
            ))}
          </Box>
        </Box>
      </LocalizationProvider>

      <Button
        variant="contained"
        color="primary"
        onClick={getSuggestions}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Terminvorschläge generieren'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {suggestions && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Vorgeschlagene Termine:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {suggestions}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AIAppointmentSuggestions; 