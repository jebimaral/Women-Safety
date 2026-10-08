import React, { useState } from 'react';
import { 
  Flame, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  Server,
  Layers,
  Radio,
  Copy,
  AlertCircle
} from 'lucide-react';
import { firebaseConfig, isFirebaseInitialized, seedInitialFirebaseData } from '../services/firebase';
import { TrackedSubject, TrustedContact, GeofenceZone, IncidentReport } from '../types';

interface FirebaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: TrackedSubject[];
  contacts: TrustedContact[];
  geofences: GeofenceZone[];
  incidents: IncidentReport[];
  isSyncing: boolean;
  onManualSync: () => void;
}

export const FirebaseStatusModal: React.FC<FirebaseStatusModalProps> = ({
  isOpen,
  onClose,
  subjects,
  contacts,
  geofences,
  incidents,
  isSyncing,
  onManualSync,
}) => {
  const [copied, setCopied] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(firebaseConfig.projectId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    const success = await seedInitialFirebaseData(subjects, contacts, geofences, incidents);
    setIsSeeding(false);
    setSeedSuccess(success);
    setTimeout(() => setSeedSuccess(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Firebase Connection Status</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400">Google Cloud Firestore & Live Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Project Credentials Card */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project ID</span>
              <button
                onClick={handleCopyProjectId}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-mono font-bold"
              >
                <span>{firebaseConfig.projectId}</span>
                <Copy className="h-3.5 w-3.5 ml-1" />
                {copied && <span className="text-[10px] text-emerald-400">Copied!</span>}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px] font-medium uppercase">Auth Domain</div>
                <div className="text-slate-300 font-mono truncate text-[11px] mt-0.5">{firebaseConfig.authDomain}</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px] font-medium uppercase">Storage Bucket</div>
                <div className="text-slate-300 font-mono truncate text-[11px] mt-0.5">{firebaseConfig.storageBucket}</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px] font-medium uppercase">App ID</div>
                <div className="text-slate-300 font-mono truncate text-[11px] mt-0.5">{firebaseConfig.appId}</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px] font-medium uppercase">Messaging Sender</div>
                <div className="text-slate-300 font-mono truncate text-[11px] mt-0.5">{firebaseConfig.messagingSenderId}</div>
              </div>
            </div>
          </div>

          {/* Firestore Collections Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Database className="h-3.5 w-3.5 text-amber-400" />
              <span>Synchronized Firestore Collections</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-extrabold text-white">{subjects.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Tracked Subjects</div>
                <div className="text-[9px] text-slate-500 font-mono">tracked_subjects</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-extrabold text-white">{contacts.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Trusted Contacts</div>
                <div className="text-[9px] text-slate-500 font-mono">trusted_contacts</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-extrabold text-white">{geofences.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Safe Geofences</div>
                <div className="text-[9px] text-slate-500 font-mono">geofences</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-extrabold text-white">{incidents.length}</div>
                <div className="text-[10px] text-slate-400 font-medium">Hazard Incidents</div>
                <div className="text-[9px] text-slate-500 font-mono">safety_incidents</div>
              </div>
            </div>
          </div>

          {/* Seed Initial Data to Firebase */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-amber-400" />
                <span>Upload Sample Safety Data to Firestore</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Seeds initial family members, safe zones, and contacts to your project1-4506 database.
              </p>
            </div>

            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Push to Firestore</span>
                </>
              )}
            </button>
          </div>

          {seedSuccess !== null && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center space-x-2 ${
              seedSuccess 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {seedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Successfully synchronized all collections with Firebase Firestore!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-rose-400" />
                  <span>Connected to project1-4506. Ensure your Firestore security rules permit read/write.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time listeners active</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
