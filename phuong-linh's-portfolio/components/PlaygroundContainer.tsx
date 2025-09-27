import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaygroundProvider } from './playground/PlaygroundContext';
import DrawingPlayground from './playground/DrawingPlayground';
import SoundPlayground from './playground/SoundPlayground';
import ParticlesPlayground from './playground/ParticlesPlayground';
import ShapeGardenPlayground from './playground/ShapeGardenPlayground';
import CustomizationPlayground from './playground/CustomizationPlayground';

const TABS = [
  { key: 'drawing', label: 'Drawing', icon: '🎨' },
  { key: 'sound', label: 'Sound', icon: '🎵' },
  { key: 'particles', label: 'Particles', icon: '✨' },
  { key: 'garden', label: 'Shape Garden', icon: '🌱' },
  { key: 'custom', label: 'Customization', icon: '⚙️' },
] as const;

type TabKey = typeof TABS[number]['key'];

const ACTIVE_TAB_STORAGE = 'playground_active_tab_v1';

const TabContent: React.FC<{ tab: TabKey }> = ({ tab }) => {
  switch (tab) {
    case 'drawing': return <DrawingPlayground />;
    case 'sound': return <SoundPlayground />;
    case 'particles': return <ParticlesPlayground />;
    case 'garden': return <ShapeGardenPlayground />;
    case 'custom': return <CustomizationPlayground />;
    default: return null;
  }
};

const PlaygroundContainer: React.FC = () => {
  const [active, setActive] = useState<TabKey>(() => {
    try { const raw = localStorage.getItem(ACTIVE_TAB_STORAGE) as TabKey | null; return (raw as TabKey) || 'drawing'; } catch { return 'drawing'; }
  });

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_TAB_STORAGE, active); } catch {}
  }, [active]);

  return (
    <PlaygroundProvider>
      <div className="w-full">
        <div className="mx-auto max-w-5xl">
          {/* Tabs / Sidebar responsive */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Sidebar on md+, top tabs on mobile */}
            <div className="md:w-56">
              <div className="flex md:flex-col gap-2 rounded-2xl p-2 shadow-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setActive(t.key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: active === t.key ? 'var(--button-bg)' : 'transparent', color: active === t.key ? 'var(--button-text)' : 'var(--text-main)' }}
                    aria-current={active === t.key}
                  >
                    <span className="text-lg" aria-hidden>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="rounded-2xl" style={{ backgroundColor: 'transparent' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={active}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <TabContent tab={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlaygroundProvider>
  );
};

export default PlaygroundContainer;
