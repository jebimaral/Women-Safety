import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  ShieldCheck, 
  Users, 
  PhoneCall, 
  Bot, 
  AlertTriangle, 
  Volume2, 
  Mic, 
  ChevronDown,
  Radio,
  BatteryCharging,
  Flame
} from 'lucide-react';
import { TrackedSubject } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subjects: TrackedSubject[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  onTriggerSOS: () => void;
  onToggleSiren: () => void;
  isSirenActive: boolean;
  onTriggerFakeCall: () => void;
  isVoiceActive: boolean;
  onToggleVoiceSOS: () => void;
  activeSOSCount: number;
  onOpenFirebase?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  onTriggerSOS,
  onToggleSiren,
  isSirenActive,
  onTriggerFakeCall,
  isVoiceActive,
  onToggleVoiceSOS,
  activeSOSCount,
  onOpenFirebase,
}) => {
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Live Protection Indicator */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                AuraGuard
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                Guard Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Women & Child Real-Time Safety & Crisis Dispatch
            </p>
          </div>
        </div>

        {/* Center: Tracked Subject Quick Selector */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-xs font-medium text-slate-400 pl-2 hidden md:inline">Tracked:</span>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="appearance-none bg-slate-800/90 text-slate-100 text-xs sm:text-sm font-semibold py-1.5 pl-3 pr-8 rounded-xl border border-slate-700/70 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.role.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
            <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
            <span>{selectedSubject?.batteryLevel}%</span>
          </div>
        </div>

        {/* Right Action Tools & Massive Emergency Panic SOS Button */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Firebase Connection Button */}
          <button
            onClick={onOpenFirebase}
            title="Firebase Project: project1-4506"
            className="flex items-center space-x-1.5 px-2.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline font-mono">project1-4506</span>
          </button>

          {/* Siren */}
          <button
            onClick={onToggleSiren}
            title={isSirenActive ? "Stop Emergency Siren" : "Sound Loud Siren"}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isSirenActive
                ? 'bg-amber-500 text-slate-950 animate-bounce shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Volume2 className={`h-4 w-4 ${isSirenActive ? 'animate-spin text-slate-950' : 'text-amber-400'}`} />
            <span className="hidden xl:inline">{isSirenActive ? 'SIREN ON' : 'Loud Siren'}</span>
          </button>

          {/* Fake Call */}
          <button
            onClick={onTriggerFakeCall}
            title="Simulate Fake Caller"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition-all"
          >
            <PhoneCall className="h-4 w-4 text-indigo-400" />
            <span className="hidden xl:inline">Fake Call</span>
          </button>

          {/* Voice SOS */}
          <button
            onClick={onToggleVoiceSOS}
            title={isVoiceActive ? "Voice Monitoring Active" : "Enable Voice SOS"}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isVoiceActive
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Mic className={`h-4 w-4 ${isVoiceActive ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">{isVoiceActive ? 'Voice SOS ON' : 'Voice SOS'}</span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onTriggerSOS}
            id="emergency-sos-btn"
            className="relative group flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-600/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-rose-400/30"
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <ShieldAlert className="h-5 w-5" />
            <span>EMERGENCY SOS</span>
            {activeSOSCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-rose-700 rounded-full text-xs font-bold">
                {activeSOSCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar space-x-1.5 py-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin className="h-4 w-4 text-rose-400" />
            <span>Live Map & Safety Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('geofences')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'geofences'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Geofence Safe Zones</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'contacts'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="h-4 w-4 text-blue-400" />
            <span>Trusted Guardians</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'ai-assistant'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="h-4 w-4 text-indigo-400" />
            <span>AI Threat Evaluator</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'incidents'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Hazard Reports & Heatmap</span>
          </button>
        </div>
      </div>
    </header>
  );
};

