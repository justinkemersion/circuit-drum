"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";
import {
  useStore,
  type InstrumentId,
  type Pattern,
  type ChannelParams,
} from "@/store/useStore";

type Engine = {
  master: Tone.Volume;
  kick: Tone.MembraneSynth;
  kickGain: Tone.Gain;
  snareTone: Tone.Synth;
  snareNoise: Tone.NoiseSynth;
  snareMix: Tone.Gain;
  closedHat: Tone.NoiseSynth;
  openHat: Tone.NoiseSynth;
  hatFilterClosed: Tone.Filter;
  hatFilterOpen: Tone.Filter;
  hatClosedGain: Tone.Gain;
  hatOpenGain: Tone.Gain;
  clapNoise: Tone.NoiseSynth;
  clapFilter: Tone.Filter;
  clapGain: Tone.Gain;
  repeatId: number;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function applyChannelParams(
  engine: Engine,
  id: InstrumentId,
  p: ChannelParams,
) {
  switch (id) {
    case "kick": {
      engine.kickGain.gain.rampTo(p.volume * 0.95 + 0.05, 0.02);
      const pitchDecay = lerp(0.02, 0.12, p.pitch);
      const decay = lerp(0.08, 0.55, p.decay);
      engine.kick.set({
        pitchDecay,
        envelope: {
          attack: 0.001,
          decay,
          sustain: 0.01,
          release: decay * 1.2,
        },
      });
      break;
    }
    case "snare": {
      engine.snareMix.gain.rampTo(p.volume * 0.85 + 0.05, 0.02);
      const toneDecay = lerp(0.04, 0.22, p.decay);
      const noiseDecay = lerp(0.06, 0.35, p.decay);
      engine.snareTone.detune.rampTo(lerp(-280, 280, p.pitch), 0.05);
      engine.snareTone.set({
        envelope: { attack: 0.001, decay: toneDecay, sustain: 0 },
        oscillator: { type: "triangle" },
      });
      engine.snareNoise.set({
        envelope: { attack: 0.001, decay: noiseDecay, sustain: 0 },
      });
      break;
    }
    case "closedHat": {
      engine.hatClosedGain.gain.rampTo(p.volume, 0.02);
      const decay = lerp(0.01, 0.09, p.decay);
      const cutoff = lerp(6500, 14000, p.pitch);
      engine.hatFilterClosed.frequency.rampTo(cutoff, 0.05);
      engine.closedHat.set({
        envelope: { attack: 0.001, decay, sustain: 0 },
      });
      break;
    }
    case "openHat": {
      engine.hatOpenGain.gain.rampTo(p.volume, 0.02);
      const decay = lerp(0.08, 0.45, p.decay);
      const cutoff = lerp(5500, 12000, p.pitch);
      engine.hatFilterOpen.frequency.rampTo(cutoff, 0.05);
      engine.openHat.set({
        envelope: { attack: 0.001, decay, sustain: 0 },
      });
      break;
    }
    case "clap": {
      engine.clapGain.gain.rampTo(p.volume * 0.9 + 0.05, 0.02);
      const decay = lerp(0.05, 0.35, p.decay);
      const freq = lerp(1200, 3200, p.pitch);
      engine.clapFilter.frequency.rampTo(freq, 0.05);
      engine.clapNoise.set({
        envelope: { attack: 0.002, decay, sustain: 0 },
      });
      break;
    }
  }
}

function buildEngine(masterDb: number): Engine {
  const master = new Tone.Volume(masterDb).toDestination();

  const kickGain = new Tone.Gain(0.85).connect(master);
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 8,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 0.35,
      sustain: 0.01,
      release: 0.4,
    },
  }).connect(kickGain);

  const snareMix = new Tone.Gain(0.75).connect(master);
  const snareTone = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
  }).connect(snareMix);
  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  }).connect(snareMix);

  const hatFilterClosed = new Tone.Filter({
    type: "highpass",
    frequency: 9000,
    rolloff: -24,
  }).connect(master);
  const hatFilterOpen = new Tone.Filter({
    type: "highpass",
    frequency: 7500,
    rolloff: -24,
  }).connect(master);
  const hatClosedGain = new Tone.Gain(0.55).connect(hatFilterClosed);
  const hatOpenGain = new Tone.Gain(0.5).connect(hatFilterOpen);

  const closedHat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
  }).connect(hatClosedGain);

  const openHat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0 },
  }).connect(hatOpenGain);

  const clapFilter = new Tone.Filter({
    type: "bandpass",
    frequency: 2000,
    Q: 0.6,
  });
  const clapGain = new Tone.Gain(0.65).connect(clapFilter);
  clapFilter.connect(master);
  const clapNoise = new Tone.NoiseSynth({
    noise: { type: "pink" },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0 },
  }).connect(clapGain);

  return {
    master,
    kick,
    kickGain,
    snareTone,
    snareNoise,
    snareMix,
    closedHat,
    openHat,
    hatFilterClosed,
    hatFilterOpen,
    hatClosedGain,
    hatOpenGain,
    clapNoise,
    clapFilter,
    clapGain,
    repeatId: -1,
  };
}

function triggerInstrument(
  engine: Engine,
  id: InstrumentId,
  time: number,
  pattern: Pattern,
  channels: Record<InstrumentId, ChannelParams>,
  step: number,
) {
  if (!pattern[id][step]) return;
  const p = channels[id];
  switch (id) {
    case "kick": {
      const note = Tone.Frequency(
        lerp(36, 52, p.pitch),
        "midi",
      ).toNote();
      const dur = lerp(0.08, 0.35, p.decay);
      engine.kick.triggerAttackRelease(note, dur, time);
      break;
    }
    case "snare": {
      engine.snareTone.triggerAttackRelease("C4", "16n", time);
      engine.snareNoise.triggerAttackRelease("16n", time);
      break;
    }
    case "closedHat":
      engine.closedHat.triggerAttackRelease("32n", time);
      break;
    case "openHat":
      engine.openHat.triggerAttackRelease("8n", time);
      break;
    case "clap": {
      const d = lerp(0.04, 0.2, p.decay);
      engine.clapNoise.triggerAttackRelease(d, time);
      break;
    }
  }
}

export function useAudioEngine() {
  const engineRef = useRef<Engine | null>(null);
  const stepRef = useRef(0);
  const initializedRef = useRef(false);

  const bpm = useStore((s) => s.bpm);
  const masterVolume = useStore((s) => s.masterVolume);
  const isPlaying = useStore((s) => s.isPlaying);
  const pattern = useStore((s) => s.pattern);
  const channels = useStore((s) => s.channels);
  const setPlayheadStep = useStore((s) => s.setPlayheadStep);
  const setPlaying = useStore((s) => s.setPlaying);

  const patternRef = useRef(pattern);
  const channelsRef = useRef(channels);
  patternRef.current = pattern;
  channelsRef.current = channels;

  useEffect(() => {
    if (!engineRef.current) return;
    const db = Tone.gainToDb(0.0001 + masterVolume * 0.999);
    engineRef.current.master.volume.rampTo(db, 0.05);
  }, [masterVolume]);

  useEffect(() => {
    Tone.Transport.bpm.rampTo(bpm, 0.08);
  }, [bpm]);

  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    (Object.keys(channels) as InstrumentId[]).forEach((id) => {
      applyChannelParams(eng, id, channels[id]);
    });
  }, [channels]);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        if (engineRef.current.repeatId >= 0) {
          Tone.Transport.clear(engineRef.current.repeatId);
        }
        engineRef.current.kick.dispose();
        engineRef.current.kickGain.dispose();
        engineRef.current.snareTone.dispose();
        engineRef.current.snareNoise.dispose();
        engineRef.current.snareMix.dispose();
        engineRef.current.closedHat.dispose();
        engineRef.current.openHat.dispose();
        engineRef.current.hatFilterClosed.dispose();
        engineRef.current.hatFilterOpen.dispose();
        engineRef.current.hatClosedGain.dispose();
        engineRef.current.hatOpenGain.dispose();
        engineRef.current.clapNoise.dispose();
        engineRef.current.clapFilter.dispose();
        engineRef.current.clapGain.dispose();
        engineRef.current.master.dispose();
        engineRef.current = null;
      }
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      Tone.Transport.cancel();
      if (engineRef.current && engineRef.current.repeatId >= 0) {
        Tone.Transport.clear(engineRef.current.repeatId);
        engineRef.current.repeatId = -1;
      }
      setPlayheadStep(-1);
      return;
    }

    let cancelled = false;

    const start = async () => {
      await Tone.start();
      if (cancelled) return;

      if (!engineRef.current) {
        const db = Tone.gainToDb(0.0001 + masterVolume * 0.999);
        engineRef.current = buildEngine(db);
        (Object.keys(channelsRef.current) as InstrumentId[]).forEach((id) => {
          applyChannelParams(engineRef.current!, id, channelsRef.current[id]);
        });
      }

      const engine = engineRef.current!;
      Tone.Transport.bpm.value = bpm;
      stepRef.current = 0;

      if (engine.repeatId >= 0) {
        Tone.Transport.clear(engine.repeatId);
      }

      Tone.Transport.stop();
      Tone.Transport.seconds = 0;

      engine.repeatId = Tone.Transport.scheduleRepeat((time) => {
        const step = stepRef.current;
        const pat = patternRef.current;
        const ch = channelsRef.current;

        const ids: InstrumentId[] = [
          "kick",
          "snare",
          "closedHat",
          "openHat",
          "clap",
        ];
        ids.forEach((id) => triggerInstrument(engine, id, time, pat, ch, step));

        Tone.Draw.schedule(() => {
          setPlayheadStep(step);
        }, time);

        stepRef.current = (step + 1) % 16;
      }, "16n");

      Tone.Transport.start();
      initializedRef.current = true;
    };

    void start();

    return () => {
      cancelled = true;
      Tone.Transport.stop();
      if (engineRef.current && engineRef.current.repeatId >= 0) {
        Tone.Transport.clear(engineRef.current.repeatId);
        engineRef.current.repeatId = -1;
      }
      setPlayheadStep(-1);
    };
  }, [isPlaying, setPlayheadStep]);

  const toggleTransport = async () => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    await Tone.start();
    setPlaying(true);
  };

  return { toggleTransport };
}
