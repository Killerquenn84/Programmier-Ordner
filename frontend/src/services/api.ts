import axios from 'axios';

// Basis-URL für die API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API-Client erstellen
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TypeScript Interfaces
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  insuranceNumber: string;
  address: string;
  phone: string;
  email?: string;
}

export interface Diagnosis {
  id: string;
  patientId: string;
  date: string;
  icdCode: string;
  description: string;
  notes?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  interactions?: string[];
}

export interface Document {
  id: string;
  patientId: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  version: number;
  ocrText?: string;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

// API-Funktionen
export const patientApi = {
  // Patienten
  getPatient: (id: string) => 
    apiClient.get<Patient>(`/patients/${id}`),
  
  updatePatient: (id: string, data: Partial<Patient>) =>
    apiClient.put<Patient>(`/patients/${id}`, data),

  // Diagnosen
  getDiagnoses: (patientId: string) =>
    apiClient.get<Diagnosis[]>(`/patients/${patientId}/diagnoses`),
  
  createDiagnosis: (patientId: string, data: Omit<Diagnosis, 'id' | 'patientId'>) =>
    apiClient.post<Diagnosis>(`/patients/${patientId}/diagnoses`, data),
  
  updateDiagnosis: (patientId: string, diagnosisId: string, data: Partial<Diagnosis>) =>
    apiClient.put<Diagnosis>(`/patients/${patientId}/diagnoses/${diagnosisId}`, data),
  
  deleteDiagnosis: (patientId: string, diagnosisId: string) =>
    apiClient.delete(`/patients/${patientId}/diagnoses/${diagnosisId}`),

  // Medikamente
  getMedications: (patientId: string) =>
    apiClient.get<Medication[]>(`/patients/${patientId}/medications`),
  
  createMedication: (patientId: string, data: Omit<Medication, 'id' | 'patientId'>) =>
    apiClient.post<Medication>(`/patients/${patientId}/medications`, data),
  
  updateMedication: (patientId: string, medicationId: string, data: Partial<Medication>) =>
    apiClient.put<Medication>(`/patients/${patientId}/medications/${medicationId}`, data),
  
  deleteMedication: (patientId: string, medicationId: string) =>
    apiClient.delete(`/patients/${patientId}/medications/${medicationId}`),

  // Dokumente
  getDocuments: (patientId: string) =>
    apiClient.get<Document[]>(`/patients/${patientId}/documents`),
  
  uploadDocument: (patientId: string, file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post<Document>(`/patients/${patientId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  deleteDocument: (patientId: string, documentId: string) =>
    apiClient.delete(`/patients/${patientId}/documents/${documentId}`),
  
  getDocumentHistory: (patientId: string, documentId: string) =>
    apiClient.get<AuditEntry[]>(`/patients/${patientId}/documents/${documentId}/history`),
};

// Interceptor für Fehlerbehandlung
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hier können wir globale Fehlerbehandlung implementieren
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient; 