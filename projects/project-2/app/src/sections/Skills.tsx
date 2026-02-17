import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiThreedotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiFigma,
  SiGit,
} from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { name: 'React', icon: SiReact, level: 95, color: '#61DAFB' },
  { name: 'TypeScript', icon: SiTypescript, level: 92, color: '#3178C6' },
  { name: 'Next.js', icon: SiNextdotjs, level: 88, color: '#FFFFFF' },
  { name: 'Three.js', icon: SiThreedotjs, level: 85, color: '#FFFFFF' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, level: 96, color: '#06B6D4' },
  { name: 'Node.js', icon: SiNodedotjs, level: 82, color: '#339933' },
  { name: 'Figma', icon: SiFigma, level: 90, color: '#F24E1E' },
  { name: 'Git', icon: SiGit, level: 87, color: '#F05032' },
];

const CircularProgress = ({
  level,
  color,
  isVisible,
}: {
  level: number;
  color: string;
  isVisible: boolean;
}) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (level / 100) * circumference;

  return (
    <div className="relative w-28 h-28 md:w-32 md:h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? strokeDashoffset : circumference}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Percentage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl md:text-2xl font-bold text-white">{level}%</span>
      </div>
    </div>
  );
};

const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { opacity: 0, y: 60 });
      gsap.set(grid.children, { opacity: 0, y: 40, scale: 0.9 });

      // Create scroll-triggered timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center center',
          toggleActions: 'play none none reverse',
          onEnter: () => setIsVisible(true),
          onLeaveBack: () => setIsVisible(false),
        },
      });

      tl.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      }).to(
        grid.children,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        },
        '-=0.6'
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="section relative min-h-screen py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="section-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            SKILLS
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Technologies and tools I use to bring ideas to life
          </p>
        </div>

        {/* Skills Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center p-6 md:p-8 glass rounded-2xl hover:border-accent/30 transition-all duration-300"
              data-cursor-hover
            >
              {/* Glow Effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${skill.color}10 0%, transparent 70%)`,
                }}
              />

              {/* Circular Progress */}
              <div className="relative mb-4">
                <CircularProgress
                  level={skill.level}
                  color={skill.color}
                  isVisible={isVisible}
                />
              </div>

              {/* Icon */}
              <skill.icon
                className="w-8 h-8 mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ color: skill.color }}
              />

              {/* Name */}
              <span className="text-white font-medium text-center">{skill.name}</span>

              {/* Hover Glow */}
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow: `0 0 30px ${skill.color}30`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Frontend Architecture',
              description:
                'Building scalable component systems with modern frameworks and design patterns.',
            },
            {
              title: 'Creative Development',
              description:
                'Crafting immersive experiences with WebGL, GSAP, and cutting-edge animations.',
            },
            {
              title: 'Performance First',
              description:
                'Optimizing for Core Web Vitals with lazy loading, code splitting, and caching strategies.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="glass rounded-xl p-6 hover:border-accent/30 transition-colors duration-300"
              data-cursor-hover
            >
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
