import "@testing-library/jest-dom/vitest";
import "./mocks/tone";
import * as Tone from "tone";

void Tone.Transport;

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
  };
}

Object.defineProperty(globalThis, "localStorage", {
  value: createMemoryStorage(),
  configurable: true,
  writable: true,
});

class MockAudioParam {
  value = 0;
  setValueAtTime = () => this;
  linearRampToValueAtTime = () => this;
  exponentialRampToValueAtTime = () => this;
}

class MockAudioNode {
  connect = (destination?: unknown) => destination ?? this;
  disconnect = () => undefined;
}

class MockAudioContext {
  state: AudioContextState = "running";
  destination = new MockAudioNode();
  createGain = () =>
    ({
      gain: new MockAudioParam(),
      connect: () => new MockAudioNode(),
    }) as unknown as GainNode;
  createOscillator = () =>
    ({
      frequency: new MockAudioParam(),
      connect: () => new MockAudioNode(),
      start: () => undefined,
      stop: () => undefined,
    }) as unknown as OscillatorNode;
  createBiquadFilter = () =>
    ({
      frequency: new MockAudioParam(),
      Q: new MockAudioParam(),
      connect: () => new MockAudioNode(),
    }) as unknown as BiquadFilterNode;
  decodeAudioData = () => Promise.resolve({} as AudioBuffer);
  resume = () => Promise.resolve();
  suspend = () => Promise.resolve();
  close = () => Promise.resolve();
}

const globalForAudio = globalThis as typeof globalThis & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: unknown;
};

if (typeof globalForAudio.AudioContext === "undefined") {
  globalForAudio.AudioContext = MockAudioContext as unknown as typeof AudioContext;
}

if (typeof globalForAudio.webkitAudioContext === "undefined") {
  globalForAudio.webkitAudioContext = MockAudioContext;
}
