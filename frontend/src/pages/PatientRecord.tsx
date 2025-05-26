import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import BasicData from '../components/patient/BasicData';
import DiagnosisHistory from '../components/patient/DiagnosisHistory';
import MedicationList from '../components/patient/MedicationList';
import DocumentManagement from '../components/patient/DocumentManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientRecord: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Dashboard
          </Link>
          <Link color="inherit" href="/patients">
            Patienten
          </Link>
          <Typography color="text.primary">Patientenakte</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Stammdaten" />
          <Tab label="Diagnosehistorie" />
          <Tab label="Medikationsliste" />
          <Tab label="Dokumente" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <BasicData patientId={patientId} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <DiagnosisHistory patientId={patientId} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <MedicationList patientId={patientId} />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <DocumentManagement patientId={patientId} />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PatientRecord; 