import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Accessible ARIA-compliant Tooltip component.
 * Supports hover, focus, and configurable placement.
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipId = useId();

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <div
        tabIndex={0}
        aria-describedby={isVisible ? tooltipId : undefined}
        className="inline-flex items-center cursor-help focus:outline-none"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 pointer-events-none px-3 py-2 text-xs font-medium text-slate-100 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 max-w-xs whitespace-normal text-center leading-snug ${getPositionClasses()}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
