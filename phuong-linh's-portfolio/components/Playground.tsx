import React, { useEffect, useRef, useState } from 'react';
import type p5Types from 'p5';

// Pastel palette
const PASTELS = ['#fbcfe8', '#e9d5ff', '#a7f3d0', '#fef9c3', '#c7d2fe', '#ffd6e7'];

// Section size
const MAX_HEIGHT = 500;

export type PlaygroundMode = 'Flower' | 'Bubble' | 'Wave' | 'Particle';

const Playground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sketchRef = useRef<p5Types | null>(null);
  const [mode, setMode] = useState<PlaygroundMode>('Flower');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Dynamically import p5 to keep bundle lean
    const load = async () => {
      const mod = await import('p5');
      const P5: any = (mod as any).default;
      if (!mounted) return;

      const sketch = (p: p5Types) => {
        // State containers for effects
        let flowers: any[] = [];
        let bubbles: any[] = [];
        let waves: any[] = [];
        let particles: any[] = [];

        const pick = () => PASTELS[Math.floor(Math.random() * PASTELS.length)];

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
          p.noStroke();
        };

        p.windowResized = () => {
          const { width, height } = getSize();
          p.resizeCanvas(width, height);
        };

        p.mousePressed = () => {
          if (!isInside()) return;
          const x = p.mouseX;
          const y = p.mouseY;
          switch (mode) {
            case 'Flower':
              flowers.push({ x, y, created: p.millis(), base: p.random(12, 22), color: pick() });
              break;
            case 'Bubble':
              for (let i = 0; i < 6; i++) {
                bubbles.push({ x, y, r: p.random(8, 18), vy: p.random(-1.5, -0.5), color: pick(), life: 255 });
              }
              break;
            case 'Wave':
              waves.push({ x, y, r: 0, alpha: 180, color: pick() });
              break;
            case 'Particle':
              for (let i = 0; i < 16; i++) {
                const a = p.random(p.TWO_PI);
                const speed = p.random(0.5, 2.2);
                particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, alpha: 255, color: pick() });
              }
              break;
          }
        };

        const isInside = () => p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

        p.draw = () => {
          // Background gradient
          const gTop = p.color('#fce7f3'); // pink
          const gBottom = p.color('#bfdbfe'); // blue
          for (let y = 0; y < p.height; y++) {
            const inter = p.map(y, 0, p.height, 0, 1);
            const c = p.lerpColor(gTop, gBottom, inter);
            p.stroke(c as any);
            p.line(0, y, p.width, y);
          }

          // Soft overlay for depth
          p.noStroke();
          p.fill(255, 255, 255, 40);
          p.rect(0, 0, p.width, p.height);

          // Update and draw Flowers
          flowers = flowers.filter((f: any) => p.millis() - f.created < 3000);
          flowers.forEach((f: any) => {
            const t = (p.millis() - f.created) / 3000;
            const petals = 5;
            for (let i = 0; i < petals; i++) {
              const angle = (p.TWO_PI / petals) * i + t * 2;
              const px = f.x + Math.cos(angle) * (f.base + t * 40);
              const py = f.y + Math.sin(angle) * (f.base + t * 40);
              p.fill(p.color(f.color) as any);
              p.ellipse(px, py, 24 + t * 18, 24 + t * 18);
            }
            // Glow center
            p.fill(255, 255, 224, 200);
            p.ellipse(f.x, f.y, 26 + Math.sin(t * 6) * 4);
          });

          // Update and draw Bubbles
          bubbles.forEach((b: any) => {
            b.y += b.vy;
            b.x += p.random(-0.5, 0.5);
            p.noFill();
            const c = p.color(b.color) as any;
            p.stroke(c);
            p.strokeWeight(2);
            p.circle(b.x, b.y, b.r * 2);
            // Burst near top
            if (b.y < 20) {
              for (let i = 0; i < 10; i++) {
                particles.push({ x: b.x, y: b.y, vx: p.random(-2, 2), vy: p.random(-2, 2), alpha: 180, color: pick() });
              }
              b.life = 0;
            }
            b.life -= 2;
          });
          bubbles = bubbles.filter((b: any) => b.life > 0);

          // Update and draw Waves
          waves.forEach((w: any) => {
            w.r += 2.2;
            w.alpha -= 2.2;
            p.noFill();
            const c = p.color(w.color) as any;
            (c as any).setAlpha(Math.max(0, w.alpha));
            p.stroke(c);
            p.strokeWeight(3);
            p.circle(w.x, w.y, w.r * 2);
          });
          waves = waves.filter((w: any) => w.alpha > 0);

          // Update and draw Particles
          // Passive sparkle trail when in Particle mode and mouse is inside
          if (mode === 'Particle' && isInside() && p.frameCount % 3 === 0) {
            particles.push({ x: p.mouseX, y: p.mouseY, vx: p.random(-0.8, 0.8), vy: p.random(-0.8, 0.8), alpha: 200, color: pick() });
          }

          particles.forEach((pt: any) => {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 3;
            const c = p.color(pt.color) as any;
            (c as any).setAlpha(Math.max(0, pt.alpha));
            p.noStroke();
            p.fill(c);
            p.circle(pt.x, pt.y, 6);
          });
          particles = particles.filter((pt: any) => pt.alpha > 0);
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
  }, [mode]);

  const onReset = () => {
    // Recreate the sketch by toggling mode to itself (forces effect state reset via unmount/remount)
    setMode((prev) => prev);
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
          <div className="pointer-events-auto">
            <select
              aria-label="Mode selector"
              value={mode}
              onChange={(e) => setMode(e.target.value as PlaygroundMode)}
              className="px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              <option>Flower</option>
              <option>Bubble</option>
              <option>Wave</option>
              <option>Particle</option>
            </select>
          </div>
          <div className="pointer-events-auto">
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
            >
              Reset
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
