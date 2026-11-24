import { AbsoluteFill, Audio, Composition, Freeze, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import { VOICE } from "./lines";
import {
  BOOK,
  Box,
  Brigade,
  Bug,
  COUNTER,
  Clipboard,
  CommandTicket,
  DOORS,
  Helper,
  INK,
  Jar,
  LINE,
  LINE_POT,
  Lens,
  OrderTicket,
  PANTRY,
  PASS,
  PULLED,
  PULLED_COLOR,
  Pantry,
  Pot,
  RAIL,
  RecipeBook,
  RecipeCorner,
  Shine,
  Spoon,
  TASTE,
  TASTE_POT,
  Tasting,
  TheCounter,
  TheLine,
  ThePass,
  TicketRail,
  Toque,
  helperPoint,
  jarSpot,
} from "./Sets";

// ECC, told as a cooking show: the AI cooks alone, then one install hands it a whole kitchen brigade.
const at = (second: number) => Math.round(second * FPS);
const L = VOICE.lines;
// Short tail: "because..." runs straight into the hook when the Short loops. 31.05 s, under the 35 s ceiling.
const END = at(VOICE.seconds + 0.3);
// Starts come from lines.ts. Cues inside a phrase sit at a word gap of the take (-30 dB, 0.05 s).
const cue = (line: keyof typeof L, share = 0) => at(L[line][0] + L[line][1] * share);
const T = {
  alone: at(1.47), // gap 1.41-1.47
  agents: cue("agents"),
  planW: at(3.84), // gap 3.73-3.84
  testW: at(4.37), // gap 4.26-4.37
  reviewW: at(4.71), // gap 4.66-4.71
  ships: at(5.49), // gap 5.43-5.49, "before it ships"
  ecc: cue("ecc"),
  install: cue("install"),
  team: cue("team"),
  first: cue("first"),
  plans: cue("plans"),
  slash: cue("slash"),
  cmd: at(12.01), // gap 11.89-12.01, "E C C plan"
  red: cue("red"),
  green: cue("green"),
  review: cue("review"),
  fresh: at(16.35), // gap 16.24-16.35
  checks: at(16.9), // estimate inside "fresh eyes checks the work"
  save: cue("save"),
  resume: cue("resume"),
  skills: cue("skills"),
  loaded: cue("loaded"),
  needed: at(22.27), // gap 22.14-22.27, "only when needed"
  catch: cue("catch"),
  once: cue("once"),
  onceW: at(25.2), // gap 25.12-25.20
  twice: cue("twice"),
  double: at(26.11), // gap 26.04-26.11
  every: at(26.69), // gap 26.54-26.69
  cmds: cue("cmds"),
  follow: cue("follow"),
  because: cue("because"),
};
// The box falls on "One install" and opens; seven cooks hop out of it on "a whole team".
const BOX_DROP = T.install - 6;
const BOX_LAND = T.install + 2;
const BOX_OPEN = T.team - 10;
const HOPS = [0, 1, 2, 3, 4, 5, 6].map((i) => T.team - 14 + i * 3);
const HOP_LEN = 14;
const SLOTS = [430, 520, 610, 700, 790, 880, 970];
// The jar leaves the shelf on "only when needed" and lands in his hand.
const JAR_FLY: [number, number] = [T.needed, T.needed + 14];
// The second box falls on "Twice" and lands with a shake.
const BOX2: [number, number] = [T.twice, T.twice + 8];

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
// At the stove: right hand on the spoon over the pot rim.
const STIR = stand({ head: [212, 1040], sh: [200, 1132], eR: [300, 1160], hR: [385, 1080], smile: -0.1 });
const LOOK_UP: Pose = { ...STIR, head: [214, 1026], look: 0.6, smile: -0.6 };
const SHOCK = stand({ head: [172, 1034], sh: [180, 1132], eL: [110, 1180], hL: [92, 1092], eR: [262, 1180], hR: [290, 1092], smile: -1.3 });
const SPREAD = stand({ look: 0, head: [192, 1032], eL: [80, 1160], hL: [10, 1090], eR: [300, 1160], hR: [370, 1090], smile: 1.6 });
const POINT_UP = stand({ head: [212, 1036], eR: [300, 1130], hR: [390, 1030], smile: 1 });
const PROUD = stand({ head: [205, 1036], smile: 1.3 });
const DIP = stand({ sh: [205, 1140], head: [222, 1046], eR: [300, 1215], hR: [390, 1270], smile: 0.3 });
const TASTE_SOUR = stand({ head: [200, 1042], eR: [300, 1190], hR: [300, 1104], smile: -1.3 });
const TASTE_GOOD = stand({ head: [200, 1038], eR: [300, 1190], hR: [300, 1104], eL: [96, 1210], hL: [70, 1130], smile: 1.6 });
const CROSSED = stand({ eL: [120, 1230], hL: [250, 1212], eR: [270, 1232], hR: [140, 1208], smile: 0.3 });
const CROSSED_HAPPY: Pose = { ...CROSSED, head: [200, 1036], smile: 1.4 };
const HOLD_BOOK = stand({ look: 0.6, head: [205, 1048], eL: [150, 1240], hL: [236, 1236], eR: [270, 1236], hR: [300, 1240], smile: 0.6 });
const HOLD_BOOK_HAPPY: Pose = { ...HOLD_BOOK, head: [205, 1040], smile: 1.4 };
const LOOK_SHELF = stand({ head: [206, 1034], look: 1, smile: 0.4 });
const REACH = stand({ sh: [205, 1135], head: [222, 1036], eR: [300, 1150], hR: [360, 1090], smile: 0.6 });
const HOLD_JAR = stand({ head: [204, 1040], eR: [292, 1170], hR: [320, 1080], smile: 1.4 });
const WARN = stand({ head: [200, 1040], eR: [282, 1130], hR: [300, 1010], smile: -0.4 });
const POINT_BOX = stand({ head: [214, 1040], eR: [300, 1200], hR: [400, 1230], smile: 0.8 });
const FACEPALM = stand({ head: [204, 1052], sh: [196, 1134], eR: [268, 1150], hR: [232, 1040], smile: -1.2, look: 0.4 });
const WAVE = stand({ look: 0, head: [196, 1034], eR: [300, 1100], hR: [330, 960], smile: 1.3 });

// The cooks of the brigade, drawn small.
const H_STAND = stand({ look: 0, smile: 1 });
const H_LAND = stand({ look: 0, eL: [110, 1180], hL: [80, 1090], eR: [270, 1180], hR: [300, 1090], smile: 1.4 });
const H_WRITE = stand({ look: -1, head: [185, 1040], eL: [140, 1220], hL: [130, 1160], eR: [240, 1230], hR: [180, 1170], smile: 0.6 });
const H_LENS = stand({ look: -1, head: [180, 1044], eL: [120, 1150], hL: [40, 1050], eR: [250, 1240], hR: [262, 1340], smile: 0.8 });

type Scene = "solo" | "brigade" | "plan" | "test" | "pass" | "book" | "pantry" | "counter" | "outro";
const CUTS: [number, Scene][] = [
  [0, "solo"],
  [T.ecc - 2, "brigade"],
  [T.first - 2, "plan"],
  [T.red - 2, "test"],
  [T.review - 2, "pass"],
  [T.save - 2, "book"],
  [T.skills - 2, "pantry"],
  [T.catch - 2, "counter"],
  [T.cmds - 2, "outro"],
];
const cutOf = (s: Scene) => CUTS.find(([, name]) => name === s)![0];
const sceneAt = (frame: number): Scene => CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "solo");

// Where he stands (shift from x=190), the wall behind his head, and the station on the order ticket.
const PLACE: Record<Scene, { tx: number; wall: string; station: string }> = {
  solo: { tx: 170, wall: LINE, station: "THE LINE" },
  brigade: { tx: 40, wall: DOORS, station: "THE BRIGADE" },
  plan: { tx: 40, wall: RAIL, station: "TICKET RAIL" },
  test: { tx: 30, wall: TASTE, station: "TASTING" },
  pass: { tx: 0, wall: PASS, station: "THE PASS" },
  book: { tx: 80, wall: BOOK, station: "RECIPE BOOK" },
  pantry: { tx: 0, wall: PANTRY, station: "THE PANTRY" },
  counter: { tx: 0, wall: COUNTER, station: "THE COUNTER" },
  outro: { tx: 170, wall: LINE, station: "THE LINE" },
};

const POSES = [
  { at: 0, pose: STIR },
  { at: T.planW - 4, pose: LOOK_UP },
  { at: T.ships - 3, pose: SHOCK },
  { at: T.ecc - 2, pose: IDLE },
  { at: T.ecc + 4, pose: PROUD },
  { at: T.team - 6, pose: SPREAD },
  { at: T.first - 2, pose: IDLE },
  { at: T.plans - 4, pose: POINT_UP },
  { at: T.cmd + 20, pose: PROUD },
  { at: T.red - 2, pose: DIP },
  { at: T.red + 4, pose: TASTE_SOUR },
  { at: T.green - 2, pose: TASTE_GOOD },
  { at: T.review - 2, pose: CROSSED },
  { at: T.checks + 6, pose: CROSSED_HAPPY },
  { at: T.save - 2, pose: HOLD_BOOK },
  { at: T.resume + 14, pose: HOLD_BOOK_HAPPY },
  { at: T.skills - 2, pose: LOOK_SHELF },
  { at: T.needed - 8, pose: REACH },
  { at: JAR_FLY[1] + 2, pose: HOLD_JAR },
  { at: T.catch - 2, pose: WARN },
  { at: T.once, pose: POINT_BOX },
  { at: T.double - 4, pose: FACEPALM },
  { at: T.cmds - 2, pose: STIR },
  { at: T.follow - 2, pose: WAVE },
  { at: T.because - 4, pose: STIR },
];

const stirring = (frame: number, scene: Scene) =>
  (scene === "solo" && frame < T.ships - 3) || (scene === "outro" && (frame < T.follow - 2 || frame >= T.because - 4));

const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };
const animatePose = (frame: number, scene: Scene): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 5;
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
  // Stirring: the spoon hand circles over the pot.
  if (stirring(frame, scene)) p.hR = [p.hR[0] + Math.cos(frame / 4) * 20, p.hR[1] + Math.sin(frame / 4) * 8];
  if (frame >= T.follow + 4 && frame < T.because - 4) p.hR = [p.hR[0] + Math.sin(frame / 2.6) * 28, p.hR[1]];
  return p;
};

const blink = (frame: number) => {
  const p = (frame + 17) % 87;
  return p < 2 ? 0.4 : p < 5 ? 0 : p < 7 ? 0.5 : 1;
};
const helperBlink = (frame: number, i: number) => ((frame + i * 23) % 97 < 4 ? 0 : 1);

const PUNCHES = CUTS.map(([from]) => from);
// Three hits: the bug jumps out of the pot, the brigade lands, the second box lands.
const SHAKES = [T.ships, HOPS[0] + HOP_LEN, BOX2[1]];
const pop = (frame: number, from: number, cfg?: { damping: number; stiffness: number }) => (frame >= from ? enter(frame - from, cfg) : 0);
const step = (n: number, name: string, atFrame: number) => ({ text: `${n} ${name}`, at: atFrame, size: 110, boxes: { [`${n}`]: AMBER } });

const KEYS = [0, 1, 2, 3].map((i) => T.cmd + i * 4);
// Few and varied: one sound per real action, a sound on all three shakes, nothing on "because" so the loop runs clean.
const Soundtrack: React.FC = () => (
  <>
    {/* Speech RMS -23.1 dB, 0.4 dB under the penthouse take (plays at 1.13), so 1.18 lands at the same level. */}
    {VOICE.file ? <Audio src={staticFile(VOICE.file)} volume={1.18} /> : null}
    {/* The bed measures -17.3 dB RMS; at 0.11 it sits about 15 dB under the voice. Ends low for the loop. */}
    <Audio src={staticFile("sfx/bgm-ecc.wav")} volume={(f) => interpolate(f, [0, 8, END - 20, END], [0.06, 0.11, 0.11, 0.05], CLAMP)} />
    {[T.planW, T.testW, T.reviewW].map((f, i) => (
      <Sfx key={f} name="pop" from={f} volume={0.24 + i * 0.04} />
    ))}
    <Sfx name="error" from={T.ships} volume={0.26} />
    <Sfx name="impact" from={T.ships} volume={0.3} />
    <Sfx name="sweep" from={T.ecc} volume={0.22} />
    <Sfx name="whoosh" from={BOX_DROP} volume={0.2} />
    <Sfx name="thud3" from={BOX_LAND} volume={0.36} />
    <Sfx name="paper" from={BOX_OPEN} volume={0.28} />
    <Sfx name="sparkle" from={HOPS[0]} volume={0.24} />
    <Sfx name="impact" from={HOPS[0] + HOP_LEN} volume={0.32} />
    <Sfx name="whoosh" from={T.plans - 4} volume={0.2} />
    {KEYS.map((f, i) => (
      <Sfx key={f} name={`key${i}`} from={f} volume={0.22} />
    ))}
    {[0, 1, 2].map((i) => (
      <Sfx key={i} name="check" from={T.cmd + 16 + i * 6} volume={0.28} />
    ))}
    <Sfx name="womp" from={T.red + 6} volume={0.26} />
    <Sfx name="chime" from={T.green} volume={0.3} />
    <Sfx name="thud0" from={T.review + 10} volume={0.2} />
    <Sfx name="sparkle" from={T.fresh} volume={0.24} />
    <Sfx name="stamp" from={T.checks + 4} volume={0.32} />
    <Sfx name="paper" from={T.save + 8} volume={0.3} />
    <Sfx name="paper" from={T.resume + 14} volume={0.28} />
    <Sfx name="sparkle" from={T.loaded} volume={0.22} />
    <Sfx name="whoosh" from={JAR_FLY[0]} volume={0.2} />
    <Sfx name="click" from={JAR_FLY[1]} volume={0.26} />
    <Sfx name="beep" from={T.catch} volume={0.16} />
    <Sfx name="check" from={T.onceW} volume={0.3} />
    <Sfx name="whoosh" from={BOX2[0] - 2} volume={0.2} />
    <Sfx name="impact" from={BOX2[1]} volume={0.32} />
    <Sfx name="thud2" from={BOX2[1]} volume={0.34} />
    <Sfx name="womp" from={T.double + 6} volume={0.26} />
    <Sfx name="paper" from={cutOf("outro") + 4} volume={0.26} />
  </>
);

// The brigade: each cook hops out of the box in an arc and lands in its slot.
const Brigades: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    {HOPS.map((start, i) => {
      if (frame < start) return null;
      const u = interpolate(frame, [start, start + HOP_LEN], [0, 1], CLAMP);
      const x = interpolate(u, [0, 1], [700, SLOTS[i]]);
      const y = interpolate(u, [0, 1], [1540, 1650]) - Math.sin(u * Math.PI) * 300;
      const s = interpolate(u, [0, 1], [0.2, 0.42]);
      const pose = blendPoses(frame, [
        { at: 0, pose: H_LAND },
        { at: start + HOP_LEN + 4, pose: H_STAND },
      ]);
      return <Helper key={i} x={x} y={y} s={s} pose={pose} wall={DOORS} eyes={helperBlink(frame, i)} />;
    })}
  </>
);

export const EccVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const tx = place.tx;
  const pose = animatePose(frame, scene);
  const hand: [number, number] = [pose.hR[0] + tx, pose.hR[1]];
  const line = scene === "solo" || scene === "outro";

  // The reviewer walks in from the right on "A reviewer", raises the lens on "fresh eyes".
  const revX = interpolate(frame, [T.review, T.review + 14], [1160, 930], { ...CLAMP, easing: (u) => 1 - (1 - u) * (1 - u) });
  const revPose = blendPoses(frame, [
    { at: 0, pose: H_STAND },
    { at: T.fresh - 8, pose: H_LENS },
  ]);
  const revS = 0.6;
  // The planner writes on his clipboard: the hand bobs a little.
  const planPose: Pose = { ...H_WRITE, hR: [H_WRITE.hR[0] + Math.sin(frame / 3) * 6, H_WRITE.hR[1] + Math.cos(frame / 3) * 4] };

  // Where the jar is: on the shelf, flying, then in his hand.
  const jarHand: [number, number] = [hand[0], hand[1] + 58];
  const jarShelf = jarSpot(...PULLED);
  const ju = interpolate(frame, JAR_FLY, [0, 1], CLAMP);
  const jarPos: [number, number] =
    frame < JAR_FLY[1] ? [jarShelf[0] + (jarHand[0] - jarShelf[0]) * ju, jarShelf[1] + (jarHand[1] - jarShelf[1]) * ju - Math.sin(ju * Math.PI) * 120] : jarHand;

  // The tasting spoon: down in the pot, then up at his mouth.
  const tasteU = interpolate(frame, [T.red - 2, T.red + 8], [0, 1], CLAMP);
  const spoonTip: [number, number] = [hand[0] + 70 - tasteU * 122, hand[1] + 70 - tasteU * 104];

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "solo" ? <TheLine signs={[T.planW, T.testW, T.reviewW].map((f) => pop(frame, f, { damping: 11, stiffness: 190 }))} /> : null}
          {scene === "outro" ? (
            <>
              <TheLine />
              <CommandTicket s={pop(frame, cutOf("outro") + 4, { damping: 12, stiffness: 180 })} />
            </>
          ) : null}
          {line ? (
            <>
              {stirring(frame, scene) ? <Spoon from={hand} to={[hand[0] + 50, hand[1] + 150]} /> : <Spoon from={[586, 1060]} to={[640, 1230]} />}
              <Pot x={LINE_POT[0]} y={LINE_POT[1]} />
            </>
          ) : null}
          {scene === "solo" && frame >= T.ships ? (
            <Bug x={LINE_POT[0] + 30} y={interpolate(frame, [T.ships, T.ships + 8], [1200, 1100], CLAMP)} s={Math.min(1.1, pop(frame, T.ships, { damping: 9, stiffness: 220 }))} />
          ) : null}

          {scene === "brigade" ? (
            <>
              <Brigade neon={interpolate(frame, [T.ecc, T.ecc + 10], [0, 1], CLAMP)} />
              {frame >= BOX_DROP ? (
                <Box
                  x={700}
                  y={interpolate(frame, [BOX_DROP, BOX_LAND], [700, 1650], { ...CLAMP, easing: (u) => u * u })}
                  open={interpolate(frame, [BOX_OPEN, BOX_OPEN + 8], [0, 1], CLAMP)}
                />
              ) : null}
              <Brigades frame={frame} />
            </>
          ) : null}

          {scene === "plan" ? (
            <>
              <TicketRail
                slide={pop(frame, T.plans - 4, { damping: 14, stiffness: 140 })}
                typed={interpolate(frame, [T.cmd, T.cmd + 14], [0, 1], CLAMP)}
                ticks={[0, 1, 2].map((i) => pop(frame, T.cmd + 16 + i * 6, { damping: 11, stiffness: 200 }))}
              />
              <Helper x={960} y={1650} s={0.55} pose={planPose} wall={RAIL} eyes={helperBlink(frame, 2)} />
              <Clipboard hand={helperPoint(960, 1650, 0.55, planPose.hL)} />
            </>
          ) : null}

          {scene === "test" ? (
            <>
              <Tasting needle={interpolate(frame, [T.green, T.green + 10], [0, 1], { ...CLAMP, easing: (u) => 1 - Math.pow(1 - u, 3) })} />
              <Pot x={TASTE_POT[0]} y={TASTE_POT[1]} s={0.8} />
            </>
          ) : null}

          {scene === "pass" ? (
            <>
              <ThePass check={pop(frame, T.checks + 4, { damping: 10, stiffness: 200 })} />
              <Helper x={revX} y={1650} s={revS} pose={revPose} wall={PASS} eyes={helperBlink(frame, 4)} />
              {frame >= T.fresh - 8 ? <Lens hand={helperPoint(revX, 1650, revS, revPose.hL)} /> : null}
              <Shine {...(() => {
                const [x, y] = helperPoint(revX, 1650, revS, revPose.head);
                return { x, y: y - 30, s: pop(frame, T.fresh, { damping: 10, stiffness: 200 }) };
              })()} />
            </>
          ) : null}

          {scene === "book" ? <RecipeCorner day={interpolate(frame, [T.resume, T.resume + 20], [0, 1], CLAMP)} /> : null}
          {scene === "pantry" ? <Pantry glow={interpolate(frame, [T.loaded, T.loaded + 6], [0, 1], CLAMP)} gone={frame >= JAR_FLY[0]} /> : null}
          {scene === "counter" ? (
            <TheCounter
              beacon={interpolate(frame, [T.catch, T.catch + 6], [0, 1], CLAMP)}
              once={pop(frame, T.onceW, { damping: 10, stiffness: 200 })}
              box2={frame >= BOX2[0] ? interpolate(frame, BOX2, [0, 1], { ...CLAMP, easing: (u) => u * u }) : -1}
              double={interpolate(frame, [T.double, T.double + 12], [0, 1], CLAMP)}
            />
          ) : null}

          <g transform={`translate(${tx} 0)`}>
            <Stickman pose={pose} thumb={scene === "test" ? interpolate(frame, [T.green + 2, T.green + 8], [0, 1], CLAMP) : 0} headFill={place.wall} bendy eyes={blink(frame)} />
            <Toque x={pose.head[0]} y={pose.head[1] - 62} />
            {scene === "book" ? (
              <RecipeBook
                hands={[(pose.hL[0] + pose.hR[0]) / 2, (pose.hL[1] + pose.hR[1]) / 2 - 10]}
                open={frame < T.save + 8 || frame >= T.resume + 14 ? 1 : 0}
                saved={interpolate(frame, [T.save + 12, T.save + 18], [0, 1], CLAMP)}
              />
            ) : null}
          </g>
          {/* The tasting spoon goes over him, so it reads at his mouth. */}
          {scene === "test" ? <Spoon from={hand} to={spoonTip} /> : null}
          {scene === "pantry" && frame >= JAR_FLY[0] ? <Jar x={jarPos[0]} y={jarPos[1]} color={PULLED_COLOR} /> : null}
        </g>
        <OrderTicket n={CUTS.findIndex(([, s]) => s === scene) + 1} label={place.station} />
      </svg>

      {/* First two seconds: on-screen words that differ from the spoken line. */}
      <Caption
        plain
        from={0}
        to={cutOf("brigade")}
        lines={[
          { text: "ONE AI.", at: 0, size: 110 },
          { text: "ZERO REVIEWERS.", at: T.alone - 8, size: 92, color: RED },
          { text: "72 AGENTS COULD", at: T.agents, size: 80, boxes: { "72": AMBER } },
          { text: "PLAN TEST REVIEW", at: T.planW, ats: [T.planW, T.testW, T.reviewW], size: 80, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={cutOf("brigade")}
        to={cutOf("plan")}
        lines={[
          { text: "THAT'S ECC", at: cutOf("brigade"), size: 130, boxes: { ECC: AMBER } },
          { text: "ONE INSTALL", at: T.install - 2, size: 96 },
          { text: "A WHOLE TEAM", at: T.team - 2, size: 96, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={cutOf("plan")}
        to={cutOf("test")}
        lines={[step(1, "PLAN FIRST", cutOf("plan")), { text: "/ecc:plan", at: T.cmd - 2, size: 100, color: AMBER }]}
      />
      <Caption
        plain
        from={cutOf("test")}
        to={cutOf("pass")}
        lines={[
          step(2, "TESTS", cutOf("test")),
          { text: "GO RED", at: T.red + 6, size: 100, boxes: { RED } },
          { text: "THEN GREEN", at: T.green - 2, size: 100, boxes: { GREEN } },
        ]}
      />
      <Caption
        plain
        from={cutOf("pass")}
        to={cutOf("book")}
        lines={[
          step(3, "REVIEW", cutOf("pass")),
          { text: "FRESH EYES", at: T.fresh - 2, size: 100, color: AMBER },
          { text: "CHECK THE WORK", at: T.checks - 2, size: 80, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={cutOf("book")}
        to={cutOf("pantry")}
        lines={[
          step(4, "REMEMBER", cutOf("book")),
          { text: "SAVE THE SESSION", at: T.save, size: 80 },
          { text: "RESUME TOMORROW", at: T.resume, size: 80, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={cutOf("pantry")}
        to={cutOf("counter")}
        lines={[
          { text: "328 SKILLS", at: cutOf("pantry"), size: 140, boxes: { "328": AMBER } },
          { text: "LOADED ONLY", at: T.loaded - 2, size: 90 },
          { text: "WHEN NEEDED", at: T.needed - 2, size: 90, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={cutOf("counter")}
        to={cutOf("outro")}
        lines={[
          { text: "ONE CATCH", at: cutOf("counter"), size: 120, boxes: { CATCH: RED } },
          { text: "INSTALL ONCE", at: T.once, size: 96, color: GREEN },
          { text: "TWICE = DOUBLE", at: T.twice, size: 96, color: RED },
        ]}
      />
      <Caption
        plain
        from={cutOf("outro")}
        to={END + 30}
        lines={[
          { text: "COMMANDS", at: cutOf("outro"), size: 120, color: AMBER },
          { text: "IN THE CAPTION", at: T.cmds + 8, size: 84 },
          { text: "FOLLOW STICKMAN SHIPS", at: T.follow, size: 66, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "BECAUSE...", at: T.because, size: 100, color: AMBER },
        ]}
      />
    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, about 15 frames after each cue.
const SHOTS: [string, number][] = [
  ["1 LINE, STIRRING ALONE", T.alone + 14],
  ["2 LINE, 72 AGENTS COULD", T.agents + 20],
  ["3 LINE, EMPTY STATIONS", T.reviewW + 12],
  ["4 LINE, THE BUG SHIPS", T.ships + 10],
  ["5 BRIGADE, THAT'S ECC", T.ecc + 18],
  ["6 BRIGADE, ONE INSTALL", T.install + 14],
  ["7 BRIGADE, A WHOLE TEAM", HOPS[6] + HOP_LEN + 4],
  ["8 RAIL, IT PLANS", T.plans + 28],
  ["9 RAIL, /ecc:plan", T.cmd + 32],
  ["10 TASTING, RED", T.red + 16],
  ["11 TASTING, GREEN", T.green + 18],
  ["12 PASS, A REVIEWER", T.review + 18],
  ["13 PASS, FRESH EYES", T.fresh + 22],
  ["14 PASS, CHECKED", T.checks + 18],
  ["15 BOOK, SAVED", T.save + 22],
  ["16 BOOK, RESUME TOMORROW", T.resume + 24],
  ["17 PANTRY, 328 SKILLS", T.skills + 16],
  ["18 PANTRY, ONLY WHEN NEEDED", T.needed + 24],
  ["19 COUNTER, ONE CATCH", T.catch + 14],
  ["20 COUNTER, INSTALL ONCE", T.onceW + 4],
  ["21 COUNTER, TWICE", BOX2[1] + 6],
  ["22 COUNTER, DOUBLE EVERYTHING", T.every + 14],
  ["23 LINE, COMMANDS IN THE CAPTION", T.cmds + 18],
  ["24 LAST FRAME, LOOPS TO THE HOOK", END - 1],
];

const Frames: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div style={{ position: "absolute", width: 1080, height: 1920, overflow: "hidden", transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Freeze frame={shot}>
            <EccVideo />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s (measured voice)`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const EccComposition = () => (
  <>
    <Composition id="EccKitchen" component={EccVideo} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition id="EccFrames" component={Frames} defaultProps={{ from: 0 }} durationInFrames={END} fps={FPS} width={1620} height={2020} />
  </>
);
