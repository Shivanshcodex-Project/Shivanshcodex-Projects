import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Sections
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Services from './sections/Services';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

// Styles
import './App.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Loading Screen Component
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.5,
          onComplete,
        });
      },
    });

    // Animate progress bar
    tl.to(progressRef.current, {
      scaleX: 1,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    // Animate text
    tl.to(
      textRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      },
      '-=1'
    );

    // Fade out text
    tl.to(textRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
    });
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center"
    >
      <div
        ref={textRef}
        className="text-4xl md:text-6xl font-bold text-white mb-8 opacity-0 translate-y-4"
      >
        ALEX MORGAN
      </div>
      <div className="w-48 h-0.5 bg-muted rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-accent origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  );
};

// Custom Cursor Component
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const isTouch = useRef(false);

  useEffect(() => {
    // Check if touch device
    isTouch.current = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let ringX = 0;
    let ringY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      posRef.current = { x: targetX, y: targetY };
    };

    const animate = () => {
      // Smooth follow for dot
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;

      // Smoother follow for ring
      ringX += (targetX - ringX) * 0.1;
      ringY += (targetY - ringY) * 0.1;

      dot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

      rafId = requestAnimationFrame(animate);
    };

    // Add hover listeners
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        'a, button, [data-cursor-hover], input, textarea'
      );

      interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          dot.classList.add('cursor-dot-hover');
          ring.classList.add('cursor-ring-hover');
        });
        el.addEventListener('mouseleave', () => {
          dot.classList.remove('cursor-dot-hover');
          ring.classList.remove('cursor-ring-hover');
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    // Add hover listeners after a short delay
    setTimeout(addHoverListeners, 100);

    // Re-add listeners when DOM changes
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 border border-white/30 rounded-full pointer-events-none z-[9998]"
        style={{ willChange: 'transform' }}
      />
      <style>{`
        .cursor-dot-hover {
          transform: scale(1.5) !important;
          background: hsl(217 91% 60%) !important;
        }
        .cursor-ring-hover {
          transform: scale(1.5) !important;
          border-color: hsl(217 91% 60% / 0.5) !important;
        }
      `}</style>
    </>
  );
};

// Navigation Component
const Navigation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Update active section based on scroll
    const sections = ['hero', 'about', 'skills', 'projects', 'services', 'contact'];

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(sectionId),
          onEnterBack: () => setActiveSection(sectionId),
        });
      }
    });
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Work' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="mx-4 mt-4">
        <div className="glass-strong rounded-full px-6 py-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="text-white font-bold text-lg"
              data-cursor-hover
            >
              AM
            </button>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-white/10 text-white'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                  data-cursor-hover
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollToSection('contact')}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:scale-105 transition-transform"
              data-cursor-hover
            >
              Hire Me
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Noise Overlay
const NoiseOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-[9990] opacity-[0.03]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

  // Refresh ScrollTrigger after loading
  useEffect(() => {
    if (!isLoading) {
      ScrollTrigger.refresh();
    }
  }, [isLoading]);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {!isLoading && (
        <>
          <CustomCursor />
          <Navigation />
          <NoiseOverlay />

          <main className="relative bg-background">
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Services />
            <Contact />
            <Footer />
          </main>
        </>
      )}
    </>
  );
}

export default App;
