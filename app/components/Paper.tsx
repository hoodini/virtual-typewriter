"use client";

import { useCallback, useMemo, useRef } from "react";
import type { TypewriterPage, TypedCharacter, TypewriterSettings } from "../hooks/useTypewriterState";

interface PaperProps {
  page: TypewriterPage;
  currentLineIndex: number;
  currentCharIndex: number;
  settings: TypewriterSettings;
  charsPerLine: number;
  linesPerPage: number;
}

export function Paper({
  page,
  currentLineIndex,
  currentCharIndex,
  settings,
  charsPerLine,
  linesPerPage,
}: PaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  // Get paper texture class
  const paperClass = useMemo(() => {
    switch (settings.paperType) {
      case "coffee-stained":
        return "coffee-stained";
      case "yellowed":
        return "yellowed";
      default:
        return "";
    }
  }, [settings.paperType]);

  // Render a single character
  const renderCharacter = useCallback((char: TypedCharacter, index: number) => {
    const style: React.CSSProperties = {
      "--char-rotation": `${char.rotation}deg`,
      "--char-offset": `${char.offsetY}px`,
    } as React.CSSProperties;

    const classes = [
      "typed-char",
      `ink-${char.inkDensity}`,
      char.rotation !== 0 ? "slight-rotate" : "",
      char.offsetY !== 0 ? "slight-offset" : "",
      char.hasGhost ? "ghost" : "",
      char.isStrikethrough ? "strikethrough" : "",
      char.isRedInk ? "red-ink" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span
        key={index}
        className={classes}
        style={style}
        data-char={char.char}
      >
        {char.char}
      </span>
    );
  }, []);

  // Calculate visible lines (scroll to keep current line in view)
  const visibleStartLine = useMemo(() => {
    const maxVisibleLines = 20;
    if (currentLineIndex < maxVisibleLines) return 0;
    return currentLineIndex - maxVisibleLines + 5;
  }, [currentLineIndex]);

  return (
    <div className="relative w-full h-full flex justify-center">
      {/* Paper sheet */}
      <div
        ref={paperRef}
        className={`paper ${paperClass} w-[600px] h-[720px] p-8 overflow-hidden relative`}
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.3), 2px 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Paper texture noise overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-noise" />

        {/* Line height guides (faint) */}
        <div className="absolute inset-8 pointer-events-none">
          {Array.from({ length: linesPerPage }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full border-b border-[#C9B896] opacity-10"
              style={{ top: `${i * 24}px` }}
            />
          ))}
        </div>

        {/* Left margin line */}
        <div
          className="absolute top-0 bottom-0 left-12 w-px bg-[#D4A5A5] opacity-30"
          style={{ boxShadow: "1px 0 0 rgba(212, 165, 165, 0.1)" }}
        />

        {/* Typed content */}
        <div className="typed-text relative z-10">
          {page.lines.slice(visibleStartLine).map((line, lineIndex) => {
            const actualLineIndex = visibleStartLine + lineIndex;
            const isCurrentLine = actualLineIndex === currentLineIndex;

            return (
              <div
                key={actualLineIndex}
                className="h-6 relative"
                style={{ minHeight: "24px" }}
              >
                {/* Line content */}
                <span className="whitespace-pre">
                  {line.characters.map((char, charIndex) =>
                    renderCharacter(char, charIndex)
                  )}
                </span>

                {/* Cursor (blinking underscore at current position) */}
                {isCurrentLine && (
                  <span
                    className="inline-block w-[10px] h-[2px] bg-[#1A1A1A] animate-pulse"
                    style={{
                      verticalAlign: "baseline",
                      marginBottom: "2px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Paper curl effect */}
        <div className="paper-curl" />

        {/* Page number (bottom right) */}
        <div className="absolute bottom-4 right-4 text-xs text-[#8B7355] opacity-50 font-[Special_Elite]">
          {currentLineIndex + 1} / {linesPerPage}
        </div>
      </div>
    </div>
  );
}

// Component for exporting paper as image
interface ExportablePaperProps {
  page: TypewriterPage;
  settings: TypewriterSettings;
  charsPerLine: number;
  linesPerPage: number;
}

export function ExportablePaper({ page, settings, charsPerLine, linesPerPage }: ExportablePaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  const paperClass = useMemo(() => {
    switch (settings.paperType) {
      case "coffee-stained":
        return "coffee-stained";
      case "yellowed":
        return "yellowed";
      default:
        return "";
    }
  }, [settings.paperType]);

  const renderCharacter = useCallback((char: TypedCharacter, index: number) => {
    const style: React.CSSProperties = {
      "--char-rotation": `${char.rotation}deg`,
      "--char-offset": `${char.offsetY}px`,
    } as React.CSSProperties;

    const classes = [
      "typed-char",
      `ink-${char.inkDensity}`,
      char.rotation !== 0 ? "slight-rotate" : "",
      char.offsetY !== 0 ? "slight-offset" : "",
      char.hasGhost ? "ghost" : "",
      char.isStrikethrough ? "strikethrough" : "",
      char.isRedInk ? "red-ink" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span key={index} className={classes} style={style} data-char={char.char}>
        {char.char}
      </span>
    );
  }, []);

  return (
    <div
      ref={paperRef}
      id="exportable-paper"
      className={`paper ${paperClass}`}
      style={{
        width: "8.5in",
        height: "11in",
        padding: "1in",
        backgroundColor: settings.paperType === "coffee-stained" ? "#E6D5B8" : settings.paperType === "yellowed" ? "#E8DCC4" : "#F2E8C9",
      }}
    >
      <div className="typed-text">
        {page.lines.map((line, lineIndex) => (
          <div key={lineIndex} className="h-6">
            <span className="whitespace-pre">
              {line.characters.map((char, charIndex) => renderCharacter(char, charIndex))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
