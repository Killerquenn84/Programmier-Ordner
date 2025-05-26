import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi, Patient, Diagnosis, Medication, Document } from '../services/api';

export const usePatient = (patientId: string) => {
  const queryClient = useQueryClient();

  // Patienten-Daten
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientApi.getPatient(patientId).then(res => res.data)
  });

  const updatePatientMutation = useMutation({
    mutationFn: (data: Partial<Patient>) => patientApi.updatePatient(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
    }
  });

  // Diagnosen
  const { data: diagnoses, isLoading: isLoadingDiagnoses } = useQuery({
    queryKey: ['diagnoses', patientId],
    queryFn: () => patientApi.getDiagnoses(patientId).then(res => res.data)
  });

  const createDiagnosisMutation = useMutation({
    mutationFn: (data: Omit<Diagnosis, 'id' | 'patientId'>) => 
      patientApi.createDiagnosis(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', patientId] });
    }
  });

  const updateDiagnosisMutation = useMutation({
    mutationFn: ({ diagnosisId, data }: { diagnosisId: string; data: Partial<Diagnosis> }) =>
      patientApi.updateDiagnosis(patientId, diagnosisId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', patientId] });
    }
  });

  const deleteDiagnosisMutation = useMutation({
    mutationFn: (diagnosisId: string) => patientApi.deleteDiagnosis(patientId, diagnosisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnoses', patientId] });
    }
  });

  // Medikamente
  const { data: medications, isLoading: isLoadingMedications } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => patientApi.getMedications(patientId).then(res => res.data)
  });

  const createMedicationMutation = useMutation({
    mutationFn: (data: Omit<Medication, 'id' | 'patientId'>) =>
      patientApi.createMedication(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', patientId] });
    }
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: Partial<Medication> }) =>
      patientApi.updateMedication(patientId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', patientId] });
    }
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: (medicationId: string) => patientApi.deleteMedication(patientId, medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', patientId] });
    }
  });

  // Dokumente
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['documents', patientId],
    queryFn: () => patientApi.getDocuments(patientId).then(res => res.data)
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      patientApi.uploadDocument(patientId, file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => patientApi.deleteDocument(patientId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
    }
  });

  return {
    // Patienten-Daten
    patient,
    isLoadingPatient,
    updatePatient: updatePatientMutation.mutate,

    // Diagnosen
    diagnoses,
    isLoadingDiagnoses,
    createDiagnosis: createDiagnosisMutation.mutate,
    updateDiagnosis: updateDiagnosisMutation.mutate,
    deleteDiagnosis: deleteDiagnosisMutation.mutate,

    // Medikamente
    medications,
    isLoadingMedications,
    createMedication: createMedicationMutation.mutate,
    updateMedication: updateMedicationMutation.mutate,
    deleteMedication: deleteMedicationMutation.mutate,

    // Dokumente
    documents,
    isLoadingDocuments,
    uploadDocument: uploadDocumentMutation.mutate,
    deleteDocument: deleteDocumentMutation.mutate,
  };
}; 