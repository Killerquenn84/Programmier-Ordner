import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, doctorData: Doctor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Beim Laden der App prüfen, ob ein Token im localStorage existiert
    const storedToken = localStorage.getItem('token');
    const storedDoctor = localStorage.getItem('doctor');
    
    if (storedToken && storedDoctor) {
      setToken(storedToken);
      setDoctor(JSON.parse(storedDoctor));
      setIsAuthenticated(true);
      
      // Token für alle zukünftigen Anfragen setzen
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = (newToken: string, doctorData: Doctor) => {
    setToken(newToken);
    setDoctor(doctorData);
    setIsAuthenticated(true);
    
    // Token und Arzt-Daten im localStorage speichern
    localStorage.setItem('token', newToken);
    localStorage.setItem('doctor', JSON.stringify(doctorData));
    
    // Token für alle zukünftigen Anfragen setzen
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setDoctor(null);
    setIsAuthenticated(false);
    
    // Token und Arzt-Daten aus dem localStorage entfernen
    localStorage.removeItem('token');
    localStorage.removeItem('doctor');
    
    // Authorization-Header entfernen
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ doctor, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
}; 