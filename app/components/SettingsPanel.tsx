"use client";

import { useCallback } from "react";
import type { TypewriterSettings } from "../hooks/useTypewriterState";

interface SettingsPanelProps {
  settings: TypewriterSettings;
  onUpdateSettings: (settings: Partial<TypewriterSettings>) => void;
  onClose: () => void;
  onExport: () => void;
  inkRemaining: number;
  inkCapacity: number;
  onChangeRibbon: () => void;
}

export function SettingsPanel({
  settings,
  onUpdateSettings,
  onClose,
  onExport,
  inkRemaining,
  inkCapacity,
  onChangeRibbon,
}: SettingsPanelProps) {
  const handleHousingChange = useCallback(
    (color: TypewriterSettings["housingColor"]) => {
      onUpdateSettings({ housingColor: color });
    },
    [onUpdateSettings]
  );

  const handlePaperChange = useCallback(
    (type: TypewriterSettings["paperType"]) => {
      onUpdateSettings({ paperType: type });
    },
    [onUpdateSettings]
  );

  const handleInkDensityChange = useCallback(
    (density: TypewriterSettings["inkDensity"]) => {
      onUpdateSettings({ inkDensity: density });
    },
    [onUpdateSettings]
  );

  const inkPercentage = Math.round((inkRemaining / inkCapacity) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose}
    >
      <div
        className="settings-panel w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#8A7C4F]">
          <h2 className="text-xl text-[#F2E8C9] font-[Special_Elite]">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#3A3A3A] transition-colors text-[#F2E8C9]"
            aria-label="Close settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Housing Color */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Housing Color
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleHousingChange("forest-green")}
                className={`w-16 h-16 rounded-lg border-2 transition-all ${
                  settings.housingColor === "forest-green"
                    ? "border-[#F2E8C9] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#2A4B3A" }}
                aria-label="Forest Green"
                title="Forest Green"
              />
              <button
                onClick={() => handleHousingChange("burgundy")}
                className={`w-16 h-16 rounded-lg border-2 transition-all ${
                  settings.housingColor === "burgundy"
                    ? "border-[#F2E8C9] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#6B1E2F" }}
                aria-label="Burgundy"
                title="Burgundy"
              />
              <button
                onClick={() => handleHousingChange("black")}
                className={`w-16 h-16 rounded-lg border-2 transition-all ${
                  settings.housingColor === "black"
                    ? "border-[#F2E8C9] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#4B5052" }}
                aria-label="Matte Black"
                title="Matte Black"
              />
            </div>
          </section>

          {/* Paper Type */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Paper Type
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handlePaperChange("standard")}
                className={`w-16 h-16 rounded-lg border-2 transition-all ${
                  settings.paperType === "standard"
                    ? "border-[#8A7C4F] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#F2E8C9" }}
                aria-label="Standard"
                title="Standard"
              />
              <button
                onClick={() => handlePaperChange("coffee-stained")}
                className={`w-16 h-16 rounded-lg border-2 transition-all relative overflow-hidden ${
                  settings.paperType === "coffee-stained"
                    ? "border-[#8A7C4F] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#E6D5B8" }}
                aria-label="Coffee Stained"
                title="Coffee Stained"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 70%, rgba(139, 90, 43, 0.15) 0%, transparent 50%)",
                  }}
                />
              </button>
              <button
                onClick={() => handlePaperChange("yellowed")}
                className={`w-16 h-16 rounded-lg border-2 transition-all ${
                  settings.paperType === "yellowed"
                    ? "border-[#8A7C4F] scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: "#E8DCC4" }}
                aria-label="Yellowed"
                title="Yellowed"
              />
            </div>
          </section>

          {/* Ink Density */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Ink Density
            </h3>
            <div className="flex gap-3">
              {(["high", "medium", "low"] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => handleInkDensityChange(density)}
                  className={`px-4 py-2 rounded border transition-all font-[Special_Elite] ${
                    settings.inkDensity === density
                      ? "border-[#8A7C4F] bg-[#8A7C4F]/20 text-[#F2E8C9]"
                      : "border-[#3A3A3A] text-[#8A8A8A] hover:border-[#5A5A5A]"
                  }`}
                >
                  {density.charAt(0).toUpperCase() + density.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Ink Ribbon Status */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Ink Ribbon
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-[#1A1A1A] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${inkPercentage}%`,
                      backgroundColor:
                        inkPercentage > 60 ? "#2A4B3A" : inkPercentage > 30 ? "#8A7C4F" : "#6B1E2F",
                    }}
                  />
                </div>
                <p className="text-xs text-[#6A6A6A] mt-1 font-[Special_Elite]">
                  {inkPercentage}% remaining
                </p>
              </div>
              <button
                onClick={onChangeRibbon}
                className="px-4 py-2 rounded border border-[#8A7C4F] text-[#F2E8C9] hover:bg-[#8A7C4F]/20 transition-colors font-[Special_Elite] text-sm"
              >
                Change Ribbon
              </button>
            </div>
          </section>

          {/* Sound Toggle */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Sound & Effects
            </h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#F2E8C9] font-[Special_Elite]">Sound Effects</span>
                <button
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.soundEnabled ? "bg-[#2A4B3A]" : "bg-[#3A3A3A]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-[#F2E8C9] transition-transform ${
                      settings.soundEnabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#F2E8C9] font-[Special_Elite]">Margin Bell</span>
                <button
                  onClick={() => onUpdateSettings({ marginBellEnabled: !settings.marginBellEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.marginBellEnabled ? "bg-[#2A4B3A]" : "bg-[#3A3A3A]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-[#F2E8C9] transition-transform ${
                      settings.marginBellEnabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#F2E8C9] font-[Special_Elite]">Typebar Jam Simulation</span>
                <button
                  onClick={() => onUpdateSettings({ jamSimulationEnabled: !settings.jamSimulationEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.jamSimulationEnabled ? "bg-[#2A4B3A]" : "bg-[#3A3A3A]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-[#F2E8C9] transition-transform ${
                      settings.jamSimulationEnabled ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </section>

          {/* Export */}
          <section>
            <h3 className="text-sm uppercase tracking-wider text-[#8A7C4F] mb-4 font-[Special_Elite]">
              Export
            </h3>
            <button
              onClick={onExport}
              className="w-full py-3 rounded border border-[#8A7C4F] text-[#F2E8C9] hover:bg-[#8A7C4F]/20 transition-colors font-[Special_Elite] flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Page as Image
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#3A3A3A] text-center">
          <p className="text-xs text-[#6A6A6A] font-[Special_Elite]">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
