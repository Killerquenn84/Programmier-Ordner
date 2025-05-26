import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { usePatient } from '../../hooks/usePatient';

interface DocumentManagementProps {
  patientId?: string;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ patientId }) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    documents,
    isLoadingDocuments,
    uploadDocument,
    deleteDocument,
  } = usePatient(patientId || '');

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (const file of acceptedFiles) {
      try {
        await uploadDocument({
          file,
          onProgress: (progress) => setUploadProgress(progress),
        });
      } catch (error) {
        console.error('Fehler beim Hochladen:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const handleDownload = (document: any) => {
    // TODO: Implementiere Download-Funktionalität
    console.log('Download document:', document);
  };

  const handleViewHistory = (document: any) => {
    setSelectedDocument(document);
  };

  if (isLoadingDocuments) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dokumentenmanagement
      </Typography>

      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          mb: 3,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography>
          {isDragActive
            ? 'Dateien hier ablegen...'
            : 'Dateien hierher ziehen oder klicken zum Auswählen'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Unterstützte Formate: PDF, PNG, JPG
        </Typography>
      </Box>

      {isUploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <List>
        {documents?.map((document) => (
          <ListItem
            key={document.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <DescriptionIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={document.name}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(document.uploadDate).toLocaleDateString()}
                  </Typography>
                  <Chip
                    size="small"
                    label={`Version ${document.version}`}
                    color="primary"
                    variant="outlined"
                  />
                  {document.ocrText && (
                    <Chip
                      size="small"
                      label="OCR verfügbar"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => handleDownload(document)}
                  sx={{ mr: 1 }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Verlauf">
                <IconButton
                  edge="end"
                  onClick={() => handleViewHistory(document)}
                  sx={{ mr: 1 }}
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Löschen">
                <IconButton edge="end" onClick={() => deleteDocument(document.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={Boolean(selectedDocument)}
        onClose={() => setSelectedDocument(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Dokumentenverlauf</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <List>
              {selectedDocument.auditLog.map((entry: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={entry.action}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(entry.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Benutzer: {entry.user}
                        </Typography>
                        <Typography variant="body2">{entry.details}</Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDocument(null)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DocumentManagement; 