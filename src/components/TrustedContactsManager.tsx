import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  Star, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  MessageSquare, 
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { TrustedContact, RelationshipType, AlertChannel } from '../types';

interface TrustedContactsManagerProps {
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  onTogglePrimary: (id: string) => void;
  onSendTestAlert: (contact: TrustedContact) => void;
}

export const TrustedContactsManager: React.FC<TrustedContactsManagerProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onTogglePrimary,
  onSendTestAlert,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [relationship, setRelationship] = useState<RelationshipType>('Mother');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);
  const [notifyChannels, setNotifyChannels] = useState<AlertChannel[]>(['sms', 'call', 'push']);
  const [testedContactId, setTestedContactId] = useState<string | null>(null);

  const handleChannelToggle = (channel: AlertChannel) => {
    if (notifyChannels.includes(channel)) {
      setNotifyChannels(notifyChannels.filter((c) => c !== channel));
    } else {
      setNotifyChannels([...notifyChannels, channel]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const avatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    ];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    onAddContact({
      name,
      relationship,
      phone,
      email,
      isPrimary,
      notifyChannels,
      avatar,
    });

    setName('');
    setPhone('');
    setEmail('');
    setShowAddModal(false);
  };

  const handleTestDispatch = (contact: TrustedContact) => {
    onSendTestAlert(contact);
    setTestedContactId(contact.id);
    setTimeout(() => setTestedContactId(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Trusted Emergency Contact Network
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              People who automatically receive your emergency SOS alerts and live GPS tracking link.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Trusted Contact</span>
        </button>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`bg-slate-900 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all relative overflow-hidden group ${
              contact.isPrimary ? 'border-rose-500/50 ring-1 ring-rose-500/30' : 'border-slate-800'
            }`}
          >
            {contact.isPrimary && (
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-md flex items-center space-x-1">
                <Star className="h-3 w-3 fill-white" />
                <span>PRIMARY SOS CONTACT</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                    {contact.name}
                  </h3>
                  <span className="inline-block text-xs font-semibold text-rose-400">
                    {contact.relationship}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 font-bold flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone</span>
                  </span>
                  <a href={`tel:${contact.phone}`} className="font-mono font-bold text-white hover:underline">
                    {contact.phone}
                  </a>
                </div>

                {contact.email && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 font-bold flex items-center space-x-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </span>
                    <span className="text-slate-300 truncate max-w-[150px]">{contact.email}</span>
                  </div>
                )}
              </div>

              {/* Channels list */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Notification Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {contact.notifyChannels.map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onTogglePrimary(contact.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  contact.isPrimary
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {contact.isPrimary ? 'Primary' : 'Set Primary'}
              </button>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleTestDispatch(contact)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center space-x-1 transition-all"
                  title="Send Test Emergency Alert SMS"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{testedContactId === contact.id ? 'Sent!' : 'Test Alert'}</span>
                </button>

                <button
                  onClick={() => onDeleteContact(contact.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Remove Contact"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Contact */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-rose-400" />
                <span>Add Emergency Trusted Contact</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Partner">Partner</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Friend">Friend</option>
                    <option value="Local Police">Local Police</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Alert Channels
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['sms', 'call', 'whatsapp', 'push'] as AlertChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleChannelToggle(ch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                        notifyChannels.includes(ch)
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded accent-rose-500 w-4 h-4"
                  />
                  <span>Set as Primary Emergency Contact</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
