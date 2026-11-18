// DevMeDoAnDrOiD

export function enableGlobalHorizontalWheelScroll(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const findHorizontalContainer = (start: EventTarget | null): HTMLElement | null => {
    let node = start instanceof HTMLElement ? start : null;
    while (node && node !== document.body && node !== document.documentElement) {
      if (node.dataset?.noWheelX !== undefined) return null;
      const tag = node.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'INPUT') return null;

      const style = window.getComputedStyle(node);
      const canScrollX =
        (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        node.scrollWidth > node.clientWidth + 4;
      const canScrollY =
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        node.scrollHeight > node.clientHeight + 4;

      if (canScrollX && !canScrollY) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (Math.abs(event.deltaY) < 1) return;

    const container = findHorizontalContainer(event.target);
    if (!container) return;

    const isRtl = window.getComputedStyle(container).direction === 'rtl';
    const delta = event.deltaY;
    const prevLeft = container.scrollLeft;

    if (isRtl) {
      container.scrollLeft -= delta;
    } else {
      container.scrollLeft += delta;
    }

    if (container.scrollLeft !== prevLeft) {
      event.preventDefault();
    }
  };

  document.addEventListener('wheel', handleWheel, { passive: false });
  return () => document.removeEventListener('wheel', handleWheel);
}

// Copyright (c) 2026 MeDoAnDrOiD. All Rights Reserved.
