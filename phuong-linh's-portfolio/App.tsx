import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, TimelineEvent } from './types';
import ProjectCard from './components/ProjectCard';
import { MailIcon, InstagramIcon, GithubIcon, FlowerIcon, StarIcon, SparkleIcon, HeartIcon, SunIcon, MoonIcon } from './components/Icons';
import PlaygroundContainer from './components/PlaygroundContainer';

// --- DATA CONFIGURATION ---
const PROJECTS: Project[] = [
  {
    title: "Creative Algorithm Project",
    description: "A generative art experiment exploring creative coding.",
    buttonText: "View Demo",
    link: "https://www.youtube.com/watch?v=DipJrMXCa_g",
    youtubeId: "DipJrMXCa_g",
  },
  {
    title: "Personal Color Test Web UI",
  description: "A mockup for a web service to test personal color palette.",
  buttonText: "See More",
  link: "https://ik.imagekit.io/1mbxrb4zp/WEB-1.png", // hoặc link demo trực tiếp
  imageUrls: [
    "https://ik.imagekit.io/1mbxrb4zp/WEB-1.png",
  ],
  },
  {
    title: "Sonar Soul",
    description: "A 3D visual project inspired by the poly-sensory nature of sound.",
    buttonText: "See More",
    link: "https://ik.imagekit.io/1mbxrb4zp/Sonar%20Soul/1.png?updatedAt=1758432987357.png", // Using a placeholder as original link was dead
    imageUrls: [
      'https://ik.imagekit.io/1mbxrb4zp/Sonar%20Soul/1(1).png?updatedAt=1758432998882.png',
      'https://ik.imagekit.io/1mbxrb4zp/Sonar%20Soul/4.png?updatedAt=1758432998389.png',
      'https://ik.imagekit.io/1mbxrb4zp/Sonar%20Soul/2.png?updatedAt=1758432998318.png',
    ],
  }
];

const TIMELINE_EVENTS: TimelineEvent[] = [
  { date: '2024', title: 'Foundation & Exploration', description: 'Started my journey in Art & Technology, focusing on drawing, graphic design, and foundational academic projects.', icon: <SparkleIcon className="h-5 w-5"/> },
  { date: '2025', title: 'Growth & Experimentation', description: 'Dived deeper into creative algorithms, VFX, and interactive design; joined group and personal projects to strengthen technical skills and visual storytelling.', icon: <HeartIcon className="h-5 w-5" /> },
  { date: '2026', title: 'Vision & Direction', description: 'Expand experience through community projects and exhibitions; gradually shape a personal style in digital art and interactive design.', icon: <StarIcon /> },
];

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#playground', label: 'Playground' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#contact', label: 'Contact' },
];

// --- INTERACTIVE COMPONENTS & HOOKS ---

const CursorTrail = () => {
  useEffect(() => {
    const dayColors = ['#fecaca', '#fce7f3', '#fef9c3', '#e9d5ff'];
    const nightColors = ['#a78bfa', '#f472b6', '#fde047', '#67e8f9'];
    
    const createParticle = (x: number, y: number) => {
      const theme = document.documentElement.getAttribute('data-theme') || 'day';
      const colors = theme === 'day' ? dayColors : nightColors;
      
      const particle = document.createElement('div');
      particle.className = 'sparkle';
      const size = Math.random() * 8 + 4;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    };

    const handleMouseMove = (e: MouseEvent) => createParticle(e.clientX, e.clientY);
    
    const throttle = (func: (...args: any[]) => void, limit: number) => {
      let inThrottle: boolean;
      return function(this: any, ...args: any[]) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };
    const throttledMouseMove = throttle(handleMouseMove, 70);

    window.addEventListener('mousemove', throttledMouseMove);
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, []);
  return null;
};

const ClickBloomEffect = () => {
    const [blooms, setBlooms] = useState<{ id: number, x: number, y: number, color: string }[]>([]);
    const dayColors = ['#fb7185', '#f472b6', '#c084fc', '#facc15'];
    const nightColors = ['#f472b6', '#c084fc', '#fde047', '#67e8f9'];

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const theme = document.documentElement.getAttribute('data-theme') || 'day';
            const colors = theme === 'day' ? dayColors : nightColors;
            const newBloom = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
                color: colors[Math.floor(Math.random() * colors.length)]
            };
            setBlooms(prev => [...prev, newBloom]);
            setTimeout(() => {
                setBlooms(prev => prev.filter(b => b.id !== newBloom.id));
            }, 600);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <>
            {blooms.map(bloom => (
                <div key={bloom.id} className="bloom" style={{ left: `${bloom.x}px`, top: `${bloom.y}px` }}>
                    <span style={{ color: bloom.color }}>
                      <SparkleIcon className="h-8 w-8" />
                    </span>
                </div>
            ))}
        </>
    );
};


const FloatingShapes = () => (
  <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="absolute shape-float" style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
        transform: `scale(${Math.random() * 0.5 + 0.5})`,
        color: 'var(--accent-color-2)'
      }}>
        <StarIcon />
      </div>
    ))}
  </div>
);

const FloatingDecorations = () => {
    const [decos, setDecos] = useState<{ id: number; icon: React.ReactNode; style: React.CSSProperties }[]>([]);
    const icons = [<StarIcon />, <HeartIcon />, <HeartIcon className="w-5 h-5"/>];
    
    useEffect(() => {
      const interval = setInterval(() => {
        const id = Date.now() + Math.random();
        const icon = icons[Math.floor(Math.random() * icons.length)];
        const style: React.CSSProperties = {
          position: 'fixed',
          bottom: '-20px',
          left: `${Math.random() * 100}%`,
          animation: `float-up ${Math.random() * 10 + 10}s linear forwards`,
          zIndex: 0,
          color: 'var(--brand-color)',
          opacity: Math.random() * 0.5 + 0.3,
        };
        const newDeco = { id, icon, style };
        
        setDecos(prev => [...prev.slice(-15), newDeco]);

        setTimeout(() => {
            setDecos(prev => prev.filter(d => d.id !== id));
        }, 20000);

      }, 1500);

      return () => clearInterval(interval);
    }, []);
    
    return <>{decos.map(deco => <div key={deco.id} style={deco.style}>{deco.icon}</div>)}</>;
};

const useScrollAnimation = <T extends HTMLElement,>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref];
};

// --- UI COMPONENTS ---

const Header: React.FC<{ activeSection: string; theme: 'day' | 'night'; toggleTheme: () => void; }> = ({ activeSection, theme, toggleTheme }) => (
  <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <a href="#home" className="flex items-center gap-2 hover:opacity-75 transition-opacity duration-300">
        <div style={{ color: 'var(--brand-color)'}}><HeartIcon className="h-10 w-10"/></div>
        <span className="font-brand text-2xl" style={{ color: 'var(--text-main)' }}>lihnogn</span>
      </a>

      <div className="flex items-center gap-2 sm:gap-4 bg-white/50 backdrop-blur-lg px-4 py-3 rounded-full shadow-sm" style={{ backgroundColor: 'var(--bg-card)'}}>
        <ul className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <a href={link.href} className={`text-sm sm:text-base font-semibold transition-colors duration-300 pb-1 relative ${activeSection === link.href.substring(1) ? 'themed-nav-active' : ''}`}
                 style={{ color: activeSection === link.href.substring(1) ? 'var(--brand-color)' : 'var(--text-light)' }}>
                {link.label}
                {activeSection === link.href.substring(1) && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1" style={{color: 'var(--accent-color-2)'}}>
                    <StarIcon />
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <button onClick={toggleTheme} className="p-1.5 rounded-full transition-colors duration-300" style={{ color: 'var(--text-light)', backgroundColor: 'rgba(120,120,120,0.1)' }}>
          {theme === 'day' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </nav>
  </header>
);

const App = () => {
  const [theme, setTheme] = useState<'day' | 'night'>('day');
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'day' ? 'night' : 'day'));
  };

  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    projects: useRef<HTMLElement>(null),
    playground: useRef<HTMLElement>(null),
    timeline: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      }),
      { rootMargin: '-40% 0px -60% 0px' }
    );
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [homeRef] = useScrollAnimation<HTMLDivElement>();
  const [aboutRef] = useScrollAnimation<HTMLDivElement>();
  const [projectsRef] = useScrollAnimation<HTMLDivElement>();
  const [playgroundRef] = useScrollAnimation<HTMLDivElement>();
  const [timelineRef] = useScrollAnimation<HTMLDivElement>();
  const [contactRef] = useScrollAnimation<HTMLDivElement>();

  return (
    <div className="bg-animated-gradient min-h-screen relative">
      <FloatingShapes />
      <FloatingDecorations />
      <CursorTrail />
      <ClickBloomEffect />
      <Header activeSection={activeSection} theme={theme} toggleTheme={toggleTheme} />

      <main className="relative z-10">
        <section ref={sectionRefs.home} id="home" className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative">
          <div ref={homeRef} className="scroll-reveal">
            <h1 className="font-brand text-6xl md:text-8xl" style={{color: 'var(--brand-color)', opacity: 0.9}}>Phuong Linh</h1>
            <p className="mt-4 text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-main)' }}>
              ArtTech | Dream. Create. Experience.
            </p>
          </div>
          <div className="absolute -bottom-10 md:bottom-0 left-1/2 -translate-x-1/2" style={{color: 'var(--brand-color-light)'}}>
             <HeartIcon className="h-20 w-20 opacity-30"/>
          </div>
        </section>

        <section ref={sectionRefs.about} id="about" className="py-24 md:py-32">
          <div ref={aboutRef} className="scroll-reveal container mx-auto px-6 max-w-3xl text-center">
            <div className="backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-lg text-lg leading-relaxed relative" style={{backgroundColor: 'var(--bg-card)', color: 'var(--text-light)'}}>
              <span className="absolute -top-5 -left-5 text-4xl rotate-[-15deg]" style={{color: 'var(--accent-color-2)'}}><SparkleIcon /></span>
              <p className="mb-4">
                Hi, I’m <span className="font-bold" style={{color: 'var(--text-brand)'}}>Phuong Linh</span> ✿ – an ArtTech student exploring the intersection of creative coding, digital aesthetics, and interactive design.
              </p>
              <p className="mb-4">
               I enjoy blending art with technology to craft engaging visual experiences, and I’m currently shaping my future direction in VFX and interactive media.
              </p>
              <p>
                My work focuses on creating expressive, immersive, and visually captivating projects.
              </p>
            </div>
          </div>
        </section>

        <section ref={sectionRefs.projects} id="projects" className="py-24 md:py-32" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
          <div ref={projectsRef} className="scroll-reveal container mx-auto px-6 max-w-5xl">
            <h2 className="font-brand text-5xl text-center mb-12" style={{ color: 'var(--text-main)' }}>My Projects</h2>
            <div className="grid md:grid-cols-2 gap-10">
              {PROJECTS.map(project => (
                <ProjectCard key={project.title} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Playground Section */}
        <section ref={sectionRefs.playground} id="playground" className="py-24 md:py-32">
          <div ref={playgroundRef} className="scroll-reveal container mx-auto px-6 max-w-5xl">
            <h2 className="font-brand text-5xl text-center" style={{ color: 'var(--text-main)' }}>Playground</h2>
            <p className="text-center mt-3 mb-10 text-lg" style={{ color: 'var(--text-light)' }}>
              Experiment with interactive art directly on my website ✨
            </p>
            <PlaygroundContainer />
          </div>
        </section>

        <section ref={sectionRefs.timeline} id="timeline" className="py-24 md:py-32">
          <div ref={timelineRef} className="scroll-reveal container mx-auto px-6 max-w-2xl">
            <h2 className="font-brand text-5xl text-center mb-16" style={{ color: 'var(--text-main)' }}>My Journey</h2>
            <div className="relative border-l-2 pl-8 space-y-16" style={{ borderColor: 'var(--brand-color-light)'}}>
              {TIMELINE_EVENTS.map(event => (
                <div key={event.title} className="timeline-item relative">
                  <span className="absolute -left-[43px] top-[14px] p-1 rounded-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--brand-color)'}}>{event.icon}</span>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-purple)'}}>{event.date}</p>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>{event.title}</h3>
                  <p style={{ color: 'var(--text-light)' }}>{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={sectionRefs.contact} id="contact" className="py-24 md:py-32" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
          <div ref={contactRef} className="scroll-reveal container mx-auto px-6 max-w-3xl text-center">
            <h2 className="font-brand text-5xl mb-8" style={{ color: 'var(--text-main)' }}>Get In Touch</h2>
            <p className="text-lg mb-10" style={{ color: 'var(--text-light)' }}>Let's create something magical together!</p>
            
            <div className="flex justify-center items-center space-x-8 mb-12" style={{ color: 'var(--text-light)' }}>
                <a href="mailto:lethiphuonglinh1005@gmail.com" className="group flex items-center gap-2 transition-colors hover:opacity-70">📧<span className="hidden md:inline group-hover:underline">Email</span></a>
                <a href="https://instagram.com/lihnogn" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 transition-colors hover:opacity-70">🌸<span className="hidden md:inline group-hover:underline">Instagram</span></a>
                <a href="https://github.com/lihnogn" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 transition-colors hover:opacity-70">💻<span className="hidden md:inline group-hover:underline">GitHub</span></a>
            </div>

            <form className="backdrop-blur-lg rounded-3xl p-8 shadow-lg text-left space-y-6" style={{backgroundColor: 'var(--bg-card)'}}>
              <input type="text" placeholder="Your Name" className="w-full p-4 rounded-lg themed-input"/>
              <input type="email" placeholder="Your Email" className="w-full p-4 rounded-lg themed-input"/>
              <textarea placeholder="Your Message" rows={5} className="w-full p-4 rounded-lg themed-input resize-none"></textarea>
              <button type="submit" className="w-full font-bold py-4 px-6 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 themed-button-action">
                Send Message <HeartIcon className="w-5 h-5"/>
              </button>
            </form>
          </div>
        </section>

        <footer className="text-center py-8" style={{ color: 'var(--text-light)' }}>
            <p>&copy; {new Date().getFullYear()} Phuong Linh. Crafted with love & pixels.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
