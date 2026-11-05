import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string | number;
  className?: string;
  showGradientOverlay?: boolean; // Maintained for backward compatibility; cinematic overlay removed
}

/**
 * Original simple PageTransition component:
 * - Fade in from opacity 0 to 1
 * - Slight upward movement of 12-16px (14px)
 * - Duration: 300ms
 * - Easing: ease-out
 * - Respects prefers-reduced-motion
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionKey,
  className = '',
}) => {
  return (
    <div
      key={transitionKey}
      className={`page-transition-enter ${className}`}
    >
      {children}
    </div>
  );
};
