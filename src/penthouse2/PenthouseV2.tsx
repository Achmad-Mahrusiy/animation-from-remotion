import { AbsoluteFill, Audio, Composition, Freeze, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Sfx, cameraTransform, enter } from "../Composition";
import { SIT, Stickman, blendPoses, type Pose } from "../Stickman";
import { CREAM, FPS, fontFamily } from "../theme";
import { VOICE } from "./lines";
import {
  Armchair,
  BOARD,
  BoardTable,
  BossChair,
  BOUTIQUE,
  Boardroom,
  Book,
  Boutique,
  Brief,
  FOYER,
  Foyer,
  GALLERY,
  GOLD,
  Gallery,
  INK,
  LIBRARY,
  Library,
  MEDIA,
  MediaRoom,
  Papers,
  SUITE,
  Suite,
  TourFrame,
  crankKnob,
  text,
} from "../penthouse/Sets";
import { DemoPanel, STEP, Stepper } from "./Demo";

// Script v2 on the same penthouse scenes, in two layouts to compare: "split" (demo cards on top, the stickman below)
// and "full" (the penthouse full screen). Both get word-by-word captions and a 1/5 stepper.
const at = (second: number) => Math.round(second * FPS);
const L = VOICE.lines;
// Short tail: the last line runs straight into the first one when the Short loops. 34.48 s, under the 35 s ceiling.
const END = at(VOICE.seconds + 0.05);
// Starts come from the table in lines.ts. A cue inside a phrase sits at a share of its length, from the word gaps.
const cue = (line: keyof typeof L, share = 0) => at(L[line][0] + L[line][1] * share);
const T = {
  hook: cue("hook"),
  teachW: cue("teachW"),
  advise: cue("advise"),
  readW: cue("readW"),
  read: cue("read"),
  five: cue("five"),
  clap: cue("five", 0.5), // on "skills"
  how: cue("how"),
  one: cue("one"),
  cos: cue("cos"),
  ask: cue("ask"),
  right: cue("right"),
  answers: cue("answers"),
  two: cue("two"),
  anatomy: cue("anatomy"),
  idea: cue("idea"),
  machine: cue("machine"),
  three: cue("three"),
  teach: cue("teach"),
  folder: cue("folder"),
  lessons: cue("lessons"),
  four: cue("four"),
  psych: cue("psych"),
  why: cue("why"),
  hesitate: cue("why", 0.32),
  page: cue("why", 0.85),
  fiveL: cue("fiveL"),
  days: cue("days"),
  topic: cue("topic"),
  brief: cue("brief"),
  cmds: cue("cmds"),
  follow: cue("follow"),
  loop: cue("follow", 0.72),
};
// The bell rings on "The right advisor"; the five lamps light after it; the answer card slides in on "answers".
const LAMPS = [0, 1, 2, 3, 4].map((i) => T.right + 3 + i * 4);
// He reaches for the green book as "folder" starts, holds it a moment later, opens it.
const REACH = T.folder;
const TAKEN = REACH + 10;
const HOLD = REACH + 18;
// In the media room he walks the stack over to the table on "last thirty days", then drops it straight down on "topic".
const WALK: [number, number] = [T.days - 4, T.days + 26];
const LAND = T.topic;
const RELEASE = LAND - 8;

const stand = (o: Partial<Pose>): Pose => ({
  head: [195, 1040],
  sh: [190, 1130],
  hip: [190, 1370],
  kL: [162, 1510],
  fL: [150, 1650],
  kR: [218, 1510],
  fR: [230, 1650],
  eL: [130, 1230],
  hL: [120, 1340],
  eR: [250, 1230],
  hR: [262, 1340],
  look: 1,
  smile: 0.5,
  ...o,
});
const IDLE = stand({ smile: 0.8 });
const THINK = stand({ head: [205, 1044], eR: [285, 1200], hR: [268, 1122], eL: [150, 1240], hL: [230, 1260], smile: 0.2 });
const POINT = stand({ head: [212, 1040], sh: [200, 1130], eR: [300, 1150], hR: [400, 1100], smile: 1 });
const CLAP_OPEN = stand({ look: 0, eL: [100, 1190], hL: [86, 1110], eR: [290, 1190], hR: [304, 1110], smile: 1 });
const CLAP = stand({ look: 0, eL: [116, 1210], hL: [186, 1180], eR: [266, 1210], hR: [198, 1180], smile: 1.3 });
const SPREAD = stand({ look: 0, head: [192, 1032], eL: [80, 1160], hL: [10, 1090], eR: [300, 1160], hR: [370, 1090], smile: 1.6 });
const CRANK = stand({ sh: [205, 1140], head: [222, 1046], eR: [285, 1225], hR: [340, 1290], smile: 0.6 });
const CRANK_HAPPY = { ...CRANK, smile: 1.5 };
const REACH_POSE = stand({ sh: [210, 1140], head: [226, 1046], eR: [300, 1205], hR: [389, 1270], smile: 0.4 });
const HOLD_BOOK = stand({ look: 0.6, head: [205, 1046], eL: [150, 1240], hL: [236, 1236], eR: [270, 1236], hR: [300, 1240], smile: 0.8 });
const HOLD_BOOK_HAPPY = { ...HOLD_BOOK, smile: 1.4 };
const CARRY = stand({ eL: [150, 1240], hL: [272, 1256], eR: [262, 1236], hR: [312, 1250], smile: 0.3 });
const OPEN = stand({ eL: [130, 1200], hL: [130, 1110], eR: [280, 1200], hR: [330, 1120], smile: 1 });
const HOLD_UP = stand({ eR: [282, 1110], hR: [322, 990], smile: 1.3 });
// Seated in a chair that faces right, hip at x=195 (SIT). Hands rest on the thighs.
const sit = (o: Partial<Pose>): Pose => ({ ...SIT, eL: [270, 1240], hL: [330, 1330], eR: [285, 1250], hR: [345, 1320], smile: 0.8, ...o });
const S_IDLE = sit({});
const S_POINT_UP = sit({ head: [236, 1000], eR: [300, 1070], hR: [372, 975], smile: 1.1 });
const S_PROUD = sit({ smile: 1.3 });
const S_POINT_TOP = sit({ look: 0.4, head: [234, 1002], eR: [290, 1050], hR: [306, 930], smile: 1.2 });
const S_WAVE = sit({ look: 0, head: [225, 1005], eR: [335, 1065], hR: [355, 925], smile: 1.2 });
// At the head of the boardroom table: hands on the table top (y=1380), the bell at x=324 in his frame.
const B_IDLE = sit({ eL: [280, 1240], hL: [330, 1368], eR: [295, 1250], hR: [360, 1366], smile: 0.6 });
const B_THINK = sit({ head: [236, 1008], eR: [292, 1170], hR: [266, 1084], eL: [280, 1240], hL: [330, 1368], smile: 0.2 });
const B_POINT = sit({ head: [238, 1004], eR: [320, 1120], hR: [420, 1070], eL: [280, 1240], hL: [330, 1368], smile: 1 });
const B_TAP_UP = sit({ head: [242, 1010], eR: [300, 1180], hR: [324, 1250], eL: [280, 1240], hL: [330, 1368], smile: 0.5 });
const B_TAP: Pose = { ...B_TAP_UP, hR: [324, 1306], smile: 0.6 };
const B_BOSS = sit({ head: [212, 1000], sh: [200, 1095], eL: [138, 1036], hL: [188, 962], eR: [282, 1036], hR: [236, 962], smile: 1.3 });
// Boutique: his right hand rests on the counter edge while he decides.
const C_LEAN = stand({ head: [214, 1046], sh: [200, 1140], eR: [252, 1262], hR: [272, 1372], smile: 0.4 });
const C_NEAR: Pose = { ...C_LEAN, head: [228, 1064], smile: 0.2 };
const C_FAR: Pose = { ...C_LEAN, head: [226, 1036], smile: 0 };
const C_THINK: Pose = { ...C_LEAN, eL: [172, 1222], hL: [250, 1112], smile: 0.1 };
const C_POINT = stand({ head: [216, 1040], sh: [200, 1134], eR: [300, 1196], hR: [404, 1222], smile: 1.2 });

type Scene = "suite" | "foyer" | "board" | "gallery" | "library" | "boutique" | "media" | "outro";
const CUTS: [number, Scene][] = [
  [0, "suite"],
  [T.five - 2, "foyer"],
  [T.one - 2, "board"],
  [T.two - 2, "gallery"],
  [T.three - 2, "library"],
  [T.four - 2, "boutique"],
  [T.fiveL - 2, "media"],
  [T.cmds - 2, "outro"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "suite");

// Where he stands in each room (shift from x=190), the wall colour behind his head, and the room plaque.
const PLACE: Record<Scene, { tx: number; wall: string; room: string }> = {
  suite: { tx: 40, wall: SUITE, room: "MASTER SUITE" },
  foyer: { tx: 350, wall: FOYER, room: "THE FOYER" },
  board: { tx: 80, wall: BOARD, room: "THE BOARDROOM" },
  gallery: { tx: 140, wall: GALLERY, room: "THE GALLERY" },
  library: { tx: 100, wall: LIBRARY, room: "THE LIBRARY" },
  boutique: { tx: 200, wall: BOUTIQUE, room: "THE BOUTIQUE" },
  media: { tx: 40, wall: MEDIA, room: "THE MEDIA ROOM" },
  outro: { tx: 40, wall: SUITE, room: "MASTER SUITE" },
};

const POSES = [
  { at: 0, pose: S_IDLE },
  { at: T.teachW - 6, pose: S_POINT_UP },
  { at: T.readW + 20, pose: S_PROUD },
  { at: T.five - 2, pose: CLAP_OPEN },
  { at: T.clap - 6, pose: CLAP },
  { at: T.how - 4, pose: SPREAD },
  { at: T.one - 2, pose: B_IDLE },
  { at: T.cos, pose: B_THINK },
  { at: T.ask, pose: B_POINT },
  { at: T.right - 10, pose: B_TAP_UP },
  { at: T.right - 4, pose: B_TAP },
  { at: T.right + 6, pose: B_TAP_UP },
  { at: T.answers - 6, pose: B_BOSS },
  { at: T.two - 2, pose: IDLE },
  { at: T.idea - 4, pose: THINK },
  { at: T.machine - 10, pose: CRANK },
  { at: T.machine + 24, pose: CRANK_HAPPY },
  { at: T.three - 2, pose: IDLE },
  { at: T.teach, pose: POINT },
  { at: REACH - 8, pose: REACH_POSE },
  { at: HOLD - 6, pose: HOLD_BOOK },
  { at: T.lessons + 10, pose: HOLD_BOOK_HAPPY },
  { at: T.four - 2, pose: C_LEAN },
  { at: T.psych, pose: C_NEAR },
  { at: T.why, pose: C_FAR },
  { at: T.hesitate - 6, pose: C_THINK },
  { at: T.page - 8, pose: C_POINT },
  { at: T.fiveL - 2, pose: CARRY },
  { at: RELEASE, pose: OPEN },
  { at: T.brief - 6, pose: HOLD_UP },
  { at: T.cmds - 2, pose: S_POINT_TOP },
  { at: T.follow, pose: S_WAVE },
  { at: T.loop, pose: S_IDLE },
];

const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };
const animatePose = (frame: number, scene: Scene): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 6;
  const p: Pose = {
    ...body,
    head: [mid.head[0] + sway, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    hip: [body.hip[0] + sway * 0.2, body.hip[1]],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0], tip.hL[1] + Math.sin(frame / 11) * 4],
    hR: [tip.hR[0], tip.hR[1] + Math.cos(frame / 11) * 4],
  };
  // While the machine runs his hand stays on the crank knob.
  if (scene === "gallery" && frame >= T.machine - 2) {
    const k = crankKnob(spinAt(frame));
    p.hR = [k[0] - PLACE.gallery.tx, k[1]];
    p.eR = [(p.sh[0] + p.hR[0]) / 2 + 10, (p.sh[1] + p.hR[1]) / 2 + 40];
  }
  if (frame >= T.follow + 6 && frame < T.loop) p.hR = [p.hR[0] + Math.sin(frame / 2.6) * 28, p.hR[1]];
  // Walking in the media room: the legs swing in steps and the hip bobs; the arms keep carrying the stack.
  const w = walkWeight(frame);
  if (scene === "media" && w > 0) {
    const ph = ((frame - WALK[0]) / 15) * Math.PI * 2;
    const sw = Math.sin(ph);
    const lift = (c: number) => Math.max(0, c) * 22;
    const mix = (a: [number, number], b: [number, number]): [number, number] => [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w];
    p.fL = mix(p.fL, [190 + 56 * sw, 1650 - lift(Math.cos(ph))]);
    p.fR = mix(p.fR, [190 - 56 * sw, 1650 - lift(-Math.cos(ph))]);
    p.kL = mix(p.kL, [196 + 30 * sw, 1508 - lift(Math.cos(ph)) * 0.6]);
    p.kR = mix(p.kR, [196 - 30 * sw, 1508 - lift(-Math.cos(ph)) * 0.6]);
    const bob = Math.abs(Math.cos(ph)) * 8 * w;
    p.hip = [p.hip[0], p.hip[1] - bob];
    p.sh = [p.sh[0], p.sh[1] - bob];
    p.head = [p.head[0], p.head[1] - bob];
  }
  return p;
};

// 1 while he walks, easing in and out over 5 frames.
const walkWeight = (frame: number) => interpolate(frame, [WALK[0], WALK[0] + 5, WALK[1] - 5, WALK[1]], [0, 1, 1, 0], CLAMP);
// His shift across the room: in the media room he walks from x=230 to x=360.
const txAt = (scene: Scene, frame: number) =>
  scene === "media" ? interpolate(frame, [WALK[0], WALK[1]], [PLACE.media.tx, 170], { ...CLAMP, easing: (u) => u * u * (3 - 2 * u) }) : PLACE[scene].tx;

const blink = (frame: number) => {
  const p = (frame + 17) % 87;
  return p < 2 ? 0.4 : p < 5 ? 0 : p < 7 ? 0.5 : 1;
};

// The big gear's angle in degrees: starts on "You get a moving machine", speeds up over half a second.
const spinAt = (frame: number) => {
  const t = Math.max(0, frame - T.machine);
  return t < 15 ? (t * t) / 5 : 45 + (t - 15) * 6;
};

const PUNCHES = CUTS.map(([from]) => from);
// Two hits: the clap under the chandelier and the newspapers landing on the table.
const SHAKES = [T.clap, LAND];
const pop = (frame: number, from: number, cfg?: { damping: number; stiffness: number }) => (frame >= from ? enter(frame - from, cfg) : 0);

// Sparkles that burst out of one point, for the clap.
const Burst: React.FC<{ from: number; x: number; y: number }> = ({ from, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0 || t > 16) return null;
  return (
    <g opacity={1 - t / 16}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r1 = 40 + t * 9;
        return (
          <path
            key={i}
            d={`M${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1} L${x + Math.cos(a) * (r1 + 34)} ${y + Math.sin(a) * (r1 + 34)}`}
            stroke={GOLD}
            strokeWidth={10}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

// Where the newspaper stack is: in his arms, flying to the table, then on the table sliding apart.
const papersAt = (frame: number, pose: Pose, tx: number) => {
  const hand: [number, number] = [(pose.hL[0] + pose.hR[0]) / 2 + tx + 20, (pose.hL[1] + pose.hR[1]) / 2 - 6];
  const table: [number, number] = [0, 1468];
  if (frame < RELEASE) return { x: hand[0], y: hand[1], spread: 0, rot: 0 };
  const u = interpolate(frame, [RELEASE, LAND], [0, 1], CLAMP);
  // Falls straight down from where his hands let go, speeding up like a real drop.
  return {
    x: hand[0],
    y: hand[1] + (table[1] - hand[1]) * u * u,
    spread: interpolate(frame, [LAND, LAND + 10], [0, 1], CLAMP),
    rot: 0,
  };
};

// Same cues as v1 (approved 2026-11-21), on the v2 timing; the v1 bed (35.2 s) covers this 34.5 s video.
// Footsteps of the walk in the media room: one per half cycle (15 frames per full step cycle).
const STEPS = [0, 1, 2, 3].map((i) => WALK[0] + 4 + i * 7.5).map(Math.round);
// Few and varied: one sound per real action, a sound on both shakes, nothing on "because" so the loop runs clean.
const Soundtrack: React.FC = () => (
  <>
    {/* Speech RMS -23.0 dB, 0.3 dB under the v1 take (plays at 1.13), so 1.17 lands at the same level. */}
    {VOICE.file ? <Audio src={staticFile(VOICE.file)} volume={1.17} /> : null}
    {/* The bed measures -18.2 dB RMS; at 0.12 it sits about 15 dB under the voice. Ends low for the loop. */}
    <Audio src={staticFile("sfx/bgm-penthouse.wav")} volume={(f) => interpolate(f, [0, 8, END - 20, END], [0.07, 0.12, 0.12, 0.05], CLAMP)} />
    {[T.teachW, T.advise, T.readW].map((f, i) => (
      <Sfx key={f} name="pop" from={f} volume={0.26 + i * 0.04} />
    ))}
    <Sfx name="whoosh" from={T.five - 4} volume={0.24} />
    <Sfx name="impact" from={T.clap} volume={0.34} />
    <Sfx name="sparkle" from={T.clap + 1} volume={0.3} />
    <Sfx name="ding" from={T.right} volume={0.42} />
    {LAMPS.map((f) => (
      <Sfx key={f} name="click" from={f} volume={0.16} />
    ))}
    <Sfx name="paper" from={T.answers - 10} volume={0.32} />
    <Sfx name="sweep" from={T.machine} volume={0.26} />
    <Sfx name="sparkle" from={T.machine + 8} volume={0.22} />
    <Sfx name="paper" from={TAKEN} volume={0.3} />
    <Sfx name="paper" from={HOLD + 4} volume={0.26} />
    {[0, 1, 2].map((i) => (
      <Sfx key={i} name="check" from={T.lessons + 4 + i * 6} volume={0.3} />
    ))}
    <Sfx name="pop" from={T.hesitate} volume={0.3} />
    <Sfx name="chime" from={T.page} volume={0.3} />
    <Sfx name="beep" from={T.days} volume={0.14} />
    {STEPS.map((f, i) => (
      <Sfx key={f} name={`thud${i % 2}`} from={f} volume={0.22} />
    ))}
    <Sfx name="impact" from={LAND} volume={0.34} />
    <Sfx name="thud3" from={LAND} volume={0.4} />
    <Sfx name="paper" from={LAND + 2} volume={0.34} />
    <Sfx name="pop" from={T.brief - 2} volume={0.3} />
    <Sfx name="whoosh" from={T.cmds - 4} volume={0.22} />
  </>
);


// Word-by-word captions: the chunk being spoken, popping in. Skill names keep their real case, in gold.
const CHUNKS = VOICE.chunks.map(([sec, t]) => [at(sec), t] as [number, string]);
const ChunkCaption: React.FC<{ frame: number; y: number; size: number }> = ({ frame, y, size }) => {
  const i = CHUNKS.filter(([f]) => f <= frame).length - 1;
  if (i < 0) return null;
  const [from, words] = CHUNKS[i];
  const s = 0.85 + 0.15 * Math.min(enter(frame - from, { damping: 12, stiffness: 260 }), 1.05);
  const skill = words !== words.toUpperCase();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", transform: `translateY(-50%) scale(${s})` }}>
      <div
        style={{
          fontFamily,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.15,
          color: skill ? GOLD : CREAM,
          background: INK,
          padding: "10px 30px 14px",
          borderRadius: 18,
          border: `4px solid ${GOLD}`,
          whiteSpace: "nowrap",
        }}
      >
        {words}
      </div>
    </div>
  );
};

export const PenthouseV2: React.FC<{ layout: "split" | "full" }> = ({ layout }) => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const tx = txAt(scene, frame);
  const pose = animatePose(frame, scene);
  const head: [number, number] = [pose.head[0] + tx, pose.head[1]];
  // After RELEASE the stack falls from where his hands were when they let go.
  const held = frame < RELEASE ? frame : RELEASE - 1;
  const papers = papersAt(frame, animatePose(held, scene), txAt(scene, held));

  const split = layout === "split";
  const step = STEP[scene];

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <clipPath id="lowerHalf">
            <rect x={0} y={960} width={1080} height={960} />
          </clipPath>
        </defs>
        {/* In the split layout the room (y 660 to 1700) is scaled into the lower half. */}
        {/* The clip sits on an untransformed group: a clip on the scaled group would be scaled with it. */}
        <g clipPath={split ? "url(#lowerHalf)" : undefined}>
        <g transform={split ? "translate(540 960) scale(0.92) translate(-540 -660)" : undefined}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "suite" ? (
            <Suite badges={[T.teachW, T.advise, T.readW].map((f) => pop(frame, f, { damping: 11, stiffness: 190 }))} />
          ) : null}
          {scene === "outro" ? <Suite /> : null}
          {scene === "suite" || scene === "outro" ? <Armchair x={195 + tx} /> : null}
          {scene === "foyer" ? <Foyer glow={interpolate(frame, [T.clap, T.clap + 4], [0, 1], CLAMP)} /> : null}
          {scene === "board" ? <Boardroom lit={LAMPS.map((f) => interpolate(frame, [f, f + 3], [0, 1], CLAMP))} /> : null}
          {/* His chair goes over the room but under him; the table goes over him (see BoardTable below). */}
          {scene === "board" ? <BossChair x={195 + tx} /> : null}
          {scene === "gallery" ? <Gallery spin={spinAt(frame)} glowOn={interpolate(frame, [T.machine + 8, T.machine + 16], [0, 1], CLAMP)} /> : null}
          {scene === "library" ? (
            <Library taken={frame >= TAKEN} ticks={[0, 1, 2].map((i) => pop(frame, T.lessons + 4 + i * 6, { damping: 11, stiffness: 200 }))} />
          ) : null}
          {scene === "boutique" ? <Boutique pick={interpolate(frame, [T.page, T.page + 16], [0, 1], CLAMP)} /> : null}
          {scene === "media" ? (
            <>
              <MediaRoom screens={interpolate(frame, [T.days, T.days + 30], [0, 1], CLAMP)} />
              {frame >= RELEASE ? <Papers {...papers} /> : null}
            </>
          ) : null}

          <g transform={`translate(${tx} 0)`}>
            <Stickman pose={pose} thumb={0} headFill={place.wall} bendy eyes={blink(frame)} />
            {scene === "library" && frame >= TAKEN ? (
              <Book hand={pose.hR} open={frame >= HOLD + 4 ? 1 : 0} ribbon={interpolate(frame, [T.lessons, T.lessons + 10], [0, 1], CLAMP)} />
            ) : null}
            {scene === "media" ? <Brief hand={pose.hR} s={pop(frame, T.brief - 2, { damping: 11, stiffness: 190 })} /> : null}
          </g>
          {scene === "board" ? <BoardTable card={interpolate(frame, [T.answers - 10, T.answers + 8], [0, 1], CLAMP)} /> : null}
          {scene === "media" && frame < RELEASE ? <Papers {...papers} /> : null}
          {scene === "foyer" ? <Burst from={T.clap} x={PLACE.foyer.tx + 192} y={1170} /> : null}
          {scene === "boutique" && frame >= T.hesitate ? (
            <text
              x={head[0] + 70}
              y={head[1] - 100}
              textAnchor="middle"
              fontSize={110}
              fill={GOLD}
              {...text}
              transform={`translate(${head[0] + 70} ${head[1] - 140}) scale(${Math.min(pop(frame, T.hesitate, { damping: 9, stiffness: 200 }), 1.15)}) translate(${-(head[0] + 70)} ${-(head[1] - 140)})`}
              opacity={interpolate(frame, [T.page - 4, T.page + 4], [1, 0], CLAMP)}
            >
              ?
            </text>
          ) : null}
        </g>
        </g>
        </g>
        {split ? <DemoPanel frame={frame} seg={scene} at={T} /> : <TourFrame room={place.room} />}
        {!split && step ? <Stepper n={step[0]} name={step[1]} y={110} /> : null}
        {!split && scene === "suite" ? (
          <text x={540} y={300} textAnchor="middle" fontSize={110} fill={GOLD} {...text} opacity={interpolate(frame, [56, 64], [1, 0], CLAMP)}>
            HOLD THE HIRE
          </text>
        ) : null}
      </svg>
      <ChunkCaption frame={frame} y={split ? 960 : 500} size={split ? 76 : 92} />

    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, about 15 frames after each cue.
const SHOTS: [string, number][] = [
  ["1 HOOK, HOLD THE HIRE", 24],
  ["2 HOOK, TUTOR ADVISOR", T.advise + 12],
  ["3 HOOK, BEFORE YOU TRY, PRICES STRUCK", T.read + 14],
  ["4 FOYER, CLAP, 5 SKILLS", T.clap + 4],
  ["5 CHIEF, RAISE OR CUT?", T.ask + 26],
  ["6 CHIEF, CFO AND CEO", T.right + 16],
  ["7 CHIEF, ONE ANSWER", T.answers + 14],
  ["8 ANATOMY, TYPED", T.idea + 30],
  ["9 ANATOMY, MOVING MACHINE", T.machine + 18],
  ["10 TEACH, PICK A TOPIC", T.folder + 20],
  ["11 TEACH, YOU ARE HERE", T.lessons + 30],
  ["12 PSYCH, WHY DON'T THEY BUY?", T.hesitate + 12],
  ["13 PSYCH, BIASES NAMED", T.page + 16],
  ["14 LAST30DAYS, 30 DAYS FILL", T.days + 24],
  ["15 LAST30DAYS, PAPERS, REDDIT", LAND + 14],
  ["16 LAST30DAYS, ONE CITED BRIEF", T.brief + 16],
  ["17 OUTRO, COMMANDS", T.cmds + 20],
  ["18 NEAR THE END, LOOPS", END - 9],
];

const Frames: React.FC<{ from: number; layout: "split" | "full" }> = ({ from, layout }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div style={{ position: "absolute", width: 1080, height: 1920, overflow: "hidden", transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Freeze frame={shot}>
            <PenthouseV2 layout={layout} />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s (measured voice)`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const PenthouseV2Composition = () => (
  <>
    <Composition id="PenthouseV2Split" component={PenthouseV2} defaultProps={{ layout: "split" as const }} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    <Composition id="PenthouseV2Full" component={PenthouseV2} defaultProps={{ layout: "full" as const }} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition id="PenthouseV2Frames" component={Frames} defaultProps={{ from: 0, layout: "split" as const }} durationInFrames={END} fps={FPS} width={1620} height={2020} />
  </>
);
