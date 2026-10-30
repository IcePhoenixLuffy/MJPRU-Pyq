import React, { useEffect } from 'react';

/**
 * Genuine Magnetic Cursor Interaction Controller
 * 
 * Attracts interactive buttons, navigation items, and cards toward the cursor
 * as the cursor approaches or hovers over them.
 * 
 * Complies with strict design instructions:
 * - NO custom circular cursor
 * - NO dot cursor
 * - NO follower ring
 * - System cursor remains normal and visible
 */
export const MagneticCursor: React.FC = () => {
  useEffect(() => {
    // Only enable on pointer-fine devices (desktop mouse/trackpad), never touch
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    let activeElement: HTMLElement | null = null;
    let originalTransition = '';

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Find if we are near or over any magnetic interactive element
      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest<HTMLElement>(
        '[data-magnetic="true"], button:not([disabled]), .magnetic-elem'
      );

      if (interactiveEl) {
        if (activeElement !== interactiveEl) {
          if (activeElement) {
            activeElement.style.transform = 'translate3d(0px, 0px, 0px)';
          }
          activeElement = interactiveEl;
          originalTransition = interactiveEl.style.transition;
          interactiveEl.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
        }

        const rect = interactiveEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = mouseX - centerX;
        const distanceY = mouseY - centerY;

        // Subtle, elegant magnetic pull strength (capped to max 10px displacement)
        const pullFactor = 0.22;
        const maxShift = 10;
        const shiftX = Math.max(-maxShift, Math.min(maxShift, distanceX * pullFactor));
        const shiftY = Math.max(-maxShift, Math.min(maxShift, distanceY * pullFactor));

        interactiveEl.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0px)`;
      } else if (activeElement) {
        // Return element smoothly to natural resting position
        activeElement.style.transform = 'translate3d(0px, 0px, 0px)';
        const elToReset = activeElement;
        setTimeout(() => {
          if (elToReset && elToReset !== activeElement) {
            elToReset.style.transition = originalTransition;
          }
        }, 150);
        activeElement = null;
      }
    };

    const handleMouseLeave = () => {
      if (activeElement) {
        activeElement.style.transform = 'translate3d(0px, 0px, 0px)';
        activeElement = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (activeElement) {
        activeElement.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    };
  }, []);

  // Renders no DOM elements, no dots, no circles.
  return null;
};
