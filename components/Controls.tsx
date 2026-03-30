"use client";

type LabeledSliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  id: string;
};

export function LabeledSlider({
  label,
  value,
  onChange,
  id,
}: LabeledSliderProps) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <label
        htmlFor={id}
        className="text-[0.6rem] font-normal uppercase tracking-[0.2em] text-zinc-500"
      >
        {label}
      </label>
      <div className="relative flex h-7 w-full max-w-[7rem] items-center justify-center sm:h-8">
        <div className="pointer-events-none absolute inset-x-0 h-2 rounded-full bg-zinc-950 shadow-led-dim ring-1 ring-zinc-800/80" />
        <div
          className="pointer-events-none absolute left-0 h-2 rounded-l-full bg-gradient-to-r from-emerald-800 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.35)]"
          style={{ width: `${pct}%`, maxWidth: "100%" }}
        />
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="relative z-10 h-8 w-full cursor-pointer opacity-0"
          aria-valuenow={pct}
        />
      </div>
      <span className="font-mono text-[0.55rem] tabular-nums text-emerald-500/80">
        {pct}
      </span>
    </div>
  );
}

type MasterSliderProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  id: string;
};

export function HorizontalSlider({
  label,
  value,
  onChange,
  min = 30,
  max = 200,
  id,
}: MasterSliderProps) {
  return (
    <div className="flex min-w-[8rem] flex-1 flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[0.65rem] uppercase tracking-widest text-zinc-500"
        >
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-emerald-400">
          {typeof value === "number" && max <= 1
            ? Math.round(value * 100)
            : Math.round(value)}
          {max <= 1 ? "%" : ""}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={max <= 1 ? 0.01 : 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-900 accent-emerald-500"
      />
    </div>
  );
}
