import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface Appointment {
  _id: string;
  datum: string;
  uhrzeit: string;
  status: string;
  patientName?: string;
  beschreibung?: string;
}

interface AppointmentSearchProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({
  appointments,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('alle');

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = 
      appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.datum.includes(searchTerm) ||
      appointment.uhrzeit.includes(searchTerm);

    const matchesStatus = statusFilter === 'alle' || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bestätigt':
        return 'success';
      case 'abgelehnt':
        return 'error';
      case 'abgesagt':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Termine suchen
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Suche nach Name, Datum, Uhrzeit oder Beschreibung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="alle">Alle</MenuItem>
              <MenuItem value="bestätigt">Bestätigt</MenuItem>
              <MenuItem value="abgelehnt">Abgelehnt</MenuItem>
              <MenuItem value="abgesagt">Abgesagt</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <List>
        {filteredAppointments.map((appointment) => (
          <ListItem
            key={appointment._id}
            divider
            sx={{
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {appointment.patientName || 'Unbekannter Patient'}
                  </Typography>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(appointment.datum), 'EEEE, d. MMMM yyyy', { locale: de })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.uhrzeit}
                  </Typography>
                  {appointment.beschreibung && (
                    <Typography variant="body2" color="text.secondary">
                      {appointment.beschreibung}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="bearbeiten"
                onClick={() => onEdit(appointment)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="löschen"
                onClick={() => onDelete(appointment._id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {filteredAppointments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Keine Termine gefunden
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AppointmentSearch; 