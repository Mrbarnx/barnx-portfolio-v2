'use client';

import { useEffect } from 'react';

const stateClasses = ['state0', 'state1', 'state2', 'state3'];

export function DesktopStorySync() {
  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    if (!media.matches) return;

    const section = document.querySelector('.aboutSection');
    const image = section?.querySelector('.aboutImage');
    const stories = Array.from(section?.querySelectorAll<HTMLElement>('[data-story]') ?? []);
    const progress = Array.from(section?.querySelectorAll<HTMLElement>('.progress i') ?? []);
    if (!section || !image || stories.length === 0) return;

    let current = -1;
    const apply = (index: number) => {
      if (index === current) return;
      current = index;
      image.classList.remove(...stateClasses);
      image.classList.add(stateClasses[index] ?? 'state0');
      stories.forEach((story, i) => story.classList.toggle('active', i === index));
      progress.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const update = () => {
      const targetY = window.innerHeight * 0.52;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      stories.forEach((story, index) => {
        const rect = story.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - targetY);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      apply(bestIndex);
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return null;
}
