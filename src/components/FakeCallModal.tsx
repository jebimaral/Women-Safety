import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  User, 
  Volume2, 
  Mic, 
  Clock, 
  X,
  Play,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { playPhoneRingtone, speakText } from '../utils/audioUtils';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState<string>('Mom (Eleanor)');
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [callState, setCallState] = useState<'idle' | 'waiting' | 'ringing' | 'connected'>('idle');
  const [countdown, setCountdown] = useState<number>(0);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);

  // Countdown timer for delayed call
  useEffect(() => {
    let timer: any;
    if (callState === 'waiting') {
      if (countdown <= 0) {
        setCallState('ringing');
      } else {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [callState, countdown]);

  // Audio ringtone when ringing
  useEffect(() => {
    let stopRingFn: any;
    if (callState === 'ringing') {
      stopRingFn = playPhoneRingtone();
    }
    return () => {
      if (stopRingFn) stopRingFn();
    };
  }, [callState]);

  // Call duration counter when connected
  useEffect(() => {
    let interval: any;
    if (callState === 'connected') {
      setCallDurationSeconds(0);
      speakText(`Hey honey, I'm right outside in the car waiting for you. Are you coming out now?`);
      interval = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const handleStartCallTrigger = () => {
    if (delaySeconds === 0) {
      setCallState('ringing');
    } else {
      setCountdown(delaySeconds);
      setCallState('waiting');
    }
  };

  const handleAcceptCall = () => {
    setCallState('connected');
  };

  const handleEndCall = () => {
    setCallState('idle');
    onClose();
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      {callState === 'idle' && (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PhoneCall className="h-5 w-5 text-indigo-400" />
              <span>Fake Incoming Call Simulator</span>
            </h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-400">
              Generate a realistic incoming call screen to safely exit uncomfortable social situations or unsafe rides.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Caller Contact Name
              </label>
              <select
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-100"
              >
                <option value="Mom (Eleanor)">Mom (Eleanor)</option>
                <option value="Dad (Marcus)">Dad (Marcus)</option>
                <option value="Officer Ramirez (Police)">Officer Ramirez (Police)</option>
                <option value="Dispatch Office">Dispatch Office</option>
                <option value="Uber / Cab Driver">Uber / Cab Driver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Trigger Delay
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 5, 10, 30].map((secs) => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setDelaySeconds(secs)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      delaySeconds === secs
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {secs === 0 ? 'Now' : `${secs}s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleStartCallTrigger}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="h-4 w-4" />
                <span>{delaySeconds === 0 ? 'RING NOW' : `RING IN ${delaySeconds} SECONDS`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Countdown View */}
      {callState === 'waiting' && (
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Call Timer Scheduled</h3>
          <p className="text-xs text-slate-400">
            Keep your phone in hand. Fake call from <strong className="text-indigo-300">{callerName}</strong> will ring in:
          </p>
          <div className="text-5xl font-black text-white font-mono tracking-tighter">
            00:0{countdown}
          </div>
          <button
            onClick={handleEndCall}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
          >
            Cancel Timer
          </button>
        </div>
      )}

      {/* Ringing / Connected Full Screen Phone Call UI */}
      {(callState === 'ringing' || callState === 'connected') && (
        <div className="relative w-full max-w-md h-[620px] bg-slate-950 rounded-[40px] border-4 border-slate-800 shadow-2xl flex flex-col justify-between p-8 text-white overflow-hidden">
          {/* Top Speaker Notch */}
          <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-4 border border-slate-800"></div>

          {/* Caller Details */}
          <div className="text-center space-y-4 my-auto">
            <div className="relative w-28 h-28 mx-auto rounded-full bg-slate-800 border-4 border-indigo-500/50 flex items-center justify-center shadow-xl overflow-hidden">
              <User className="h-16 w-16 text-slate-400" />
              {callState === 'ringing' && (
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping"></div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">{callerName}</h2>
              <p className="text-xs font-semibold text-indigo-300 mt-1">
                {callState === 'ringing' ? 'Incoming Mobile Call...' : `Connected • ${formatDuration(callDurationSeconds)}`}
              </p>
            </div>
          </div>

          {/* Connected audio transcript banner */}
          {callState === 'connected' && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-center space-y-1 mb-4">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center space-x-1">
                <Volume2 className="h-3 w-3 animate-pulse" />
                <span>Simulated Voice Audio Active</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                "I'm right outside waiting for you in the car, honey..."
              </p>
            </div>
          )}

          {/* Call Control Action Buttons */}
          <div className="flex items-center justify-around pt-6 border-t border-slate-900">
            {callState === 'ringing' ? (
              <>
                {/* Decline Button */}
                <button
                  onClick={handleEndCall}
                  className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform hover:scale-110 active:scale-95 transition-all"
                  title="Decline Call"
                >
                  <PhoneOff className="h-8 w-8" />
                </button>

                {/* Accept Button */}
                <button
                  onClick={handleAcceptCall}
                  className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 transform hover:scale-110 active:scale-95 transition-all animate-bounce"
                  title="Accept Call"
                >
                  <Phone className="h-8 w-8" />
                </button>
              </>
            ) : (
              /* End Active Call */
              <button
                onClick={handleEndCall}
                className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform hover:scale-110 active:scale-95 transition-all mx-auto"
                title="Hang Up"
              >
                <PhoneOff className="h-8 w-8" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
