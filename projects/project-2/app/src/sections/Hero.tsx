import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const locationRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Creative Developer';

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Mouse attraction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          particle.vx += dx * 0.0001;
          particle.vy += dy * 0.0001;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.alpha})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // GSAP animations
  useEffect(() => {
    const section = sectionRef.current;
    const name = nameRef.current;
    const subtitle = subtitleRef.current;
    const location = locationRef.current;
    const cta = ctaRef.current;

    if (!section || !name || !subtitle || !location || !cta) return;

    const ctx = gsap.context(() => {
      // Split name into characters
      const chars = name.innerText.split('');
      name.innerHTML = chars
        .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      const charElements = name.querySelectorAll('span');

      // Initial states
      gsap.set(charElements, { opacity: 0, y: 100, rotateX: -90 });
      gsap.set(subtitle, { opacity: 0, y: 30 });
      gsap.set(location, { opacity: 0, y: 20 });
      gsap.set(cta, { opacity: 0, y: 20 });

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.5 });

      tl.to(charElements, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.05,
        ease: 'expo.out',
      })
        .to(
          subtitle,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        .to(
          location,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.4'
        )
        .to(
          cta,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
          },
          '-=0.3'
        );

      // Scroll-triggered exit animation
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress > 0.5) {
            const exitProgress = (progress - 0.5) * 2;
            gsap.to(charElements, {
              opacity: 1 - exitProgress,
              x: (i) => (i % 2 === 0 ? -100 : 100) * exitProgress,
              stagger: 0.02,
              duration: 0.1,
            });
            gsap.to([subtitle, location, cta], {
              opacity: 1 - exitProgress,
              y: -50 * exitProgress,
              duration: 0.1,
            });
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="section relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #050505 0%, #0a0a0a 50%, #050505 100%)' }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Name */}
        <h1
          ref={nameRef}
          className="hero-title text-[12vw] md:text-[10vw] font-bold tracking-tighter text-white leading-none mb-6"
          style={{ perspective: '1000px' }}
        >
          ALEX MORGAN
        </h1>

        {/* Subtitle with typing effect */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light mb-4"
        >
          {typedText}
          <span className="inline-block w-0.5 h-6 bg-accent ml-1 animate-blink" />
        </p>

        {/* Location */}
        <p ref={locationRef} className="text-sm md:text-base text-muted-foreground/60 tracking-widest uppercase">
          Based in London
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToAbout}
            className="magnetic-btn px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform duration-300"
            data-cursor-hover
          >
            Explore My Work
          </button>
          <a
            href="#contact"
            className="magnetic-btn px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300"
            data-cursor-hover
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce-subtle" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
};

export default Hero;
