"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTypewriterState } from "../hooks/useTypewriterState";
import { useSoundSystem } from "../hooks/useSoundSystem";
import { TypewriterKeyboard } from "./TypewriterKey";
import { Paper } from "./Paper";
import { SettingsPanel } from "./SettingsPanel";
import { JamModal } from "./JamModal";
import { StatisticsPanel } from "./StatisticsPanel";
import { BackspaceTooltip, PageFullTooltip } from "./Tooltip";

type ViewMode = "full" | "focus" | "desk";

export function Typewriter() {
  const {
    state,
    typeCharacter,
    carriageReturn,
    backspace,
    clearJam,
    changeRibbon,
    toggleInkColor,
    loadNewSheet,
    updateSettings,
    isPageFull,
    getWPM,
    getElapsedTime,
    setKeyPressed,
    dismissBackspaceTooltip,
    CHARS_PER_LINE,
    LINES_PER_PAGE,
    INK_RIBBON_CAPACITY,
  } = useTypewriterState();

  const {
    initAudio,
    playKeystroke,
    playSpacebar,
    playCarriageReturn,
    playCarriageAdvance,
    playMarginBell,
    playTypebarJam,
    playPaperLoad,
  } = useSoundSystem();

  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showPageFullPrompt, setShowPageFullPrompt] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeTypebar, setActiveTypebar] = useState<string | null>(null);
  const [marginBellRinging, setMarginBellRinging] = useState(false);
  const [carriageReturning, setCarriageReturning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize audio on first interaction
  const handleFirstInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      initAudio();
    }
  }, [hasInteracted, initAudio]);

  // Handle key press
  const handleKeyPress = useCallback(
    (char: string) => {
      handleFirstInteraction();

      if (state.jamState.isJammed) {
        if (state.settings.soundEnabled) playTypebarJam();
        return;
      }

      if (isPageFull() && state.carriagePosition >= CHARS_PER_LINE - 1) {
        setShowPageFullPrompt(true);
        return;
      }

      setActiveTypebar(char.toLowerCase());
      setTimeout(() => setActiveTypebar(null), 80);

      const result = typeCharacter(char);

      if (result.isJammed) {
        if (state.settings.soundEnabled) playTypebarJam();
        return;
      }

      if (result.shouldPlaySound && state.settings.soundEnabled) {
        playKeystroke();
      }

      if (result.isMarginBell && state.settings.soundEnabled) {
        playMarginBell();
        setMarginBellRinging(true);
        setTimeout(() => setMarginBellRinging(false), 300);
      }
    },
    [handleFirstInteraction, state.jamState.isJammed, state.carriagePosition, state.settings.soundEnabled, isPageFull, typeCharacter, playKeystroke, playMarginBell, playTypebarJam, CHARS_PER_LINE]
  );

  // Handle space
  const handleSpace = useCallback(() => {
    handleFirstInteraction();
    if (state.jamState.isJammed) return;

    if (isPageFull() && state.carriagePosition >= CHARS_PER_LINE - 1) {
      setShowPageFullPrompt(true);
      return;
    }

    const result = typeCharacter(" ");

    if (result.shouldPlaySound && state.settings.soundEnabled) {
      playSpacebar();
    }

    if (result.isMarginBell && state.settings.soundEnabled) {
      playMarginBell();
      setMarginBellRinging(true);
      setTimeout(() => setMarginBellRinging(false), 300);
    }
  }, [handleFirstInteraction, state.jamState.isJammed, state.carriagePosition, state.settings.soundEnabled, isPageFull, typeCharacter, playSpacebar, playMarginBell, CHARS_PER_LINE]);

  // Handle carriage return
  const handleReturn = useCallback(() => {
    handleFirstInteraction();
    if (state.jamState.isJammed) return;

    if (isPageFull()) {
      setShowPageFullPrompt(true);
      return;
    }

    setCarriageReturning(true);
    setTimeout(() => setCarriageReturning(false), 400);

    const success = carriageReturn();
    if (success && state.settings.soundEnabled) {
      playCarriageReturn();
    }
  }, [handleFirstInteraction, state.jamState.isJammed, isPageFull, carriageReturn, state.settings.soundEnabled, playCarriageReturn]);

  // Handle backspace
  const handleBackspace = useCallback(() => {
    handleFirstInteraction();
    if (state.jamState.isJammed) return;
    backspace();
  }, [handleFirstInteraction, state.jamState.isJammed, backspace]);

  // Handle shift
  const handleShift = useCallback((pressed: boolean) => {
    setIsShiftPressed(pressed);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showStats) {
        if (e.key === "Escape") {
          setShowSettings(false);
          setShowStats(false);
        }
        return;
      }

      if (e.key === "Escape") {
        if (state.jamState.isJammed) {
          clearJam();
        } else {
          setShowSettings(true);
        }
        return;
      }

      if (e.key === "1" && !e.ctrlKey && !e.altKey && !e.metaKey) { setViewMode("full"); return; }
      if (e.key === "2" && !e.ctrlKey && !e.altKey && !e.metaKey) { setViewMode("focus"); return; }
      if (e.key === "3" && !e.ctrlKey && !e.altKey && !e.metaKey) { setViewMode("desk"); return; }

      setKeyPressed(e.key, true);

      if (e.key === "Shift") { setIsShiftPressed(true); return; }
      if (e.key === "Enter") { e.preventDefault(); handleReturn(); return; }
      if (e.key === "Backspace") { e.preventDefault(); handleBackspace(); return; }
      if (e.key === " ") { e.preventDefault(); handleSpace(); return; }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyPressed(e.key, false);
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [showSettings, showStats, state.jamState.isJammed, clearJam, setKeyPressed, handleKeyPress, handleSpace, handleReturn, handleBackspace]);

  // Export current page as image
  const handleExport = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const paperElement = document.querySelector(".paper");
      if (!paperElement) return;

      const canvas = await html2canvas(paperElement as HTMLElement, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `typewriter-page-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Failed to export:", error);
    }
  }, []);

  // Handle loading new sheet
  const handleLoadNewSheet = useCallback(() => {
    loadNewSheet();
    setShowPageFullPrompt(false);
    if (state.settings.soundEnabled) playPaperLoad();
  }, [loadNewSheet, state.settings.soundEnabled, playPaperLoad]);

  // Housing color class
  const housingClass = state.settings.housingColor === "burgundy" ? "burgundy" : state.settings.housingColor === "black" ? "black" : "";

  // Current page data
  const currentPage = state.pages[state.currentPageIndex];
  const ribbonPercentage = (state.inkRemaining / INK_RIBBON_CAPACITY) * 100;
  const carriageOffset = state.carriagePosition * 8;

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden relative" onClick={handleFirstInteraction}>
      {/* Background - desk surface */}
      <div className="absolute inset-0 desk-surface">
        <div className="lamp-glow" style={{ top: "-200px", left: "-100px" }} />
        <div className="lamp-glow" style={{ top: "100px", right: "-200px", opacity: 0.3 }} />
      </div>

      {/* Main container */}
      <div className={`relative w-full h-full flex items-center justify-center transition-transform duration-500 ${viewMode === "desk" ? "scale-[0.7]" : viewMode === "focus" ? "scale-100" : ""}`}>

        {/* Typewriter Machine */}
        <div className={`typewriter-housing ${housingClass} relative flex flex-col`} style={{ width: "900px", padding: "24px" }}>

          {/* Top Section - Platen, Paper, Carriage */}
          <div className="relative h-[380px] mb-4">

            {/* Platen (roller) at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-8 bg-gradient-to-b from-[#1A1A1A] to-[#2A2A2A] rounded-full shadow-lg z-20" />

            {/* Carriage ruler */}
            <div
              className={`absolute top-2 left-1/2 w-[680px] h-5 z-30 ${carriageReturning ? "transition-transform duration-400" : "transition-transform duration-50"}`}
              style={{ transform: `translateX(calc(-50% + ${carriageReturning ? 0 : -carriageOffset}px))` }}
            >
              <div className="w-full h-full bg-gradient-to-b from-[#A89058] to-[#8A7C4F] rounded shadow-md relative">
                {/* Ruler marks */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  {Array.from({ length: 68 }).map((_, i) => (
                    <div key={i} className={`w-px ${i % 5 === 0 ? "h-3 bg-[#4A4030]" : "h-2 bg-[#5A5040]"}`} />
                  ))}
                </div>
              </div>
              {/* Carriage return lever */}
              <div
                className="absolute -left-12 top-1/2 -translate-y-1/2 w-16 h-4 bg-gradient-to-r from-[#C0C0C0] to-[#A0A0A0] rounded cursor-pointer hover:from-[#D0D0D0] hover:to-[#B0B0B0] shadow-md"
                onClick={handleReturn}
                title="Carriage Return (Enter)"
              />
            </div>

            {/* Paper area - positioned inside platen */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[520px] h-[340px] overflow-hidden z-10">
              <div style={{ transform: "scale(0.72)", transformOrigin: "top center" }}>
                <Paper
                  page={currentPage}
                  currentLineIndex={state.currentLineIndex}
                  currentCharIndex={state.currentCharIndex}
                  settings={state.settings}
                  charsPerLine={CHARS_PER_LINE}
                  linesPerPage={LINES_PER_PAGE}
                />
              </div>
            </div>

            {/* Left ribbon spool */}
            <div
              className="absolute top-12 left-6 cursor-pointer z-30"
              onClick={toggleInkColor}
              title={`Switch to ${state.settings.isRedInk ? "black" : "red"} ink`}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-[3px] border-[#8A7C4F] shadow-lg relative">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#8A7C4F] to-[#6B5F3E]" />
                <div className="absolute inset-4 rounded-full bg-[#1A1A1A] border border-[#0A0A0A]">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: `conic-gradient(from 0deg, #1A1A1A 0%, #1A1A1A ${ribbonPercentage}%, transparent ${ribbonPercentage}%)` }}
                  />
                </div>
                <div className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${state.settings.isRedInk ? "bg-red-700" : "bg-[#0A0A0A]"}`} />
              </div>
            </div>

            {/* Right ribbon spool */}
            <div className="absolute top-12 right-6 z-30">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-[3px] border-[#8A7C4F] shadow-lg relative">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#8A7C4F] to-[#6B5F3E]" />
                <div className="absolute inset-4 rounded-full bg-[#1A1A1A] border border-[#0A0A0A]" />
              </div>
            </div>

            {/* Margin bell */}
            <div className={`absolute top-8 right-24 w-6 h-6 rounded-full bg-gradient-radial from-[#D4AF37] to-[#8A7C4F] shadow-md z-30 ${marginBellRinging ? "animate-pulse" : ""}`} title="Margin Bell" />

            {/* Typebar fan (visual only) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[80px] overflow-hidden z-0" style={{ perspective: "300px" }}>
              {Array.from({ length: 44 }).map((_, i) => {
                const angle = (i - 22) * 3.5;
                const isActive = activeTypebar !== null && Math.abs(i - (activeTypebar.charCodeAt(0) - 97 + 22)) < 2;
                return (
                  <div
                    key={i}
                    className="absolute bottom-0 left-1/2 w-[6px] h-[70px] origin-bottom"
                    style={{
                      background: "linear-gradient(to top, #808080, #C0C0C0, #808080)",
                      transform: `translateX(-50%) rotateZ(${angle}deg) ${isActive ? "rotateX(-50deg)" : ""}`,
                      transition: isActive ? "transform 0.06s ease-out" : "none",
                      borderRadius: "2px",
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-4 bg-gradient-to-b from-[#A0A0A0] to-[#707070] rounded-sm" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyboard Section */}
          {viewMode !== "focus" && (
            <div className="relative z-40 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.1)] pt-4 pb-2 rounded-b-lg">
              <TypewriterKeyboard
                onKeyPress={handleKeyPress}
                onSpace={handleSpace}
                onShift={handleShift}
                onReturn={handleReturn}
                pressedKeys={state.pressedKeys}
                disabled={state.jamState.isJammed}
                isShiftPressed={isShiftPressed}
              />
            </div>
          )}
        </div>
      </div>

      {/* View mode buttons */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-50">
        {(["full", "focus", "desk"] as const).map((mode, index) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-[Special_Elite] transition-colors ${
              viewMode === mode ? "bg-[#8A7C4F] text-[#1A1A1A]" : "bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A]"
            }`}
            title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View (${index + 1})`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Stats button */}
      <button
        onClick={() => setShowStats(true)}
        className="absolute bottom-4 right-4 px-4 py-2 rounded bg-[#2A2A2A] text-[#8A7C4F] font-[Special_Elite] text-sm hover:bg-[#3A3A3A] transition-colors flex items-center gap-2 z-50"
      >
        <span>{state.stats.wordsTyped} words</span>
        <span className="text-[#6A6A6A]">|</span>
        <span>{getWPM()} WPM</span>
      </button>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors z-50"
        title="Settings (ESC)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A7C4F" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* Start prompt */}
      {!hasInteracted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-fade-in z-50 pointer-events-none">
          <p className="text-[#F2E8C9] font-[Special_Elite] text-lg mb-2">Click or press any key to begin</p>
          <p className="text-[#6A6A6A] font-[Special_Elite] text-sm">ESC for settings | 1-2-3 for views</p>
        </div>
      )}

      {/* Modals */}
      {state.jamState.isJammed && <JamModal key1={state.jamState.key1} key2={state.jamState.key2} onClear={clearJam} />}

      {showSettings && (
        <SettingsPanel
          settings={state.settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettings(false)}
          onExport={handleExport}
          inkRemaining={state.inkRemaining}
          inkCapacity={INK_RIBBON_CAPACITY}
          onChangeRibbon={changeRibbon}
        />
      )}

      {showStats && (
        <StatisticsPanel
          stats={state.stats}
          wpm={getWPM()}
          elapsedTime={getElapsedTime()}
          onClose={() => setShowStats(false)}
        />
      )}

      {state.showBackspaceTooltip && <BackspaceTooltip onDismiss={dismissBackspaceTooltip} />}
      {showPageFullPrompt && <PageFullTooltip onLoadNewSheet={handleLoadNewSheet} onDismiss={() => setShowPageFullPrompt(false)} />}
    </div>
  );
}
