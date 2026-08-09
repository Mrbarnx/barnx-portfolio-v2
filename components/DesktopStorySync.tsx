'use client';

import { useEffect } from 'react';

const visualStates = [
  { filter: 'grayscale(.15)', transform: 'scale(1)' },
  { filter: 'grayscale(.5)', transform: 'scale(1.015)' },
  { filter: 'grayscale(.9) contrast(1.05)', transform: 'scale(1.03)' },
  { filter: 'grayscale(.25) contrast(1.08)', transform: 'scale(1.01)' },
];

export function DesktopStorySync() {
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    let raf = 0;
    let current = -1;
    let observer: MutationObserver | null = null;

    const frame = () => {
      if (media.matches) {
        const section = document.querySelector<HTMLElement>('.aboutSection');
        const image = section?.querySelector<HTMLElement>('.aboutImage');
        const stories = Array.from(section?.querySelectorAll<HTMLElement>('[data-story]') ?? []);
        const progress = Array.from(section?.querySelectorAll<HTMLElement>('.progress i') ?? []);

        if (section && image && stories.length) {
          const sectionRect = section.getBoundingClientRect();
          const nearViewport = sectionRect.bottom > -window.innerHeight && sectionRect.top < window.innerHeight * 2;

          if (nearViewport) {
            const targetY = window.innerHeight * 0.52;
            let nextIndex = 0;
            let nearest = Number.POSITIVE_INFINITY;

            stories.forEach((story, index) => {
              const rect = story.getBoundingClientRect();
              const center = rect.top + rect.height / 2;
              const distance = Math.abs(center - targetY);

              if (distance < nearest) {
                nearest = distance;
                nextIndex = index;
              }
            });

            if (nextIndex !== current) {
              current = nextIndex;
              const visual = visualStates[nextIndex] ?? visualStates[0];
              image.style.filter = visual.filter;
              image.style.transform = visual.transform;

              stories.forEach((story, index) => {
                story.classList.toggle('active', index === nextIndex);
              });

              progress.forEach((dot, index) => {
                dot.classList.toggle('active', index === nextIndex);
              });
            }
          }
        }
      }

      raf = requestAnimationFrame(frame);
    };

    const clearDesktopInlineState = () => {
      if (media.matches) return;
      const section = document.querySelector<HTMLElement>('.aboutSection');
      const image = section?.querySelector<HTMLElement>('.aboutImage');
      image?.style.removeProperty('filter');
      image?.style.removeProperty('transform');
      current = -1;
    };

    observer = new MutationObserver(() => {
      if (!media.matches) clearDesktopInlineState();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    media.addEventListener('change', clearDesktopInlineState);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      media.removeEventListener('change', clearDesktopInlineState);
      const section = document.querySelector<HTMLElement>('.aboutSection');
      const image = section?.querySelector<HTMLElement>('.aboutImage');
      image?.style.removeProperty('filter');
      image?.style.removeProperty('transform');
    };
  }, []);

  return null;
}
