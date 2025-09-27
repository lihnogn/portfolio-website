import React, { useEffect, useRef, useState } from 'react';
import type p5Types from 'p5';

// Pastel palette
const PASTELS = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef9c3', '#c7d2fe', '#ffd6e7'];

// Section size
const MAX_HEIGHT = 500;

type BrushSize = 'S' | 'M' | 'L';
type Segment = {
  x1: number; y1: number; x2: number; y2: number;
  color: string; size: number; erase?: boolean;
};

const Playground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5Types | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [brushColor, setBrushColor] = useState<string>('#f472b6');
  const [brushSize, setBrushSize] = useState<BrushSize>('M');
  const [erasing, setErasing] = useState(false);
  const brushColorRef = useRef<string>(brushColor);
  const brushSizeRef = useRef<BrushSize>(brushSize);
  const erasingRef = useRef<boolean>(erasing);
  const strokesRef = useRef<Segment[]>([]);
  const prevPosRef = useRef<{x:number;y:number}|null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const sizeToPx = (s: BrushSize) => s === 'S' ? 4 : s === 'M' ? 8 : 14;
  const saveStrokes = () => {
    try {
      localStorage.setItem('playground_strokes', JSON.stringify(strokesRef.current));
    } catch {}
  };
  const loadStrokes = (): Segment[] => {
    try {
      const raw = localStorage.getItem('playground_strokes');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Segment[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    // Dynamically import p5 to keep bundle lean
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
          const c = p.createCanvas(width, height);
          c.parent(containerRef.current!);
          g = p.createGraphics(width, height);
          // load strokes from storage
          strokesRef.current = loadStrokes();
        };

        p.windowResized = () => {
          const { width, height } = getSize();
          p.resizeCanvas(width, height);
          // Recreate offscreen and redraw current strokes for new size
          const old = g;
          g = p.createGraphics(width, height);
          g.clear();
          // Redraw strokes onto new buffer with same coordinates (no scaling)
          strokesRef.current.forEach(seg => {
            if (seg.erase) {
              (g as any).erase();
            } else {
              (g as any).noErase();
              g.stroke(seg.color as any);
            }
            g.strokeWeight(seg.size);
            g.strokeCap(p.ROUND);
            g.line(seg.x1, seg.y1, seg.x2, seg.y2);
          });
          old.remove();
        };

        const isInside = () => p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

        p.mousePressed = () => {
          if (!isInside()) return;
          prevPosRef.current = { x: p.mouseX, y: p.mouseY };
        };

        p.mouseReleased = () => {
          prevPosRef.current = null;
        };

        p.mouseDragged = () => {
          if (!isInside() || !prevPosRef.current) return;
          const { x, y } = prevPosRef.current;
          const seg: Segment = {
            x1: x, y1: y, x2: p.mouseX, y2: p.mouseY,
            color: brushColorRef.current,
            size: sizeToPx(brushSizeRef.current),
            erase: erasingRef.current,
          };
          // Draw onto offscreen buffer directly
          if (seg.erase) {
            (g as any).erase();
          } else {
            (g as any).noErase();
            g.stroke(seg.color as any);
          }
          g.strokeWeight(seg.size);
          g.strokeCap(p.ROUND);
          g.line(seg.x1, seg.y1, seg.x2, seg.y2);
          strokesRef.current.push(seg);
          saveStrokes();
          prevPosRef.current = { x: p.mouseX, y: p.mouseY };
        };

        p.draw = () => {
          // Background pastel gradient (pink -> purple -> mint)
          const top = p.color('#fce7f3');
          const mid = p.color('#e9d5ff');
          const bot = p.color('#a7f3d0');
          for (let y = 0; y < p.height; y++) {
            const t = y / p.height;
            // two-step gradient
            const c = t < 0.5 ? p.lerpColor(top, mid, t * 2) : p.lerpColor(mid, bot, (t - 0.5) * 2);
            p.stroke(c as any);
            p.line(0, y, p.width, y);
          }

          // Soft overlay
          p.noStroke();
          p.fill(255, 255, 255, 40);
          p.rect(0, 0, p.width, p.height);

          // Composite drawing layer
          p.image(g, 0, 0);
        };

      };

      // Initialize p5 instance
      sketchRef.current = new P5(sketch as any);
      setIsReady(true);
    };

    load();

    return () => {
      mounted = false;
      if (sketchRef.current) {
        sketchRef.current.remove();
        sketchRef.current = null;
      }
    };
  }, [refreshKey]);

  // Sync refs when UI state changes
  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { erasingRef.current = erasing; }, [erasing]);

  const onClear = () => {
    strokesRef.current = [];
    saveStrokes();
    // Trigger re-initialization to clear offscreen buffer
    setRefreshKey((k) => k + 1);
  };

  const onDownload = () => {
    const p: any = sketchRef.current as any;
    if (p && typeof p.saveCanvas === 'function') {
      p.saveCanvas('playground-art', 'png');
    }
  };

  return (
    <div className="relative w-full" style={{ maxHeight: MAX_HEIGHT }}>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl shadow-xl"
        style={{
          height: 'min(500px, 56vw)',
          boxShadow: '0 20px 40px -20px var(--shadow-color)',
          background: 'linear-gradient(135deg, #fce7f3 0%, #e9d5ff 50%, #a7f3d0 100%)'
        }}
      />

      {/* UI overlay */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ padding: 12 }}>
        <div className="flex justify-between" style={{ gap: 12 }}>
          {/* Left controls: colors and sizes */}
          <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
            {/* Color presets */}
            {['#f472b6', '#a78bfa', '#34d399', '#facc15', '#60a5fa'].map((c) => (
              <button
                key={c}
                onClick={() => { setBrushColor(c); setErasing(false); }}
                className="w-7 h-7 rounded-full border"
                style={{ backgroundColor: c, borderColor: 'rgba(0,0,0,0.1)', boxShadow: brushColor === c && !erasing ? '0 0 0 3px rgba(255,255,255,0.8)' : 'none' }}
                aria-label={`Brush color ${c}`}
                title={`Brush color ${c}`}
              />
            ))}

            {/* Size presets */}
            {(['S','M','L'] as BrushSize[]).map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className="px-2 py-1 rounded-lg text-xs font-bold"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: brushSize === s ? '0 0 0 2px var(--brand-color)' : 'none' }}
                aria-label={`Brush size ${s}`}
              >{s}</button>
            ))}
          </div>

          {/* Right controls: Eraser and Clear */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => setErasing((v) => !v)}
              className="px-3 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: erasing ? 'var(--accent-color-2)' : 'var(--button-bg)', color: 'var(--button-text)' }}
            >
              {erasing ? 'Eraser: ON' : 'Eraser'}
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Title and subtitle overlay at bottom-left */}
      <div className="absolute left-0 bottom-0 p-4 select-none" style={{ color: 'var(--text-main)' }}>
        <h3 className="font-brand text-3xl" style={{ color: 'var(--text-main)' }}>Playground</h3>
        <p className="text-sm" style={{ color: 'var(--text-light)' }}>Experiment with interactive art directly on my website ✨</p>
      </div>

      {/* Download button below canvas */}
      <div className="w-full flex justify-center mt-4">
        <button
          onClick={onDownload}
          className="px-6 py-3 rounded-full font-bold transition-all"
          style={{
            background: 'linear-gradient(90deg, #fbcfe8 0%, #e9d5ff 50%, #a7f3d0 100%)',
            color: '#4b5563',
            boxShadow: '0 6px 20px rgba(200, 160, 255, 0.35)'
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 28px rgba(200, 160, 255, 0.55)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(200, 160, 255, 0.35)'; }}
        >
          Download My Playground Art
        </button>
      </div>
    </div>
  );
};

export default Playground;
