import React, { useEffect, useState, useRef } from 'react';

/**
 * Custom Magnetic Cursor
 * 
 * Replaces the default system mouse cursor completely on desktop.
 * - Single precision geometric cursor (NO dot surrounded by circle, NO trailing rings).
 * - Smooth, zero-lag tracking with subtle spring dynamics.
 * - Magnetic attraction on interactive targets (buttons, links, cards).
 * - Transforms size and color on hover and click.
 * - Automatically disabled on touch devices.
 */
export const MagneticCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverType, setHoverType] = useState<'button' | 'card' | 'input' | null>(null);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const activeElementRef = useRef<HTMLElement | null>(null);
  const originalTransitionRef = useRef<string>('');

  useEffect(() => {
    // Only enable on desktop pointer-fine devices
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) {
      setIsEnabled(false);
      return;
    }
    setIsEnabled(true);

    // Enforce cursor: none on document body
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      posRef.current = { x: mouseX, y: mouseY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Detect hover over interactive elements
      const target = e.target as HTMLElement | null;
      const interactiveEl = target?.closest<HTMLElement>(
        'button, a, input, select, textarea, [data-magnetic="true"], .interactive-card'
      );

      if (interactiveEl) {
        setIsHovered(true);

        if (interactiveEl.tagName === 'INPUT' || interactiveEl.tagName === 'TEXTAREA') {
          setHoverType('input');
        } else if (interactiveEl.tagName === 'BUTTON' || interactiveEl.tagName === 'A') {
          setHoverType('button');
        } else {
          setHoverType('card');
        }

        // Apply magnetic attraction to the element itself
        if (activeElementRef.current !== interactiveEl) {
          if (activeElementRef.current) {
            activeElementRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
          }
          activeElementRef.current = interactiveEl;
          originalTransitionRef.current = interactiveEl.style.transition;
          interactiveEl.style.transition = 'transform 0.16s cubic-bezier(0.25, 1, 0.5, 1)';
        }

        const rect = interactiveEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;

        // Subtle pull displacement
        const pull = 0.22;
        const maxShift = 9;
        const shiftX = Math.max(-maxShift, Math.min(maxShift, deltaX * pull));
        const shiftY = Math.max(-maxShift, Math.min(maxShift, deltaY * pull));

        interactiveEl.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0px)`;
      } else {
        setIsHovered(false);
        setHoverType(null);

        if (activeElementRef.current) {
          activeElementRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
          const el = activeElementRef.current;
          const orig = originalTransitionRef.current;
          setTimeout(() => {
            if (el && el !== activeElementRef.current) {
              el.style.transition = orig;
            }
          }, 160);
          activeElementRef.current = null;
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseLeave = () => {
      posRef.current = { x: -100, y: -100 };
      if (cursorRef.current) {
        cursorRef.current.style.transform = 'translate3d(-100px, -100px, 0)';
      }
      if (activeElementRef.current) {
        activeElementRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
        activeElementRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.style.cursor = 'auto';
      document.body.style.cursor = 'auto';
      if (activeElementRef.current) {
        activeElementRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      }
    };
  }, []);

  if (!isEnabled) return null;

  // Single precision diamond/capsule cursor style
  const cursorSize = isHovered 
    ? (hoverType === 'input' ? 'w-2 h-6 rounded-sm' : 'w-5 h-5 rounded-md') 
    : 'w-3.5 h-3.5 rounded-sm';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-99999 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 will-change-transform"
        style={{
          transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
        }}
      >
        <div
          className={`transition-[width,height,transform,background-color] duration-150 ease-out flex items-center justify-center ${cursorSize}`}
          style={{
            transform: `translate(-50%, -50%) rotate(${
              isHovered ? (hoverType === 'input' ? '0deg' : '90deg') : '45deg'
            }) scale(${isClicking ? 0.8 : 1})`,
            background: isHovered
              ? (hoverType === 'input'
                  ? '#0e0fed'
                  : 'linear-gradient(135deg, #f2b1d8 0%, #ffdc6a 50%, #8bf0ba 100%)')
              : 'linear-gradient(135deg, #0e0fed 0%, #94f0f1 100%)',
            boxShadow: isHovered
              ? '0 0 16px rgba(14, 15, 237, 0.45), 0 0 6px rgba(242, 177, 216, 0.6)'
              : '0 0 10px rgba(14, 15, 237, 0.35), 0 1px 3px rgba(0, 0, 0, 0.2)',
            border: isHovered ? '1.5px solid #0e0fed' : '1px solid rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Subtle center precision core */}
          <div 
            className="w-1 h-1 rounded-full bg-white transition-opacity duration-150"
            style={{ opacity: isHovered ? 0.9 : 0.6 }}
          />
        </div>
      </div>
    </div>
  );
};
