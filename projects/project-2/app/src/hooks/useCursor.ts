import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

interface CursorPosition {
  x: number;
  y: number;
}

export const useCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<CursorPosition>({ x: 0, y: 0 });
  const isHoveringRef = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    positionRef.current = { x: e.clientX, y: e.clientY };

    if (cursorDotRef.current) {
      gsap.to(cursorDotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
      });
    }

    if (cursorRingRef.current) {
      gsap.to(cursorRingRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
    cursorDotRef.current?.classList.add('hover');
    cursorRingRef.current?.classList.add('hover');
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    cursorDotRef.current?.classList.remove('hover');
    cursorRingRef.current?.classList.remove('hover');
  }, []);

  useEffect(() => {
    // Check if touch device
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    // Create cursor elements
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    cursorDotRef.current = dot;

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    cursorRingRef.current = ring;

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      dot.remove();
      ring.remove();
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  // Function to refresh hover listeners (call after DOM changes)
  const refreshHoverListeners = useCallback(() => {
    const interactiveElements = document.querySelectorAll('a, button, [data-cursor-hover]');
    interactiveElements.forEach((el) => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });
  }, [handleMouseEnter, handleMouseLeave]);

  return { refreshHoverListeners };
};

export default useCursor;
