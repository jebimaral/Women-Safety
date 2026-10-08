import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  Lightbulb,
  Radio,
  FileText
} from 'lucide-react';
import { ThreatAnalysis } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AISafetyAssistantProps {
  onTriggerSOS: () => void;
  onTriggerFakeCall: () => void;
}

export const AISafetyAssistant: React.FC<AISafetyAssistantProps> = ({
  onTriggerSOS,
  onTriggerFakeCall,
}) => {
  const [activeTab, setActiveTab] = useState<'evaluator' | 'chat'>('evaluator');
  const [situationInput, setSituationInput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ThreatAnalysis | null>(null);

  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: "Hello, I am your AuraGuard AI Safety Companion. Ask me any question regarding crisis protocols, travel safety, child security, or legal rights.",
      timestamp: 'Just now',
    },
  ]);
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Quick Preset Situations
  const presetSituations = [
    "A person in a black jacket has been walking 20 steps behind me for 4 blocks.",
    "Rideshare driver turned off GPS and took an unpaved dark alleyway.",
    "My child hasn't checked in 30 minutes after school bell.",
    "Aggressive individual shouting threats at bus station platform.",
  ];

  const handleEvaluateSituation = async (customText?: string) => {
    const textToAnalyze = customText || situationInput;
    if (!textToAnalyze.trim()) return;

    setIsEvaluating(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/ai/analyze-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToAnalyze,
          location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsgText = chatInput;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: messages,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>AI Threat Assessment & Safety Assistant</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase">
                Powered by Gemini 2.5
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Instant situation risk evaluation, crisis guidance, and step-by-step de-escalation protocols.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'evaluator'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Threat Evaluator
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24/7 Safety Chatbot
          </button>
        </div>
      </div>

      {activeTab === 'evaluator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Situation Input Box */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Describe Current Safety Situation</span>
            </h3>

            <textarea
              rows={4}
              value={situationInput}
              onChange={(e) => setSituationInput(e.target.value)}
              placeholder="e.g. Walking down 4th St towards bus stop, notice someone in grey hoodie following closely..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />

            <button
              onClick={() => handleEvaluateSituation()}
              disabled={isEvaluating || !situationInput.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Bot className={`h-4 w-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'ANALYZING THREAT LEVEL...' : 'EVALUATE THREAT RISK NOW'}</span>
            </button>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Situation Examples
              </span>
              <div className="space-y-2">
                {presetSituations.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSituationInput(preset);
                      handleEvaluateSituation(preset);
                    }}
                    className="w-full text-left p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{preset}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results Display */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            {analysisResult ? (
              <div className="space-y-5 animate-fade-in">
                {/* Risk Badge Header */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    analysisResult.threatLevel === 'CRITICAL_EMERGENCY'
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : analysisResult.threatLevel === 'HIGH_DANGER'
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : analysisResult.threatLevel === 'SUSPICIOUS'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">
                      AI THREAT EVALUATION
                    </span>
                    <h3 className="text-lg font-black tracking-wide">
                      {analysisResult.threatLevel.replace('_', ' ')}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-3xl font-black font-mono">
                      {analysisResult.riskScore}%
                    </span>
                    <span className="block text-[10px] font-bold uppercase opacity-80">Risk Score</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  {analysisResult.summary}
                </p>

                {/* Immediate Action Steps */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Immediate Safety Actions
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.immediateActions.map((act, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start space-x-2 text-xs text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick SOS Trigger Recommendation */}
                {analysisResult.recommendSOS && (
                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      onClick={onTriggerSOS}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/40 flex items-center justify-center space-x-2"
                    >
                      <ShieldAlert className="h-4 w-4 animate-bounce" />
                      <span>DISPATCH SOS NOW</span>
                    </button>

                    <button
                      onClick={onTriggerFakeCall}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
                    >
                      Fake Call
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                  <Bot className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">Ready for Risk Evaluation</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type any location, situation, or suspicious event on the left to receive immediate Gemini AI safety analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 24/7 AI Safety Companion Chat Interface */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col h-[520px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white font-medium rounded-br-xs'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-4 opacity-75 text-[10px] pb-1 border-b border-white/10">
                    <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AuraGuard AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI safety assistant e.g. What are my rights if followed by a cab driver?"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isChatSending || !chatInput.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
