import { loadFont } from "@remotion/google-fonts/NotoSansKR";

export const { fontFamily } = loadFont("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});

export const FPS = 30;
export const WALL = "#20323a";
export const AMBER = "#f4b942";
export const GREEN = "#7fe0a0";
export const RED = "#ef6a56";
export const CREAM = "#f6efe2";

// shortcut: pause-detected voice timings, re-measure if the voice file changes.
export const VOICE_SECONDS = 31.555875;
export const VOICE_RATE = VOICE_SECONDS / 30;
export const at = (voiceSecond: number) =>
  Math.round((voiceSecond / VOICE_RATE) * FPS);

export const T = {
  by: at(2.55),
  generic: at(5.25),
  filter: at(7.35),
  terminal: at(9.55),
  type: at(12.28),
  typeEnd: at(14.38),
  pick: at(14.83),
  tick2: at(15.95),
  tick3: at(17.1),
  session: at(18.45),
  stand: at(19.6),
  during: at(20.33),
  after: at(22.26),
  fixBlock: at(24.0),
  report: at(25.08),
  yours: at(29.5),
  end: 900,
};
