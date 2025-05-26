import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { usePatient } from '../../hooks/usePatient';

interface MedicationListProps {
  patientId?: string;
}

// Beispiel-Medikamente für Autocomplete
const medications = [
  { name: 'Metformin', dosage: '1000mg', frequency: '2x täglich' },
  { name: 'Aspirin', dosage: '100mg', frequency: '1x täglich' },
  { name: 'Lisinopril', dosage: '10mg', frequency: '1x täglich' },
];

const validationSchema = yup.object({
  name: yup.string().required('Medikamentenname ist erforderlich'),
  dosage: yup.string().required('Dosierung ist erforderlich'),
  frequency: yup.string().required('Einnahmefrequenz ist erforderlich'),
  startDate: yup.date().required('Startdatum ist erforderlich'),
  endDate: yup.date(),
  notes: yup.string(),
});

const MedicationList: React.FC<MedicationListProps> = ({ patientId }) => {
  const [open, setOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<string | null>(null);
  const [interactions, setInteractions] = useState<string[]>([]);

  const {
    medications: patientMedications,
    isLoadingMedications,
    createMedication,
    updateMedication,
    deleteMedication,
  } = usePatient(patientId || '');

  const formik = useFormik({
    initialValues: {
      name: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      notes: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (editingMedication) {
        updateMedication({ medicationId: editingMedication, data: values });
      } else {
        createMedication(values);
      }
      handleClose();
    },
  });

  const handleOpen = (medication?: any) => {
    if (medication) {
      setEditingMedication(medication.id);
      formik.setValues({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        startDate: medication.startDate,
        endDate: medication.endDate || '',
        notes: medication.notes || '',
      });
      setInteractions(medication.interactions || []);
    } else {
      setEditingMedication(null);
      formik.resetForm();
      setInteractions([]);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMedication(null);
    formik.resetForm();
    setInteractions([]);
  };

  const checkInteractions = (medicationName: string) => {
    // TODO: Implementiere AMIS-Schnittstelle
    // Hier nur Beispiel-Interaktionen
    if (medicationName.toLowerCase().includes('metformin')) {
      setInteractions(['Mögliche Wechselwirkung mit ACE-Hemmern']);
    } else {
      setInteractions([]);
    }
  };

  if (isLoadingMedications) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Medikationsliste</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Neues Medikament
        </Button>
      </Box>

      {interactions.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              Mögliche Wechselwirkungen gefunden
            </Typography>
          </Box>
          {interactions.map((interaction, index) => (
            <Typography key={index} variant="body2" sx={{ ml: 4 }}>
              • {interaction}
            </Typography>
          ))}
        </Alert>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Medikament</TableCell>
              <TableCell>Dosierung</TableCell>
              <TableCell>Frequenz</TableCell>
              <TableCell>Startdatum</TableCell>
              <TableCell>Enddatum</TableCell>
              <TableCell>Notizen</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patientMedications?.map((medication) => (
              <TableRow key={medication.id}>
                <TableCell>
                  {medication.name}
                  {medication.interactions?.length > 0 && (
                    <Tooltip title="Wechselwirkungen vorhanden">
                      <WarningIcon color="warning" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>{medication.dosage}</TableCell>
                <TableCell>{medication.frequency}</TableCell>
                <TableCell>{new Date(medication.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{medication.endDate ? new Date(medication.endDate).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{medication.notes}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Bearbeiten">
                    <IconButton onClick={() => handleOpen(medication)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton onClick={() => deleteMedication(medication.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMedication ? 'Medikament bearbeiten' : 'Neues Medikament'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Autocomplete
                options={medications}
                getOptionLabel={(option) => option.name}
                value={medications.find((m) => m.name === formik.values.name) || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue('name', newValue?.name || '');
                  formik.setFieldValue('dosage', newValue?.dosage || '');
                  formik.setFieldValue('frequency', newValue?.frequency || '');
                  if (newValue?.name) {
                    checkInteractions(newValue.name);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Medikament"
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                )}
              />
              <TextField
                fullWidth
                id="dosage"
                name="dosage"
                label="Dosierung"
                value={formik.values.dosage}
                onChange={formik.handleChange}
                error={formik.touched.dosage && Boolean(formik.errors.dosage)}
                helperText={formik.touched.dosage && formik.errors.dosage}
              />
              <TextField
                fullWidth
                id="frequency"
                name="frequency"
                label="Einnahmefrequenz"
                value={formik.values.frequency}
                onChange={formik.handleChange}
                error={formik.touched.frequency && Boolean(formik.errors.frequency)}
                helperText={formik.touched.frequency && formik.errors.frequency}
              />
              <TextField
                fullWidth
                id="startDate"
                name="startDate"
                label="Startdatum"
                type="date"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="endDate"
                name="endDate"
                label="Enddatum"
                type="date"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notizen"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Abbrechen</Button>
            <Button type="submit" variant="contained">
              Speichern
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default MedicationList; 