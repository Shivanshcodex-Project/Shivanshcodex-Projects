import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Palette, Sparkles, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { name: 'Frontend Development', level: 95, icon: Code2 },
  { name: 'UI/UX Design', level: 90, icon: Palette },
  { name: 'Creative Direction', level: 85, icon: Sparkles },
  { name: 'Performance Optimization', level: 88, icon: Zap },
];

const About = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const skillBarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const text = textRef.current;
    const cards = cardsRef.current;
    const skillBars = skillBarsRef.current;

    if (!section || !heading || !text || !cards || !skillBars) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { opacity: 0, y: 60 });
      gsap.set(text, { opacity: 0, y: 40 });
      gsap.set(cards.children, { opacity: 0, y: 40, rotateY: -15 });
      gsap.set(skillBars.querySelectorAll('.skill-bar-fill'), { scaleX: 0 });

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
      })
        .to(
          text,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .to(
          cards.children,
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
          },
          '-=0.4'
        )
        .to(
          skillBars.querySelectorAll('.skill-bar-fill'),
          {
            scaleX: 1,
            duration: 1.5,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.4'
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="section relative min-h-screen py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="section-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            ABOUT ME
          </h2>
          <p
            ref={textRef}
            className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed"
          >
            I craft digital experiences that merge art with technology. With a focus on
            WebGL and creative frontend development, I build websites that don&apos;t just
            display content—they tell stories. My work is defined by clean code,
            obsessive attention to detail, and a passion for pushing the boundaries of
            the web.
          </p>
        </div>

        {/* Stats Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
          style={{ perspective: '1000px' }}
        >
          {[
            { value: '5+', label: 'Years Experience' },
            { value: '50+', label: 'Projects Completed' },
            { value: '30+', label: 'Happy Clients' },
            { value: '15+', label: 'Awards Won' },
          ].map((stat, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 md:p-8 text-center hover:border-accent/30 transition-colors duration-300"
              data-cursor-hover
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="glass rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Core Expertise
          </h3>

          <div ref={skillBarsRef} className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <skill.icon className="w-5 h-5 text-accent" />
                    <span className="text-white font-medium">{skill.name}</span>
                  </div>
                  <span className="text-accent font-bold">{skill.level}%</span>
                </div>
                <div className="skill-bar">
                  <div
                    className="skill-bar-fill"
                    style={{ transform: `scaleX(${skill.level / 100})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-16">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Journey
          </h3>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/20 to-transparent" />

            {/* Timeline Items */}
            {[
              {
                year: '2024',
                title: 'Senior Creative Developer',
                company: 'Freelance',
                description: 'Leading creative development for premium brands worldwide.',
              },
              {
                year: '2022',
                title: 'Frontend Lead',
                company: 'Digital Agency',
                description: 'Spearheaded the development of award-winning web experiences.',
              },
              {
                year: '2020',
                title: 'Web Developer',
                company: 'Tech Startup',
                description: 'Built scalable applications and honed my craft.',
              },
              {
                year: '2019',
                title: 'Started Journey',
                company: 'Self-Taught',
                description: 'Began my path in web development and design.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`relative flex items-start gap-8 mb-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 mt-2 ring-4 ring-background" />

                {/* Content */}
                <div
                  className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}
                >
                  <div className="glass rounded-xl p-6 hover:border-accent/30 transition-colors duration-300">
                    <span className="text-accent font-bold text-sm">{item.year}</span>
                    <h4 className="text-white font-bold text-lg mt-1">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.company}</p>
                    <p className="text-muted-foreground/70 text-sm mt-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
