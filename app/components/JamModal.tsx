"use client";

import { useEffect } from "react";

interface JamModalProps {
  key1: string;
  key2: string;
  onClear: () => void;
}

export function JamModal({ key1, key2, onClear }: JamModalProps) {
  // Listen for Escape key to clear jam
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClear]);

  return (
    <div className="jam-overlay" onClick={onClear}>
      <div className="jam-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Jam illustration */}
        <div className="mb-6 relative">
          {/* Stylized typebar collision visual */}
          <div className="flex justify-center items-end gap-1 h-24 perspective-500">
            <div
              className="w-3 h-20 bg-gradient-to-b from-[#C0C0C0] to-[#808080] rounded-sm origin-bottom"
              style={{ transform: "rotateX(-45deg) translateZ(10px)" }}
            >
              <div className="w-4 h-5 bg-gradient-to-b from-[#C0C0C0] to-[#909090] -ml-0.5 rounded-sm flex items-center justify-center text-[8px] font-bold text-[#1A1A1A]">
                {key1.toUpperCase()}
              </div>
            </div>
            <div
              className="w-3 h-20 bg-gradient-to-b from-[#C0C0C0] to-[#808080] rounded-sm origin-bottom"
              style={{ transform: "rotateX(-40deg) translateZ(5px)" }}
            >
              <div className="w-4 h-5 bg-gradient-to-b from-[#C0C0C0] to-[#909090] -ml-0.5 rounded-sm flex items-center justify-center text-[8px] font-bold text-[#1A1A1A]">
                {key2.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Collision burst effect */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,200,120,0.3) 0%, transparent 70%)",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
        </div>

        {/* Title */}
        <h2 className="text-xl text-[#F2E8C9] font-[Special_Elite] mb-4">Typebar Jam!</h2>

        {/* Message */}
        <p className="text-[#B0A090] font-[Special_Elite] mb-4 leading-relaxed">
          Keys <span className="text-[#F2E8C9] bg-[#8A7C4F]/30 px-2 py-0.5 rounded">{key1.toUpperCase()}</span> and{" "}
          <span className="text-[#F2E8C9] bg-[#8A7C4F]/30 px-2 py-0.5 rounded">{key2.toUpperCase()}</span> collided!
        </p>

        {/* Educational content */}
        <div className="bg-[#1A1A1A] rounded-lg p-4 mb-6 text-left">
          <p className="text-[#8A8A8A] font-[Special_Elite] text-sm leading-relaxed">
            <span className="text-[#8A7C4F]">Did you know?</span> The QWERTY keyboard layout was designed in the 1870s
            specifically to separate commonly used letter pairs and reduce typebar jams on mechanical typewriters.
            Professional typists learned to pace their keystrokes to avoid these collisions.
          </p>
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          className="px-6 py-3 rounded bg-[#8A7C4F] text-[#1A1A1A] font-[Special_Elite] hover:bg-[#9A8C5F] transition-colors"
        >
          Unjam (ESC)
        </button>

        <p className="text-xs text-[#6A6A6A] mt-4 font-[Special_Elite]">
          Click anywhere or press ESC to continue
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        .perspective-500 {
          perspective: 500px;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
