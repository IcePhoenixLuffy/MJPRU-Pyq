import React, { useState, useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey?: string | number;
  showGradientOverlay?: boolean;
}

/**
  Expanding Gradient Reveal + Cinematic Fade Up Page Transition:
  1. Subtly scales down current page to ~0.985 with soft blur.
  2. Smooth expanding circular/radial gradient reveal blooms across viewport using MJPRU palette:
     (#94f0f1, #8bf0ba, #f2b1d8, #ffdc6a, #0e0fed).
  3. Reveals incoming page through the expanding gradient.
  4. Incoming page fades from opacity 0 to 1 while moving upward 15px.
  5. Subtle blur disappears as the new page settles into crisp normal scale (1.0) and position.
  6. Timing: coordinated 600ms total duration with cubic-bezier(0.22, 1, 0.36, 1).
  7. Accessible: automatically respects prefers-reduced-motion.
  8. Prevents overlap: flow-based replacement without stacking collisions.
  9. Does NOT replay on filter/search changes (governed by transitionKey stability).
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  transitionKey,
  showGradientOverlay = true,
}) => {
  const [displayedChildren, setDisplayedChildren] = useState<React.ReactNode>(children);
  const [currentKey, setCurrentKey] = useState<string | number | undefined>(transitionKey);
  const [phase, setPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const isInitialMount = useRef(true);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion in browser
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    // On first mount, initialize immediately without transition delays
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setCurrentKey(transitionKey);
      setDisplayedChildren(children);
      return;
    }

    // If key hasn't changed, keep children in sync (e.g. search filter updates, in-page state)
    if (transitionKey === currentKey) {
      setDisplayedChildren(children);
      return;
    }

    // Reduced-motion path: instantaneous switch without animations
    if (prefersReducedMotion) {
      setCurrentKey(transitionKey);
      setDisplayedChildren(children);
      setPhase('idle');
      setShowOverlay(false);
      return;
    }

    // Clear any previous running transition timers
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);

    // Phase 1: Exiting current page (scale down to 0.985) + Launch expanding gradient bloom
    setPhase('exiting');
    if (showGradientOverlay) {
      setShowOverlay(true);
    }

    // Phase 2: After 180ms, switch children to incoming page (cinematic fade up 15px + blur-to-crisp)
    exitTimerRef.current = setTimeout(() => {
      setCurrentKey(transitionKey);
      setDisplayedChildren(children);
      setPhase('entering');
    }, 180);

    // Phase 3: At 600ms, transition is fully complete
    endTimerRef.current = setTimeout(() => {
      setPhase('idle');
      setShowOverlay(false);
    }, 600);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, [transitionKey, children, currentKey, prefersReducedMotion, showGradientOverlay]);

  return (
    <>
      {showOverlay && (
        <div 
          className="cinematic-gradient-overlay" 
          aria-hidden="true"
          data-testid="cinematic-gradient-overlay"
        >
          <div className="cinematic-gradient-circle" />
        </div>
      )}

      <div
        className={`w-full ${
          phase === 'exiting'
            ? 'page-cinematic-exit'
            : phase === 'entering'
            ? 'page-cinematic-enter'
            : ''
        } ${className}`}
        data-testid="page-transition-container"
      >
        {displayedChildren}
      </div>
    </>
  );
};
