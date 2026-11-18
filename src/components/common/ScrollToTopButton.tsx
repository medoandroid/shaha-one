// DevMeDoAnDrOiD
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY > 420);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة للأعلى"
      title="العودة للأعلى"
      className="fixed bottom-28 left-4 md:bottom-6 md:left-6 z-30 w-11 h-11 rounded-2xl bg-emerald-700/95 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-950/25 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
