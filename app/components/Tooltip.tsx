"use client";

import { useEffect } from "react";

interface TooltipProps {
  title: string;
  message: string;
  onDismiss: () => void;
  position?: "top" | "bottom";
}

export function Tooltip({ title, message, onDismiss, position = "top" }: TooltipProps) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Dismiss on click anywhere
  useEffect(() => {
    const handleClick = () => onDismiss();
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [onDismiss]);

  return (
    <div
      className={`tooltip animate-fade-in fixed ${
        position === "top" ? "top-24" : "bottom-24"
      } left-1/2 -translate-x-1/2 z-40`}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="tooltip-title">{title}</p>
      <p className="text-[#B0A090]">{message}</p>
      <p className="text-xs text-[#6A6A6A] mt-2">Click anywhere to dismiss</p>
    </div>
  );
}

// Backspace-specific tooltip
interface BackspaceTooltipProps {
  onDismiss: () => void;
}

export function BackspaceTooltip({ onDismiss }: BackspaceTooltipProps) {
  return (
    <Tooltip
      title="No Delete Key!"
      message="Typewriters cannot truly erase. The carriage moves back, but the character remains. Typists would overstrike with 'X' or use correction tape/fluid."
      onDismiss={onDismiss}
    />
  );
}

// Margin bell tooltip
interface MarginBellTooltipProps {
  onDismiss: () => void;
}

export function MarginBellTooltip({ onDismiss }: MarginBellTooltipProps) {
  return (
    <Tooltip
      title="Margin Bell"
      message="That bell signals you're approaching the right margin. Press RETURN or pull the carriage lever to start a new line."
      onDismiss={onDismiss}
    />
  );
}

// Page full tooltip
interface PageFullTooltipProps {
  onLoadNewSheet: () => void;
  onDismiss: () => void;
}

export function PageFullTooltip({ onLoadNewSheet, onDismiss }: PageFullTooltipProps) {
  return (
    <div
      className="tooltip animate-fade-in fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="tooltip-title">Page Full</p>
      <p className="text-[#B0A090] mb-4">
        You've reached the end of this sheet. Load a new one to continue typing.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onLoadNewSheet}
          className="px-4 py-2 rounded bg-[#8A7C4F] text-[#1A1A1A] font-[Special_Elite] hover:bg-[#9A8C5F] transition-colors"
        >
          Load New Sheet
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded border border-[#8A7C4F] text-[#F2E8C9] font-[Special_Elite] hover:bg-[#8A7C4F]/20 transition-colors"
        >
          Stay on Page
        </button>
      </div>
    </div>
  );
}
