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
    let raf