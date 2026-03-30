import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { createDefaultStateSlice, useStore } from "@/store/useStore";
import { getToneMocks } from "@/tests/mocks/tone";

describe("useAudioEngine", () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState(createDefaultStateSlice());
    vi.clearAllMocks();
    const toneMocks = getToneMocks();
    toneMocks.mockTransport.bpm.rampTo.mockClear();
    toneMocks.mockTransport.bpm.value = 120;
  });

  afterEach(() => {
    useStore.setState({ ...createDefaultStateSlice(), isPlaying: false });
  });

  it("applies rapid BPM changes without throwing while the engine is running", async () => {
    const { unmount } = renderHook(() => useAudioEngine());

    useStore.getState().setPlaying(true);

    await waitFor(() => {
      const m = getToneMocks();
      expect(m.toneStart).toHaveBeenCalled();
      expect(m.scheduleRepeat).toHaveBeenCalled();
      expect(m.transportStart).toHaveBeenCalled();
    });

    expect(() => {
      for (let i = 0; i < 80; i += 1) {
        useStore.getState().setBpm(30 + (i % 171));
      }
    }).not.toThrow();

    const rampTo = getToneMocks().mockTransport.bpm.rampTo;
    expect(rampTo).toHaveBeenCalled();
    expect(useStore.getState().bpm).toBe(30 + (79 % 171));

    unmount();
  });
});
