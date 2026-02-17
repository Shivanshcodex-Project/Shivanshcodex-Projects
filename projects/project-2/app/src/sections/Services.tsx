import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Code2,
  Palette,
  Layers,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Code2,
    title: 'Frontend Development',
    description:
      'Building fast, responsive, and accessible web applications using modern frameworks like React, Next.js, and Vue.',
    features: [
      'React & Next.js Development',
      'TypeScript Implementation',
      'Performance Optimization',
      'Accessibility (WCAG)',
    ],
  },
  {
    icon: Layers,
    title: 'WebGL / Three.js',
    description:
      'Creating immersive 3D experiences and interactive visualizations that push the boundaries of web technology.',
    features: [
      '3D Website Experiences',
      'Interactive Animations',
      'Shader Programming',
      'Particle Systems',
    ],
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description:
      'Designing intuitive and visually stunning interfaces that delight users and drive engagement.',
    features: [
      'User Interface Design',
      'Prototyping & Wireframing',
      'Design Systems',
      'User Research',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Creative Direction',
    description:
      'Guiding projects from concept to completion with a focus on innovation and brand storytelling.',
    features: [
      'Brand Strategy',
      'Art Direction',
      'Motion Design',
      'Creative Consulting',
    ],
  },
];

const ServiceCard = ({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={cardRef}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-cursor-hover
    >
      <div
        className={`relative p-8 md:p-10 glass rounded-2xl overflow-hidden transition-all duration-500 ${
          isHovered ? 'border-accent/30' : ''
        }`}
      >
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Number */}
        <div className="absolute top-6 right-6 text-6xl font-bold text-white/5">
          0{index + 1}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 transition-all duration-300 ${
              isHovered ? 'scale-110 bg-accent/20' : ''
            }`}
          >
            <service.icon
              className={`w-7 h-7 text-accent transition-transform duration-300 ${
                isHovered ? 'rotate-12' : ''
              }`}
            />
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {service.description}
          </p>

          {/* Features */}
          <ul className="space-y-2 mb-6">
            {service.features.map((feature, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 text-sm text-muted-foreground transition-all duration-300 ${
                  isHovered ? 'translate-x-2' : ''
                }`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                {feature}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            className={`flex items-center gap-2 text-accent font-medium transition-all duration-300 ${
              isHovered ? 'gap-4' : ''
            }`}
          >
            Learn More
            <ArrowRight
              className={`w-4 h-4 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : ''
              }`}
            />
          </button>
        </div>

        {/* Border Glow */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            boxShadow: 'inset 0 0 30px hsl(217 91% 60% / 0.1)',
          }}
        />
      </div>
    </div>
  );
};

const Services = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { opacity: 0, y: 60 });
      gsap.set(cards.children, { opacity: 0, y: 50 });

      // Create scroll-triggered timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'center center',
          toggleActions: 'play none none reverse',
        },
      });

      tl.to(heading, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      }).to(
        cards.children,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
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
      id="services"
      className="section relative min-h-screen py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="section-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            SERVICES
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Comprehensive solutions to bring your digital vision to life
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Have a project in mind? Let&apos;s discuss how I can help.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform duration-300"
            data-cursor-hover
          >
            Start a Project
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
