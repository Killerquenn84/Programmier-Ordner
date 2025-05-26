import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Address {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: Address;
  phoneNumber: string;
  email?: string;
  name: string;
  geburtsdatum: string;
}

interface PatientContextType {
  patient: Patient | null;
  setPatient: (patient: Patient | null) => void;
  isIdentified: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

interface PatientProviderProps {
  children: ReactNode;
}

export const PatientProvider: React.FC<PatientProviderProps> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isIdentified, setIsIdentified] = useState(false);

  const handleSetPatient = (newPatient: Patient | null) => {
    setPatient(newPatient);
    setIsIdentified(!!newPatient);
    
    // Patient im localStorage speichern
    if (newPatient) {
      localStorage.setItem('patient', JSON.stringify(newPatient));
    } else {
      localStorage.removeItem('patient');
    }
  };

  return (
    <PatientContext.Provider value={{ patient, setPatient: handleSetPatient, isIdentified }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}; 