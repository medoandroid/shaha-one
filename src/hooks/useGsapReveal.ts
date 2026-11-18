// DevMeDoAnDrOiD
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface UseGsapRevealOptions {
  selector?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  deps?: unknown[];
}

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>({
  selector = '[data-reveal]',
  stagger = 0.06,
  y = 18,
  duration = 0.55,
  deps = []
}: UseGsapRevealOptions = {}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(selector, root);
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: root,
            start: 'top 88%',
            once: true
          }
        }
      );
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
