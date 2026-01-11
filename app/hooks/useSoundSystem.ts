"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Sound URLs from Freesound.org (CC0 licensed placeholders)
// Structure allows easy replacement with custom sounds
const SOUND_URLS = {
  keystroke: [
    "https://cdn.freesound.org/previews/256/256117_4488812-lq.mp3", // typewriter key 1
    "https://cdn.freesound.org/previews/256/256116_4488812-lq.mp3", // typewriter key 2
    "https://cdn.freesound.org/previews/256/256115_4488812-lq.mp3", // typewriter key 3
  ],
  spacebar: "https://cdn.freesound.org/previews/256/256118_4488812-lq.mp3",
  carriageReturn: "https://cdn.freesound.org/previews/161/161644_2614628-lq.mp3",
  carriageAdvance: "https://cdn.freesound.org/previews/256/256114_4488812-lq.mp3",
  marginBell: "https://cdn.freesound.org/previews/411/411749_5121236-lq.mp3",
  typebarJam: "https://cdn.freesound.org/previews/352/352515_4019029-lq.mp3",
  paperLoad: "https://cdn.freesound.org/previews/240/240776_4284968-lq.mp3",
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

  // Specific sound playing functions
  const playKeystroke = useCallback(() => {
    playSound("keystroke", { pitchVariation: 0.05, volumeMultiplier: 0.8 });
  }, [playSound]);

  const playSpacebar = useCallback(() => {
    playSound("spacebar", { volumeMultiplier: 0.9 });
  }, [playSound]);

  const playCarriageReturn = useCallback(() => {
    playSound("carriageReturn", { volumeMultiplier: 1 });
  }, [playSound]);

  const playCarriageAdvance = useCallback(() => {
    playSound("carriageAdvance", { pitchVariation: 0.03, volumeMultiplier: 0.3 });
  }, [playSound]);

  const playMarginBell = useCallback(() => {
    playSound("marginBell", { volumeMultiplier: 0.6 });
  }, [playSound]);

  const playTypebarJam = useCallback(() => {
    playSound("typebarJam", { volumeMultiplier: 0.8 });
  }, [playSound]);

  const playPaperLoad = useCallback(() => {
    playSound("paperLoad", { volumeMultiplier: 0.7 });
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
