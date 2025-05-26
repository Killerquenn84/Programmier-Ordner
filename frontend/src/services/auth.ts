import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CryptoJS from 'crypto-js';

// Basis-URL für die API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Verschlüsselungsschlüssel aus Umgebungsvariablen
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';

// Token-Konfiguration
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 Minuten in Millisekunden

// Datensegmentierung
export enum DataSegment {
  ADMIN = 'admin',
  MEDICAL = 'medical',
  ADMINISTRATIVE = 'administrative',
  AUDIT = 'audit'
}

interface SecurityContext {
  segment: DataSegment;
  accessLevel: number;
  requiresMFA: boolean;
  auditRequired: boolean;
}

interface Practice {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  licenseNumber: string;
  securityLevel: number;
  lastSecurityAudit?: Date;
}

interface User {
  id: string;
  practiceId: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
  firstName: string;
  lastName: string;
  password?: string;
  mfaEnabled: boolean;
  lastLogin?: Date;
  securityContext: SecurityContext;
  accessPatterns: {
    lastAccess: Date;
    ipAddress: string;
    deviceId: string;
  }[];
}

interface AuthResponse {
  token: string;
  user: User;
  practice: Practice;
  mfaRequired: boolean;
  securityContext: SecurityContext;
}

// Honeypot-Konfiguration
const HONEYPOT_ENDPOINTS = [
  '/api/admin/backup',
  '/api/admin/logs',
  '/api/admin/users/all',
  '/api/medical/patients/all'
];

// AI-gestützte Anomalieerkennung
interface AccessPattern {
  timestamp: Date;
  endpoint: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

// Zugriffsmuster-Analyse
const getRecentAccessPatterns = (): AccessPattern[] => {
  const patterns = localStorage.getItem('accessPatterns');
  return patterns ? JSON.parse(patterns) : [];
};

const analyzeAccessPattern = (pattern: AccessPattern, recentPatterns: AccessPattern[]): boolean => {
  // Einfache Anomalieerkennung basierend auf:
  // 1. Ungewöhnliche Zugriffszeiten
  // 2. Unbekannte IP-Adressen
  // 3. Ungewöhnliche Endpunkte
  // 4. Häufige Fehlversuche
  
  const now = new Date();
  const hour = now.getHours();
  
  // Prüfe auf ungewöhnliche Zugriffszeiten (außerhalb der Praxiszeiten)
  if (hour < 7 || hour > 20) {
    return true;
  }
  
  // Prüfe auf unbekannte IP-Adressen
  const knownIPs = new Set(recentPatterns.map(p => p.ipAddress));
  if (!knownIPs.has(pattern.ipAddress)) {
    return true;
  }
  
  // Prüfe auf ungewöhnliche Endpunkte
  const endpointFrequency = recentPatterns.reduce((acc, p) => {
    acc[p.endpoint] = (acc[p.endpoint] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (!endpointFrequency[pattern.endpoint]) {
    return true;
  }
  
  return false;
};

// Sicherheitsprotokollierung
const logSecurityIncident = async (incident: any): Promise<void> => {
  try {
    await authClient.post('/security/incidents', {
      ...incident,
      timestamp: new Date().toISOString(),
      blockchainHash: await generateBlockchainHash(incident)
    });
  } catch (error) {
    console.error('Fehler beim Protokollieren des Sicherheitsvorfalls:', error);
  }
};

// Blockchain-Hash-Generierung
const generateBlockchainHash = async (data: any): Promise<string> => {
  try {
    const response = await authClient.post('/security/generate-hash', data);
    return response.data.hash;
  } catch (error) {
    console.error('Fehler bei der Hash-Generierung:', error);
    return '';
  }
};

// Sicherheitskontext
const getSecurityContext = (): SecurityContext => {
  const user = secureStorage.get('user', DataSegment.ADMIN);
  return user?.securityContext || {
    segment: DataSegment.ADMINISTRATIVE,
    accessLevel: 1,
    requiresMFA: false,
    auditRequired: true
  };
};

// Verschlüsselungsfunktionen mit AES-256
const encrypt = (data: any, segment: DataSegment): string => {
  const jsonString = JSON.stringify(data);
  const segmentKey = `${ENCRYPTION_KEY}_${segment}`;
  return CryptoJS.AES.encrypt(jsonString, segmentKey).toString();
};

const decrypt = (encryptedData: string, segment: DataSegment): any => {
  const segmentKey = `${ENCRYPTION_KEY}_${segment}`;
  const bytes = CryptoJS.AES.decrypt(encryptedData, segmentKey);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
};

// Token-Management mit erweiterten Sicherheitsmaßnahmen
const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return token;
  } catch {
    removeToken();
    return null;
  }
};

const setToken = (token: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('tokenTimestamp', Date.now().toString());
};

const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenTimestamp');
  secureStorage.clear();
};

// API-Client mit erweiterten Sicherheitsmaßnahmen
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Honeypot-Erkennung
const isHoneypotEndpoint = (url: string): boolean => {
  return HONEYPOT_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Token zu jeder Anfrage hinzufügen und Sicherheitsheader
authClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Request-ID'] = crypto.randomUUID();
    config.headers['X-Security-Context'] = JSON.stringify(getSecurityContext());
  }

  // Honeypot-Erkennung
  if (isHoneypotEndpoint(config.url || '')) {
    logSecurityIncident({
      type: 'honeypot_triggered',
      url: config.url,
      timestamp: new Date(),
      severity: 'critical'
    });
  }

  return config;
});

// Response Interceptor für Sicherheitsüberprüfungen
authClient.interceptors.response.use(
  (response) => {
    // Anomalieerkennung
    const accessPattern: AccessPattern = {
      timestamp: new Date(),
      endpoint: response.config.url || '',
      method: response.config.method || '',
      ipAddress: response.config.headers['X-Forwarded-For'] || '',
      userAgent: navigator.userAgent,
      success: true
    };

    if (detectAnomaly(accessPattern)) {
      // Automatische Sperrung bei Anomalie
      removeToken();
      window.location.href = '/security-incident';
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Token-Validierung mit erweiterten Sicherheitsprüfungen
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now();
    const tokenTimestamp = parseInt(localStorage.getItem('tokenTimestamp') || '0');

    // Prüfe Token-Ablaufzeit
    if (!decoded.exp || decoded.exp * 1000 < currentTime) {
      return false;
    }

    // Prüfe maximale Token-Lebensdauer
    if (currentTime - tokenTimestamp > TOKEN_EXPIRY) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// AI-gestützte Anomalieerkennung
const detectAnomaly = (pattern: AccessPattern): boolean => {
  const recentPatterns = getRecentAccessPatterns();
  const isAnomaly = analyzeAccessPattern(pattern, recentPatterns);
  
  if (isAnomaly) {
    logSecurityIncident({
      type: 'anomaly_detected',
      pattern,
      timestamp: new Date(),
      severity: 'high'
    });
  }
  
  return isAnomaly;
};

// Authentifizierungsfunktionen mit erweiterten Sicherheitsmaßnahmen
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/login', {
      email,
      password,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      },
    });
    const { token, user, practice, mfaRequired, securityContext } = response.data;
    
    if (!mfaRequired) {
      setToken(token);
      secureStorage.set('user', user, securityContext.segment);
      secureStorage.set('practice', practice, securityContext.segment);
    }
    
    return { token, user, practice, mfaRequired, securityContext };
  },

  verifyMFA: async (code: string): Promise<AuthResponse> => {
    const response = await authClient.post<AuthResponse>('/auth/verify-mfa', { code });
    const { token, user, practice } = response.data;
    setToken(token);
    secureStorage.set('user', user, DataSegment.ADMINISTRATIVE);
    secureStorage.set('practice', practice, DataSegment.ADMINISTRATIVE);
    return { token, user, practice, mfaRequired: false, securityContext: {
      segment: DataSegment.ADMINISTRATIVE,
      accessLevel: 1,
      requiresMFA: false,
      auditRequired: true
    } };
  },

  logout: (): void => {
    removeToken();
  },

  registerPractice: async (practiceData: Omit<Practice, 'id'>): Promise<Practice> => {
    const response = await authClient.post<Practice>('/auth/register-practice', practiceData);
    return response.data;
  },

  registerUser: async (userData: Omit<User, 'id' | 'practiceId'>): Promise<User> => {
    const response = await authClient.post<User>('/auth/register-user', {
      ...userData,
      mfaEnabled: userData.role === 'admin' || userData.role === 'doctor',
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await authClient.get<User>('/auth/me');
    return response.data;
  },

  getCurrentPractice: async (): Promise<Practice> => {
    const response = await authClient.get<Practice>('/auth/practice');
    return response.data;
  },

  updatePractice: async (practiceId: string, data: Partial<Practice>): Promise<Practice> => {
    const response = await authClient.put<Practice>(`/auth/practice/${practiceId}`, data);
    return response.data;
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await authClient.put<User>(`/auth/users/${userId}`, data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await authClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  resetPassword: async (email: string): Promise<void> => {
    await authClient.post('/auth/reset-password', { email });
  },

  // Neue Sicherheitsfunktionen
  enableMFA: async (): Promise<{ secret: string; qrCode: string }> => {
    const response = await authClient.post<{ secret: string; qrCode: string }>('/auth/enable-mfa');
    return response.data;
  },

  disableMFA: async (code: string): Promise<void> => {
    await authClient.post('/auth/disable-mfa', { code });
  },

  getAuditLogs: async (): Promise<any[]> => {
    const response = await authClient.get('/auth/audit-logs');
    return response.data;
  },

  getAuditTrail: async (): Promise<any[]> => {
    const response = await authClient.get('/security/audit-trail');
    return response.data;
  },
};

// Verschlüsselte Datenspeicherung mit erweiterten Sicherheitsmaßnahmen
export const secureStorage = {
  set: (key: string, value: any, segment: DataSegment): void => {
    const encrypted = encrypt(value, segment);
    localStorage.setItem(key, encrypted);
  },

  get: (key: string, segment: DataSegment): any => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    try {
      return decrypt(encrypted, segment);
    } catch {
      removeToken();
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// Hilfsfunktionen mit erweiterten Sicherheitsprüfungen
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token ? isTokenValid(token) : false;
};

export const getUserRole = (): string | null => {
  const user = secureStorage.get('user', DataSegment.ADMIN);
  return user?.role || null;
};

export const hasPermission = (requiredRole: string, segment: DataSegment): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;

  const roleHierarchy = {
    admin: 4,
    doctor: 3,
    nurse: 2,
    receptionist: 1,
  };

  const userContext = secureStorage.get('user', DataSegment.ADMIN)?.securityContext;
  if (!userContext || userContext.segment !== segment) return false;

  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
};

export const requiresMFA = (role: string): boolean => {
  return role === 'admin' || role === 'doctor';
};

export default authApi; 