import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { de } from 'date-fns/locale';
import { addWeeks, addMonths, format } from 'date-fns';

interface RecurringAppointmentProps {
  onSubmit: (appointments: Array<{ datum: string; uhrzeit: string }>) => void;
}

const RecurringAppointment: React.FC<RecurringAppointmentProps> = ({ onSubmit }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<string>('weekly');
  const [recurrenceCount, setRecurrenceCount] = useState<number>(1);
  const [interval, setInterval] = useState<number>(1);

  const handleSubmit = () => {
    if (!startDate || !startTime) return;

    const appointments: Array<{ datum: string; uhrzeit: string }> = [];
    const timeString = format(startTime, 'HH:mm');

    for (let i = 0; i < recurrenceCount; i++) {
      let nextDate: Date;
      switch (recurrenceType) {
        case 'weekly':
          nextDate = addWeeks(startDate, i * interval);
          break;
        case 'monthly':
          nextDate = addMonths(startDate, i * interval);
          break;
        default:
          nextDate = startDate;
      }

      appointments.push({
        datum: format(nextDate, 'yyyy-MM-dd'),
        uhrzeit: timeString
      });
    }

    onSubmit(appointments);
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Wiederkehrender Termin
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Startdatum"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Uhrzeit"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              sx={{ width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Wiederholungstyp</InputLabel>
              <Select
                value={recurrenceType}
                label="Wiederholungstyp"
                onChange={(e) => setRecurrenceType(e.target.value)}
              >
                <MenuItem value="weekly">Wöchentlich</MenuItem>
                <MenuItem value="monthly">Monatlich</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Intervall"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Anzahl der Wiederholungen"
              value={recurrenceCount}
              onChange={(e) => setRecurrenceCount(Number(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!startDate || !startTime}
        >
          Termine erstellen
        </Button>
      </Box>
    </Paper>
  );
};

export default RecurringAppointment; 