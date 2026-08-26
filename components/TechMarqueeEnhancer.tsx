'use client';

import { useEffect } from 'react';

const additionalSkills = [
  { label: 'Docker', iconSrc: 'https://cdn.simpleicons.org/docker/000000' },
  { label: 'Express.js', iconSrc: 'https://cdn.simpleicons.org/express/000000' },
  { label: 'PostgreSQL', iconSrc: 'https://cdn.simpleicons.org/postgresql/000000' },
  { label: 'Git', iconSrc: 'https://cdn.simpleicons.org/git/000000' },
  { label: 'GitHub', iconSrc: 'https://cdn.simpleicons.org/github/000000' },
];

function enhanceMarquee() {
  document.querySelectorAll<HTMLElement>('.techMarqueeGroup').forEach((group) => {
    if (group.dataset.skillsEnhanced === 'true') return;

    additionalSkills.forEach((skill) => {
      const item = document.createElement('span');
      item.className = 'techMarqueeItem';
      item.dataset.addedSkill = skill.label;

      const icon = document.createElement('img');
      icon.src = skill.iconSrc;
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');

      const label = document.createElement('b');
      label.textContent = skill.label;

      item.append(icon, label);
      group.appendChild(item);
    });

    group.dataset.skillsEnhanced = 'true';
  });
}

export function TechMarqueeEnhancer() {
  useEffect(() => {
    enhanceMarquee();

    const observer = new MutationObserver(() => enhanceMarquee());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return <style jsx global>{`
    @media (min-width: 621px) {
      .techMarqueeGroup[data-skills-enhanced='true'] {
        width: 1780px !important;
        min-width: 1780px !important;
        flex-basis: 1780px !important;
      }
    }
    @media (max-width: 620px) {
      .techMarqueeGroup[data-skills-enhanced='true'] {
        width: max-content !important;
        min-width: max-content !important;
        flex: 0 0 auto !important;
      }
    }
  `}</style>;
}
