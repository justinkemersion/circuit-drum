# CircuitDrum

CircuitDrum is a browser-based, retro-styled **16-step analog drum sequencer**. It uses synthesized voices (no samples) via [Tone.js](https://tonejs.github.io/), a cyberpunk-inspired UI with [Tailwind CSS](https://tailwindcss.com/), and [Next.js](https://nextjs.org/) for the app shell. State is managed with [Zustand](https://github.com/pmndrs/zustand) so the UI stays decoupled from the audio engine.

## Features

- **Five channels:** Kick, Snare, Closed Hi-Hat, Open Hi-Hat, and Clap  
- **16-step grid** with playhead highlight; steps can be toggled while the transport is running  
- **Tempo** 30–200 BPM via `Tone.Transport`  
- **Per-channel controls:** Pitch, Decay, and Volume (sliders)  
- **Master volume**  
- **Persistence:** Pattern and knob settings (plus BPM and master level) are saved in **localStorage** and restored after refresh  

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 15 (App Router)                     |
| UI           | React 19, Tailwind CSS, Lucide React icons  |
| Audio        | Tone.js (`MembraneSynth`, `NoiseSynth`, etc.) |
| State        | Zustand + `persist` middleware            |

## Prerequisites

- **Node.js** 18.18 or newer (or 20+), matching [Next.js requirements](https://nextjs.org/docs/app/getting-started/installation)  
- **npm** (or use your preferred package manager with equivalent commands)  

## Getting started

Clone the repository and install dependencies:

```bash
git clone git@github.com:justinkemersion/circuit-drum.git
cd circuit-drum
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Because Web Audio requires a **user gesture**, click **Play** once to start audio; the first interaction also resumes the audio context.

### Other scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | ESLint (Next.js config)  |

## Project layout

| Path | Role |
| ---- | ---- |
| `app/` | Next.js App Router: `layout.tsx`, `page.tsx`, `globals.css` |
| `components/DrumMachine.tsx` | Main shell: top bar, grid, channel strips |
| `components/StepGrid.tsx` | 16×5 step buttons and row labels |
| `components/Controls.tsx` | Shared slider components |
| `hooks/useAudioEngine.ts` | Tone.js voices, transport, scheduling |
| `store/useStore.ts` | Sequencer state, persistence, actions |

The audio hook reads the latest pattern and channel parameters from the store (via refs) inside the transport callback so the sequence stays in sync with the UI without stale closures.

## License

This project is private unless you choose to publish it under a specific license.
