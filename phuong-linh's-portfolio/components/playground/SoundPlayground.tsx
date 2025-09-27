import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { usePlaygroundSettings } from './PlaygroundContext';

const MAX_HEIGHT = 500;

type SoundSet = 'Piano' | 'Synth' | 'Percussion' | 'Ambient';

type ClickPulse = { id: number; x: number; y: number; created: number; color: string };

const COLORS = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef9c3', '#c7d2fe'];

const SoundPlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [soundSet, setSoundSet] = useState<SoundSet>('Piano');
  const [muted, setMuted] = useState(false);
  const [pulses, setPulses] = useState<ClickPulse[]>([]);
  const { theme, mode } = usePlaygroundSettings();

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const fmRef = useRef<Tone.MembraneSynth | null>(null);
  const noiseRef = useRef<Tone.NoiseSynth | null>(null);

  const playNote = async (x: number, y: number) => {
    if (muted) return;
    await Tone.start();
    const now = Tone.now();
    // Adjust master volume by interaction mode
    if (mode === 'Calm') Tone.Destination.volume.value = -10;
    if (mode === 'Playful') Tone.Destination.volume.value = -4;
    if (mode === 'Chaotic') Tone.Destination.volume.value = 0;
    switch (soundSet) {
      case 'Piano':
        if (!synthRef.current) synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synthRef.current.triggerAttackRelease(['C5','E5','G5'][Math.floor(Math.random()*3)], 0.2, now);
        break;
      case 'Synth':
        if (!synthRef.current) synthRef.current = new Tone.PolySynth(Tone.FMSynth).toDestination();
        synthRef.current.triggerAttackRelease(['A4','B4','D5','E5'][Math.floor(Math.random()*4)], 0.2, now);
        break;
      case 'Percussion':
        if (!fmRef.current) fmRef.current = new Tone.MembraneSynth().toDestination();
        fmRef.current.triggerAttackRelease('C2', 0.1, now);
        break;
      case 'Ambient':
        if (!noiseRef.current) noiseRef.current = new Tone.NoiseSynth({ volume: -20 }).toDestination();
        noiseRef.current.triggerAttackRelease(0.15, now);
        break;
    }
    const id = Date.now() + Math.random();
    setPulses(prev => [...prev, { id, x, y, created: performance.now(), color: COLORS[Math.floor(Math.random()*COLORS.length)] }]);
    setTimeout(() => setPulses(prev => prev.filter(p => p.id !== id)), 800);
  };

  return (
    <div className="relative w-full" style={{ maxHeight: MAX_HEIGHT }}>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-xl"
        style={{ height: 'min(500px, 56vw)', background: theme==='Dark'? 'linear-gradient(135deg,#1f2937,#0f172a,#111827)': theme==='Neon'? 'radial-gradient(circle at 30% 30%, #ff61f6, transparent 40%), radial-gradient(circle at 70% 70%, #7afcff, transparent 40%), #0b1020' : theme==='Magical'? 'linear-gradient(135deg,#f0abfc,#a78bfa,#60a5fa)' : 'linear-gradient(135deg,#fce7f3,#e9d5ff,#a7f3d0)' }}
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          playNote(e.clientX - rect.left, e.clientY - rect.top);
        }}
      >
        {pulses.map(p => (
          <span key={p.id} className="absolute rounded-full" style={{ left: p.x-6, top: p.y-6, width: 12, height: 12, backgroundColor: p.color, boxShadow: `0 0 ${mode==='Neon' ? 28 : 20}px ${p.color}`, pointerEvents:'none' }} />
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {(['Piano','Synth','Percussion','Ambient'] as SoundSet[]).map(s => (
            <button key={s} onClick={()=>setSoundSet(s)} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: soundSet===s? '0 0 0 2px var(--brand-color)':'none' }}>{s}</button>
          ))}
        </div>
        <button onClick={()=>setMuted(m=>!m)} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor:'var(--button-bg)', color:'var(--button-text)'}}>{muted? 'Unmute':'Mute'}</button>
      </div>
    </div>
  );
};

export default SoundPlayground;
