import React, { useEffect, useRef, useState } from 'react';
import type p5Types from 'p5';
import { usePlaygroundSettings } from './PlaygroundContext';

// Section size
const MAX_HEIGHT = 500;

type BrushSize = 'S' | 'M' | 'L';

type Segment = {
  x1: number; y1: number; x2: number; y2: number;
  color: string; size: number; erase?: boolean;
};

const STORAGE_KEY = 'playground_drawing_strokes_v1';

const DrawingPlayground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5Types | null>(null);
  const graphicsRef = useRef<p5Types.Graphics | null>(null);
  const [brushColor, setBrushColor] = useState<string>('#f472b6');
  const [brushSize, setBrushSize] = useState<BrushSize>('M');
  const [erasing, setErasing] = useState(false);
  const strokesRef = useRef<Segment[]>([]);
  const prevPosRef = useRef<{x:number;y:number}|null>(null);
  const { theme, mode } = usePlaygroundSettings();

  const brushColorRef = useRef<string>(brushColor);
  const brushSizeRef = useRef<BrushSize>(brushSize);
  const erasingRef = useRef<boolean>(erasing);

  const sizeToPx = (s: BrushSize) => s === 'S' ? 4 : s === 'M' ? 8 : 14;
  const saveStrokes = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(strokesRef.current)); } catch {}
  };
  const loadStrokes = (): Segment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Segment[];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { erasingRef.current = erasing; }, [erasing]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const mod = await import('p5');
      const P5: any = (mod as any).default;
      if (!mounted) return;

      const sketch = (p: p5Types) => {
        let g: p5Types.Graphics;
        const getSize = () => {
          const el = containerRef.current;
          const width = el ? el.clientWidth : window.innerWidth;
          const height = Math.min(MAX_HEIGHT, Math.round(width * 0.5));
          return { width, height };
        };
        p.setup = () => {
          const { width, height } = getSize();
          const c = p.createCanvas(width, height); c.parent(containerRef.current!);
          g = p.createGraphics(width, height);
          graphicsRef.current = g;
          strokesRef.current = loadStrokes();
          // redraw existing strokes
          strokesRef.current.forEach(seg => {
            if (seg.erase) (g as any).erase(); else { (g as any).noErase(); g.stroke(seg.color as any); }
            g.strokeWeight(seg.size); g.strokeCap(p.ROUND); g.line(seg.x1, seg.y1, seg.x2, seg.y2);
          });
        };
        p.windowResized = () => {
          const { width, height } = getSize();
          p.resizeCanvas(width, height);
          const old = g; g = p.createGraphics(width, height); g.clear();
          graphicsRef.current = g;
          strokesRef.current.forEach(seg => {
            if (seg.erase) (g as any).erase(); else { (g as any).noErase(); g.stroke(seg.color as any); }
            g.strokeWeight(seg.size); g.strokeCap(p.ROUND); g.line(seg.x1, seg.y1, seg.x2, seg.y2);
          });
          old.remove();
        };
        const isInside = () => p.mouseX>=0 && p.mouseX<=p.width && p.mouseY>=0 && p.mouseY<=p.height;
        p.mousePressed = () => { if (!isInside()) return; prevPosRef.current = { x:p.mouseX, y:p.mouseY }; };
        p.mouseReleased = () => { prevPosRef.current = null; };
        p.mouseDragged = () => {
          if (!isInside() || !prevPosRef.current) return;
          // Smooth toward current mouse
          const { x, y } = prevPosRef.current;
          const lerpFactor = mode === 'Calm' ? 0.3 : mode === 'Playful' ? 0.5 : 0.8;
          const nx = x + (p.mouseX - x) * lerpFactor;
          const ny = y + (p.mouseY - y) * lerpFactor;
          const seg: Segment = { x1:x, y1:y, x2:p.mouseX, y2:p.mouseY, color: brushColorRef.current, size: sizeToPx(brushSizeRef.current), erase: erasingRef.current };
          if (seg.erase) (g as any).erase(); else { (g as any).noErase(); g.stroke(seg.color as any); }
          g.strokeWeight(seg.size);
          g.strokeCap(p.ROUND);
          // draw a short segment with smoothing
          g.line(x, y, nx, ny);
          strokesRef.current.push(seg); saveStrokes();
          prevPosRef.current = { x: nx, y: ny };
        };
        p.draw = () => {
          // Theme-based background
          let top = '#fce7f3', mid = '#e9d5ff', bot = '#a7f3d0';
          if (theme === 'Dark') { top = '#1f2937'; mid = '#0f172a'; bot = '#111827'; }
          if (theme === 'Neon') { top = '#0b1020'; mid = '#19203a'; bot = '#0b1020'; }
          if (theme === 'Magical') { top = '#f0abfc'; mid = '#a78bfa'; bot = '#60a5fa'; }
          const ct = p.color(top), cm = p.color(mid), cb = p.color(bot);
          for (let y=0;y<p.height;y++){
            const t=y/p.height;
            const c=t<.5? p.lerpColor(ct,cm,t*2): p.lerpColor(cm,cb,(t-.5)*2);
            p.stroke(c as any); p.line(0,y,p.width,y);
          }
          p.noStroke(); p.fill(255,255,255,40); p.rect(0,0,p.width,p.height);
          p.image(g,0,0);
        };
      };
      sketchRef.current = new P5(sketch as any);
    };
    load();
    return () => { mounted = false; if (sketchRef.current){ sketchRef.current.remove(); sketchRef.current=null; } };
  }, [theme, mode]);

  const onClear = () => {
    strokesRef.current = [];
    localStorage.setItem(STORAGE_KEY, '[]');
    const g = graphicsRef.current;
    if (g) {
      g.clear();
    }
  };
  const onDownload = () => { const p:any = sketchRef.current as any; if (p?.saveCanvas) p.saveCanvas('playground-drawing','png'); };

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-2xl shadow-xl" style={{ height: 'min(500px, 56vw)', boxShadow:'0 20px 40px -20px var(--shadow-color)'}} />
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ padding: 12 }}>
        <div className="flex justify-between" style={{ gap: 12 }}>
          <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
            {['#f472b6','#a78bfa','#34d399','#facc15','#60a5fa'].map(c => (
              <button key={c} onClick={()=>{ setBrushColor(c); setErasing(false); }} className="w-7 h-7 rounded-full border" style={{ backgroundColor:c, borderColor:'rgba(0,0,0,0.1)', boxShadow: brushColor===c && !erasing ? '0 0 0 3px rgba(255,255,255,0.8)':'none' }} />
            ))}
            {(['S','M','L'] as BrushSize[]).map(s => (
              <button key={s} onClick={()=>setBrushSize(s)} className="px-2 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor:'var(--bg-card)', color:'var(--text-main)', border:'1px solid var(--border-color)', boxShadow: brushSize===s ? '0 0 0 2px var(--brand-color)':'none' }}>{s}</button>
            ))}
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <button onClick={()=>setErasing(v=>!v)} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor: erasing ? 'var(--accent-color-2)':'var(--button-bg)', color:'var(--button-text)'}}>{erasing?'Eraser: ON':'Eraser'}</button>
            <button onClick={onClear} className="px-3 py-2 rounded-xl text-sm font-bold" style={{ backgroundColor:'var(--button-bg)', color:'var(--button-text)'}}>Clear</button>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center mt-4">
        <button onClick={onDownload} className="px-6 py-3 rounded-full font-bold transition-all" style={{ background:'linear-gradient(90deg,#fbcfe8 0%,#e9d5ff 50%,#a7f3d0 100%)', color:'#4b5563', boxShadow:'0 6px 20px rgba(200,160,255,0.35)'}} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.boxShadow='0 10px 28px rgba(200,160,255,0.55)';}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.boxShadow='0 6px 20px rgba(200,160,255,0.35)';}}>Download My Playground Art</button>
      </div>
    </div>
  );
};

export default DrawingPlayground;
