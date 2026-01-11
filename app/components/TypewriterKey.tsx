"use client";

import { useCallback, useEffect, useState } from "react";

interface TypewriterKeyProps {
  keyLabel: string;
  keyCode: string;
  onPress: (char: string) => void;
  isPressed?: boolean;
  className?: string;
  size?: "normal" | "wide" | "extra-wide";
  disabled?: boolean;
}

export function TypewriterKey({
  keyLabel,
  keyCode,
  onPress,
  isPressed = false,
  className = "",
  size = "normal",
  disabled = false,
}: TypewriterKeyProps) {
  const [localPressed, setLocalPressed] = useState(false);
  const showPressed = isPressed || localPressed;

  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setLocalPressed(true);
    onPress(keyCode);
  }, [disabled, keyCode, onPress]);

  const handleMouseUp = useCallback(() => {
    setLocalPressed(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setLocalPressed(false);
  }, []);

  // Handle touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (disabled) return;
      setLocalPressed(true);
      onPress(keyCode);
    },
    [disabled, keyCode, onPress]
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setLocalPressed(false);
  }, []);

  const sizeClass = size === "wide" ? "wide" : size === "extra-wide" ? "extra-wide" : "";

  return (
    <button
      type="button"
      className={`typewriter-key ${sizeClass} ${showPressed ? "pressed" : ""} ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled}
      aria-label={`Type ${keyLabel}`}
    >
      <span className="relative z-10 pointer-events-none select-none">{keyLabel}</span>
    </button>
  );
}

// Keyboard layout for full QWERTY
export const KEYBOARD_LAYOUT = {
  row1: [
    { label: "1", code: "1" },
    { label: "2", code: "2" },
    { label: "3", code: "3" },
    { label: "4", code: "4" },
    { label: "5", code: "5" },
    { label: "6", code: "6" },
    { label: "7", code: "7" },
    { label: "8", code: "8" },
    { label: "9", code: "9" },
    { label: "0", code: "0" },
    { label: "-", code: "-" },
    { label: "=", code: "=" },
  ],
  row2: [
    { label: "Q", code: "q" },
    { label: "W", code: "w" },
    { label: "E", code: "e" },
    { label: "R", code: "r" },
    { label: "T", code: "t" },
    { label: "Y", code: "y" },
    { label: "U", code: "u" },
    { label: "I", code: "i" },
    { label: "O", code: "o" },
    { label: "P", code: "p" },
  ],
  row3: [
    { label: "A", code: "a" },
    { label: "S", code: "s" },
    { label: "D", code: "d" },
    { label: "F", code: "f" },
    { label: "G", code: "g" },
    { label: "H", code: "h" },
    { label: "J", code: "j" },
    { label: "K", code: "k" },
    { label: "L", code: "l" },
    { label: ";", code: ";" },
    { label: "'", code: "'" },
  ],
  row4: [
    { label: "Z", code: "z" },
    { label: "X", code: "x" },
    { label: "C", code: "c" },
    { label: "V", code: "v" },
    { label: "B", code: "b" },
    { label: "N", code: "n" },
    { label: "M", code: "m" },
    { label: ",", code: "," },
    { label: ".", code: "." },
    { label: "/", code: "/" },
  ],
};

interface TypewriterKeyboardProps {
  onKeyPress: (char: string) => void;
  onSpace: () => void;
  onShift: (pressed: boolean) => void;
  onReturn: () => void;
  pressedKeys: Set<string>;
  disabled?: boolean;
  isShiftPressed?: boolean;
}

export function TypewriterKeyboard({
  onKeyPress,
  onSpace,
  onShift,
  onReturn,
  pressedKeys,
  disabled = false,
  isShiftPressed = false,
}: TypewriterKeyboardProps) {
  const getDisplayLabel = (label: string) => {
    if (!isShiftPressed) return label;

    // Shift mappings
    const shiftMap: Record<string, string> = {
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ":",
      "'": '"',
      ",": "<",
      ".": ">",
      "/": "?",
    };

    return shiftMap[label] || label;
  };

  const handleKeyPress = useCallback(
    (code: string) => {
      let char = code;

      // Apply shift transformation
      if (isShiftPressed) {
        const shiftMap: Record<string, string> = {
          "1": "!",
          "2": "@",
          "3": "#",
          "4": "$",
          "5": "%",
          "6": "^",
          "7": "&",
          "8": "*",
          "9": "(",
          "0": ")",
          "-": "_",
          "=": "+",
          ";": ":",
          "'": '"',
          ",": "<",
          ".": ">",
          "/": "?",
        };
        char = shiftMap[code] || code.toUpperCase();
      }

      onKeyPress(char);
    },
    [isShiftPressed, onKeyPress]
  );

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Number row */}
      <div className="flex gap-1">
        {KEYBOARD_LAYOUT.row1.map(({ label, code }) => (
          <TypewriterKey
            key={code}
            keyLabel={getDisplayLabel(label)}
            keyCode={code}
            onPress={handleKeyPress}
            isPressed={pressedKeys.has(code)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* QWERTY row */}
      <div className="flex gap-1 ml-4">
        {KEYBOARD_LAYOUT.row2.map(({ label, code }) => (
          <TypewriterKey
            key={code}
            keyLabel={isShiftPressed ? label : label.toLowerCase()}
            keyCode={code}
            onPress={handleKeyPress}
            isPressed={pressedKeys.has(code)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* ASDF row */}
      <div className="flex gap-1 ml-8">
        {KEYBOARD_LAYOUT.row3.map(({ label, code }) => (
          <TypewriterKey
            key={code}
            keyLabel={isShiftPressed && label.length === 1 && label.match(/[a-z]/i) ? label : getDisplayLabel(label)}
            keyCode={code}
            onPress={handleKeyPress}
            isPressed={pressedKeys.has(code)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* ZXCV row with Shift */}
      <div className="flex gap-1 items-center">
        <TypewriterKey
          keyLabel="SHIFT"
          keyCode="shift"
          onPress={() => onShift(true)}
          isPressed={isShiftPressed}
          size="wide"
          disabled={disabled}
        />
        {KEYBOARD_LAYOUT.row4.map(({ label, code }) => (
          <TypewriterKey
            key={code}
            keyLabel={isShiftPressed && label.length === 1 && label.match(/[a-z]/i) ? label : getDisplayLabel(label)}
            keyCode={code}
            onPress={handleKeyPress}
            isPressed={pressedKeys.has(code)}
            disabled={disabled}
          />
        ))}
        <TypewriterKey
          keyLabel="RETURN"
          keyCode="return"
          onPress={onReturn}
          isPressed={pressedKeys.has("enter")}
          size="wide"
          disabled={disabled}
        />
      </div>

      {/* Space bar row */}
      <div className="flex gap-1 items-center mt-1">
        <TypewriterKey
          keyLabel="SPACE"
          keyCode="space"
          onPress={onSpace}
          isPressed={pressedKeys.has(" ")}
          size="extra-wide"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
