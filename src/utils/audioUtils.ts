let audioCtx: AudioContext | null = null;
let sirenOsc1: OscillatorNode | null = null;
let sirenOsc2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

/**
 * High-decibel emergency siren synthesizer using Web Audio API
 */
export function startEmergencySiren(): boolean {
  try {
    if (sirenOsc1) return true; // Already playing

    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    sirenOsc1 = audioCtx.createOscillator();
    sirenOsc2 = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOsc1.type = 'sawtooth';
    sirenOsc2.type = 'square';

    sirenGain.gain.setValueAtTime(0.3, audioCtx.currentTime);

    sirenOsc1.connect(sirenGain);
    sirenOsc2.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    sirenOsc1.start();
    sirenOsc2.start();

    // Frequency modulation loop (800Hz to 1400Hz)
    let highPitch = false;
    sirenInterval = setInterval(() => {
      if (!audioCtx || !sirenOsc1 || !sirenOsc2) return;
      const targetFreq1 = highPitch ? 1400 : 800;
      const targetFreq2 = highPitch ? 700 : 400;
      
      sirenOsc1.frequency.exponentialRampToValueAtTime(targetFreq1, audioCtx.currentTime + 0.35);
      sirenOsc2.frequency.exponentialRampToValueAtTime(targetFreq2, audioCtx.currentTime + 0.35);
      
      highPitch = !highPitch;
    }, 400);

    return true;
  } catch (err) {
    console.error("Audio synth error:", err);
    return false;
  }
}

/**
 * Stop emergency siren synthesizer
 */
export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  if (sirenOsc1) {
    try { sirenOsc1.stop(); } catch (e) {}
    sirenOsc1 = null;
  }
  if (sirenOsc2) {
    try { sirenOsc2.stop(); } catch (e) {}
    sirenOsc2 = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch (e) {}
    audioCtx = null;
  }
}

/**
 * Play phone ringtone simulation
 */
export function playPhoneRingtone(): () => void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    const ringInterval = setInterval(() => {
      if (ctx.state === 'running') {
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        setTimeout(() => {
          if (ctx.state === 'running') gain.gain.setValueAtTime(0.001, ctx.currentTime);
        }, 1200);
      }
    }, 2500);

    return () => {
      clearInterval(ringInterval);
      try { osc.stop(); ctx.close(); } catch (e) {}
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Speak voice message using Web Speech API Synthesis
 */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}
