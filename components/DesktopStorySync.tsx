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
    let detach: (() => void) | null = null;
    let observer: MutationObserver | null = null;

    const setup = () => {
      if (!media.matches || detach) return;

      const section = document.querySelector<HTMLElement>('.aboutSection');
      const image = section?.querySelector<HTMLElement>('.aboutImage');
      const stories = Array.from(section?.querySelectorAll<HTMLElement>('[data-story]') ?? []);
      const progress = Array.from(section?.querySelectorAll<HTMLElement>('.progress i') ?? []);

      if (!section || !image || stories.length === 0) return;

      const apply = (index: number) => {
        if (index === current) return;
        current = index;

        const visual = visualStates[index] ?? visualStates[0];
        image.style.filter = visual.filter;
        image.style.transform = visual.transform;

        stories.forEach((story, storyIndex) => {
          story.classList.toggle('active', storyIndex === index);
        });

        progress.forEach((dot, dotIndex) => {
          dot.classList.toggle('active', dotIndex === index);
        });
      };

      const update = () => {
        if (!media.matches) return;

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

        apply(nextIndex);
      };

      const scheduleUpdate = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      };

      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate);
      update();

      detach = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', scheduleUpdate);
        image.style.removeProperty('filter');
        image.style.removeProperty('transform');
        current = -1;
        detach = null;
      };
    };

    const handleMediaChange = () => {
      if (!media.matches) {
        detach?.();
        return;
      }
      setup();
    };

    setup();

    // RootLayout stays mounted during client-side navigation. If Home is entered
    // from another route, attach the controller as soon as the About section appears.
    observer = new MutationObserver(() => {
      if (media.matches && !detach) setup();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    media.addEventListener('change', handleMediaChange);

    return () => {
      detach?.();
      observer?.disconnect();
      media.removeEventListener('change', handleMediaChange);
    };
  }, []);

  return null;
}
