import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const form = formRef.current;
    const info = infoRef.current;

    if (!section || !heading || !form || !info) return;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(heading, { opacity: 0, y: 60 });
      gsap.set(form.children, { opacity: 0, y: 40 });
      gsap.set(info.children, { opacity: 0, y: 30 });

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
          form.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .to(
          info.children,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.4'
        );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });

    // Reset submitted state after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="section relative min-h-screen py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            ref={headingRef}
            className="section-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            LET&apos;S WORK
            <br />
            <span className="text-shimmer">TOGETHER</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Have a project in mind? I&apos;d love to hear about it. Let&apos;s create
            something amazing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-8 md:p-10"
          >
            {/* Name Field */}
            <div className="floating-label-group mb-6">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="floating-input"
                placeholder=" "
                required
              />
              <label htmlFor="name" className="floating-label">
                Your Name
              </label>
            </div>

            {/* Email Field */}
            <div className="floating-label-group mb-6">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="floating-input"
                placeholder=" "
                required
              />
              <label htmlFor="email" className="floating-label">
                Your Email
              </label>
            </div>

            {/* Message Field */}
            <div className="floating-label-group mb-8">
              <textarea
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                className="floating-input min-h-[150px] resize-none"
                placeholder=" "
                required
              />
              <label htmlFor="message" className="floating-label">
                Your Message
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-8 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                submitted
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-black hover:scale-[1.02]'
              }`}
              data-cursor-hover
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : submitted ? (
                <>Message Sent!</>
              ) : (
                <>
                  Send Message
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8">
            {/* Info Cards */}
            <div className="glass rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Email</h3>
                  <a
                    href="mailto:hello@alexmorgan.dev"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    hello@alexmorgan.dev
                  </a>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Phone</h3>
                  <a
                    href="tel:+442012345678"
                    className="text-muted-foreground hover:text-accent transition-colors"
                  >
                    +44 20 1234 5678
                  </a>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 hover:border-accent/30 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Location</h3>
                  <p className="text-muted-foreground">
                    London, United Kingdom
                  </p>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-medium">
                  Available for new projects
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Currently accepting new projects for Q1 2026. Let&apos;s discuss
                your ideas!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
