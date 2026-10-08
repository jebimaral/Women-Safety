import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Users, 
  MapPin, 
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  GeofenceZone, 
  GeofenceAlert, 
  TrackedSubject, 
  TrustedContact, 
  GeofenceType 
} from '../types';

interface GeofenceManagerProps {
  geofences: GeofenceZone[];
  alerts: GeofenceAlert[];
  subjects: TrackedSubject[];
  contacts: TrustedContact[];
  onAddGeofence: (newZone: Omit<GeofenceZone, 'id'>) => void;
  onDeleteGeofence: (id: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  alerts,
  subjects,
  contacts,
  onAddGeofence,
  onDeleteGeofence,
  onAcknowledgeAlert,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<GeofenceType>('safe');
  const [radiusMeters, setRadiusMeters] = useState<number>(300);
  const [lat, setLat] = useState<number>(37.7749);
  const [lng, setLng] = useState<number>(-122.4194);
  const [description, setDescription] = useState<string>('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(subjects.map((s) => s.id));
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(contacts.map((c) => c.id));
  const [alertOnEntry, setAlertOnEntry] = useState<boolean>(true);
  const [alertOnExit, setAlertOnExit] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'zones' | 'history'>('zones');

  const handleSubjectToggle = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((sId) => sId !== id));
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleContactToggle = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cId) => cId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let color = '#10b981';
    if (type === 'school') color = '#3b82f6';
    if (type === 'work') color = '#8b5cf6';
    if (type === 'high_risk') color = '#ef4444';
    if (type === 'restricted') color = '#f59e0b';

    onAddGeofence({
      name,
      type,
      lat,
      lng,
      radiusMeters,
      assignedSubjectIds: selectedSubjectIds,
      notifyContactIds: selectedContactIds,
      alertOnEntry,
      alertOnExit,
      color,
      description,
    });

    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Subtab Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Geofencing & Safe Zone Protection
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Automated virtual perimeters. Instant SMS/Push notifications sent to trusted contacts on boundary crossing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveSubTab('zones')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'zones'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Configured Zones ({geofences.length})
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeSubTab === 'history'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BellRing className="h-3.5 w-3.5" />
              <span>Breach Alert History ({alerts.length})</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Safe Zone</span>
          </button>
        </div>
      </div>

      {/* Main Section View */}
      {activeSubTab === 'zones' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {geofences.map((zone) => (
            <div
              key={zone.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden group"
            >
              {/* Colored Indicator Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: zone.color }}
              ></div>

              <div className="space-y-4 pt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1"
                      style={{
                        backgroundColor: `${zone.color}25`,
                        color: zone.color,
                        border: `1px solid ${zone.color}40`,
                      }}
                    >
                      {zone.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                      {zone.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => onDeleteGeofence(zone.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Geofence"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {zone.description || 'Virtual safety perimeter with real-time tracking alerts.'}
                </p>

                {/* Properties Grid */}
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 font-bold">Perimeter Radius</span>
                    <span className="font-mono font-bold text-white">{zone.radiusMeters}m ({zone.radiusMeters * 3.28 | 0} ft)</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 font-bold">Alert Triggers</span>
                    <span className="font-semibold text-slate-200">
                      {zone.alertOnEntry && 'Entry '}
                      {zone.alertOnExit && 'Exit'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 font-bold">Monitored Subjects</span>
                    <span className="font-semibold text-emerald-400">
                      {zone.assignedSubjectIds.length} Subjects Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1 text-[11px]">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Notifies {zone.notifyContactIds.length} Trusted Contacts</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">ID: {zone.id}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Breach Alert History Subtab */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-amber-400" />
              <span>Real-Time Geofence Breach Stream</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing recent automated boundary triggers
            </span>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No geofence boundary breaches detected yet.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    alert.eventType === 'HIGH_RISK_BREACH'
                      ? 'bg-red-950/30 border-red-500/40'
                      : alert.eventType === 'EXITED'
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-emerald-950/30 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      {alert.eventType === 'HIGH_RISK_BREACH' ? (
                        <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
                      ) : (
                        <Radio className="h-5 w-5 text-amber-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{alert.subjectName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            alert.eventType === 'HIGH_RISK_BREACH'
                              ? 'bg-red-600 text-white'
                              : alert.eventType === 'EXITED'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {alert.eventType}
                        </span>
                        <span className="text-xs font-bold text-rose-300">{alert.zoneName}</span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">{alert.address}</p>

                      <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-3">
                        <span>Time: {alert.timestamp}</span>
                        <span>•</span>
                        <span>Notified: {alert.notifiedContacts.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {alert.status === 'unread' && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 whitespace-nowrap"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Create New Geofence Zone */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Configure New Geofence Safe Zone</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude Elementary School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Zone Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GeofenceType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200"
                  >
                    <option value="safe">Home / General Safe Haven</option>
                    <option value="school">School / Academy</option>
                    <option value="work">Workplace Office</option>
                    <option value="high_risk">High Risk / Danger Zone</option>
                    <option value="restricted">Restricted Area</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Radius ({radiusMeters}m)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Monitored Subjects Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Apply Geofence to Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSubjectIds.includes(sub.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Triggers */}
              <div className="flex items-center space-x-6 py-2 border-y border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={alertOnEntry}
                    onChange={(e) => setAlertOnEntry(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span>Alert on Entry</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={alertOnExit}
                    onChange={(e) => setAlertOnExit(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <span>Alert on Exit</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description / Notes
                </label>
                <input
                  type="text"
                  placeholder="Additional safety protocol notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Save Geofence Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
