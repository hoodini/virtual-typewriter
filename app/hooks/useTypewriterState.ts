"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Constants
const CHARS_PER_LINE = 65;
const LINES_PER_PAGE = 28;
const MARGIN_BELL_OFFSET = 7; // Characters before right margin
const JAM_WINDOW_MS = 100; // Window for detecting adjacent key presses
const INK_RIBBON_CAPACITY = 800; // Characters before ribbon needs changing

// Adjacent keys on QWERTY layout that can cause jams
const ADJACENT_KEYS: Record<string, string[]> = {
  q: ["w", "a"],
  w: ["q", "e", "a", "s"],
  e: ["w", "r", "s", "d"],
  r: ["e", "t", "d", "f"],
  t: ["r", "y", "f", "g"],
  y: ["t", "u", "g", "h"],
  u: ["y", "i", "h", "j"],
  i: ["u", "o", "j", "k"],
  o: ["i", "p", "k", "l"],
  p: ["o", "l"],
  a: ["q", "w", "s", "z"],
  s: ["w", "e", "a", "d", "z", "x"],
  d: ["e", "r", "s", "f", "x", "c"],
  f: ["r", "t", "d", "g", "c", "v"],
  g: ["t", "y", "f", "h", "v", "b"],
  h: ["y", "u", "g", "j", "b", "n"],
  j: ["u", "i", "h", "k", "n", "m"],
  k: ["i", "o", "j", "l", "m"],
  l: ["o", "p", "k"],
  z: ["a", "s", "x"],
  x: ["z", "s", "d", "c"],
  c: ["x", "d", "f", "v"],
  v: ["c", "f", "g", "b"],
  b: ["v", "g", "h", "n"],
  n: ["b", "h", "j", "m"],
  m: ["n", "j", "k"],
};

export interface TypedCharacter {
  char: string;
  rotation: number; // -2 to 2 degrees
  offsetY: number; // -1 to 1 px
  inkDensity: "high" | "medium" | "low";
  hasGhost: boolean;
  isStrikethrough: boolean;
  isRedInk: boolean;
}

export interface TypewriterLine {
  characters: TypedCharacter[];
}

export interface TypewriterPage {
  lines: TypewriterLine[];
}

export interface JamState {
  isJammed: boolean;
  key1: string;
  key2: string;
}

export interface TypewriterStats {
  charactersTyped: number;
  wordsTyped: number;
  carriageReturns: number;
  jams: number;
  jamPairs: Record<string, number>;
  startTime: number | null;
}

export interface TypewriterSettings {
  housingColor: "forest-green" | "burgundy" | "black";
  paperType: "standard" | "coffee-stained" | "yellowed";
  inkDensity: "high" | "medium" | "low";
  soundEnabled: boolean;
  marginBellEnabled: boolean;
  jamSimulationEnabled: boolean;
  isRedInk: boolean;
}

export interface TypewriterState {
  pages: TypewriterPage[];
  currentPageIndex: number;
  currentLineIndex: number;
  currentCharIndex: number;
  carriagePosition: number;
  inkRemaining: number;
  jamState: JamState;
  stats: TypewriterStats;
  settings: TypewriterSettings;
  pressedKeys: Set<string>;
  lastKeyTime: number;
  lastKey: string;
  showBackspaceTooltip: boolean;
}

const DEFAULT_SETTINGS: TypewriterSettings = {
  housingColor: "forest-green",
  paperType: "standard",
  inkDensity: "high",
  soundEnabled: true,
  marginBellEnabled: true,
  jamSimulationEnabled: true,
  isRedInk: false,
};

const createEmptyPage = (): TypewriterPage => ({
  lines: [{ characters: [] }],
});

const createEmptyState = (): TypewriterState => ({
  pages: [createEmptyPage()],
  currentPageIndex: 0,
  currentLineIndex: 0,
  currentCharIndex: 0,
  carriagePosition: 0,
  inkRemaining: INK_RIBBON_CAPACITY,
  jamState: { isJammed: false, key1: "", key2: "" },
  stats: {
    charactersTyped: 0,
    wordsTyped: 0,
    carriageReturns: 0,
    jams: 0,
    jamPairs: {},
    startTime: null,
  },
  settings: DEFAULT_SETTINGS,
  pressedKeys: new Set(),
  lastKeyTime: 0,
  lastKey: "",
  showBackspaceTooltip: false,
});

export function useTypewriterState() {
  const [state, setState] = useState<TypewriterState>(createEmptyState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSettings = localStorage.getItem("typewriter-settings");
    const savedWork = localStorage.getItem("typewriter-work");

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, ...parsed },
        }));
      } catch {
        // Ignore invalid JSON
      }
    }

    if (savedWork) {
      try {
        const parsed = JSON.parse(savedWork);
        setState((prev) => ({
          ...prev,
          pages: parsed.pages || [createEmptyPage()],
          currentPageIndex: parsed.currentPageIndex || 0,
          currentLineIndex: parsed.currentLineIndex || 0,
          currentCharIndex: parsed.currentCharIndex || 0,
          carriagePosition: parsed.carriagePosition || 0,
          inkRemaining: parsed.inkRemaining || INK_RIBBON_CAPACITY,
          stats: { ...prev.stats, ...parsed.stats },
        }));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((settings: TypewriterSettings) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("typewriter-settings", JSON.stringify(settings));
  }, []);

  // Save work in progress
  const saveWork = useCallback(() => {
    if (typeof window === "undefined") return;
    const { pages, currentPageIndex, currentLineIndex, currentCharIndex, carriagePosition, inkRemaining, stats } = stateRef.current;
    localStorage.setItem(
      "typewriter-work",
      JSON.stringify({
        pages,
        currentPageIndex,
        currentLineIndex,
        currentCharIndex,
        carriagePosition,
        inkRemaining,
        stats,
      })
    );
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveWork, 30000);
    return () => clearInterval(interval);
  }, [saveWork]);

  // Generate character with imperfections
  const generateCharacter = useCallback(
    (char: string, isStrikethrough = false): TypedCharacter => {
      const { settings, inkRemaining } = stateRef.current;

      // Calculate ink density based on ribbon remaining and settings
      let inkDensity: "high" | "medium" | "low" = settings.inkDensity;
      if (inkRemaining < INK_RIBBON_CAPACITY * 0.3) {
        inkDensity = "low";
      } else if (inkRemaining < INK_RIBBON_CAPACITY * 0.6) {
        inkDensity = "medium";
      }

      // Add slight random variations
      const rotation = (Math.random() - 0.5) * 3; // -1.5 to 1.5 degrees
      const offsetY = (Math.random() - 0.5) * 1.5; // -0.75 to 0.75 px
      const hasGhost = Math.random() < 0.05; // 5% chance of ghost/double-strike

      return {
        char,
        rotation,
        offsetY,
        inkDensity,
        hasGhost,
        isStrikethrough,
        isRedInk: settings.isRedInk,
      };
    },
    []
  );

  // Check for typebar collision
  const checkForJam = useCallback((key: string): boolean => {
    const { lastKeyTime, lastKey, settings } = stateRef.current;

    if (!settings.jamSimulationEnabled) return false;

    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTime;

    if (timeSinceLastKey < JAM_WINDOW_MS && lastKey) {
      const lowerKey = key.toLowerCase();
      const lowerLastKey = lastKey.toLowerCase();

      // Check if keys are adjacent
      const adjacentToKey = ADJACENT_KEYS[lowerKey] || [];
      if (adjacentToKey.includes(lowerLastKey)) {
        return true;
      }
    }

    return false;
  }, []);

  // Type a character
  const typeCharacter = useCallback(
    (char: string): { shouldPlaySound: boolean; isMarginBell: boolean; isJammed: boolean } => {
      const currentState = stateRef.current;

      // Don't type if jammed
      if (currentState.jamState.isJammed) {
        return { shouldPlaySound: false, isMarginBell: false, isJammed: true };
      }

      // Check for jam
      if (checkForJam(char)) {
        setState((prev) => {
          const jamPairKey = [prev.lastKey.toLowerCase(), char.toLowerCase()].sort().join("-");
          return {
            ...prev,
            jamState: { isJammed: true, key1: prev.lastKey, key2: char },
            stats: {
              ...prev.stats,
              jams: prev.stats.jams + 1,
              jamPairs: {
                ...prev.stats.jamPairs,
                [jamPairKey]: (prev.stats.jamPairs[jamPairKey] || 0) + 1,
              },
            },
          };
        });
        return { shouldPlaySound: false, isMarginBell: false, isJammed: true };
      }

      // Start timer on first character
      if (currentState.stats.startTime === null) {
        setState((prev) => ({
          ...prev,
          stats: { ...prev.stats, startTime: Date.now() },
        }));
      }

      // Check for margin bell
      const isMarginBell =
        currentState.settings.marginBellEnabled &&
        currentState.carriagePosition === CHARS_PER_LINE - MARGIN_BELL_OFFSET;

      setState((prev) => {
        const newCharacter = generateCharacter(char);
        const newPages = [...prev.pages];
        const currentPage = newPages[prev.currentPageIndex];
        const currentLine = currentPage.lines[prev.currentLineIndex];

        // Add character to current line
        currentLine.characters.push(newCharacter);

        // Update word count (count words when space is typed after characters)
        const newWordsTyped =
          char === " " && currentLine.characters.length > 1 && currentLine.characters[currentLine.characters.length - 2].char !== " "
            ? prev.stats.wordsTyped + 1
            : prev.stats.wordsTyped;

        return {
          ...prev,
          pages: newPages,
          currentCharIndex: prev.currentCharIndex + 1,
          carriagePosition: prev.carriagePosition + 1,
          inkRemaining: Math.max(0, prev.inkRemaining - 1),
          lastKeyTime: Date.now(),
          lastKey: char,
          stats: {
            ...prev.stats,
            charactersTyped: prev.stats.charactersTyped + 1,
            wordsTyped: newWordsTyped,
          },
        };
      });

      return { shouldPlaySound: true, isMarginBell, isJammed: false };
    },
    [checkForJam, generateCharacter]
  );

  // Carriage return
  const carriageReturn = useCallback((): boolean => {
    const currentState = stateRef.current;

    // Don't return if jammed
    if (currentState.jamState.isJammed) {
      return false;
    }

    setState((prev) => {
      const newPages = [...prev.pages];
      const currentPage = newPages[prev.currentPageIndex];

      // Check if we need a new page
      if (prev.currentLineIndex >= LINES_PER_PAGE - 1) {
        // Page is full
        return prev;
      }

      // Add new line
      currentPage.lines.push({ characters: [] });

      return {
        ...prev,
        pages: newPages,
        currentLineIndex: prev.currentLineIndex + 1,
        currentCharIndex: 0,
        carriagePosition: 0,
        lastKeyTime: Date.now(),
        lastKey: "",
        stats: {
          ...prev.stats,
          carriageReturns: prev.stats.carriageReturns + 1,
        },
      };
    });

    return true;
  }, []);

  // Backspace (overstrike)
  const backspace = useCallback((): { shouldShowTooltip: boolean } => {
    const currentState = stateRef.current;

    // Don't backspace if jammed
    if (currentState.jamState.isJammed) {
      return { shouldShowTooltip: false };
    }

    // Can't backspace at beginning of line
    if (currentState.carriagePosition === 0) {
      return { shouldShowTooltip: false };
    }

    // Check if we should show the tooltip (first backspace)
    const shouldShowTooltip = !currentState.showBackspaceTooltip;

    setState((prev) => {
      const newPages = [...prev.pages];
      const currentPage = newPages[prev.currentPageIndex];
      const currentLine = currentPage.lines[prev.currentLineIndex];

      // Mark last character as strikethrough
      if (currentLine.characters.length > 0) {
        const lastChar = currentLine.characters[currentLine.characters.length - 1];
        lastChar.isStrikethrough = true;
      }

      return {
        ...prev,
        pages: newPages,
        carriagePosition: Math.max(0, prev.carriagePosition - 1),
        showBackspaceTooltip: true,
      };
    });

    return { shouldShowTooltip };
  }, []);

  // Clear jam
  const clearJam = useCallback(() => {
    setState((prev) => ({
      ...prev,
      jamState: { isJammed: false, key1: "", key2: "" },
      lastKeyTime: 0,
      lastKey: "",
    }));
  }, []);

  // Change ribbon
  const changeRibbon = useCallback(() => {
    setState((prev) => ({
      ...prev,
      inkRemaining: INK_RIBBON_CAPACITY,
    }));
  }, []);

  // Toggle red/black ink
  const toggleInkColor = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, isRedInk: !prev.settings.isRedInk },
    }));
  }, []);

  // Load new sheet
  const loadNewSheet = useCallback(() => {
    setState((prev) => {
      const newPages = [...prev.pages, createEmptyPage()];
      return {
        ...prev,
        pages: newPages,
        currentPageIndex: newPages.length - 1,
        currentLineIndex: 0,
        currentCharIndex: 0,
        carriagePosition: 0,
      };
    });
  }, []);

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<TypewriterSettings>) => {
      setState((prev) => {
        const updatedSettings = { ...prev.settings, ...newSettings };
        saveSettings(updatedSettings);
        return {
          ...prev,
          settings: updatedSettings,
        };
      });
    },
    [saveSettings]
  );

  // Check if page is full
  const isPageFull = useCallback((): boolean => {
    const { currentLineIndex } = stateRef.current;
    return currentLineIndex >= LINES_PER_PAGE - 1;
  }, []);

  // Get current text as string
  const getCurrentText = useCallback((): string => {
    const { pages, currentPageIndex } = stateRef.current;
    const page = pages[currentPageIndex];
    return page.lines.map((line) => line.characters.map((c) => c.char).join("")).join("\n");
  }, []);

  // Calculate WPM
  const getWPM = useCallback((): number => {
    const { stats } = stateRef.current;
    if (!stats.startTime) return 0;

    const minutes = (Date.now() - stats.startTime) / 60000;
    if (minutes < 0.1) return 0;

    return Math.round(stats.wordsTyped / minutes);
  }, []);

  // Get elapsed time formatted
  const getElapsedTime = useCallback((): string => {
    const { stats } = stateRef.current;
    if (!stats.startTime) return "0:00";

    const seconds = Math.floor((Date.now() - stats.startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Clear current page
  const clearCurrentPage = useCallback(() => {
    setState((prev) => {
      const newPages = [...prev.pages];
      newPages[prev.currentPageIndex] = createEmptyPage();
      return {
        ...prev,
        pages: newPages,
        currentLineIndex: 0,
        currentCharIndex: 0,
        carriagePosition: 0,
      };
    });
  }, []);

  // Key press tracking
  const setKeyPressed = useCallback((key: string, pressed: boolean) => {
    setState((prev) => {
      const newPressedKeys = new Set(prev.pressedKeys);
      if (pressed) {
        newPressedKeys.add(key.toLowerCase());
      } else {
        newPressedKeys.delete(key.toLowerCase());
      }
      return { ...prev, pressedKeys: newPressedKeys };
    });
  }, []);

  // Dismiss backspace tooltip
  const dismissBackspaceTooltip = useCallback(() => {
    setState((prev) => ({ ...prev, showBackspaceTooltip: false }));
  }, []);

  return {
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
    getCurrentText,
    getWPM,
    getElapsedTime,
    clearCurrentPage,
    setKeyPressed,
    dismissBackspaceTooltip,
    saveWork,
    CHARS_PER_LINE,
    LINES_PER_PAGE,
    INK_RIBBON_CAPACITY,
  };
}
