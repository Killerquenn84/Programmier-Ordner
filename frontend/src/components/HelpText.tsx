import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface HelpSection {
  title: string;
  icon: React.ReactNode;
  content: string[];
}

const HelpText: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const helpSections: HelpSection[] = [
    {
      title: 'Terminverwaltung',
      icon: <CalendarIcon />,
      content: [
        'Termine können über den Kalender oder die Listenansicht verwaltet werden.',
        'Neue Termine können durch Klicken auf einen freien Zeitpunkt erstellt werden.',
        'Bestehende Termine können durch Klicken bearbeitet oder gelöscht werden.',
        'Wiederkehrende Termine können mit der entsprechenden Funktion erstellt werden.'
      ]
    },
    {
      title: 'Patientenverwaltung',
      icon: <PersonIcon />,
      content: [
        'Patientendaten können über das Patientenmenü verwaltet werden.',
        'Neue Patienten können über den "Neuer Patient" Button hinzugefügt werden.',
        'Bestehende Patienten können durch Klicken auf den Namen bearbeitet werden.',
        'Die Patientenhistorie zeigt alle vergangenen Termine und Behandlungen.'
      ]
    },
    {
      title: 'Einstellungen',
      icon: <SettingsIcon />,
      content: [
        'Persönliche Einstellungen können im Einstellungsmenü angepasst werden.',
        'Die Sprechzeiten können für jeden Wochentag individuell festgelegt werden.',
        'Benachrichtigungen können nach Bedarf aktiviert oder deaktiviert werden.',
        'Das Erscheinungsbild kann nach persönlichen Vorlieben angepasst werden.'
      ]
    },
    {
      title: 'Sicherheit',
      icon: <SecurityIcon />,
      content: [
        'Die Zwei-Faktor-Authentifizierung erhöht die Sicherheit Ihres Kontos.',
        'Aktive Sitzungen können im Sitzungsmanagement eingesehen werden.',
        'Das Passwort sollte regelmäßig geändert werden.',
        'Bei Verdacht auf unbefugten Zugriff sollten Sie alle Sitzungen beenden.'
      ]
    },
    {
      title: 'Benachrichtigungen',
      icon: <NotificationsIcon />,
      content: [
        'Terminerinnerungen werden automatisch an Patienten gesendet.',
        'E-Mail und SMS-Benachrichtigungen können konfiguriert werden.',
        'Erinnerungen können für verschiedene Zeiträume eingestellt werden.',
        'Benachrichtigungen können für einzelne Termine deaktiviert werden.'
      ]
    },
    {
      title: 'Suche und Filter',
      icon: <SearchIcon />,
      content: [
        'Die Suchfunktion ermöglicht das schnelle Finden von Terminen und Patienten.',
        'Filter können nach verschiedenen Kriterien angewendet werden.',
        'Die Suche kann auf bestimmte Zeiträume eingeschränkt werden.',
        'Suchergebnisse können exportiert oder geteilt werden.'
      ]
    }
  ];

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <HelpIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          Hilfe & Anleitung
        </Typography>
      </Box>

      {helpSections.map((section) => (
        <Accordion
          key={section.title}
          expanded={expanded === section.title}
          onChange={handleChange(section.title)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${section.title}-content`}
            id={`${section.title}-header`}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {section.icon}
              <Typography sx={{ ml: 1 }}>
                {section.title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {section.content.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={item} />
                  </ListItem>
                  {index < section.content.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          href="/docs/user-manual.pdf"
          target="_blank"
        >
          Vollständige Benutzeranleitung herunterladen
        </Button>
      </Box>
    </Paper>
  );
};

export default HelpText; 