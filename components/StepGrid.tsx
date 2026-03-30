"use client";

import { INSTRUMENTS, INSTRUMENT_LABELS } from "@/store/useStore";
import { useStore } from "@/store/useStore";

const STEPS = 16;

export function StepGrid() {
  const pattern = useStore((s) => s.pattern);
  const playheadStep = useStore((s) => s.playheadStep);
  const toggleStep = useStore((s) => s.toggleStep);

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="inline-block min-w-full">
        <div className="mb-2 grid grid-cols-[minmax(4.5rem,6rem)_repeat(16,minmax(1.5rem,1fr))] gap-x-1 gap-y-0.5 px-1 sm:gap-x-1.5">
          <div />
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={`h-${i}`}
              className="text-center font-mono text-[0.55rem] tabular-nums text-zinc-600 sm:text-[0.6rem]"
            >
              {i + 1}
            </div>
          ))}
        </div>
        {INSTRUMENTS.map((inst) => (
          <div
            key={inst}
            className="mb-1.5 grid grid-cols-[minmax(4.5rem,6rem)_repeat(16,minmax(1.5rem,1fr))] items-center gap-x-1 gap-y-1 sm:gap-x-1.5"
          >
            <div className="truncate pr-1 text-[0.65rem] uppercase tracking-wide text-zinc-400 sm:text-xs">
              {INSTRUMENT_LABELS[inst]}
            </div>
            {Array.from({ length: STEPS }, (_, step) => (
              <StepButton
                key={step}
                label={`${INSTRUMENT_LABELS[inst]} step ${step + 1}`}
                active={pattern[inst][step]}
                isPlayhead={playheadStep === step}
                onToggle={() => toggleStep(inst, step)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepButton({
  label,
  active,
  isPlayhead,
  onToggle,
}: {
  label: string;
  active: boolean;
  isPlayhead: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className={[
        "relative aspect-square w-full min-h-[1.75rem] max-h-10 rounded-md border transition-all duration-150 sm:min-h-8",
        active
          ? "border-emerald-400/60 bg-emerald-500/25 shadow-led-on"
          : "border-zinc-700/80 bg-zinc-900/90 shadow-led-dim",
        isPlayhead
          ? "ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-[#1c2028]"
          : "ring-0 ring-offset-0",
      ].join(" ")}
      aria-pressed={active}
    >
      <span
        className={[
          "absolute inset-[22%] rounded-sm",
          active ? "bg-emerald-400/90 shadow-[0_0_12px_#22c55e]" : "bg-zinc-800",
        ].join(" ")}
      />
    </button>
  );
}
