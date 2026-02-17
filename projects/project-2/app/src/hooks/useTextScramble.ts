import { useCallback, useRef } from 'react';

const chars = '!<>-_\\/[]{}—=+*^?#________';

export const useTextScramble = () => {
  const frameRef = useRef<number>(0);
  const queueRef = useRef<{ from: string; to: string; start: number; end: number; char?: string }[]>([]);
  const frameCounter = useRef(0);

  const scramble = useCallback((
    element: HTMLElement,
    newText: string,
    duration: number = 1500
  ) => {
    const oldText = element.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => {
      const update = () => {
        let output = '';
        let complete = 0;

        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor((duration / 3) * (i / length));
          const end = start + Math.floor((duration / 3));

          let char = queueRef.current[i]?.char;

          if (frameCounter.current < start) {
            char = from;
          } else if (frameCounter.current > end) {
            char = to;
            complete++;
          } else {
            if (!char || Math.random() < 0.28) {
              char = chars[Math.floor(Math.random() * chars.length)];
            }
          }

          output += char;
          queueRef.current[i] = { from, to, start, end, char };
        }

        element.innerText = output;

        if (complete === length) {
          resolve();
        } else {
          frameCounter.current++;
          frameRef.current = requestAnimationFrame(update);
        }
      };

      cancelAnimationFrame(frameRef.current);
      queueRef.current = [];
      frameCounter.current = 0;
      update();
    });

    return promise;
  }, []);

  return { scramble };
};

export default useTextScramble;
