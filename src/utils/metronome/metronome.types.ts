import type { SoundGeneratorConfig } from "./sound-generator.types";

export type MaxBeatsConfig = {
  count: number;
  onEnd?: () => void;
};

export type BeatEvent = {
  beatNumber: number; // Current beat in the bar (1-based)
  time: number; // Audio context time
  totalBeats: number; // Total beats since metronome started
};

export type BeatIntervalConfig = {
  count: number;
  onBeatInterval: (event: { currentInterval: number }) => void;
};

export type MetronomeConfig = {
  tempo: number;
  beatsPerBar: number;
  volume: number; // 0-100
  onBeatStart?: (event: BeatEvent) => void;
  maxBeats?: MaxBeatsConfig;
  beatInterval?: BeatIntervalConfig;
  soundConfig?: SoundGeneratorConfig;
};

export type MetronomeUpdateConfig = {
  tempo?: number;
  volume?: number;
};

export type PlaybackState = "playing" | "stopped" | "paused";

export type MetronomeState = {
  playbackState: PlaybackState;
  currentBeat: number;
  totalBeats: number;
  currentInterval: number;
  nextNoteTime: number;
  audioContext: AudioContext | null;
  timerID: number | null;
  lookaheadMs: number; // How far ahead to schedule audio (in milliseconds)
};
