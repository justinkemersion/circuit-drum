import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DrumMachine } from "@/components/DrumMachine";
import { createDefaultStateSlice, useStore } from "@/store/useStore";
import { getToneMocks } from "@/tests/mocks/tone";

describe("Sequencer (DrumMachine)", () => {
  beforeEach(() => {
    localStorage.clear();
    useStore.setState(createDefaultStateSlice());
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    useStore.setState(createDefaultStateSlice());
  });

  it("toggles a step button active state when clicked", async () => {
    const user = userEvent.setup();
    render(<DrumMachine />);
    await act(async () => {
      await useStore.persist.rehydrate();
    });

    const step = screen.getByRole("button", { name: "Kick step 1" });
    expect(step).toHaveAttribute("aria-pressed", "false");
    await user.click(step);
    expect(step).toHaveAttribute("aria-pressed", "true");
    await user.click(step);
    expect(step).toHaveAttribute("aria-pressed", "false");
  });

  it("starts Tone.Transport when Play is pressed", async () => {
    const user = userEvent.setup();
    render(<DrumMachine />);
    await act(async () => {
      await useStore.persist.rehydrate();
    });

    await user.click(
      screen.getByRole("button", { name: /start playback/i }),
    );
    await waitFor(() => {
      const toneMocks = getToneMocks();
      expect(toneMocks.toneStart).toHaveBeenCalled();
      expect(toneMocks.transportStart).toHaveBeenCalled();
    });
  });

  it("updates the displayed BPM when the tempo slider changes", async () => {
    render(<DrumMachine />);
    await act(async () => {
      await useStore.persist.rehydrate();
    });

    const bpmSlider = screen.getByRole("slider", { name: /tempo \(bpm\)/i });
    expect(bpmSlider).toHaveAttribute("id", "bpm");
    fireEvent.change(bpmSlider, { target: { value: "140" } });

    await waitFor(() => {
      expect(screen.getAllByText("140").length).toBeGreaterThanOrEqual(1);
    });
    expect(useStore.getState().bpm).toBe(140);
  });

  it("updates kick pitch in the store when the channel slider changes", async () => {
    render(<DrumMachine />);
    await act(async () => {
      await useStore.persist.rehydrate();
    });

    const pitchInput = document.getElementById("kick-pitch") as HTMLInputElement;
    expect(pitchInput).toBeTruthy();
    fireEvent.change(pitchInput, { target: { value: "25" } });

    await waitFor(() => {
      expect(useStore.getState().channels.kick.pitch).toBeCloseTo(0.25, 2);
    });
  });
});
