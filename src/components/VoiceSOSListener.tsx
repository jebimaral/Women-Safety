import React, { useEffect, useState } from 'react';
import { Mic, MicOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface VoiceSOSListenerProps {
  isActive: boolean;
  onTriggerSOS: () => void;
}

export const VoiceSOSListener: React.FC<VoiceSOSListenerProps> = ({
  isActive,
  onTriggerSOS,
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [lastDetectedKeyword, setLastDetectedKeyword] = useState<string | null>(null);

  useEffect(() => {
    let recognition: any = null;

    if (isActive && 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript.toLowerCase();
          setTranscript(text);

          const keywords = ['help', 'sos', 'police', 'emergency', 'followed', 'stop', 'save me', 'danger'];
          for (const kw of keywords) {
            if (text.includes(kw)) {
              setLastDetectedKeyword(kw);
              onTriggerSOS();
              break;
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e.error);
        };

        recognition.start();
      } catch (err) {
        console.warn("Speech recognition not supported:", err);
      }
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 left-4 z-30 bg-slate-900/95 border border-indigo-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center space-x-3 text-xs text-slate-200 animate-bounce">
      <div className="p-2 bg-indigo-600 text-white rounded-xl animate-pulse">
        <Mic className="h-4 w-4" />
      </div>
      <div>
        <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
          <span>VOICE SOS MONITORING</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <p className="text-[11px] text-slate-400 max-w-[200px] truncate">
          {transcript || 'Listening for "Help", "SOS", "Police"...'}
        </p>
      </div>
    </div>
  );
};
