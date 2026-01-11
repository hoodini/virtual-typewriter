"use client";

import { useEffect, useState } from "react";

interface MobileWarningProps {
  onContinue: () => void;
}

export function MobileWarning({ onContinue }: MobileWarningProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
      <div className="mobile-warning max-w-md animate-fade-in">
        {/* Typewriter icon */}
        <div className="mb-6">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A7C4F"
            strokeWidth="1.5"
            className="mx-auto"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
            <path d="M6 18v2" />
            <path d="M18 18v2" />
            <circle cx="8" cy="12" r="1" fill="#8A7C4F" />
            <circle cx="12" cy="12" r="1" fill="#8A7C4F" />
            <circle cx="16" cy="12" r="1" fill="#8A7C4F" />
            <path d="M8 15h8" />
          </svg>
        </div>

        <h1 className="text-xl text-[#F2E8C9] mb-4">Best with a Physical Keyboard</h1>

        <p className="text-[#B0A090] mb-6 leading-relaxed">
          This virtual typewriter is designed to simulate the experience of using a 1960s mechanical
          typewriter. For the most authentic experience, please use a desktop or laptop computer with a
          physical keyboard.
        </p>

        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 rounded bg-[#8A7C4F] text-[#1A1A1A] font-[Special_Elite] hover:bg-[#9A8C5F] transition-colors"
          >
            Continue Anyway
          </button>

          <p className="text-xs text-[#6A6A6A]">
            Touch controls are available but the full experience requires a keyboard
          </p>
        </div>
      </div>
    </div>
  );
}

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone"];
      const isMobileDevice = mobileKeywords.some((keyword) => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return {
    showWarning: isMobile && !dismissed,
    dismissWarning: () => setDismissed(true),
  };
}
