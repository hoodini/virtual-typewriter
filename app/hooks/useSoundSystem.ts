"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sound configuration - using local authentic typewriter sound
const SOUND_URLS = {
  keystroke: [
    "/audio/single_typing.mp3", // Authentic typewriter keystroke
  ],
  spacebar: "/audio/single_typing.mp3",
  carriageReturn: "/audio/single_typing.mp3", // Use same sound with different pitch
  carriageAdvance: "/audio/single_typing.mp3",
  marginBell: "/audio/single_typing.mp3", // Higher pitch for bell effect
  typebarJam: "/audio/single_typing.mp3", // Lower pitch for jam
  paperLoad: "/audio/single_typing.mp3",
};

interface SoundSystemState {
  isLoaded: boolean;
  isMuted: boolean;
  volume: number;
}

export function useSoundSystem() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer[]>>(new Map());
  const [state, setState] = useState<SoundSystemState>({
    isLoaded: false,
    isMuted: false,
    volume: 0.7,
  });

  // Initialize audio context on user interaction
  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = state.volume;

      // Preload all sounds
      await loadAllSounds();
      setState((prev) => ({ ...prev, isLoaded: true }));
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }, [state.volume]);

  // Load a single sound file
  const loadSound = useCallback(async (url: string): Promise<AudioBuffer | null> => {
    if (!audioContextRef.current) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContextRef.current.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Failed to load sound: ${url}`, error);
      return null;
    }
  }, []);

  // Load all sounds
  const loadAllSounds = useCallback(async () => {
    const loadPromises: Promise<void>[] = [];

    // Load keystroke variations
    const keystrokeBuffers: AudioBuffer[] = [];
    for (const url of SOUND_URLS.keystroke) {
      loadPromises.push(
        loadSound(url).then((buffer) => {
          if (buffer) keystrokeBuffers.push(buffer);
        })
      );
    }

    // Load other sounds
    const soundKeys = Object.keys(SOUND_URLS).filter((key) => key !== "keystroke") as (keyof typeof SOUND_URLS)[];

    for (const key of soundKeys) {
      const url = SOUND_URLS[key];
      if (typeof url === "string") {
        loadPromises.push(
          loadSound(url).then((buffer) => {
            if (buffer) buffersRef.current.set(key, [buffer]);
          })
        );
      }
    }

    await Promise.all(loadPromises);
    buffersRef.current.set("keystroke", keystrokeBuffers);
  }, [loadSound]);

  // Play a sound by name
  const playSound = useCallback(
    (name: keyof typeof SOUND_URLS, options?: { pitchVariation?: number; volumeMultiplier?: number }) => {
      if (!audioContextRef.current || !gainNodeRef.current || state.isMuted) return;

      const buffers = buffersRef.current.get(name);
      if (!buffers || buffers.length === 0) return;

      // Pick a random buffer for keystroke variations
      const buffer = buffers[Math.floor(Math.random() * buffers.length)];

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;

      // Add slight pitch variation for more natural sound
      if (options?.pitchVariation) {
        source.playbackRate.value = 1 + (Math.random() - 0.5) * options.pitchVariation;
      }

      // Create a gain node for this specific sound
      const soundGain = audioContextRef.current.createGain();
      soundGain.gain.value = options?.volumeMultiplier || 1;

      source.connect(soundGain);
      soundGain.connect(gainNodeRef.current);

      source.start(0);
    },
    [state.isMuted]
  );

  // Specific sound playing functions with pitch variations for variety
  const playKeystroke = useCallback(() => {
    playSound("keystroke", { pitchVariation: 0.15, volumeMultiplier: 0.9 });
  }, [playSound]);

  const playSpacebar = useCallback(() => {
    playSound("spacebar", { pitchVariation: 0.1, volumeMultiplier: 1.0 });
  }, [playSound]);

  const playCarriageReturn = useCallback(() => {
    playSound("carriageReturn", { pitchVariation: 0.2, volumeMultiplier: 0.8 });
  }, [playSound]);

  const playCarriageAdvance = useCallback(() => {
    playSound("carriageAdvance", { pitchVariation: 0.1, volumeMultiplier: 0.4 });
  }, [playSound]);

  const playMarginBell = useCallback(() => {
    playSound("marginBell", { pitchVariation: 0.3, volumeMultiplier: 0.7 });
  }, [playSound]);

  const playTypebarJam = useCallback(() => {
    playSound("typebarJam", { pitchVariation: 0.05, volumeMultiplier: 1.0 });
  }, [playSound]);

  const playPaperLoad = useCallback(() => {
    playSound("paperLoad", { pitchVariation: 0.2, volumeMultiplier: 0.6 });
  }, [playSound]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setState((prev) => ({ ...prev, volume: clampedVolume }));
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    ...state,
    initAudio,
    playKeystroke,
    playSpacebar,
    playCarriageReturn,
    playCarriageAdvance,
    playMarginBell,
    playTypebarJam,
    playPaperLoad,
    setVolume,
    toggleMute,
  };
}
