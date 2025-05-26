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
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { usePatient } from '../../hooks/usePatient';

interface DiagnosisHistoryProps {
  patientId?: string;
}

const validationSchema = yup.object({
  date: yup.date().required('Datum ist erforderlich'),
  icdCode: yup.string().required('ICD-Code ist erforderlich'),
  description: yup.string().required('Beschreibung ist erforderlich'),
  notes: yup.string(),
});

const DiagnosisHistory: React.FC<DiagnosisHistoryProps> = ({ patientId }) => {
  const [open, setOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<string | null>(null);

  const {
    diagnoses,
    isLoadingDiagnoses,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
  } = usePatient(patientId || '');

  const formik = useFormik({
    initialValues: {
      date: '',
      icdCode: '',
      description: '',
      notes: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (editingDiagnosis) {
        updateDiagnosis({ diagnosisId: editingDiagnosis, data: values });
      } else {
        createDiagnosis(values);
      }
      handleClose();
    },
  });

  const handleOpen = (diagnosis?: any) => {
    if (diagnosis) {
      setEditingDiagnosis(diagnosis.id);
      formik.setValues({
        date: diagnosis.date,
        icdCode: diagnosis.icdCode,
        description: diagnosis.description,
        notes: diagnosis.notes || '',
      });
    } else {
      setEditingDiagnosis(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDiagnosis(null);
    formik.resetForm();
  };

  if (isLoadingDiagnoses) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Diagnosehistorie</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Neue Diagnose
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datum</TableCell>
              <TableCell>ICD-Code</TableCell>
              <TableCell>Beschreibung</TableCell>
              <TableCell>Notizen</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diagnoses?.map((diagnosis) => (
              <TableRow key={diagnosis.id}>
                <TableCell>{new Date(diagnosis.date).toLocaleDateString()}</TableCell>
                <TableCell>{diagnosis.icdCode}</TableCell>
                <TableCell>{diagnosis.description}</TableCell>
                <TableCell>{diagnosis.notes}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Bearbeiten">
                    <IconButton onClick={() => handleOpen(diagnosis)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Löschen">
                    <IconButton onClick={() => deleteDiagnosis(diagnosis.id)}>
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
          {editingDiagnosis ? 'Diagnose bearbeiten' : 'Neue Diagnose'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Datum"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                id="icdCode"
                name="icdCode"
                label="ICD-Code"
                value={formik.values.icdCode}
                onChange={formik.handleChange}
                error={formik.touched.icdCode && Boolean(formik.errors.icdCode)}
                helperText={formik.touched.icdCode && formik.errors.icdCode}
              />
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Beschreibung"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
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

export default DiagnosisHistory; 