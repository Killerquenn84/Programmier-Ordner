import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import axios from 'axios';
import { usePatient } from '../contexts/PatientContext';

interface Appointment {
  _id: string;
  arztId: string;
  datum: string;
  uhrzeit: string;
  status: string;
  kommentar?: string;
}

const PatientAppointmentList: React.FC = () => {
  const { patient } = usePatient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patient) return;

      try {
        const response = await axios.get('/api/appointments', {
          params: {
            patientName: patient.name,
            patientGeburtsdatum: patient.geburtsdatum
          }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Termine:', error);
      }
    };

    fetchAppointments();
  }, [patient]);

  if (!patient) {
    return (
      <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Meine Termine
        </Typography>
        <Typography>Bitte identifizieren Sie sich zuerst als Patient.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Meine Termine
      </Typography>
      <List>
        {appointments.map((appt) => (
          <ListItem key={appt._id} divider>
            <ListItemText
              primary={`Termin am ${appt.datum} um ${appt.uhrzeit}`}
              secondary={
                appt.kommentar && (
                  <Box component="span" sx={{ mt: 1 }}>
                    Kommentar: {appt.kommentar}
                  </Box>
                )
              }
            />
            <Chip
              label={appt.status}
              color={
                appt.status === 'bestätigt'
                  ? 'success'
                  : appt.status === 'abgelehnt'
                  ? 'error'
                  : appt.status === 'abgesagt'
                  ? 'warning'
                  : 'default'
              }
              size="small"
            />
          </ListItem>
        ))}
        {appointments.length === 0 && (
          <ListItem>
            <ListItemText primary="Keine Termine gefunden" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default PatientAppointmentList; 