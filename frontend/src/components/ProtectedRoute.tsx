import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Wenn nicht authentifiziert, zur Login-Seite weiterleiten
    return <Navigate to="/login" replace />;
  }

  // Wenn authentifiziert, die geschützte Komponente rendern
  return <>{children}</>;
};

export default ProtectedRoute; 