export type SafetyStatus = 'safe' | 'warning' | 'sos';

export type SubjectRole = 'self' | 'child' | 'ward' | 'elderly';

export interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
  accuracyMeters?: number;
  speedKmH?: number;
}

export interface TrackedSubject {
  id: string;
  name: string;
  role: SubjectRole;
  avatar: string;
  phone: string;
  batteryLevel: number;
  speedKmH: number;
  isTrackingActive: boolean;
  lastUpdated: string;
  currentLocation: LocationPoint;
  status: SafetyStatus;
}

export type RelationshipType = 
  | 'Mother' 
  | 'Father' 
  | 'Partner' 
  | 'Guardian' 
  | 'Sister' 
  | 'Brother' 
  | 'Friend' 
  | 'Local Police' 
  | 'School Desk';

export type AlertChannel = 'sms' | 'call' | 'whatsapp' | 'push';

export interface TrustedContact {
  id: string;
  name: string;
  relationship: RelationshipType;
  phone: string;
  email: string;
  isPrimary: boolean;
  notifyChannels: AlertChannel[];
  avatar: string;
}

export type GeofenceType = 'safe' | 'school' | 'home' | 'work' | 'high_risk' | 'restricted';

export interface GeofenceZone {
  id: string;
  name: string;
  type: GeofenceType;
  lat: number;
  lng: number;
  radiusMeters: number;
  assignedSubjectIds: string[];
  notifyContactIds: string[];
  alertOnEntry: boolean;
  alertOnExit: boolean;
  color: string;
  description?: string;
}

export interface GeofenceAlert {
  id: string;
  subjectId: string;
  subjectName: string;
  zoneId: string;
  zoneName: string;
  eventType: 'ENTERED' | 'EXITED' | 'HIGH_RISK_BREACH';
  timestamp: string;
  lat: number;
  lng: number;
  address: string;
  notifiedContacts: string[];
  status: 'unread' | 'acknowledged';
}

export interface SOSAlert {
  id: string;
  subjectId: string;
  subjectName: string;
  timestamp: string;
  lat: number;
  lng: number;
  address: string;
  triggerType: 'MANUAL_BUTTON' | 'VOICE_COMMAND' | 'GEOFENCE_BREACH' | 'AI_THREAT_AUTO' | 'SHAKE_TRIGGER';
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  contactsNotified: string[];
  notes?: string;
}

export type IncidentCategory = 
  | 'Harassment' 
  | 'Stalking' 
  | 'Poor Lighting' 
  | 'Suspicious Activity' 
  | 'Unsafe Road' 
  | 'Cyber Crime'
  | 'Domestic Threat';

export interface IncidentReport {
  id: string;
  category: IncidentCategory;
  title: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  reportedAt: string;
  reportedBy: string;
  severity: 'low' | 'medium' | 'high';
  upvotes: number;
  mediaUrl?: string;
}

export interface FakeCallConfig {
  callerName: string;
  callerNumber: string;
  callerType: string;
  delaySeconds: number;
  ringtone: string;
}

export interface ThreatAnalysis {
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'HIGH_DANGER' | 'CRITICAL_EMERGENCY';
  riskScore: number;
  recommendSOS: boolean;
  summary: string;
  immediateActions: string[];
  deescalationTips: string[];
  policeContactRecommended: boolean;
}

export interface SafePlace {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'shelter' | 'fire_station';
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}
