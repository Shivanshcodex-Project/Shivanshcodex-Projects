import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Github, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: 1,
    title: 'Aurora Design',
    category: 'Web Design',
    description:
      'A stunning portfolio website for a luxury fashion brand featuring immersive scroll animations and WebGL effects.',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    tech: ['React', 'Three.js', 'GSAP'],
    liveUrl: '#',
    githubUrl: '#',
    color: '#8B5CF6',
  },
  {
    id: 2,
    title: 'Nova Studio',
    category: 'Development',
    description:
      'Creative agency website with bold typography, smooth transitions, and interactive project showcases.',
    image:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    tech: ['Next.js', 'Framer Motion', 'Tailwind'],
    liveUrl: '#',
    githubUrl: '#',
    color: '#06B6D4',
  },
  {
    id: 3,
    title: 'Zenith App',
    category: 'UI/UX Design',
    description:
      'Mobile-first fintech application with intuitive user interface and seamless user experience.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    tech: ['Figma', 'React Native', 'Node.js'],
    liveUrl: '#',
    githubUrl: '#',
    color: '#10B981',
  },
  {
    id: 4,
    title: 'Echo Brand',
    category: 'Identity',
    description:
      'Complete brand identity and website for an audio technology startup.',
    image:
      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
    tech: ['Vue.js', 'GSAP', 'WebGL'],
    liveUrl: '#',
    githubUrl: '#',
    color: '#F59E0B',
  },
];

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tech: string[];
  liveUrl: string;
  githubUrl: string;
  color: string;
}

const ProjectCard = ({
  project,
  onClick,
}: {
  project: Project;
  onClick: (project: Project) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      className="project-card group relative cursor-pointer"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(project)}
      data-cursor-hover
    >
      {/* Card Content */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="project-card-image w-full h-full object-cover"
          />
          <div className="project-card-overlay" />

          {/* Hover Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white/80 text-sm mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="flex gap-2">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-white/10 backdrop-blur-sm rounded-full text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: project.color }}
              >
                {project.category}
              </span>
              <h3 className="text-xl font-bold text-white mt-1 group-hover:text-accent transition-colors">
                {project.title}
              </h3>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <a
                href={project.githubUrl}
                className="p-2 rounded-full bg-muted hover:bg-accent/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={project.liveUrl}
                className="p-2 rounded-full bg-muted hover:bg-accent/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${project.color}30`,
        }}
      />
    </div>
  );
};

const ProjectModal = ({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 50,
      duration: 0.3,
      ease: 'power3.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      onComplete: onClose,
    });
  };

  if (!project) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-strong rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-video">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content */}
        <div className="p-8">
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: project.color }}
          >
            {project.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
            {project.title}
          </h2>
          <p className="text-muted-foreground text-lg mb-6">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="mb-8">
            <h3 className="text-white font-medium mb-3">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span
                  key={i}
                  className="px-4 py-2 text-sm bg-muted rounded-full text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a
              href={project.liveUrl}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </a>
            <a
              href={project.githubUrl}
              className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              <Github className="w-4 h-4" />
              Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const grid = gridRef.current;

    if (!section || !heading || !grid) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { opacity: 0, y: 60 });
      gsap.set(grid.children, { opacity: 0, y: 60 });

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
        grid.children,
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
      id="projects"
      className="section relative min-h-screen py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="section-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            WORK
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Selected projects showcasing my expertise in creative development
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={setSelectedProject}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <button
            className="magnetic-btn px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300"
            data-cursor-hover
          >
            View All Projects
          </button>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};

export default Projects;
