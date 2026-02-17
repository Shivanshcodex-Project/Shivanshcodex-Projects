import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
  y?: number;
  stagger?: number;
  start?: string;
}

export const useScrollReveal = <T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) => {
  const ref = useRef<T>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  const {
    delay = 0,
    duration = 0.8,
    y = 40,
    start = 'top 85%',
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set initial state
    gsap.set(element, { opacity: 0, y });

    // Create animation
    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: 'play none none none',
      },
    });

    if (animation.scrollTrigger) {
      triggersRef.current.push(animation.scrollTrigger);
    }

    return () => {
      triggersRef.current.forEach((trigger) => trigger.kill());
      triggersRef.current = [];
    };
  }, [delay, duration, y, start]);

  return ref;
};

export const useStaggerReveal = <T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) => {
  const containerRef = useRef<T>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);

  const {
    delay = 0,
    duration = 0.6,
    y = 30,
    stagger = 0.1,
    start = 'top 85%',
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.children;
    if (children.length === 0) return;

    // Set initial state
    gsap.set(children, { opacity: 0, y });

    // Create animation
    const animation = gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start,
        toggleActions: 'play none none none',
      },
    });

    if (animation.scrollTrigger) {
      triggersRef.current.push(animation.scrollTrigger);
    }

    return () => {
      triggersRef.current.forEach((trigger) => trigger.kill());
      triggersRef.current = [];
    };
  }, [delay, duration, y, stagger, start]);

  return containerRef;
};

export default useScrollReveal;
