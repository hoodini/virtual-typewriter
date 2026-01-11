"use client";

import dynamic from "next/dynamic";
import { MobileWarning, useMobileDetection } from "./components/MobileWarning";

// Dynamically import Typewriter to avoid SSR issues with Web Audio API
const Typewriter = dynamic(() => import("./components/Typewriter").then((mod) => mod.Typewriter), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
      <div className="text-center animate-fade-in">
        <div className="mb-4">
          {/* Loading typewriter animation */}
          <div className="inline-block w-16 h-16 relative">
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "linear-gradient(145deg, #2A4B3A 0%, #1F3A2B 50%, #162A1F 100%)",
                border: "2px solid #8A7C4F",
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full bg-[#F2E8C9] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#F2E8C9] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#F2E8C9] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-[#8A7C4F] font-[Special_Elite] text-sm">Loading typewriter...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { showWarning, dismissWarning } = useMobileDetection();

  return (
    <main className="min-h-screen">
      {showWarning ? <MobileWarning onContinue={dismissWarning} /> : <Typewriter />}
    </main>
  );
}
