import { create } from "zustand";
import { persist } from "zustand/middleware";

export const INSTRUMENTS = [
  "kick",
  "snare",
  "closedHat",
  "openHat",
  "clap",
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number];

export const INSTRUMENT_LABELS: Record<InstrumentId, string> = {
  kick: "Kick",
  snare: "Snare",
  closedHat: "Closed Hat",
  openHat: "Open Hat",
  clap: "Clap",
};

export type ChannelParams = {
  pitch: number;
  decay: number;
  volume: number;
};

export type Pattern = Record<InstrumentId, boolean[]>;

const STEPS = 16;

function emptyPattern(): Pattern {
  return {
    kick: Array(STEPS).fill(false),
    snare: Array(STEPS).fill(false),
    closedHat: Array(STEPS).fill(false),
    openHat: Array(STEPS).fill(false),
    clap: Array(STEPS).fill(false),
  };
}

function defaultChannelParams(): ChannelParams {
  return { pitch: 0.5, decay: 0.45, volume: 0.75 };
}

export type CircuitState = {
  bpm: number;
  masterVolume: number;
  isPlaying: boolean;
  playheadStep: number;
  pattern: Pattern;
  channels: Record<InstrumentId, ChannelParams>;
  setBpm: (bpm: number) => void;
  setMasterVolume: (v: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlayheadStep: (step: number) => void;
  toggleStep: (instrument: InstrumentId, step: number) => void;
  setChannelParam: (
    instrument: InstrumentId,
    key: keyof ChannelParams,
    value: number,
  ) => void;
};

export const useStore = create<CircuitState>()(
  persist(
    (set) => ({
      bpm: 120,
      masterVolume: 0.8,
      isPlaying: false,
      playheadStep: -1,
      pattern: emptyPattern(),
      channels: {
        kick: defaultChannelParams(),
        snare: defaultChannelParams(),
        closedHat: { pitch: 0.65, decay: 0.25, volume: 0.55 },
        openHat: { pitch: 0.55, decay: 0.72, volume: 0.5 },
        clap: defaultChannelParams(),
      },
      setBpm: (bpm) => set({ bpm: Math.min(200, Math.max(30, Math.round(bpm))) }),
      setMasterVolume: (masterVolume) =>
        set({ masterVolume: Math.min(1, Math.max(0, masterVolume)) }),
      setPlaying: (isPlaying) => set({ isPlaying }),
      setPlayheadStep: (playheadStep) => set({ playheadStep }),
      toggleStep: (instrument, step) =>
        set((s) => {
          const row = [...s.pattern[instrument]];
          row[step] = !row[step];
          return { pattern: { ...s.pattern, [instrument]: row } };
        }),
      setChannelParam: (instrument, key, value) =>
        set((s) => ({
          channels: {
            ...s.channels,
            [instrument]: {
              ...s.channels[instrument],
              [key]: Math.min(1, Math.max(0, value)),
            },
          },
        })),
    }),
    {
      name: "circuit-drum-state",
      skipHydration: true,
      partialize: (s) => ({
        bpm: s.bpm,
        masterVolume: s.masterVolume,
        pattern: s.pattern,
        channels: s.channels,
      }),
    },
  ),
);
