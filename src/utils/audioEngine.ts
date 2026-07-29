// audioEngine.ts
// Zen Gong / Meditation Bowl chime synthesized via Web Audio API

export function playZenGong() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Zen Bowl frequency
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing frequency
    
    // Bell envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4); // 4 seconds decay
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 4.1);
  } catch (e) {
    console.log("Audio not supported or interaction required first.");
  }
}
