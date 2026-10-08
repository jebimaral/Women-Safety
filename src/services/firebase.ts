import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth, User } from 'firebase/auth';
import { 
  TrackedSubject, 
  TrustedContact, 
  GeofenceZone, 
  GeofenceAlert, 
  IncidentReport, 
  SOSAlert 
} from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyCHzVQvhyUurobX3YIPAs-w_Ac0kiZRZ1g",
  authDomain: "project1-4506.firebaseapp.com",
  projectId: "project1-4506",
  storageBucket: "project1-4506.firebasestorage.app",
  messagingSenderId: "367992509924",
  appId: "1:367992509924:web:68af9926dcd498ad8d63f1"
};

// Initialize Firebase safely
let app: ReturnType<typeof initializeApp>;
let db: Firestore;
let auth: Auth;
let isFirebaseInitialized = false;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  isFirebaseInitialized = true;
  
  // Optional anonymous sign-in to satisfy default Firebase rules
  signInAnonymously(auth).catch((err) => {
    console.info("Anonymous auth notice (proceeding with Firestore direct access):", err.message);
  });
} catch (error) {
  console.warn("Firebase initialization warning:", error);
}

export { db, auth, isFirebaseInitialized };

export interface FirebaseSyncState {
  connected: boolean;
  projectId: string;
  lastSyncedAt: Date | null;
  syncError: string | null;
}

// ----------------- Realtime Subscriptions & Sync Helpers -----------------

// Subscribe to Subjects
export const subscribeToSubjects = (
  onData: (subjects: TrackedSubject[]) => void,
  onError?: (error: any) => void
) => {
  if (!db) return () => {};
  const colRef = collection(db, 'tracked_subjects');
  return onSnapshot(
    colRef, 
    (snapshot) => {
      if (!snapshot.empty) {
        const list: TrackedSubject[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as TrackedSubject);
        });
        onData(list);
      }
    },
    (err) => {
      console.warn("Firestore subjects sync:", err.message);
      if (onError) onError(err);
    }
  );
};

// Save / Update a Tracked Subject Location & Status
export const syncSubjectToFirebase = async (subject: TrackedSubject) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'tracked_subjects', subject.id);
    await setDoc(docRef, subject, { merge: true });
  } catch (error) {
    console.warn("Failed to sync subject to Firebase:", error);
  }
};

// Subscribe to Trusted Contacts
export const subscribeToContacts = (
  onData: (contacts: TrustedContact[]) => void,
  onError?: (error: any) => void
) => {
  if (!db) return () => {};
  const colRef = collection(db, 'trusted_contacts');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: TrustedContact[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as TrustedContact);
        });
        onData(list);
      }
    },
    (err) => {
      console.warn("Firestore contacts sync:", err.message);
      if (onError) onError(err);
    }
  );
};

// Add/Update Contact in Firebase
export const saveContactToFirebase = async (contact: TrustedContact) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'trusted_contacts', contact.id);
    await setDoc(docRef, contact, { merge: true });
  } catch (error) {
    console.warn("Failed to save contact to Firebase:", error);
  }
};

// Delete Contact in Firebase
export const deleteContactFromFirebase = async (contactId: string) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'trusted_contacts', contactId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Failed to delete contact from Firebase:", error);
  }
};

// Subscribe to Geofences
export const subscribeToGeofences = (
  onData: (geofences: GeofenceZone[]) => void,
  onError?: (error: any) => void
) => {
  if (!db) return () => {};
  const colRef = collection(db, 'geofences');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: GeofenceZone[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as GeofenceZone);
        });
        onData(list);
      }
    },
    (err) => {
      console.warn("Firestore geofences sync:", err.message);
      if (onError) onError(err);
    }
  );
};

// Save Geofence in Firebase
export const saveGeofenceToFirebase = async (zone: GeofenceZone) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'geofences', zone.id);
    await setDoc(docRef, zone, { merge: true });
  } catch (error) {
    console.warn("Failed to save geofence to Firebase:", error);
  }
};

// Delete Geofence in Firebase
export const deleteGeofenceFromFirebase = async (zoneId: string) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'geofences', zoneId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Failed to delete geofence from Firebase:", error);
  }
};

// Dispatch SOS Alert to Firebase
export const broadcastSOSToFirebase = async (sosAlert: SOSAlert) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'sos_alerts', sosAlert.id);
    await setDoc(docRef, sosAlert);
  } catch (error) {
    console.warn("Failed to broadcast SOS to Firebase:", error);
  }
};

// Save Incident Report to Firebase
export const saveIncidentToFirebase = async (incident: IncidentReport) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'safety_incidents', incident.id);
    await setDoc(docRef, incident, { merge: true });
  } catch (error) {
    console.warn("Failed to save incident to Firebase:", error);
  }
};

// Subscribe to Incident Reports
export const subscribeToIncidents = (
  onData: (incidents: IncidentReport[]) => void,
  onError?: (error: any) => void
) => {
  if (!db) return () => {};
  const colRef = collection(db, 'safety_incidents');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: IncidentReport[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id } as IncidentReport);
        });
        onData(list);
      }
    },
    (err) => {
      console.warn("Firestore incidents sync:", err.message);
      if (onError) onError(err);
    }
  );
};

// Upvote Incident in Firebase
export const upvoteIncidentInFirebase = async (incidentId: string, currentUpvotes: number) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'safety_incidents', incidentId);
    await updateDoc(docRef, { upvotes: currentUpvotes + 1 });
  } catch (error) {
    console.warn("Failed to upvote incident in Firebase:", error);
  }
};

// Save Geofence Breach Alert to Firebase
export const saveGeofenceAlertToFirebase = async (alert: GeofenceAlert) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'geofence_alerts', alert.id);
    await setDoc(docRef, alert, { merge: true });
  } catch (error) {
    console.warn("Failed to save geofence alert to Firebase:", error);
  }
};

// Batch seed initial data to user's Firebase if empty
export const seedInitialFirebaseData = async (
  subjects: TrackedSubject[],
  contacts: TrustedContact[],
  geofences: GeofenceZone[],
  incidents: IncidentReport[]
) => {
  if (!db) return;
  try {
    for (const sub of subjects) {
      await setDoc(doc(db, 'tracked_subjects', sub.id), sub, { merge: true });
    }
    for (const cont of contacts) {
      await setDoc(doc(db, 'trusted_contacts', cont.id), cont, { merge: true });
    }
    for (const geo of geofences) {
      await setDoc(doc(db, 'geofences', geo.id), geo, { merge: true });
    }
    for (const inc of incidents) {
      await setDoc(doc(db, 'safety_incidents', inc.id), inc, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn("Seeding initial data notice:", err);
    return false;
  }
};
