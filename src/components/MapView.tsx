import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Layers, 
  Eye, 
  EyeOff, 
  Play, 
  ShieldAlert, 
  Building2, 
  AlertTriangle,
  LocateFixed,
  Radio,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { 
  TrackedSubject, 
  GeofenceZone, 
  IncidentReport, 
  SafePlace, 
  LocationPoint 
} from '../types';
import { simulateMovement, calculateDistanceMeters, formatDistance } from '../utils/geoUtils';

interface MapViewProps {
  subjects: TrackedSubject[];
  selectedSubjectId: string;
  onUpdateSubjectLocation: (id: string, newLoc: LocationPoint) => void;
  geofences: GeofenceZone[];
  incidents: IncidentReport[];
  safePlaces: SafePlace[];
  onTriggerGeofenceBreach: (subject: TrackedSubject, zone: GeofenceZone, type: 'ENTERED' | 'EXITED') => void;
  onTriggerSOS: () => void;
}

export const MapView: React.FC<MapViewProps> = ({
  subjects,
  selectedSubjectId,
  onUpdateSubjectLocation,
  geofences,
  incidents,
  safePlaces,
  onTriggerGeofenceBreach,
  onTriggerSOS,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const circlesRef = useRef<{ [key: string]: L.Circle }>({});
  const safePlacesMarkersRef = useRef<L.Marker[]>([]);
  const incidentsMarkersRef = useRef<L.Marker[]>([]);

  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showSafePlaces, setShowSafePlaces] = useState<boolean>(true);
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = activeSubject.currentLocation.lat;
    const initialLng = activeSubject.currentLocation.lng;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([initialLat, initialLng], 15);

    // OpenStreetMap Tile Layer with dark mode CSS filter
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'map-tiles-dark',
    }).addTo(map);


    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when subject selection changes
  useEffect(() => {
    if (mapInstanceRef.current && activeSubject) {
      mapInstanceRef.current.panTo([
        activeSubject.currentLocation.lat,
        activeSubject.currentLocation.lng,
      ]);
    }
  }, [selectedSubjectId]);

  // Render/Update Tracked Subject Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    subjects.forEach((subject) => {
      const isSelected = subject.id === selectedSubjectId;
      const lat = subject.currentLocation.lat;
      const lng = subject.currentLocation.lng;

      // Create Custom Marker Icon HTML
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-110">
          <div class="absolute -inset-2 rounded-full ${
            subject.status === 'sos'
              ? 'bg-red-500/50 animate-ping'
              : isSelected
              ? 'bg-rose-500/30 animate-pulse'
              : 'bg-emerald-500/20'
          }"></div>
          
          <div class="w-11 h-11 rounded-full border-2 ${
            subject.status === 'sos'
              ? 'border-red-500 ring-4 ring-red-500/40'
              : isSelected
              ? 'border-rose-400 ring-2 ring-rose-500/40'
              : 'border-slate-800'
          } shadow-xl overflow-hidden bg-slate-900 flex items-center justify-center">
            <img src="${subject.avatar}" alt="${subject.name}" class="w-full h-full object-cover" />
          </div>

          <div class="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-md ${
            subject.status === 'sos'
              ? 'bg-red-600 text-white'
              : subject.role === 'self'
              ? 'bg-indigo-600 text-white'
              : 'bg-emerald-600 text-white'
          }">
            ${subject.role === 'self' ? 'YOU' : subject.role.toUpperCase()}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-subject-marker',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (markersRef.current[subject.id]) {
        markersRef.current[subject.id].setLatLng([lat, lng]);
        markersRef.current[subject.id].setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans min-w-[200px]">
            <div class="font-bold text-sm">${subject.name}</div>
            <div class="text-xs text-slate-600">${subject.currentLocation.address}</div>
            <div class="mt-2 text-xs flex items-center justify-between border-t border-slate-200 pt-1">
              <span>Speed: <b>${subject.speedKmH} km/h</b></span>
              <span>Battery: <b>${subject.batteryLevel}%</b></span>
            </div>
          </div>
        `);

        markersRef.current[subject.id] = marker;
      }
    });
  }, [subjects, selectedSubjectId]);

  // Render/Update Geofence Circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing circles if hidden
    Object.keys(circlesRef.current).forEach((zoneId) => {
      if (circlesRef.current[zoneId]) {
        map.removeLayer(circlesRef.current[zoneId]);
        delete circlesRef.current[zoneId];
      }
    });

    if (showGeofences) {
      geofences.forEach((zone) => {
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radiusMeters,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: zone.type === 'high_risk' ? 0.25 : 0.12,
          weight: zone.type === 'high_risk' ? 2.5 : 1.5,
          dashArray: zone.type === 'high_risk' ? '6, 6' : undefined,
        }).addTo(map);

        circle.bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <div class="font-bold text-xs uppercase text-slate-500">${zone.type.toUpperCase()} ZONE</div>
            <div class="font-bold text-sm" style="color:${zone.color}">${zone.name}</div>
            <div class="text-xs text-slate-600">Radius: ${zone.radiusMeters} meters</div>
            <div class="text-xs text-slate-500 mt-1">${zone.description || ''}</div>
          </div>
        `);

        circlesRef.current[zone.id] = circle;
      });
    }
  }, [geofences, showGeofences]);

  // Render Safe Places Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    safePlacesMarkersRef.current.forEach((m) => map.removeLayer(m));
    safePlacesMarkersRef.current = [];

    if (showSafePlaces) {
      safePlaces.forEach((place) => {
        const iconColor =
          place.type === 'police'
            ? 'bg-blue-600'
            : place.type === 'hospital'
            ? 'bg-emerald-600'
            : 'bg-purple-600';

        const iconHtml = `
          <div class="w-8 h-8 rounded-full ${iconColor} border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
            ${place.type === 'police' ? '👮' : place.type === 'hospital' ? '🏥' : '🛡️'}
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-safe-place-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <div class="font-bold text-sm">${place.name}</div>
            <div class="text-xs text-slate-600">${place.address}</div>
            <a href="tel:${place.phone}" class="inline-block mt-1 text-xs font-bold text-blue-600">Call: ${place.phone}</a>
          </div>
        `);

        safePlacesMarkersRef.current.push(marker);
      });
    }
  }, [safePlaces, showSafePlaces]);

  // Render Incidents Heatmap Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    incidentsMarkersRef.current.forEach((m) => map.removeLayer(m));
    incidentsMarkersRef.current = [];

    if (showIncidents) {
      incidents.forEach((inc) => {
        const iconHtml = `
          <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg flex items-center justify-center text-slate-950 font-black text-xs animate-pulse">
            ⚠️
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-incident-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">${inc.category}</span>
            <div class="font-bold text-xs mt-1">${inc.title}</div>
            <div class="text-xs text-slate-600 mt-1">${inc.description}</div>
            <div class="text-[10px] text-slate-400 mt-1">${inc.reportedAt} • ${inc.upvotes} upvotes</div>
          </div>
        `);

        incidentsMarkersRef.current.push(marker);
      });
    }
  }, [incidents, showIncidents]);

  // Movement Simulation Engine
  useEffect(() => {
    let interval: any;
    if (isSimulatingMovement) {
      interval = setInterval(() => {
        const nextLoc = simulateMovement(
          activeSubject.currentLocation,
          Math.floor(Math.random() * 360),
          15 * simulationSpeed
        );

        onUpdateSubjectLocation(activeSubject.id, nextLoc);

        // Geofence check on movement
        geofences.forEach((zone) => {
          if (zone.assignedSubjectIds.includes(activeSubject.id)) {
            const dist = calculateDistanceMeters(nextLoc.lat, nextLoc.lng, zone.lat, zone.lng);
            const insideNow = dist <= zone.radiusMeters;

            // Trigger breach test
            if (zone.type === 'high_risk' && insideNow) {
              onTriggerGeofenceBreach(activeSubject, zone, 'ENTERED');
            }
          }
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMovement, activeSubject, simulationSpeed, geofences]);

  const handleRecenterMap = () => {
    if (mapInstanceRef.current && activeSubject) {
      mapInstanceRef.current.flyTo(
        [activeSubject.currentLocation.lat, activeSubject.currentLocation.lng],
        16,
        { duration: 1 }
      );
    }
  };

  const handleShareLiveTrack = () => {
    const trackUrl = `${window.location.origin}?track=${activeSubject.id}`;
    navigator.clipboard.writeText(trackUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Simulate Geofence Exit (For testing trusted contact alerts)
  const handleTestGeofenceExit = () => {
    const schoolZone = geofences.find((g) => g.type === 'school') || geofences[0];
    if (schoolZone) {
      // Offset position outside circle
      const offsetLat = schoolZone.lat + (schoolZone.radiusMeters + 200) / 111000;
      const outsideLoc: LocationPoint = {
        lat: offsetLat,
        lng: schoolZone.lng,
        address: 'Outside ' + schoolZone.name + ' Perimeter',
        speedKmH: 14.2,
        accuracyMeters: 4,
      };

      onUpdateSubjectLocation(activeSubject.id, outsideLoc);
      onTriggerGeofenceBreach(activeSubject, schoolZone, 'EXITED');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([outsideLoc.lat, outsideLoc.lng], 15);
      }
    }
  };

  // Simulate High Risk Zone Entry
  const handleTestHighRiskEntry = () => {
    const dangerZone = geofences.find((g) => g.type === 'high_risk') || geofences[0];
    if (dangerZone) {
      const insideLoc: LocationPoint = {
        lat: dangerZone.lat,
        lng: dangerZone.lng,
        address: 'Inside Restricted High Risk Site',
        speedKmH: 3.5,
        accuracyMeters: 3,
      };

      onUpdateSubjectLocation(activeSubject.id, insideLoc);
      onTriggerGeofenceBreach(activeSubject, dangerZone, 'ENTERED');

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([insideLoc.lat, insideLoc.lng], 16);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left / Main Map Canvas Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Map Header Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Real-Time Live Location Track</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Active Subject: <strong className="text-rose-300">{activeSubject.name}</strong>
              </p>
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setShowGeofences(!showGeofences)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                showGeofences
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Geofences</span>
            </button>

            <button
              onClick={() => setShowIncidents(!showIncidents)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                showIncidents
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Incidents</span>
            </button>

            <button
              onClick={() => setShowSafePlaces(!showSafePlaces)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                showSafePlaces
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Safe Places</span>
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[520px] rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Recenter Button Overlay */}
          <button
            onClick={handleRecenterMap}
            title="Recenter Map on Active Subject"
            className="absolute top-4 right-4 z-10 p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-100 rounded-2xl border border-slate-700 shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <LocateFixed className="h-5 w-5 text-rose-400" />
          </button>

          {/* Simulation Status Floating Overlay */}
          {isSimulatingMovement && (
            <div className="absolute top-4 left-4 z-10 px-3.5 py-2 bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-bold flex items-center space-x-2 backdrop-blur-md shadow-lg animate-pulse">
              <Radio className="h-4 w-4 text-indigo-400 animate-spin" />
              <span>LIVE GPS MOVEMENT SIMULATOR RUNNING...</span>
            </div>
          )}

          {/* Bottom Live Telemetry Overlay Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center space-x-3">
              <img
                src={activeSubject.avatar}
                alt={activeSubject.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-rose-500"
              />
              <div>
                <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                  <span>{activeSubject.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    {activeSubject.status}
                  </span>
                </div>
                <p className="text-slate-400 truncate max-w-xs">{activeSubject.currentLocation.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 border-l border-slate-800 pl-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Speed</span>
                <p className="font-bold text-slate-200">{activeSubject.speedKmH} km/h</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Battery</span>
                <p className="font-bold text-slate-200">{activeSubject.batteryLevel}%</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</span>
                <p className="font-bold text-slate-200">±{activeSubject.currentLocation.accuracyMeters || 5}m</p>
              </div>
            </div>

            <button
              onClick={handleShareLiveTrack}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold rounded-xl border border-rose-500/30 flex items-center space-x-1.5 transition-all"
            >
              <Share2 className="h-4 w-4" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Live Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Real-Time Simulation Controls & Nearby Safe Havens */}
      <div className="w-full lg:w-96 flex flex-col space-y-5">
        {/* Real-Time Geofence Testing Simulation Deck */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Radio className="h-4 w-4 text-rose-400" />
              <span>Geofence Alert Simulator</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">
              Interactive
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Test automated boundary alerts sent to trusted contacts by simulating subject location changes:
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                isSimulatingMovement
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              <Play className={`h-4 w-4 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
              <span>{isSimulatingMovement ? 'STOP ROUTE SIMULATION' : 'START LIVE ROUTE WALK'}</span>
            </button>

            <button
              onClick={handleTestGeofenceExit}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Simulate School Geofence Exit</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Trigger Alert</span>
            </button>

            <button
              onClick={handleTestHighRiskEntry}
              className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-200 rounded-xl text-xs font-bold flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                <span>Simulate High Risk Zone Entry</span>
              </div>
              <span className="text-[10px] text-red-400 font-mono">Critical</span>
            </button>
          </div>
        </div>

        {/* Nearby Safe Places & Police Emergency Stations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span>Nearby Emergency Havens</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">{safePlaces.length} Nearby</span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {safePlaces.map((place) => (
              <div
                key={place.id}
                className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 hover:border-blue-500/40 transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {place.name}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{place.address}</p>
                  <div className="mt-1.5 flex items-center space-x-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold uppercase">
                      {place.type}
                    </span>
                    <span className="text-slate-400 font-semibold">{place.distanceKm} km away</span>
                  </div>
                </div>

                <a
                  href={`tel:${place.phone}`}
                  className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl transition-all"
                  title={`Call ${place.name}`}
                >
                  <LocateFixed className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
