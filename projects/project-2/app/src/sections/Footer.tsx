import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Dribbble,
  ArrowUp,
  Heart,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Dribbble, href: '#', label: 'Dribbble' },
];

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    const content = contentRef.current;

    if (!footer || !content) return;

    const ctx = gsap.context(() => {
      gsap.set(content.children, { opacity: 0, y: 30 });

      ScrollTrigger.create({
        trigger: footer,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(content.children, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
      });
    }, footer);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      ref={footerRef}
      className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-border"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">ALEX MORGAN</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Creative developer crafting immersive digital experiences with
              modern technologies and bold design.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-icon"
                  aria-label={social.label}
                  data-cursor-hover
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-medium mb-4">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-medium mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Subscribe to my newsletter for the latest updates and insights.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-muted rounded-full text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
                data-cursor-hover
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by
              Alex Morgan &copy; {new Date().getFullYear()}
            </p>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
              data-cursor-hover
            >
              Back to top
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:bg-accent/10 transition-colors">
                <ArrowUp className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
