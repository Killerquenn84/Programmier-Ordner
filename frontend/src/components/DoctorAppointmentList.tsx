import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Chip, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Appointment {
  _id: string;
  patientName: string;
  patientGeburtsdatum: string;
  datum: string;
  uhrzeit: string;
  status: string;
  kommentar?: string;
}

const DoctorAppointmentList: React.FC = () => {
  const { doctor } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = () => {
    if (!doctor) return;
    axios
      .get(`/api/appointments/doctor/${doctor.id}`)
      .then((res) => setAppointments(res.data))
      .catch((error) => console.error('Fehler beim Abrufen der Termine:', error));
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  const handleAction = async (id: string, action: 'confirm' | 'reject') => {
    try {
      await axios.post(`/api/appointments/${id}/${action}`);
      fetchAppointments();
    } catch (error) {
      console.error(`Fehler bei der Termin-${action}:`, error);
    }
  };

  if (!doctor) {
    return (
      <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Termin-Anfragen
        </Typography>
        <Typography>Bitte melden Sie sich an, um Termine zu verwalten.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Termin-Anfragen
      </Typography>
      <List>
        {appointments.map((appt) => (
          <ListItem key={appt._id} divider>
            <ListItemText
              primary={`Patient: ${appt.patientName} (${appt.patientGeburtsdatum})`}
              secondary={
                <>
                  Am {appt.datum} um {appt.uhrzeit}
                  {appt.kommentar && (
                    <Box component="span" sx={{ ml: 2 }}>
                      Kommentar: {appt.kommentar}
                    </Box>
                  )}
                </>
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
              sx={{ mr: 2 }}
            />
            {appt.status === 'angefragt' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={() => handleAction(appt._id, 'confirm')}
                >
                  Bestätigen
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleAction(appt._id, 'reject')}
                >
                  Ablehnen
                </Button>
              </>
            )}
          </ListItem>
        ))}
        {appointments.length === 0 && (
          <ListItem>
            <ListItemText primary="Keine Terminanfragen vorhanden" />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default DoctorAppointmentList; 