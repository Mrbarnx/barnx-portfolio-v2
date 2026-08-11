'use client';

import { useEffect } from 'react';

const visualStates = [
  { filter: 'grayscale(0) contrast(1.02)', transform: 'scale(1.02)', objectPosition: '50% 8%' },
  { filter: 'grayscale(.35) contrast(1.04)', transform: 'scale(1.16)', objectPosition: '48% 16%' },
  { filter: 'grayscale(1) contrast(1.08)', transform: 'scale(1.28)', objectPosition: '52% 24%' },
  { filter: 'grayscale(.12) contrast(1.12)', transform: 'scale(1.10)', objectPosition: '50% 38%' },
];

export function DesktopStorySync() {
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    let raf = 0;

    const clearInlineVisual = () => {
      const section = document.querySelector<HTMLElement>('.aboutSection');
      const imageWrap = section?.querySelector<HTMLElement>('.aboutImage');
      const image = imageWrap?.querySelector<HTMLElement>('img');

      imageWrap?.removeAttribute('data-about-state');
      image?.style.removeProperty('filter');
      image?.style.removeProperty('transform');
      image?.style.removeProperty('object-position');
    };

    const frame = () => {
      const section = document.querySelector<HTMLElement>('.aboutSection');

      if (desktop.matches && section) {
        const imageWrap = section.querySelector<HTMLElement>('.aboutImage');
        const image = imageWrap?.querySelector<HTMLElement>('img');
        const stories = Array.from(section.querySelectorAll<HTMLElement>('[data-story]'));
        const progress = Array.from(section.querySelectorAll<HTMLElement>('.progress i'));

        if (imageWrap && image && stories.length) {
          const targetY = window.innerHeight * 0.52;
          let activeIndex = 0;
          let nearest = Number.POSITIVE_INFINITY;

          stories.forEach((story, index) => {
            const rect = story.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(center - targetY);

            if (distance < nearest) {
              nearest = distance;
              activeIndex = index;
            }
          });

          const visual = visualStates[activeIndex] ?? visualStates[0];

          imageWrap.dataset.aboutState = String(activeIndex);
          image.style.setProperty('filter', visual.filter, 'important');
          image.style.setProperty('transform', visual.transform, 'important');
          image.style.setProperty('object-position', visual.objectPosition, 'important');

          stories.forEach((story, index) => {
            story.classList.toggle('active', index === activeIndex);
          });

          progress.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
          });
        }
      } else {
        clearInlineVisual();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearInlineVisual();
    };
  }, []);

  return null;
}
