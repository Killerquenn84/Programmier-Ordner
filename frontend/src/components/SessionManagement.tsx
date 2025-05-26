import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Computer as ComputerIcon,
  Phone as PhoneIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
}

const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/sessions');
      setSessions(response.data);
    } catch (err) {
      setError('Fehler beim Laden der Sitzungen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await axios.delete(`/api/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(session => session.id !== sessionId));
      setConfirmDialogOpen(false);
    } catch (err) {
      setError('Fehler beim Löschen der Sitzung');
    }
  };

  const handleDeleteAllSessions = async () => {
    try {
      await axios.delete('/api/auth/sessions');
      setSessions(sessions.filter(session => session.current));
      setConfirmDialogOpen(false);
    } catch (err) {
      setError('Fehler beim Löschen aller Sitzungen');
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <ComputerIcon />;
      case 'mobile':
        return <PhoneIcon />;
      case 'tablet':
        return <TabletIcon />;
      default:
        return <ComputerIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Aktive Sitzungen
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchSessions}
          disabled={loading}
        >
          Aktualisieren
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <List>
        {sessions.map((session) => (
          <React.Fragment key={session.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getDeviceIcon(session.device)}
                    <Typography variant="subtitle1">
                      {session.browser} auf {session.device}
                    </Typography>
                    {session.current && (
                      <Chip
                        label="Aktuelle Sitzung"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {session.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Letzte Aktivität: {formatDate(session.lastActive)}
                    </Typography>
                  </>
                }
              />
              {!session.current && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="löschen"
                    onClick={() => {
                      setSelectedSession(session);
                      setConfirmDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {sessions.length > 1 && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setSelectedSession(null);
              setConfirmDialogOpen(true);
            }}
          >
            Alle anderen Sitzungen beenden
          </Button>
        </Box>
      )}

      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          {selectedSession ? 'Sitzung beenden?' : 'Alle anderen Sitzungen beenden?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedSession
              ? `Möchten Sie die Sitzung auf ${selectedSession.device} (${selectedSession.browser}) wirklich beenden?`
              : 'Möchten Sie wirklich alle anderen aktiven Sitzungen beenden?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={() => {
              if (selectedSession) {
                handleDeleteSession(selectedSession.id);
              } else {
                handleDeleteAllSessions();
              }
            }}
            color="error"
            variant="contained"
          >
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SessionManagement; 