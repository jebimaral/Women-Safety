import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  Filter, 
  ShieldAlert,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { IncidentReport, IncidentCategory } from '../types';

interface IncidentReporterProps {
  incidents: IncidentReport[];
  onAddIncident: (report: Omit<IncidentReport, 'id' | 'reportedAt' | 'upvotes'>) => void;
  onUpvoteIncident: (id: string) => void;
}

export const IncidentReporter: React.FC<IncidentReporterProps> = ({
  incidents,
  onAddIncident,
  onUpvoteIncident,
}) => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<IncidentCategory>('Poor Lighting');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Market St & 7th St, San Francisco');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedFilterCategory === 'all') return true;
    return inc.category === selectedFilterCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddIncident({
      title,
      category,
      description,
      address,
      lat: 37.7749 + (Math.random() - 0.5) * 0.01,
      lng: -122.4194 + (Math.random() - 0.5) * 0.01,
      reportedBy: 'AuraGuard Verified User',
      severity,
    });

    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Community Incident & Safety Hazard Watch
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Crowdsourced community reporting for unlit streets, harassment spots, and suspicious activity.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition-all uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Report Safety Hazard</span>
        </button>
      </div>

      {/* Filter Category Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-slate-500 uppercase px-2 flex items-center space-x-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </span>
        {['all', 'Harassment', 'Stalking', 'Poor Lighting', 'Suspicious Activity', 'Unsafe Road'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilterCategory === cat
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Incident Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/30 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {inc.category}
                </span>

                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    inc.severity === 'high'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {inc.severity} Severity
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {inc.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">{inc.description}</p>

              <div className="flex items-center space-x-1 text-xs text-slate-400 font-medium">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                <span className="truncate">{inc.address}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] text-slate-500">{inc.reportedAt}</span>

              <button
                onClick={() => onUpvoteIncident(inc.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Confirm ({inc.upvotes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Report Hazard */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span>Report Safety Hazard or Incident</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Hazard Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unlit Alleyway at 5th & Howard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200"
                  >
                    <option value="Poor Lighting">Poor Lighting</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Stalking">Stalking</option>
                    <option value="Suspicious Activity">Suspicious Activity</option>
                    <option value="Unsafe Road">Unsafe Road</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Emergency Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Location Pin / Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the hazard to alert nearby women and guardians..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-600/30 uppercase tracking-wider"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
