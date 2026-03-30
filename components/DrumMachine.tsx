"use client";

import { useEffect } from "react";
import { Activity, Play, Square, Volume2 } from "lucide-react";
import { HorizontalSlider, LabeledSlider } from "@/components/Controls";
import { StepGrid } from "@/components/StepGrid";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { INSTRUMENTS, INSTRUMENT_LABELS } from "@/store/useStore";
import { useStore } from "@/store/useStore";

export function DrumMachine() {
  const { toggleTransport } = useAudioEngine();

  useEffect(() => {
    void useStore.persist.rehydrate();
  }, []);

  const bpm = useStore((s) => s.bpm);
  const setBpm = useStore((s) => s.setBpm);
  const masterVolume = useStore((s) => s.masterVolume);
  const setMasterVolume = useStore((s) => s.setMasterVolume);
  const isPlaying = useStore((s) => s.isPlaying);
  const channels = useStore((s) => s.channels);
  const setChannelParam = useStore((s) => s.setChannelParam);

  return (
    <div className="relative flex w-full max-w-5xl flex-col gap-0 shadow-panel">
      <div className="wood-grain absolute -left-3 top-0 z-0 hidden h-full w-5 rounded-l-md sm:block" />
      <div className="wood-grain absolute -right-3 top-0 z-0 hidden h-full w-5 rounded-r-md sm:block" />

      <div className="relative z-10 flex flex-col overflow-hidden rounded-lg border border-zinc-800/90 bg-[#1c2028] ring-1 ring-zinc-700/40">
        <div className="scanlines absolute inset-0 z-20 opacity-40" />

        <header className="metal-face relative z-10 border-b border-zinc-800/80 px-3 py-3 sm:px-5 sm:py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <div>
                <h1 className="text-lg font-normal tracking-[0.25em] text-zinc-100 sm:text-xl">
                  CIRCUITDRUM
                </h1>
                <p className="text-[0.6rem] uppercase tracking-[0.35em] text-zinc-500">
                  Analog · 16 Step
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-zinc-700/60 bg-zinc-950/50 px-2 py-1">
              <span
                className={`h-2 w-2 rounded-full ${isPlaying ? "animate-pulse bg-emerald-400 shadow-led-on" : "bg-zinc-600"}`}
              />
              <span className="text-[0.65rem] uppercase tracking-widest text-zinc-500">
                {isPlaying ? "Run" : "Stop"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <HorizontalSlider
              id="bpm"
              label="Tempo (BPM)"
              value={bpm}
              min={30}
              max={200}
              onChange={setBpm}
            />
            <div className="flex flex-1 flex-wrap items-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => void toggleTransport()}
                className="flex h-11 min-w-[6.5rem] items-center justify-center gap-2 rounded-md border border-emerald-600/50 bg-gradient-to-b from-emerald-900/40 to-zinc-950 px-4 text-sm uppercase tracking-widest text-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.15)] transition hover:border-emerald-400/70 hover:text-emerald-200 active:scale-[0.98]"
              >
                {isPlaying ? (
                  <>
                    <Square className="h-4 w-4 fill-current" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Play
                  </>
                )}
              </button>
              <div className="flex min-w-[10rem] flex-1 items-center gap-2">
                <Volume2 className="h-4 w-4 shrink-0 text-zinc-500" />
                <HorizontalSlider
                  id="master-vol"
                  label="Master"
                  value={masterVolume}
                  min={0}
                  max={1}
                  onChange={setMasterVolume}
                />
              </div>
            </div>
          </div>
        </header>

        <section className="relative z-10 border-b border-zinc-800/80 px-2 py-4 sm:px-4 sm:py-5">
          <h2 className="mb-3 px-1 text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">
            Pattern
          </h2>
          <StepGrid />
        </section>

        <footer className="relative z-10 px-2 py-4 sm:px-4 sm:py-5">
          <h2 className="mb-3 px-1 text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">
            Channel strips
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {INSTRUMENTS.map((id) => (
              <div
                key={id}
                className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 p-3 ring-1 ring-zinc-800/50"
              >
                <div className="mb-2 border-b border-zinc-800/80 pb-2 text-center text-[0.7rem] font-normal uppercase tracking-[0.2em] text-emerald-500/90">
                  {INSTRUMENT_LABELS[id]}
                </div>
                <div className="flex gap-2">
                  <LabeledSlider
                    id={`${id}-pitch`}
                    label="Pitch"
                    value={channels[id].pitch}
                    onChange={(v) => setChannelParam(id, "pitch", v)}
                  />
                  <LabeledSlider
                    id={`${id}-decay`}
                    label="Decay"
                    value={channels[id].decay}
                    onChange={(v) => setChannelParam(id, "decay", v)}
                  />
                  <LabeledSlider
                    id={`${id}-vol`}
                    label="Vol"
                    value={channels[id].volume}
                    onChange={(v) => setChannelParam(id, "volume", v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
