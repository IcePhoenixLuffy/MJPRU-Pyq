import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  transitionKey?: string | number;
}

/**
  Smooth Page-Transition Component:
  - Animation style: Fade + Slight Upward Slide (opacity 0 -> 1, translateY 14px -> 0)
  - Duration: 300ms
  - Easing: ease-out
  - Flow-based layout: prevents overlap between old and incoming content
  - Reduced motion accessible: automatically respects prefers-reduced-motion
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
  transitionKey,
}) => {
  return (
    <div
      key={transitionKey}
      className={`page-transition-enter ${className}`}
      data-testid="page-transition-container"
    >
      {children}
    </div>
  );
};
