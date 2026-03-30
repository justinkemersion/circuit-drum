import { vi } from "vitest";

export type ToneTestMocks = {
  toneStart: ReturnType<typeof vi.fn>;
  transportStart: ReturnType<typeof vi.fn>;
  transportStop: ReturnType<typeof vi.fn>;
  transportCancel: ReturnType<typeof vi.fn>;
  transportClear: ReturnType<typeof vi.fn>;
  scheduleRepeat: ReturnType<typeof vi.fn>;
  mockTransport: {
    bpm: { value: number; rampTo: ReturnType<typeof vi.fn> };
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    scheduleRepeat: ReturnType<typeof vi.fn>;
    seconds: number;
  };
  Synth: ReturnType<typeof vi.fn>;
  MembraneSynth: ReturnType<typeof vi.fn>;
  NoiseSynth: ReturnType<typeof vi.fn>;
  Gain: ReturnType<typeof vi.fn>;
  Filter: ReturnType<typeof vi.fn>;
  Volume: ReturnType<typeof vi.fn>;
  Sequence: ReturnType<typeof vi.fn>;
};

const GLOBAL_KEY = "__CIRCUIT_DRUM_TONE_MOCKS__" as const;

function createAudioNode() {
  const self = {
    connect: vi.fn(function connect(_dest?: unknown) {
      return _dest !== undefined ? _dest : self;
    }),
    toDestination: vi.fn(function toDestination() {
      return self;
    }),
    dispose: vi.fn(),
    chain: vi.fn(function chain() {
      return self;
    }),
    gain: { rampTo: vi.fn() },
    volume: { rampTo: vi.fn() },
    frequency: { rampTo: vi.fn() },
    detune: { rampTo: vi.fn() },
    triggerAttackRelease: vi.fn(),
    set: vi.fn(),
  };
  return self;
}

vi.mock("tone", () => {
  const toneStart = vi.fn(() => Promise.resolve());
  const transportStart = vi.fn();
  const transportStop = vi.fn();
  const transportCancel = vi.fn();
  const transportClear = vi.fn();
  const scheduleRepeat = vi.fn(() => 42);

  const mockTransport = {
    bpm: {
      value: 120,
      rampTo: vi.fn(),
    },
    start: transportStart,
    stop: transportStop,
    cancel: transportCancel,
    clear: transportClear,
    scheduleRepeat,
    seconds: 0,
  };

  const Synth = vi.fn(() => createAudioNode());
  const MembraneSynth = vi.fn(() => createAudioNode());
  const NoiseSynth = vi.fn(() => createAudioNode());
  const Gain = vi.fn(() => createAudioNode());
  const Filter = vi.fn(() => createAudioNode());
  const Volume = vi.fn(() => createAudioNode());
  const Sequence = vi.fn(() => ({
    dispose: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));

  const Frequency = vi.fn((_midi: number, _unit: string) => ({
    toNote: () => "C2",
  }));

  const gainToDb = vi.fn((g: number) => 20 * Math.log10(Math.max(g, 1e-6)));

  const Draw = {
    schedule: vi.fn((fn: () => void) => {
      fn();
    }),
  };

  const toneNamespace = {
    start: toneStart,
    Transport: mockTransport,
    Synth,
    MembraneSynth,
    NoiseSynth,
    Gain,
    Filter,
    Volume,
    Sequence,
    Frequency,
    gainToDb,
    Draw,
  };

  const mocks: ToneTestMocks = {
    toneStart,
    transportStart,
    transportStop,
    transportCancel,
    transportClear,
    scheduleRepeat,
    mockTransport,
    Synth,
    MembraneSynth,
    NoiseSynth,
    Gain,
    Filter,
    Volume,
    Sequence,
  };

  (
    globalThis as typeof globalThis & {
      [GLOBAL_KEY]?: ToneTestMocks;
    }
  )[GLOBAL_KEY] = mocks;

  return {
    __esModule: true,
    default: toneNamespace,
    ...toneNamespace,
  };
});

export function getToneMocks(): ToneTestMocks {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: ToneTestMocks;
  };
  const mocks = g[GLOBAL_KEY];
  if (!mocks) {
    throw new Error(
      "Tone mocks are not initialized. Import a module that loads the tone mock first.",
    );
  }
  return mocks;
}
