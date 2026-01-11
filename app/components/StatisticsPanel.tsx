"use client";

import type { TypewriterStats } from "../hooks/useTypewriterState";

interface StatisticsPanelProps {
  stats: TypewriterStats;
  wpm: number;
  elapsedTime: string;
  onClose: () => void;
}

export function StatisticsPanel({ stats, wpm, elapsedTime, onClose }: StatisticsPanelProps) {
  // Get top jam pairs
  const topJamPairs = Object.entries(stats.jamPairs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="settings-panel w-full max-w-md mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#8A7C4F]">
          <h2 className="text-xl text-[#F2E8C9] font-[Special_Elite]">Session Statistics</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#3A3A3A] transition-colors text-[#F2E8C9]"
            aria-label="Close statistics"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Characters" value={stats.charactersTyped.toLocaleString()} />
            <StatCard label="Words" value={stats.wordsTyped.toLocaleString()} />
            <StatCard label="Time" value={elapsedTime} />
            <StatCard label="Returns" value={stats.carriageReturns.toString()} />
          </div>

          {/* WPM with comparison */}
          <div className="bg-[#1A1A1A] rounded-lg p-4">
            <div className="text-center mb-3">
              <p className="text-sm text-[#8A7C4F] font-[Special_Elite] uppercase tracking-wider mb-1">
                Typing Speed
              </p>
              <p className="text-4xl text-[#F2E8C9] font-[Special_Elite]">
                {wpm} <span className="text-lg text-[#8A8A8A]">WPM</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#6A6A6A] font-[Special_Elite] leading-relaxed">
                {wpm < 30 && "Take your time - enjoy the mechanical rhythm!"}
                {wpm >= 30 && wpm < 50 && "Steady pace! You're getting the hang of it."}
                {wpm >= 50 && wpm < 70 && "Great speed! Professional typists averaged 60-80 WPM."}
                {wpm >= 70 && wpm < 90 && "Impressive! You'd be a star in any 1960s typing pool."}
                {wpm >= 90 && "Exceptional! You type faster than most professionals of the era!"}
              </p>
            </div>
          </div>

          {/* Jam statistics */}
          {stats.jams > 0 && (
            <div>
              <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-3 font-[Special_Elite]">
                Typebar Jams ({stats.jams})
              </h3>
              {topJamPairs.length > 0 && (
                <div className="space-y-2">
                  {topJamPairs.map(([pair, count]) => {
                    const [key1, key2] = pair.split("-");
                    return (
                      <div key={pair} className="flex items-center justify-between text-sm">
                        <span className="text-[#F2E8C9] font-[Special_Elite]">
                          <span className="bg-[#8A7C4F]/30 px-2 py-0.5 rounded">{key1.toUpperCase()}</span>
                          {" + "}
                          <span className="bg-[#8A7C4F]/30 px-2 py-0.5 rounded">{key2.toUpperCase()}</span>
                        </span>
                        <span className="text-[#6A6A6A] font-[Special_Elite]">{count}x</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Historical context */}
          <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
            <p className="text-xs text-[#6A6A6A] font-[Special_Elite] italic">
              "A skilled typist in the 1960s could produce up to 150 words per minute on a well-maintained machine."
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3A3A3A] text-center">
          <p className="text-xs text-[#6A6A6A] font-[Special_Elite]">Press ESC or click outside to close</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-4 text-center">
      <p className="text-xs text-[#8A7C4F] font-[Special_Elite] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl text-[#F2E8C9] font-[Special_Elite]">{value}</p>
    </div>
  );
}
