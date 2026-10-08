import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  PhoneCall, 
  Send, 
  Volume2, 
  VolumeX, 
  MapPin, 
  CheckCircle2, 
  AlertOctagon,
  Share2,
  Lock
} from 'lucide-react';
import { TrackedSubject, TrustedContact, SOSAlert } from '../types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: TrackedSubject;
  trustedContacts: TrustedContact[];
  onConfirmSOS: (notes?: string) => void;
  onCancelSOS: () => void;
  isSirenActive: boolean;
  onToggleSiren: () => void;
  activeAlert?: SOSAlert | null;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  subject,
  trustedContacts,
  onConfirmSOS,
  onCancelSOS,
  isSirenActive,
  onToggleSiren,
  activeAlert,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isAlertBroadcasting, setIsAlertBroadcasting] = useState<boolean>(false);
  const [cancelPinInput, setCancelPinInput] = useState<string>('');
  const [showCancelPin, setShowCancelPin] = useState<boolean>(false);
  const [notesInput, setNotesInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isOpen && !isAlertBroadcasting) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsAlertBroadcasting(true);
            onConfirmSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImmediateTrigger = () => {
    setIsAlertBroadcasting(true);
    onConfirmSOS(notesInput);
  };

  const handleShareLiveTrack = () => {
    const trackUrl = `${window.location.origin}?track=${subject.id}&lat=${subject.currentLocation.lat}&lng=${subject.currentLocation.lng}`;
    navigator.clipboard.writeText(trackUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSafeCancel = () => {
    onCancelSOS();
    setIsAlertBroadcasting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      {/* Background Red Pulsing Aura */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-rose-950/20 to-transparent pointer-events-none animate-pulse"></div>

      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500/50 rounded-3xl shadow-2xl shadow-red-600/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-2xl animate-bounce">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wider uppercase">
                EMERGENCY SOS ACTIVATED
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Dispatching real-time coordinates to trusted contacts & emergency network
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCancelPin(!showCancelPin)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            title="Cancel Emergency Alert"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Countdown safeguarding section */}
          {!isAlertBroadcasting ? (
            <div className="bg-red-950/40 border border-red-500/30 p-6 rounded-2xl text-center space-y-4">
              <div className="text-xs font-bold text-red-400 uppercase tracking-widest">
                AUTOMATIC DISPATCH COUNTDOWN
              </div>
              <div className="text-6xl font-black text-white font-mono tracking-tighter">
                00:0{countdown}
              </div>
              <p className="text-sm text-slate-300">
                Broadcasting <span className="font-bold text-white">{subject.name}</span>'s exact GPS location in {countdown} seconds...
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleImmediateTrigger}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/50 transition-all uppercase tracking-wider"
                >
                  DISPATCH IMMEDIATELY (SKIP COUNTDOWN)
                </button>
                <button
                  onClick={handleSafeCancel}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition-all"
                >
                  CANCEL (FALSE ALARM)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-300">
                  SOS ALERTS BROADCASTED LIVE
                </h4>
                <p className="text-xs text-slate-300">
                  GPS position and audio signal have been transmitted to your primary contacts.
                </p>
              </div>
            </div>
          )}

          {/* Location Pin & Telemetry */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                <MapPin className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Live GPS Coordinates</span>
                <p className="text-sm font-semibold text-white">
                  {subject.currentLocation.address}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Lat: {subject.currentLocation.lat.toFixed(5)}, Lng: {subject.currentLocation.lng.toFixed(5)} (±{subject.currentLocation.accuracyMeters || 5}m accuracy)
                </p>
              </div>
            </div>

            <button
              onClick={handleShareLiveTrack}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-2 whitespace-nowrap"
            >
              <Share2 className="h-4 w-4 text-rose-400" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Track Link'}</span>
            </button>
          </div>

          {/* Loud Audio Siren Toggle */}
          <div className="flex items-center justify-between p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${isSirenActive ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-amber-400'}`}>
                {isSirenActive ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">High-Decibel Deterrent Siren</h4>
                <p className="text-xs text-slate-400">Emits loud dual-tone alarm synthesizer to attract immediate public help.</p>
              </div>
            </div>
            <button
              onClick={onToggleSiren}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                isSirenActive 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                  : 'bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30'
              }`}
            >
              {isSirenActive ? 'SILENCE SIREN' : 'PLAY LOUD SIREN'}
            </button>
          </div>

          {/* Trusted Contacts Alert Dispatch Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Trusted Contacts Dispatch Status ({trustedContacts.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {trustedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1">
                        <span>{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-bold">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{contact.relationship} • {contact.phone}</p>
                    </div>
                  </div>

                  <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-lg">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    SMS & Call Dispatched
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Panic Note */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Emergency Situation Note (Optional)
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Pursued by blue sedan near 4th St metro station"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <a
            href="tel:911"
            className="px-5 py-2.5 bg-red-700 hover:bg-red-600 text-white font-black text-xs sm:text-sm rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-red-700/40"
          >
            <PhoneCall className="h-4 w-4" />
            <span>DIRECT DIAL POLICE (911 / 112)</span>
          </a>

          <button
            onClick={handleSafeCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
          >
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>CANCEL SOS ALERT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
