import React, { useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useHover, useFocus, useDismiss, useRole, useInteractions, FloatingPortal } from '@floating-ui/react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  align?: 'center' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, description }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8), 
      flip(),   
      shift({ padding: 10 }),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  return (
    <span className="relative inline-flex items-center ml-1.5 align-middle">
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className="cursor-help flex items-center justify-center"
      >
        <HelpCircle size={14} className="text-gray-400 hover:text-blue-600 transition-colors" />
      </span>

      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 99999 }}
            {...getFloatingProps()}
            className="w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl font-normal leading-relaxed text-left pointer-events-none"
          >
            <strong className="block text-blue-300 mb-1 border-b border-gray-700 pb-1">{title}</strong>
            {description}
          </div>
        )}
      </FloatingPortal>
    </span>
  );
};