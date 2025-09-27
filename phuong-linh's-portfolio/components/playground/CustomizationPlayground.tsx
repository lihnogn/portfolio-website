import React from 'react';
import { usePlaygroundSettings, PlaygroundTheme, InteractionMode } from './PlaygroundContext';

const THEME_OPTIONS: PlaygroundTheme[] = ['Pastel','Dark','Neon','Magical'];
const MODE_OPTIONS: InteractionMode[] = ['Calm','Playful','Chaotic'];

const themePreviewStyle = (theme: PlaygroundTheme): React.CSSProperties => {
  switch (theme) {
    case 'Pastel': return { background: 'linear-gradient(135deg,#fce7f3,#e9d5ff,#a7f3d0)' };
    case 'Dark': return { background: 'linear-gradient(135deg,#1f2937,#0f172a,#111827)', color:'#e5e7eb' };
    case 'Neon': return { background: 'radial-gradient(circle at 30% 30%, #ff61f6, transparent 40%), radial-gradient(circle at 70% 70%, #7afcff, transparent 40%), #0b1020', color:'#e5e7eb' };
    case 'Magical': return { background: 'linear-gradient(135deg,#f0abfc,#a78bfa,#60a5fa)', color:'#1f2937' };
  }
};

const CustomizationPlayground: React.FC = () => {
  const { theme, setTheme, mode, setMode } = usePlaygroundSettings();

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5 shadow-xl" style={{ backgroundColor:'var(--bg-card)' }}>
          <h4 className="font-bold mb-3" style={{ color:'var(--text-main)' }}>Theme</h4>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map(t => (
              <button key={t} onClick={()=>setTheme(t)} className="rounded-xl p-4 text-sm font-semibold border"
                style={{ ...themePreviewStyle(t), borderColor:'rgba(0,0,0,0.1)', boxShadow: theme===t ? '0 0 0 3px var(--brand-color)' : 'none' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5 shadow-xl" style={{ backgroundColor:'var(--bg-card)' }}>
          <h4 className="font-bold mb-3" style={{ color:'var(--text-main)' }}>Interaction Mode</h4>
          <div className="flex gap-3 flex-wrap">
            {MODE_OPTIONS.map(m => (
              <button key={m} onClick={()=>setMode(m)} className="px-3 py-2 rounded-xl text-sm font-bold border"
                style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', borderColor:'rgba(0,0,0,0.1)', boxShadow: mode===m ? '0 0 0 3px var(--brand-color)' : 'none' }}>{m}</button>
            ))}
          </div>
          <p className="text-sm mt-3" style={{ color:'var(--text-light)' }}>
            This setting influences animation speed, bounce, and energy across all experiences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPlayground;
