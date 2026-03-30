import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultStateSlice,
  emptyPattern,
  useStore,
} from "@/store/useStore";

const PERSIST_KEY = "circuit-drum-state";

function seedLocalStorage(partial: Record<string, unknown>) {
  const base = createDefaultStateSlice();
  localStorage.setItem(
    PERSIST_KEY,
    JSON.stringify({
      state: { ...base, ...partial },
      version: 0,
    }),
  );
}

describe("useStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState(createDefaultStateSlice());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("toggles a step on and off in the grid", () => {
    expect(useStore.getState().pattern.kick[0]).toBe(false);
    useStore.getState().toggleStep("kick", 0);
    expect(useStore.getState().pattern.kick[0]).toBe(true);
    useStore.getState().toggleStep("kick", 0);
    expect(useStore.getState().pattern.kick[0]).toBe(false);
  });

  it("clamps BPM to 30–200", () => {
    useStore.getState().setBpm(10);
    expect(useStore.getState().bpm).toBe(30);
    useStore.getState().setBpm(300);
    expect(useStore.getState().bpm).toBe(200);
    useStore.getState().setBpm(95.4);
    expect(useStore.getState().bpm).toBe(95);
  });

  it("clearPattern resets every step to inactive", () => {
    useStore.getState().toggleStep("snare", 3);
    useStore.getState().toggleStep("closedHat", 15);
    useStore.getState().clearPattern();
    const { pattern } = useStore.getState();
    for (const row of Object.values(pattern)) {
      expect(row.every((cell) => cell === false)).toBe(true);
    }
    expect(pattern).toEqual(emptyPattern());
  });

  it("updates pitch and decay channel parameters with clamping", () => {
    useStore.getState().setChannelParam("kick", "pitch", 0.33);
    useStore.getState().setChannelParam("kick", "decay", 0.66);
    expect(useStore.getState().channels.kick.pitch).toBeCloseTo(0.33);
    expect(useStore.getState().channels.kick.decay).toBeCloseTo(0.66);
    useStore.getState().setChannelParam("snare", "pitch", 2);
    useStore.getState().setChannelParam("snare", "decay", -1);
    expect(useStore.getState().channels.snare.pitch).toBe(1);
    expect(useStore.getState().channels.snare.decay).toBe(0);
  });

  describe("persistence", () => {
    it("persists state to localStorage when the store changes", () => {
      useStore.getState().setBpm(133);
      const raw = localStorage.getItem(PERSIST_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw as string) as { state: { bpm: number } };
      expect(parsed.state.bpm).toBe(133);
    });

    it("rehydrates from localStorage when rehydrate() runs", async () => {
      seedLocalStorage({ bpm: 77, masterVolume: 0.4 });
      expect(useStore.getState().bpm).toBe(120);
      await useStore.persist.rehydrate();
      expect(useStore.getState().bpm).toBe(77);
      expect(useStore.getState().masterVolume).toBe(0.4);
    });
  });

  describe("edge cases", () => {
    it("resetSequencer clears the pattern and stops playback", () => {
      useStore.getState().toggleStep("kick", 0);
      useStore.setState({ isPlaying: true, playheadStep: 7 });
      useStore.getState().resetSequencer();
      const s = useStore.getState();
      expect(s.isPlaying).toBe(false);
      expect(s.playheadStep).toBe(-1);
      expect(s.pattern.kick[0]).toBe(false);
    });

    it("clearPattern leaves transport flags unchanged while playing", () => {
      useStore.setState({ isPlaying: true, playheadStep: 4 });
      useStore.getState().toggleStep("clap", 2);
      useStore.getState().clearPattern();
      const s = useStore.getState();
      expect(s.isPlaying).toBe(true);
      expect(s.playheadStep).toBe(4);
      expect(s.pattern.clap[2]).toBe(false);
    });
  });
});
