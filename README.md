# Healthcare SaaS MVP - Terminbuchung & Basis-EHR

## Projektübersicht

Dieses MVP fokussiert sich auf die Implementierung einer DSGVO-konformen SaaS-Lösung für Arztpraxen mit den Kernfunktionen Terminbuchung und Basis-EHR.

### Kernfunktionen

#### Terminbuchung
- Echtzeit-Kalender mit KI-Optimierung
- Automatische Erinnerungen
- Kalendersynchronisation
- Drag-and-Drop-Rescheduling

#### Basis-EHR
- Patienten-Stammdaten
- Diagnosehistorie (ICD-10-GM)
- Medikationsliste
- Dokumentenmanagement

## Technologie-Stack

### Frontend
- **Patientenportal**: React + Next.js
- **Arzt-Dashboard**: Flutter
- **Design-System**: Figma + Material-UI

### Backend
- **Termin-Service**: Node.js + NestJS
- **EHR-Service**: Python + FastAPI
- **Datenbank**: PostgreSQL + MongoDB
- **Search**: Elasticsearch

### Infrastruktur
- **Cloud**: AWS Frankfurt
- **CI/CD**: GitLab + ArgoCD
- **Monitoring**: Prometheus + Grafana

## Entwicklungsumgebung einrichten

### Voraussetzungen
- Node.js 18+
- Python 3.11+
- Flutter SDK
- Docker & Docker Compose
- AWS CLI

### Lokale Entwicklung starten

1. Repository klonen:
   ```bash
   git clone [repository-url]
   cd healthcare-saas-mvp
   ```

2. Umgebungsvariablen konfigurieren:
   ```bash
   cp .env.example .env
   # Bearbeiten Sie .env mit Ihren lokalen Einstellungen
   ```

3. Entwicklungsumgebung starten:
   ```bash
   ./scripts/setup-dev.sh
   ```

4. Services starten:
   ```bash
   docker-compose up -d
   ```

## Projektstruktur

```
/
├── frontend/                    # Patientenportal (Next.js)
│   ├── src/
│   │   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── pages/             # Next.js Seiten
│   │   ├── services/          # API-Integrationen
│   │   └── utils/             # Hilfsfunktionen
│   └── public/                # Statische Assets
│
├── mobile/                     # Arzt-Dashboard (Flutter)
│   ├── lib/
│   │   ├── screens/           # App-Bildschirme
│   │   ├── widgets/           # UI-Komponenten
│   │   └── services/          # Backend-Integration
│   └── pubspec.yaml           # Flutter-Abhängigkeiten
│
├── backend/
│   ├── appointment-service/    # Termin-Microservice
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ehr-service/           # EHR-Microservice
│       ├── src/
│       └── requirements.txt
│
├── infrastructure/             # IaC und Deployment
│   ├── kubernetes/            # K8s-Manifeste
│   ├── terraform/             # Cloud-Infrastruktur
│   └── docker/                # Docker-Konfigurationen
│
└── docs/                      # Dokumentation
    ├── architecture/          # Architekturdiagramme
    ├── api/                   # API-Dokumentation
    └── compliance/            # Compliance-Dokumentation
```

## API-Dokumentation

### Termin-Service
- `GET /api/v1/appointments` - Termine abrufen
- `POST /api/v1/appointments` - Termin erstellen
- `PUT /api/v1/appointments/{id}` - Termin aktualisieren
- `DELETE /api/v1/appointments/{id}` - Termin stornieren

### EHR-Service
- `GET /api/v1/patients` - Patientenliste abrufen
- `GET /api/v1/patients/{id}` - Patientendetails abrufen
- `POST /api/v1/patients` - Neuen Patienten anlegen
- `PUT /api/v1/patients/{id}` - Patientendaten aktualisieren

## Sicherheit & Compliance

### DSGVO-Konformität
- Verschlüsselung im Ruhezustand (AES-256)
- Verschlüsselung während der Übertragung (TLS 1.3)
- Pseudonymisierung sensibler Daten
- Audit-Logging aller Datenzugriffe

### Zugriffskontrolle
- Role-Based Access Control (RBAC)
- Multi-Faktor-Authentifizierung
- JWT-Tokens mit kurzer Gültigkeit

## Testing

### Automatisierte Tests
```bash
# Frontend Tests
cd frontend
npm test

# Backend Tests
cd backend/appointment-service
npm install

cd backend/ehr-service
pytest
```

### Manuelle Tests
- Usability-Tests mit Ärzten
- End-to-End-Szenarien
- Penetrationstests

## Deployment

### Staging
```bash
./scripts/deploy-staging.sh
```

### Production
```bash
./scripts/deploy-production.sh
```

## Monitoring

- Prometheus Metriken: `http://localhost:9090`
- Grafana Dashboards: `http://localhost:3000`
- Logs: ELK Stack

## Support & Kontakt

Bei Fragen oder Problemen:
- E-Mail: support@healthcare-saas.de
- Dokumentation: docs.healthcare-saas.de
- Issue Tracker: github.com/healthcare-saas/issues 
npm install
