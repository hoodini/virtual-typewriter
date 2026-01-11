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
    saveWork,
    CHARS_PER_LINE,
    LINES_PER_PAGE,
    INK_RIBBON_CAPACITY,
  } = useTypewriterState();

  const {
    isLoaded: soundLoaded,
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
        if (state.settings.soundEnabled) {
          playTypebarJam();
        }
        return;
      }

      // Check if page is full
      if (isPageFull() && state.carriagePosition >= CHARS_PER_LINE - 1) {
        setShowPageFullPrompt(true);
        return;
      }

      // Animate typebar
      setActiveTypebar(char.toLowerCase());
      setTimeout(() => setActiveTypebar(null), 80);

      const result = typeCharacter(char);

      if (result.isJammed) {
        if (state.settings.soundEnabled) {
          playTypebarJam();
        }
        return;
      }

      if (result.shouldPlaySound && state.settings.soundEnabled) {
        playKeystroke();
        playCarriageAdvance();
      }

      if (result.isMarginBell && state.settings.soundEnabled) {
        playMarginBell();
        setMarginBellRinging(true);
        setTimeout(() => setMarginBellRinging(false), 300);
      }
    },
    [
      handleFirstInteraction,
      state.jamState.isJammed,
      state.carriagePosition,
      state.settings.soundEnabled,
      isPageFull,
      typeCharacter,
      playKeystroke,
      playCarriageAdvance,
      playMarginBell,
      playTypebarJam,
      CHARS_PER_LINE,
    ]
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
      playCarriageAdvance();
    }

    if (result.isMarginBell && state.settings.soundEnabled) {
      playMarginBell();
      setMarginBellRinging(true);
      setTimeout(() => setMarginBellRinging(false), 300);
    }
  }, [
    handleFirstInteraction,
    state.jamState.isJammed,
    state.carriagePosition,
    state.settings.soundEnabled,
    isPageFull,
    typeCharacter,
    playSpacebar,
    playCarriageAdvance,
    playMarginBell,
    CHARS_PER_LINE,
  ]);

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
  }, [
    handleFirstInteraction,
    state.jamState.isJammed,
    isPageFull,
    carriageReturn,
    state.settings.soundEnabled,
    playCarriageReturn,
  ]);

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
      // Don't handle if settings or modals are open
      if (showSettings || showStats) {
        if (e.key === "Escape") {
          setShowSettings(false);
          setShowStats(false);
        }
        return;
      }

      // Handle Escape - open settings
      if (e.key === "Escape") {
        if (state.jamState.isJammed) {
          clearJam();
        } else {
          setShowSettings(true);
        }
        return;
      }

      // Handle view mode switching (1, 2, 3)
      if (e.key === "1" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setViewMode("full");
        return;
      }
      if (e.key === "2" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setViewMode("focus");
        return;
      }
      if (e.key === "3" && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setViewMode("desk");
        return;
      }

      // Track pressed keys
      setKeyPressed(e.key, true);

      // Handle shift
      if (e.key === "Shift") {
        setIsShiftPressed(true);
        return;
      }

      // Handle Enter/Return
      if (e.key === "Enter") {
        e.preventDefault();
        handleReturn();
        return;
      }

      // Handle Backspace
      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Handle Space
      if (e.key === " ") {
        e.preventDefault();
        handleSpace();
        return;
      }

      // Handle printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeyPressed(e.key, false);

      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    showSettings,
    showStats,
    state.jamState.isJammed,
    clearJam,
    setKeyPressed,
    handleKeyPress,
    handleSpace,
    handleReturn,
    handleBackspace,
  ]);

  // Export current page as image
  const handleExport = useCallback(async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const paperElement = document.querySelector(".paper");
      if (!paperElement) return;

      const canvas = await html2canvas(paperElement as HTMLElement, {
        backgroundColor: null,
        scale: 2,
      });

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
    if (state.settings.soundEnabled) {
      playPaperLoad();
    }
  }, [loadNewSheet, state.settings.soundEnabled, playPaperLoad]);

  // Get housing class based on color setting
  const housingClass =
    state.settings.housingColor === "burgundy"
      ? "burgundy"
      : state.settings.housingColor === "black"
      ? "black"
      : "";

  // Calculate carriage offset for animation
  const carriageOffset = state.carriagePosition * 9.2; // Approximate character width

  // Get current page
  const currentPage = state.pages[state.currentPageIndex];

  // Ribbon remaining percentage
  const ribbonPercentage = (state.inkRemaining / INK_RIBBON_CAPACITY) * 100;

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden relative"
      onClick={handleFirstInteraction}
    >
      {/* Background - desk surface with warm lighting */}
      <div className="absolute inset-0 desk-surface">
        {/* Lamp glow effect */}
        <div className="lamp-glow" style={{ top: "-200px", left: "-100px" }} />
        <div className="lamp-glow" style={{ top: "100px", right: "-200px", opacity: 0.3 }} />
      </div>

      {/* Main typewriter container */}
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center transition-transform duration-500 ${
          viewMode === "desk" ? "scale-75" : viewMode === "focus" ? "translate-y-[-120px]" : ""
        }`}
      >
        {/* Typewriter body */}
        <div
          className={`typewriter-housing ${housingClass} relative`}
          style={{
            width: viewMode === "focus" ? "650px" : "800px",
            height: viewMode === "focus" ? "auto" : "600px",
            padding: "20px",
            transition: "all 0.5s ease",
          }}
        >
          {/* Brass trim top */}
          <div className="brass-trim absolute top-0 left-8 right-8 h-2 rounded-t-sm" />

          {/* Paper and platen area */}
          <div
            className={`relative mb-4 ${viewMode === "focus" ? "" : "h-[350px]"}`}
            style={{
              opacity: viewMode !== "focus" ? 1 : 1,
            }}
          >
            {/* Platen (roller) */}
            {viewMode !== "focus" && (
              <div className="platen absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-6 rounded-full z-10" />
            )}

            {/* Paper guide rails */}
            {viewMode !== "focus" && (
              <>
                <div className="absolute top-6 left-[70px] w-1 h-[320px] bg-gradient-to-b from-[#8A7C4F] to-[#6B5F3E] rounded-full opacity-60" />
                <div className="absolute top-6 right-[70px] w-1 h-[320px] bg-gradient-to-b from-[#8A7C4F] to-[#6B5F3E] rounded-full opacity-60" />
              </>
            )}

            {/* Carriage with ruler */}
            {viewMode !== "focus" && (
              <div
                className={`carriage absolute top-2 left-1/2 w-[620px] h-4 -translate-x-1/2 z-20 ${
                  carriageReturning ? "transition-transform duration-400" : "transition-transform duration-50"
                }`}
                style={{
                  transform: `translateX(calc(-50% + ${carriageReturning ? 0 : -carriageOffset}px))`,
                }}
              >
                <div className="carriage-ruler w-full h-full rounded" />
                {/* Carriage return lever */}
                <div
                  className="carriage-return-lever absolute -left-8 top-0 w-20 h-3 cursor-pointer"
                  onClick={handleReturn}
                  title="Carriage Return (Enter)"
                />
              </div>
            )}

            {/* Paper */}
            <div
              className={`relative z-0 ${viewMode === "focus" ? "" : "mt-8"}`}
              style={{
                transform: viewMode === "focus" ? "scale(1.1)" : "scale(0.85)",
                transformOrigin: "top center",
              }}
            >
              <Paper
                page={currentPage}
                currentLineIndex={state.currentLineIndex}
                currentCharIndex={state.currentCharIndex}
                settings={state.settings}
                charsPerLine={CHARS_PER_LINE}
                linesPerPage={LINES_PER_PAGE}
              />
            </div>

            {/* Ribbon spools */}
            {viewMode !== "focus" && (
              <>
                <div
                  className="ribbon-spool absolute top-16 left-8 cursor-pointer"
                  onClick={toggleInkColor}
                  title={`Switch to ${state.settings.isRedInk ? "black" : "red"} ink`}
                >
                  <div className="ribbon-amount">
                    <div
                      className="ribbon-fill"
                      style={{ "--ribbon-remaining": `${ribbonPercentage}%` } as React.CSSProperties}
                    />
                  </div>
                  {/* Red indicator */}
                  <div
                    className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                      state.settings.isRedInk ? "bg-red-800" : "bg-[#1A1A1A]"
                    }`}
                  />
                </div>
                <div className="ribbon-spool absolute top-16 right-8">
                  <div className="ribbon-amount" />
                </div>
              </>
            )}

            {/* Margin bell */}
            {viewMode !== "focus" && (
              <div
                className={`margin-bell absolute top-8 right-16 ${marginBellRinging ? "ringing" : ""}`}
                title="Margin Bell"
              />
            )}

            {/* Typebars (simplified visual) */}
            {viewMode !== "focus" && (
              <div className="typebar-container absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-20 overflow-hidden">
                {/* Fan of typebars */}
                {Array.from({ length: 42 }).map((_, i) => {
                  const angle = (i - 21) * 4;
                  const isActive = activeTypebar !== null && i === activeTypebar.charCodeAt(0) - 97 + 10;
                  return (
                    <div
                      key={i}
                      className={`typebar ${isActive ? "striking" : ""}`}
                      style={{
                        left: "50%",
                        transform: `translateX(-50%) rotate(${angle}deg)`,
                      }}
                    >
                      <div className="typebar-head" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keyboard */}
          {viewMode !== "focus" && (
            <div className="relative z-30 mt-4">
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

      {/* View mode indicator */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {(["full", "focus", "desk"] as const).map((mode, index) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-[Special_Elite] transition-colors ${
              viewMode === mode
                ? "bg-[#8A7C4F] text-[#1A1A1A]"
                : "bg-[#2A2A2A] text-[#8A8A8A] hover:bg-[#3A3A3A]"
            }`}
            title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View (${index + 1})`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Quick stats indicator */}
      <button
        onClick={() => setShowStats(true)}
        className="absolute bottom-4 right-4 px-4 py-2 rounded bg-[#2A2A2A] text-[#8A7C4F] font-[Special_Elite] text-sm hover:bg-[#3A3A3A] transition-colors flex items-center gap-2"
      >
        <span>{state.stats.wordsTyped} words</span>
        <span className="text-[#6A6A6A]">|</span>
        <span>{getWPM()} WPM</span>
      </button>

      {/* Settings button (gear icon) */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors"
        title="Settings (ESC)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8A7C4F"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {/* Help text */}
      {!hasInteracted && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-fade-in z-50">
          <p className="text-[#F2E8C9] font-[Special_Elite] text-lg mb-2">Click or press any key to begin</p>
          <p className="text-[#6A6A6A] font-[Special_Elite] text-sm">ESC for settings | 1-2-3 for views</p>
        </div>
      )}

      {/* Modals and overlays */}
      {state.jamState.isJammed && (
        <JamModal key1={state.jamState.key1} key2={state.jamState.key2} onClear={clearJam} />
      )}

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

      {showPageFullPrompt && (
        <PageFullTooltip onLoadNewSheet={handleLoadNewSheet} onDismiss={() => setShowPageFullPrompt(false)} />
      )}
    </div>
  );
}
