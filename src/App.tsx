import React, { useState, useEffect } from 'react';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_CONTACTS, 
  INITIAL_GEOFENCES, 
  INITIAL_GEOFENCE_ALERTS, 
  INITIAL_INCIDENTS, 
  SAFE_PLACES 
} from './data/initialData';
import { 
  TrackedSubject, 
  TrustedContact, 
  GeofenceZone, 
  GeofenceAlert, 
  IncidentReport, 
  LocationPoint, 
  SOSAlert 
} from './types';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { GeofenceManager } from './components/GeofenceManager';
import { TrustedContactsManager } from './components/TrustedContactsManager';
import { AISafetyAssistant } from './components/AISafetyAssistant';
import { IncidentReporter } from './components/IncidentReporter';
import { SOSModal } from './components/SOSModal';
import { FakeCallModal } from './components/FakeCallModal';
import { VoiceSOSListener } from './components/VoiceSOSListener';
import { FirebaseStatusModal } from './components/FirebaseStatusModal';
import { startEmergencySiren, stopEmergencySiren, speakText } from './utils/audioUtils';
import { 
  subscribeToSubjects, 
  syncSubjectToFirebase, 
  subscribeToContacts, 
  saveContactToFirebase, 
  deleteContactFromFirebase, 
  subscribeToGeofences, 
  saveGeofenceToFirebase, 
  deleteGeofenceFromFirebase, 
  broadcastSOSToFirebase, 
  saveIncidentToFirebase, 
  subscribeToIncidents, 
  upvoteIncidentInFirebase, 
  saveGeofenceAlertToFirebase,
  seedInitialFirebaseData
} from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [subjects, setSubjects] = useState<TrackedSubject[]>(INITIAL_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(INITIAL_SUBJECTS[0].id);
  const [contacts, setContacts] = useState<TrustedContact[]>(INITIAL_CONTACTS);
  const [geofences, setGeofences] = useState<GeofenceZone[]>(INITIAL_GEOFENCES);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>(INITIAL_GEOFENCE_ALERTS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  
  // Firebase sync state & modal
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState<boolean>(false);

  // Real-time Firebase Subscriptions
  useEffect(() => {
    const unsubSubjects = subscribeToSubjects((remoteSubjects) => {
      if (remoteSubjects.length > 0) setSubjects(remoteSubjects);
    });
    const unsubContacts = subscribeToContacts((remoteContacts) => {
      if (remoteContacts.length > 0) setContacts(remoteContacts);
    });
    const unsubGeofences = subscribeToGeofences((remoteGeofences) => {
      if (remoteGeofences.length > 0) setGeofences(remoteGeofences);
    });
    const unsubIncidents = subscribeToIncidents((remoteIncidents) => {
      if (remoteIncidents.length > 0) setIncidents(remoteIncidents);
    });

    return () => {
      unsubSubjects();
      unsubContacts();
      unsubGeofences();
      unsubIncidents();
    };
  }, []);

  // Emergency Controls State
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(true);
  const [activeSOSAlerts, setActiveSOSAlerts] = useState<SOSAlert[]>([]);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Manual Firebase Sync
  const handleManualSync = async () => {
    setIsSyncingFirebase(true);
    await seedInitialFirebaseData(subjects, contacts, geofences, incidents);
    setIsSyncingFirebase(false);
  };

  // Toggle Loud Alarm Siren
  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      const started = startEmergencySiren();
      if (started) setIsSirenActive(true);
    }
  };

  // Trigger Emergency SOS
  const handleTriggerSOS = () => {
    setIsSOSModalOpen(true);
    
    // Update subject status
    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === activeSubject.id ? { ...sub, status: 'sos' as const } : sub
      )
    );

    // Speak voice prompt
    speakText("Emergency SOS alert initiated. Live coordinates dispatched to contacts.");
  };

  // Confirm Emergency SOS Dispatch
  const handleConfirmSOS = (notes?: string) => {
    const newAlert: SOSAlert = {
      id: `sos-${Date.now()}`,
      subjectId: activeSubject.id,
      subjectName: activeSubject.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lat: activeSubject.currentLocation.lat,
      lng: activeSubject.currentLocation.lng,
      address: activeSubject.currentLocation.address,
      triggerType: 'MANUAL_BUTTON',
      status: 'ACTIVE',
      contactsNotified: contacts.map((c) => c.name),
      notes,
    };

    setActiveSOSAlerts((prev) => [newAlert, ...prev]);
    // Dispatch to Firebase Firestore
    broadcastSOSToFirebase(newAlert);
  };

  // Cancel Emergency SOS
  const handleCancelSOS = () => {
    setIsSOSModalOpen(false);
    stopEmergencySiren();
    setIsSirenActive(false);

    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === activeSubject.id) {
          const updated = { ...sub, status: 'safe' as const };
          syncSubjectToFirebase(updated);
          return updated;
        }
        return sub;
      })
    );
  };

  // Update Location of Subject
  const handleUpdateSubjectLocation = (id: string, newLoc: LocationPoint) => {
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const updated = {
            ...sub,
            currentLocation: newLoc,
            speedKmH: newLoc.speedKmH || sub.speedKmH,
            lastUpdated: 'Just now',
          };
          syncSubjectToFirebase(updated);
          return updated;
        }
        return sub;
      })
    );
  };

  // Trigger Geofence Breach Event
  const handleTriggerGeofenceBreach = (
    subject: TrackedSubject,
    zone: GeofenceZone,
    type: 'ENTERED' | 'EXITED'
  ) => {
    const newAlert: GeofenceAlert = {
      id: `alert-${Date.now()}`,
      subjectId: subject.id,
      subjectName: subject.name,
      zoneId: zone.id,
      zoneName: zone.name,
      eventType: zone.type === 'high_risk' ? 'HIGH_RISK_BREACH' : type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lat: subject.currentLocation.lat,
      lng: subject.currentLocation.lng,
      address: subject.currentLocation.address,
      notifiedContacts: contacts.filter((c) => zone.notifyContactIds.includes(c.id)).map((c) => c.name),
      status: 'unread',
    };

    setGeofenceAlerts((prev) => [newAlert, ...prev]);
    saveGeofenceAlertToFirebase(newAlert);

    if (zone.type === 'high_risk') {
      speakText(`Warning! ${subject.name} entered restricted high risk area: ${zone.name}`);
    } else {
      speakText(`Geofence Alert: ${subject.name} ${type.toLowerCase()} ${zone.name}`);
    }
  };

  // Geofence Management
  const handleAddGeofence = (newZone: Omit<GeofenceZone, 'id'>) => {
    const zone: GeofenceZone = {
      ...newZone,
      id: `geo-${Date.now()}`,
    };
    setGeofences((prev) => [...prev, zone]);
    saveGeofenceToFirebase(zone);
  };

  const handleDeleteGeofence = (id: string) => {
    setGeofences((prev) => prev.filter((g) => g.id !== id));
    deleteGeofenceFromFirebase(id);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setGeofenceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'acknowledged' as const } : a))
    );
  };

  // Contacts Management
  const handleAddContact = (contact: Omit<TrustedContact, 'id'>) => {
    const newContact: TrustedContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, newContact]);
    saveContactToFirebase(newContact);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    deleteContactFromFirebase(id);
  };

  const handleTogglePrimaryContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        const updated = {
          ...c,
          isPrimary: c.id === id,
        };
        saveContactToFirebase(updated);
        return updated;
      })
    );
  };

  const handleSendTestAlert = (contact: TrustedContact) => {
    speakText(`Sending test SMS dispatch to ${contact.name}`);
  };

  // Incident Management
  const handleAddIncident = (
    report: Omit<IncidentReport, 'id' | 'reportedAt' | 'upvotes'>
  ) => {
    const newInc: IncidentReport = {
      ...report,
      id: `inc-${Date.now()}`,
      reportedAt: 'Just now',
      upvotes: 1,
    };
    setIncidents((prev) => [newInc, ...prev]);
    saveIncidentToFirebase(newInc);
  };

  const handleUpvoteIncident = (id: string) => {
    const target = incidents.find((inc) => inc.id === id);
    if (target) {
      upvoteIncidentInFirebase(id, target.upvotes);
    }
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, upvotes: inc.upvotes + 1 } : inc))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Main Application Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        onTriggerSOS={handleTriggerSOS}
        onToggleSiren={handleToggleSiren}
        isSirenActive={isSirenActive}
        onTriggerFakeCall={() => setIsFakeCallOpen(true)}
        isVoiceActive={isVoiceActive}
        onToggleVoiceSOS={() => setIsVoiceActive(!isVoiceActive)}
        activeSOSCount={activeSOSAlerts.length}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'map' && (
          <MapView
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onUpdateSubjectLocation={handleUpdateSubjectLocation}
            geofences={geofences}
            incidents={incidents}
            safePlaces={SAFE_PLACES}
            onTriggerGeofenceBreach={handleTriggerGeofenceBreach}
            onTriggerSOS={handleTriggerSOS}
          />
        )}

        {activeTab === 'geofences' && (
          <GeofenceManager
            geofences={geofences}
            alerts={geofenceAlerts}
            subjects={subjects}
            contacts={contacts}
            onAddGeofence={handleAddGeofence}
            onDeleteGeofence={handleDeleteGeofence}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}

        {activeTab === 'contacts' && (
          <TrustedContactsManager
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onTogglePrimary={handleTogglePrimaryContact}
            onSendTestAlert={handleSendTestAlert}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AISafetyAssistant
            onTriggerSOS={handleTriggerSOS}
            onTriggerFakeCall={() => setIsFakeCallOpen(true)}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentReporter
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onUpvoteIncident={handleUpvoteIncident}
          />
        )}
      </main>

      {/* Voice SOS Listener background service */}
      <VoiceSOSListener
        isActive={isVoiceActive}
        onTriggerSOS={handleTriggerSOS}
      />

      {/* Firebase Project Status & Sync Modal */}
      <FirebaseStatusModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        subjects={subjects}
        contacts={contacts}
        geofences={geofences}
        incidents={incidents}
        isSyncing={isSyncingFirebase}
        onManualSync={handleManualSync}
      />

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        subject={activeSubject}
        trustedContacts={contacts}
        onConfirmSOS={handleConfirmSOS}
        onCancelSOS={handleCancelSOS}
        isSirenActive={isSirenActive}
        onToggleSiren={handleToggleSiren}
      />

      {/* Fake Incoming Call Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AuraGuard Safety Platform • Real-time Protection for Women & Children</span>
          <span>Emergency Direct Dial: 911 / 112 • 24/7 Helpline: 1-800-799-SAFE</span>
        </div>
      </footer>
    </div>
  );
}
