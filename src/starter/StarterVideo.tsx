import { AbsoluteFill, Audio, Composition, Freeze, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import { VOICE } from "./lines";
import { BugHunt, Burst, CANYON, Camp, Canyon, FOREST, Helper, Hud, INK, MEADOW, Meadow, NIGHT, Note, Pouch, QuestBoard, SHOP, Shop, TRAIL, Tablet, Trail, VILLAGE } from "./Sets";

// Five skills a beginner should use so they don't waste tokens, told as a level-one adventure.
const at = (second: number) => Math.round(second * FPS);
const L = VOICE.lines;
// Short tail: the last line runs straight into the first one when the Short loops.
const END = at(VOICE.seconds + 0.1);
// Starts come from the table in lines.ts. A cue inside a phrase sits at a share of its length, an estimate.
const cue = (line: keyof typeof L, share = 0) => at(L[line][0] + L[line][1] * share);
const T = {
  hook: cue("hook"),
  // "run" starts at 1.22 s (loudness envelope; no silence before it), 0.44 of the hook.
  runout: cue("hook", 0.44),
  app: cue("hook", 0.85),
  why: cue("why"),
  five: cue("five"),
  one: cue("one"),
  shows: cue("shows"),
  ate: cue("shows", 0.6),
  two: cue("two"),
  fixes: cue("fixes"),
  session: cue("fixes", 0.6),
  three: cue("three"),
  side: cue("side"),
  docs: cue("side", 0.4),
  note: cue("side", 0.7),
  four: cue("four"),
  test: cue("test"),
  build: cue("test", 0.78),
  fiveD: cue("fiveD"),
  prove: cue("prove"),
  fix: cue("fix"),
  up: cue("all"),
  cmds: cue("all", 0.45),
  follow: cue("follow"),
  loop: cue("follow", 0.72),
};
// The coins that leave his pouch while "run out" is said.
const COINS = [0, 1, 2, 3, 4].map((k) => T.runout - 6 + k * 7);
const SKILLS = [T.one, T.two, T.three, T.four, T.fiveD];
// He pokes the model and it falls; the plank slides in after; he jumps once the plank is there and "build" is said.
const COLLAPSE = T.test + 8;
const PLANK = COLLAPSE + 12;
// He lands at least a second before the cut to "Five", even when "build" comes late.
const JUMP = Math.max(PLANK + 14, Math.min(T.build + 2, T.fiveD - 32));

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
const PROUD = stand({ eL: [110, 1240], hL: [160, 1345], eR: [272, 1240], hR: [222, 1345], smile: 1.2 });
const LOOK_DOWN = stand({ head: [215, 1062], eR: [260, 1240], hR: [250, 1330], smile: -0.6 });
const THINK = stand({ head: [205, 1044], eR: [285, 1200], hR: [268, 1122], eL: [150, 1240], hL: [230, 1260], smile: 0.2 });
const POINT = stand({ head: [212, 1040], sh: [200, 1130], eR: [300, 1150], hR: [400, 1100], smile: 1 });
const SHOCK = stand({ look: 1, eL: [90, 1180], hL: [60, 1090], eR: [290, 1180], hR: [320, 1090], smile: -1 });
const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [300, 1040], hR: [330, 910], smile: 1.6 });
const THUMBS = stand({ eR: [285, 1170], hR: [330, 1080], smile: 1.4 });
const NOTE = stand({ eR: [270, 1180], hR: [320, 1110], smile: 1 });
const POKE = stand({ head: [205, 1046], eR: [258, 1250], hR: [322, 1420], smile: 0.3 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], smile: 1.2 });

type Scene = "start" | "shop" | "report" | "claudemd" | "research" | "proto" | "diagnose" | "finale";
const CUTS: [number, Scene][] = [
  [0, "start"],
  [T.why - 2, "shop"],
  [T.one - 2, "report"],
  [T.two - 2, "claudemd"],
  [T.three - 2, "research"],
  [T.four - 2, "proto"],
  [T.fiveD - 2, "diagnose"],
  [T.up - 2, "finale"],
];
const SKILL_SCENES: Scene[] = ["report", "claudemd", "research", "proto", "diagnose"];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "start");

// Where he stands in each scene: shift from x=190, and mirrored.
const PLACE: Record<Scene, { tx: number; flip?: boolean; wall: string }> = {
  start: { tx: 0, wall: MEADOW },
  shop: { tx: 700, flip: true, wall: SHOP },
  report: { tx: 0, wall: FOREST },
  claudemd: { tx: 700, flip: true, wall: VILLAGE },
  research: { tx: 0, wall: NIGHT },
  proto: { tx: -40, wall: CANYON },
  diagnose: { tx: 0, wall: TRAIL },
  finale: { tx: 60, wall: MEADOW },
};

const POSES = [
  { at: 0, pose: IDLE },
  { at: T.runout - 8, pose: LOOK_DOWN },
  { at: T.app, pose: SHOCK },
  { at: T.why - 2, pose: POINT },
  { at: T.five + 16, pose: PROUD },
  { at: T.one - 2, pose: THINK },
  { at: T.shows, pose: POINT },
  { at: T.ate + 2, pose: SHOCK },
  { at: T.ate + 20, pose: PROUD },
  { at: T.two - 2, pose: THINK },
  { at: T.fixes, pose: POINT },
  { at: T.session + 4, pose: THUMBS },
  { at: T.three - 2, pose: THINK },
  { at: T.side, pose: POINT },
  { at: T.docs, pose: THINK },
  { at: T.note - 8, pose: NOTE },
  { at: T.four - 2, pose: THINK },
  { at: T.test, pose: POKE },
  { at: COLLAPSE + 4, pose: SHOCK },
  { at: PLANK + 6, pose: PROUD },
  { at: JUMP - 4, pose: CHEER },
  { at: T.fiveD - 2, pose: LOOK_DOWN },
  { at: T.prove, pose: POINT },
  { at: T.fix + 4, pose: THUMBS },
  { at: T.up - 4, pose: CHEER },
  { at: T.cmds, pose: POINT },
  { at: T.follow, pose: WAVE },
  { at: T.loop, pose: IDLE },
];

const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };
const animatePose = (frame: number): Pose => {
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
  if (frame >= T.follow + 6 && frame < T.loop) p.hL = [p.hL[0] + Math.sin(frame / 2.6) * 28, p.hL[1]];
  return p;
};

const blink = (frame: number) => {
  const p = (frame + 17) % 87;
  return p < 2 ? 0.4 : p < 5 ? 0 : p < 7 ? 0.5 : 1;
};

// Crouch, jump with stretch, land with squash.
const hop = (frame: number, start: number, len: number, height: number) => {
  const u = (frame - start) / len;
  if (u < -0.35 || u > 1.4) return { dy: 0, sy: 1 };
  if (u < 0) return { dy: 0, sy: 1 - 0.1 * Math.sin((Math.PI * (u + 0.35)) / 0.35) };
  if (u <= 1) return { dy: -height * Math.sin(Math.PI * u), sy: 1 + 0.09 * Math.sin(Math.PI * u) };
  return { dy: 0, sy: 1 - 0.12 * Math.sin((Math.PI * (u - 1)) / 0.4) };
};
const HOPS: [number, number, number][] = [
  [JUMP, 16, 150],
  [T.fix + 6, 12, 70],
  [T.up - 2, 15, 130],
];
// After "build it" he jumps from the cliff onto the middle of the plank.
const walkX = (frame: number, scene: Scene) => (scene === "proto" ? interpolate(frame, [JUMP, JUMP + 16], [0, 430], CLAMP) : 0);

// The side agent: beside him, off to the tower, reading there, back with the note.
const HOME: [number, number] = [330, 950];
const TOWER: [number, number] = [800, 880];
const helperAt = (frame: number) => {
  const arc = (u: number, a: [number, number], b: [number, number]) => ({
    x: interpolate(u, [0, 1], [a[0], b[0]]),
    y: interpolate(u, [0, 1], [a[1], b[1]]) - Math.sin(u * Math.PI) * 120,
  });
  const bob = Math.sin(frame / 6) * 10;
  if (frame < T.side) return { x: HOME[0], y: HOME[1] + bob, reading: 0, carry: false };
  if (frame < T.side + 14) return { ...arc((frame - T.side) / 14, HOME, TOWER), reading: 0, carry: false };
  if (frame < T.note - 12) {
    const reading = interpolate(frame, [T.side + 14, T.side + 20, T.note - 18, T.note - 12], [0, 1, 1, 0], CLAMP);
    return { x: TOWER[0], y: TOWER[1] + bob, reading, carry: false };
  }
  if (frame < T.note) return { ...arc((frame - T.note + 12) / 12, TOWER, HOME), reading: 0, carry: true };
  return { x: HOME[0] + 60, y: HOME[1] - 60 + bob, reading: 0, carry: false };
};

// A coin that jumps out of the pouch and falls away off the pouch side.
const Coin: React.FC<{ hip: [number, number]; from: number; k: number }> = ({ hip, from, k }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0 || t > 26) return null;
  // Out on the pouch side, clear of his body.
  const x = hip[0] - 62 - t * (5 + k * 1.5);
  const y = hip[1] - 10 - 30 * t + 1.6 * t * t;
  return (
    <g transform={`translate(${x} ${y}) scale(${Math.abs(Math.cos(t / 2)) * 0.5 + 0.5} 1)`}>
      <circle r={38} fill={AMBER} stroke="#5e3a24" strokeWidth={6} />
      <text y={16} textAnchor="middle" fontSize={46} fill="#5e3a24" fontFamily={fontFamily} fontWeight={900}>
        T
      </text>
    </g>
  );
};

const PUNCHES = CUTS.map(([from]) => from);
// Three hits: the hungry prompt ringed, the model falling, and the level up.
const SHAKES = [T.ate, COLLAPSE, T.up];
const header = (n: number, name: string, atFrame: number) => ({
  text: `${n} ${name}`,
  at: atFrame,
  size: name.length > 15 ? 72 : name.length > 10 ? 88 : 110,
  boxes: { [`${n}`]: AMBER },
});
const pop = (frame: number, from: number, cfg?: { damping: number; stiffness: number }) => (frame >= from ? enter(frame - from, cfg) : 0);

// Few and varied: a chime when an item lands in the bar, otherwise each scene has its own sounds. No sound on "because",
// so the line runs straight into the hook on replay.
const Soundtrack: React.FC = () => (
  <>
    {/* Speech RMS measured 1 dB above the grill-me take, which plays at 1.2, so this one plays at 1.1. */}
    {VOICE.file ? <Audio src={staticFile(VOICE.file)} volume={1.1} /> : null}
    {/* The bed measures -16.9 dB RMS; at 0.105 it sits about 15 dB under the voice, like the grill-me video. */}
    <Audio src={staticFile("sfx/bgm-starter.wav")} volume={(f) => interpolate(f, [0, 8, END - 20, END], [0.065, 0.105, 0.105, 0.04], CLAMP)} />
    {COINS.map((c, i) => (
      <Sfx key={c} name="pop" from={c} volume={0.22 + i * 0.03} />
    ))}
    <Sfx name="womp" from={T.app} volume={0.3} />
    <Sfx name="whoosh" from={T.why - 4} volume={0.26} />
    {SKILLS.map((s) => (
      <Sfx key={s} name="chime" from={s} volume={0.24} />
    ))}
    <Sfx name="sweep" from={T.shows} volume={0.24} />
    <Sfx name="stamp" from={T.ate} volume={0.45} />
    <Sfx name="impact" from={T.ate} volume={0.32} />
    <Sfx name="paper" from={T.fixes + 4} volume={0.34} />
    <Sfx name="paper" from={T.fixes + 14} volume={0.3} />
    <Sfx name="check" from={T.session} volume={0.42} />
    <Sequence from={T.three - 2} durationInFrames={T.four - T.three} layout="none">
      <Audio src={staticFile("sfx/crickets.wav")} volume={0.18} loop />
    </Sequence>
    <Sfx name="pop" from={T.note} volume={0.36} />
    <Sfx name="click" from={T.test + 4} volume={0.4} />
    <Sfx name="impact" from={COLLAPSE} volume={0.36} />
    {[0, 1, 2].map((i) => (
      <Sfx key={i} name={`thud${i}`} from={COLLAPSE + 4 + i * 5} volume={0.32 - i * 0.05} />
    ))}
    <Sfx name="whoosh" from={JUMP} volume={0.24} />
    <Sfx name="thud3" from={JUMP + 16} volume={0.4} />
    <Sfx name="thud2" from={T.prove + 2} volume={0.45} />
    <Sfx name="error" from={T.prove + 4} volume={0.26} />
    <Sfx name="check" from={T.fix + 2} volume={0.4} />
    <Sfx name="sparkle" from={T.fix + 2} volume={0.28} />
    <Sfx name="impact" from={T.up} volume={0.32} />
    <Sfx name="ding" from={T.up} volume={0.4} />
  </>
);

export const StarterVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const pose = animatePose(frame);
  const jump = HOPS.map(([start, len, height]) => hop(frame, start, len, height));
  const dy = jump.reduce((sum, j) => sum + j.dy, 0);
  const sy = jump.reduce((product, j) => product * j.sy, 1);
  const helper = helperAt(frame);
  const got = SKILLS.map((s) => pop(frame, s, { damping: 11, stiffness: 190 }));
  // The gauge drains while the coins leave, then each skill wins a fifth of it back.
  const drained = interpolate(frame, [COINS[0], COINS[4] + 6], [1, 0.12], CLAMP);
  const tokens = Math.min(1, drained + got.reduce((sum, g) => sum + Math.min(g, 1) * 0.176, 0));
  const coinsLeft = 1 - COINS.filter((c) => frame >= c).length / COINS.length;
  const active = SKILL_SCENES.indexOf(scene);
  const level = frame >= T.up ? 2 : 1;
  const tx = place.tx + walkX(frame, scene);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "start" ? <Meadow level={1} /> : null}
          {scene === "shop" ? <Shop from={T.five} /> : null}
          {scene === "report" ? (
            <QuestBoard
              bars={[0, 1, 2].map((i) => pop(frame, T.shows + i * 5, { damping: 14, stiffness: 120 }))}
              stamp={pop(frame, T.ate, { damping: 10, stiffness: 220 })}
            />
          ) : null}
          {scene === "claudemd" ? (
            <Tablet
              fix={[T.fixes + 4, T.fixes + 14].map((f) => pop(frame, f, { damping: 14, stiffness: 120 }))}
              grade={pop(frame, T.session, { damping: 10, stiffness: 220 })}
            />
          ) : null}
          {scene === "research" ? <Camp reading={helper.reading} /> : null}
          {scene === "proto" ? <Canyon collapse={COLLAPSE} plank={pop(frame, PLANK)} /> : null}
          {scene === "diagnose" ? (
            <>
              <Trail />
              <BugHunt
                jar={pop(frame, T.prove, { damping: 12, stiffness: 260 })}
                red={interpolate(frame, [T.prove + 4, T.prove + 8], [0, 1], CLAMP)}
                green={interpolate(frame, [T.fix + 2, T.fix + 10], [0, 1], CLAMP)}
              />
              <Burst from={T.fix + 2} x={540} y={1590} />
            </>
          ) : null}
          {scene === "finale" ? (
            <>
              <Meadow level={level} levelPop={frame >= T.up ? 0.7 + 0.3 * enter(frame - T.up, { damping: 9, stiffness: 200 }) : 1} />
              <Burst from={T.up} x={790} y={1275} />
            </>
          ) : null}

          <g
            transform={`translate(${tx} ${dy}) translate(190 1650) scale(${(place.flip ? -1 : 1) * (2 - sy)} ${sy}) translate(-190 -1650)`}
          >
            <Stickman pose={pose} thumb={0} headFill={place.wall} bendy eyes={blink(frame)} />
            <Pouch hip={pose.hip} bulge={scene === "start" ? coinsLeft : 0} />
            {scene === "start" ? COINS.map((c, k) => <Coin key={c} hip={pose.hip} from={c} k={k} />) : null}
            {scene === "research" ? <Note hand={pose.hR} s={pop(frame, T.note, { damping: 10, stiffness: 190 })} /> : null}
          </g>
          {scene === "research" ? (
            <Helper x={helper.x} y={helper.y} s={pop(frame, T.three, { damping: 11, stiffness: 190 })} reading={helper.reading} carry={helper.carry} />
          ) : null}
          {scene === "finale" && frame >= T.up ? (
            <text
              x={790}
              y={1110}
              textAnchor="middle"
              fontSize={92}
              fill={GREEN}
              stroke={INK}
              strokeWidth={10}
              paintOrder="stroke"
              fontFamily={fontFamily}
              fontWeight={900}
              transform={`translate(790 1080) scale(${Math.min(enter(frame - T.up, { damping: 9, stiffness: 200 }), 1.2)}) translate(-790 -1080)`}
            >
              LEVEL UP!
            </text>
          ) : null}
        </g>
        <Hud level={level} tokens={tokens} got={got} active={active} />
      </svg>

      {/* First two seconds: on-screen words that differ from the spoken line. */}
      <Caption plain from={0} to={T.app - 4} lines={[{ text: "OUT OF TOKENS. AGAIN?", at: 0, size: 84, boxes: { OUT: RED } }]} />
      <Caption
        plain
        from={T.app - 4}
        to={T.why - 2}
        lines={[
          { text: "TOKENS RUN OUT", at: T.app - 4, size: 96, boxes: { OUT: RED } },
          { text: "BEFORE YOUR APP WORKS", at: T.app, size: 72 },
        ]}
      />
      <Caption
        plain
        from={T.why - 4}
        to={T.one - 2}
        lines={[
          { text: "HERE'S WHY", at: T.why - 4, size: 110, color: AMBER },
          { text: "5 SKILLS THAT STOP IT", at: T.five, size: 80, boxes: { "5": AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.one - 4}
        to={T.two - 2}
        lines={[header(1, "session-report", T.one - 4), { text: "SHOWS WHICH PROMPT", at: T.shows, size: 76 }, { text: "ATE YOUR TOKENS", at: T.ate - 6, size: 84, boxes: { ATE: RED } }]}
      />
      <Caption
        plain
        from={T.two - 4}
        to={T.three - 2}
        lines={[header(2, "claude-md-improver", T.two - 4), { text: "FIXES THE MEMORY FILE", at: T.fixes, size: 68 }, { text: "IT READS EVERY SESSION", at: T.session, size: 64, color: AMBER }]}
      />
      <Caption
        plain
        from={T.three - 4}
        to={T.four - 2}
        lines={[header(3, "research", T.three - 4), { text: "A SIDE AGENT READS THE DOCS", at: T.side, size: 56 }, { text: "SAVES ONE NOTE", at: T.note - 4, size: 88, color: GREEN }]}
      />
      <Caption
        plain
        from={T.four - 4}
        to={T.fiveD - 2}
        lines={[header(4, "prototype", T.four - 4), { text: "TEST THE IDEA", at: T.test, size: 96 }, { text: "BEFORE YOU BUILD IT", at: T.build - 4, size: 74, boxes: { BEFORE: AMBER } }]}
      />
      <Caption
        plain
        from={T.fiveD - 4}
        to={T.up - 2}
        lines={[header(5, "diagnosing-bugs", T.fiveD - 4), { text: "PROVE THE BUG", at: T.prove, size: 96, boxes: { BUG: RED } }, { text: "THEN FIX IT", at: T.fix, size: 96, color: GREEN }]}
      />
      <Caption
        plain
        from={T.up - 4}
        to={END + 30}
        lines={[
          { text: "ALL 5", at: T.up - 4, size: 130, color: GREEN, boxes: { "5": AMBER } },
          { text: "IN THE CAPTION", at: T.cmds, size: 84 },
          { text: "FOLLOW STICKMAN SHIPS", at: T.follow, size: 66, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "BECAUSE...", at: T.loop, size: 100, color: AMBER },
        ]}
      />
    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, about 15 frames after each cue.
const SHOTS: [string, number][] = [
  ["1 MEADOW, OUT OF TOKENS? (0-2 s TEXT)", T.hook + 20],
  ["2 MEADOW, COINS LEAVE THE POUCH", T.runout + 12],
  ["3 MEADOW, BEFORE YOUR APP WORKS", T.app + 14],
  ["4 SHOP, 5 SKILLS THAT STOP IT", T.five + 24],
  ["5 FOREST, TOKENS USED", T.shows + 22],
  ["6 FOREST, THIS PROMPT ATE THEM", T.ate + 16],
  ["7 VILLAGE, CLAUDE.md", T.two + 16],
  ["8 VILLAGE, STALE LINES FIXED", T.fixes + 36],
  ["9 VILLAGE, GRADE A", T.session + 18],
  ["10 CAMP, SIDE AGENT FLIES OFF", T.side + 12],
  ["11 CAMP, READING THE DOCS", T.docs + 2],
  ["12 CAMP, ONE NOTE", T.note + 16],
  ["13 CANYON, THE MODEL", T.four + 22],
  ["14 CANYON, MODEL FALLS", COLLAPSE + 12],
  ["15 CANYON, ON THE PLANK", JUMP + 20],
  ["16 TRAIL, A BUG", T.fiveD + 16],
  ["17 TRAIL, CAUGHT, TEST RED", T.prove + 14],
  ["18 TRAIL, FIXED, TEST GREEN", T.fix + 16],
  ["19 MEADOW, ALL 5, LEVEL UP", T.up + 14],
  ["20 LAST FRAME, LOOPS TO THE HOOK", END - 1],
];

const Frames: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div style={{ position: "absolute", width: 1080, height: 1920, overflow: "hidden", transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Freeze frame={shot}>
            <StarterVideo />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s (measured voice)`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const StarterComposition = () => (
  <>
    <Composition id="StarterPack" component={StarterVideo} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition id="StarterFrames" component={Frames} defaultProps={{ from: 0 }} durationInFrames={END} fps={FPS} width={1620} height={2020} />
  </>
);
