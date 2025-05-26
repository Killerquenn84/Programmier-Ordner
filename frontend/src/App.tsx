import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import theme from './theme';

// Création d'un client de requête
const queryClient = new QueryClient();

// Komponenten
import DoctorLogin from './components/DoctorLogin';
import PatientIdentification from './components/PatientIdentification';
import PatientAppointmentRequest from './components/PatientAppointmentRequest';
import PatientAppointmentList from './components/PatientAppointmentList';
import DoctorAppointmentList from './components/DoctorAppointmentList';
import AIAppointmentSuggestions from './components/AIAppointmentSuggestions';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <PatientProvider>
            <Router>
            <Layout>
              <Routes>
                {/* Öffentliche Routen */}
                <Route path="/login" element={<DoctorLogin onLoginSuccess={() => {}} />} />
                <Route path="/patient-identification" element={<PatientIdentification onIdentificationSuccess={() => {}} />} />
                
                {/* Patienten-Routen */}
                <Route path="/patient/request" element={<PatientAppointmentRequest />} />
                <Route path="/patient/appointments" element={<PatientAppointmentList />} />
                <Route path="/patient/ai-suggestions" element={<AIAppointmentSuggestions />} />
                <Route path="/patient/chatbot" element={<Chatbot />} />
                
                {/* Geschützte Arzt-Routen */}
                <Route
                  path="/doctor/appointments"
                  element={
                    <ProtectedRoute>
                      <DoctorAppointmentList />
                    </ProtectedRoute>
                  }
                />
                
                {/* Standard-Weiterleitung */}
                <Route path="/" element={<Navigate to="/patient-identification" replace />} />
              </Routes>
            </Layout>
          </Router>
          </PatientProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 