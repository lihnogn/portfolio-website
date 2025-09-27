import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MAX_HEIGHT = 500;

type Style = 'Bouncing' | 'Floating' | 'Exploding';

type Particle = {
  id: number;
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
};

const PASTEL = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef9c3', '#c7d2fe'];
const NEON = ['#ff61f6', '#7afcff', '#ffd166', '#caffbf', '#9bf6ff'];

const ParticlesPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [style, setStyle] = useState<Style>('Floating');
  const [palette, setPalette] = useState<'Pastel' | 'Neon'>('Pastel');
  const particlesRef = useRef<Particle[]>([]);

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const colors = palette === 'Pastel' ? PASTEL : NEON;

  const resize = () => {
    const el = wrapRef.current; const cv = canvasRef.current; if (!el || !cv) return;
    cv.width = el.clientWidth; cv.height = Math.min(MAX_HEIGHT, Math.round(el.clientWidth * 0.5));
  };

  const spawn = (x: number, y: number) => {
    const arr = particlesRef.current;
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = style === 'Exploding' ? Math.random() * 4 + 1 : Math.random() * 1.5 + 0.2;
      const vx = Math.cos(a) * sp;
      const vy = Math.sin(a) * sp;
      arr.push({ id: Date.now() + Math.random(), x, y, vx, vy, life: 1, maxLife: 1 + Math.random() * 1.5, color: pick(colors) });
    }
  };

  useEffect(() => {
    resize();
    const on = () => resize();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;

    const tick = () => {
      const { width, height } = cv;
      ctx.clearRect(0, 0, width, height);

      // Soft gradient background
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, '#fce7f3'); g.addColorStop(0.5, '#e9d5ff'); g.addColorStop(1, '#a7f3d0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, width, height);

      const arr = particlesRef.current;
      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        // physics
        if (style === 'Floating') p.vy -= 0.003; // drift up
        if (style === 'Bouncing') p.vy += 0.05; // gravity
        p.x += p.vx; p.y += p.vy; p.life -= 0.01;

        if (style === 'Bouncing') {
          if (p.y > height - 8) { p.y = height - 8; p.vy *= -0.7; }
          if (p.x < 8 || p.x > width - 8) p.vx *= -1;
        }

        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = p.color; ctx.shadowBlur = palette === 'Neon' ? 20 : 8; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
      }
      ctx.globalAlpha = 1;
      particlesRef.current = arr.filter(p => p.life > 0);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [palette, style]);

  return (
    <div className="relative w-full">
      <div ref={wrapRef} className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ height: 'min(500px,56vw)', boxShadow: '0 20px 40px -20px var(--shadow-color)' }}
        onMouseMove={(e) => { if (!canvasRef.current) return; const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); spawn(e.clientX - r.left, e.clientY - r.top); }}
        onClick={(e) => { if (!canvasRef.current) return; const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); spawn(e.clientX - r.left, e.clientY - r.top); }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {(['Floating','Bouncing','Exploding'] as Style[]).map(s => (
            <button key={s} onClick={()=>setStyle(s)} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: style===s? '0 0 0 2px var(--brand-color)':'none' }}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setPalette('Pastel')} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: palette==='Pastel'? '0 0 0 2px var(--brand-color)':'none' }}>Pastel</button>
          <button onClick={()=>setPalette('Neon')} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: palette==='Neon'? '0 0 0 2px var(--brand-color)':'none' }}>Neon</button>
        </div>
      </div>
    </div>
  );
};

export default ParticlesPlayground;
