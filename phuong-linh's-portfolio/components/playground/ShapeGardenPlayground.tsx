import React, { useEffect, useRef, useState } from 'react';
import { usePlaygroundSettings } from './PlaygroundContext';

const MAX_HEIGHT = 500;

type Mode = 'Nature' | 'Abstract';

type ShapeItem = {
  id: number;
  x: number; y: number; r: number; rot: number;
  color: string; kind: 'leaf' | 'flower' | 'cloud' | 'grass' | 'circle' | 'triangle' | 'square';
};

const PASTELS = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef9c3', '#c7d2fe', '#ffd6e7'];
const STORAGE_KEY = 'playground_shape_garden_v1';

const ShapeGardenPlayground: React.FC = () => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<Mode>('Nature');
  const [items, setItems] = useState<ShapeItem[]>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });
  const { theme, mode: interactionMode } = usePlaygroundSettings();

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {} }, [items]);

  const addAt = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    const color = PASTELS[Math.floor(Math.random() * PASTELS.length)];
    const r = 12 + Math.random() * 28;
    const rot = Math.random() * Math.PI * 2;
    const kind: ShapeItem['kind'] = mode === 'Nature'
      ? (['leaf', 'flower', 'cloud', 'grass'] as const)[Math.floor(Math.random() * 4)]
      : (['circle', 'triangle', 'square'] as const)[Math.floor(Math.random() * 3)];
    setItems(prev => [...prev, { id, x, y, r, rot, color, kind }]);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    addAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const renderItem = (it: ShapeItem) => {
    const baseStyle: React.CSSProperties = { position:'absolute', left: it.x, top: it.y, transform:`translate(-50%,-50%) rotate(${it.rot}rad)`, color: it.color };
    switch (it.kind) {
      case 'leaf':
        return <div key={it.id} style={baseStyle}>
          <div style={{ width: it.r, height: it.r * 2, background: `linear-gradient(135deg, ${it.color}, #ffffff80)`, borderRadius: it.r, filter:'blur(0.2px)', transform:`rotate(${(it.rot*20)%40-20}deg)` }} />
        </div>;
      case 'flower':
        return <div key={it.id} style={baseStyle}>
          {Array.from({length:5}).map((_,i)=> (
            <div key={i} style={{ position:'absolute', width: it.r, height: it.r, background: `radial-gradient(circle at 30% 30%, #ffffffaa, ${it.color})`, borderRadius:'50%', left: Math.cos((i/5)*Math.PI*2)*it.r*0.9, top: Math.sin((i/5)*Math.PI*2)*it.r*0.9, filter:'drop-shadow(0 6px 10px rgba(0,0,0,0.05))' }} />
          ))}
          <div style={{ position:'absolute', width: it.r*0.9, height: it.r*0.9, background:'radial-gradient(circle,#fff5cc,#ffe8a3)', borderRadius:'50%', left:-it.r*0.45, top:-it.r*0.45, boxShadow:`0 0 10px ${it.color}` }} />
        </div>;
      case 'grass':
        return <div key={it.id} style={baseStyle}>
          {Array.from({length: 3 + Math.floor(Math.random()*3)}).map((_,i)=> (
            <div key={i} style={{ position:'absolute', width: 3, height: it.r*2, background: `linear-gradient(${Math.random()*20}deg, ${it.color}, #ffffff70)`, borderRadius: 3, transform:`rotate(${(i-1)*6}deg)`, left: i*4-6, top: it.r/2 }} />
          ))}
        </div>;
      case 'cloud':
        return <div key={it.id} style={baseStyle}>
          {Array.from({length: 4 + Math.floor(Math.random()*3)}).map((_,i)=> (
            <div key={i} style={{ position:'absolute', width: it.r*1.2, height: it.r*0.9, background: 'radial-gradient(circle at 30% 30%, #ffffff, #ffffffcc)', borderRadius:'50%', left: (i-2)*it.r*0.5, top: -Math.abs(i-2)*4 }} />
          ))}
        </div>;
      case 'circle':
        return <div key={it.id} style={baseStyle}><div style={{ width: it.r*2, height: it.r*2, background: it.color, borderRadius:'50%', boxShadow:`0 10px 24px -12px ${it.color}` }}/></div>;
      case 'triangle':
        return <div key={it.id} style={baseStyle}><div style={{ width: 0, height: 0, borderLeft: `${it.r}px solid transparent`, borderRight: `${it.r}px solid transparent`, borderBottom: `${it.r*1.8}px solid ${it.color}` }}/></div>;
      case 'square':
        return <div key={it.id} style={baseStyle}><div style={{ width: it.r*1.6, height: it.r*1.6, background: it.color, borderRadius: 12 }}/></div>;
    }
  };

  return (
    <div className="relative w-full">
      <div ref={wrapRef} className="relative w-full overflow-hidden rounded-2xl shadow-xl"
        style={{ height:'min(500px,56vw)', background: theme==='Dark'? 'linear-gradient(135deg,#1f2937,#0f172a,#111827)': theme==='Neon'? 'radial-gradient(circle at 30% 30%, #ff61f6, transparent 40%), radial-gradient(circle at 70% 70%, #7afcff, transparent 40%), #0b1020' : theme==='Magical'? 'linear-gradient(135deg,#f0abfc,#a78bfa,#60a5fa)' : 'linear-gradient(135deg,#fce7f3,#e9d5ff,#a7f3d0)', boxShadow:'0 20px 40px -20px var(--shadow-color)'}}
        onClick={onClick}
      >
        {items.map(renderItem)}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button onClick={()=>setMode('Nature')} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: mode==='Nature'? '0 0 0 2px var(--brand-color)':'none' }}>Nature</button>
          <button onClick={()=>setMode('Abstract')} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: mode==='Abstract'? '0 0 0 2px var(--brand-color)':'none' }}>Abstract</button>
        </div>
        <button onClick={()=>setItems([])} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor:'var(--button-bg)', color:'var(--button-text)' }}>Reset Garden</button>
      </div>
    </div>
  );
};

export default ShapeGardenPlayground;
