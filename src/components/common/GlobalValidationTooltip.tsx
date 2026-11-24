import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipData {
  element: HTMLElement;
  message: string;
  x: number;
  y: number;
  placement: 'bottom' | 'top';
  arrowX: number;
}

declare global {
  interface Window {
    showValidationTooltip?: (element: HTMLElement, message?: string) => void;
    hideValidationTooltip?: () => void;
  }
}

export const GlobalValidationTooltip: React.FC = () => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const activeElementRef = useRef<HTMLElement | null>(null);
  const lastInvalidTimestampRef = useRef<number>(0);

  const clearTooltip = useCallback(() => {
    if (activeElementRef.current) {
      activeElementRef.current.classList.remove('validation-invalid-ring');
      activeElementRef.current = null;
    }
    setTooltip(null);
  }, []);

  const calculatePosition = useCallback((element: HTMLElement, message: string) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    // Remove ring from previous element if different
    if (activeElementRef.current && activeElementRef.current !== element) {
      activeElementRef.current.classList.remove('validation-invalid-ring');
    }

    activeElementRef.current = element;
    element.classList.add('validation-invalid-ring');

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const preferTop = spaceBelow < 65 && spaceAbove > 65;

    const placement: 'bottom' | 'top' = preferTop ? 'top' : 'bottom';
    
    // Position tooltip aligned with element left, but keep in viewport
    const tooltipWidthEstimate = Math.min(Math.max(message.length * 7.5 + 45, 160), 340);
    let x = rect.left + 4;
    if (x + tooltipWidthEstimate > window.innerWidth - 12) {
      x = window.innerWidth - tooltipWidthEstimate - 12;
    }
    if (x < 12) {
      x = 12;
    }

    // Arrow position relative to tooltip box
    const targetAnchorX = rect.left + Math.min(24, rect.width / 2);
    const arrowX = Math.max(12, Math.min(targetAnchorX - x, tooltipWidthEstimate - 18));

    const y = placement === 'bottom' ? rect.bottom + 7 : rect.top - 7;

    setTooltip({
      element,
      message,
      x,
      y,
      placement,
      arrowX,
    });
  }, []);

  useEffect(() => {
    // Expose window API for programmatic validation tooltip triggers
    window.showValidationTooltip = (el: HTMLElement, msg?: string) => {
      const message = msg || (el as HTMLInputElement).validationMessage || 'Please fill out this field.';
      calculatePosition(el, message);
      el.focus({ preventScroll: true });
    };

    window.hideValidationTooltip = clearTooltip;

    // Intercept native HTML5 validation invalid event globally
    const handleInvalid = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof HTMLElement)) return;

      // Always prevent default native browser tooltip
      e.preventDefault();

      // Form submission triggers 'invalid' on every invalid element at once.
      // We only anchor the tooltip to the first invalid field.
      const now = Date.now();
      if (now - lastInvalidTimestampRef.current < 80 && tooltip !== null) {
        return;
      }
      lastInvalidTimestampRef.current = now;

      const input = target as HTMLInputElement;
      const message = input.validationMessage || 'Please fill out this field.';

      calculatePosition(target, message);

      // Smoothly bring element into view if not visible
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      target.focus({ preventScroll: true });
    };

    // Auto-dismiss handlers
    const handleInput = (e: Event) => {
      if (activeElementRef.current && (e.target === activeElementRef.current || activeElementRef.current.contains(e.target as Node))) {
        clearTooltip();
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      const tooltipEl = document.getElementById('budget-global-validation-tooltip');
      if (tooltipEl && tooltipEl.contains(e.target as Node)) {
        return;
      }
      clearTooltip();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTooltip();
      }
    };

    const handleScrollOrResize = () => {
      if (activeElementRef.current) {
        const msg = (activeElementRef.current as HTMLInputElement).validationMessage || 'Please fill out this field.';
        calculatePosition(activeElementRef.current, msg);
      }
    };

    // Capture invalid events before the browser can render native UI
    document.addEventListener('invalid', handleInvalid, true);
    document.addEventListener('input', handleInput, true);
    document.addEventListener('change', handleInput, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });

    return () => {
      document.removeEventListener('invalid', handleInvalid, true);
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('change', handleInput, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      delete window.showValidationTooltip;
      delete window.hideValidationTooltip;
    };
  }, [calculatePosition, clearTooltip, tooltip]);

  if (!tooltip) return null;

  return createPortal(
    <div
      id="budget-global-validation-tooltip"
      role="alert"
      className="fixed z-[999999] pointer-events-auto transition-transform duration-100 ease-out animate-tooltip-pop"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: tooltip.placement === 'top' ? 'translateY(-100%)' : 'translateY(0)',
      }}
      onClick={clearTooltip}
    >
      <div className="relative bg-white text-slate-800 border border-amber-300 rounded-lg shadow-md shadow-amber-950/10 px-3 py-1.5 flex items-center space-x-2 select-none min-h-[30px] cursor-pointer">
        {/* Pointer Caret Arrow */}
        {tooltip.placement === 'bottom' ? (
          <div
            className="absolute -top-[5px] w-2.5 h-2.5 bg-white border-t border-l border-amber-300 transform rotate-45"
            style={{ left: `${tooltip.arrowX}px` }}
          />
        ) : (
          <div
            className="absolute -bottom-[5px] w-2.5 h-2.5 bg-white border-b border-r border-amber-300 transform rotate-45"
            style={{ left: `${tooltip.arrowX}px` }}
          />
        )}

        {/* Amber / Orange Warning Exclamation Badge */}
        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center font-black text-[10px] shadow-2xs shrink-0 select-none">
          !
        </span>

        {/* Validation Message */}
        <span className="text-[11.5px] font-semibold text-slate-800 tracking-tight leading-tight whitespace-nowrap">
          {tooltip.message}
        </span>
      </div>
    </div>,
    document.body
  );
};
