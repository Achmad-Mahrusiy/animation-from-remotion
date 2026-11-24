import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Panel } from "../Screens";
import { SIT, SIT_SCRATCH, Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import { SCREEN_ON_DESK, STAGE_WALL, Stage } from "./Stage";

const END = 51.5 * FPS;
// shortcut: timings from pauses in public/voice-motion.mp3, which is voice-raw/voice-motion.mp3 after
// scripts/trim-voice.mjs (pauses cut to 0.4 s, speed 1.06). Words inside a sentence are estimated.
// Re-measure if the voice file changes.
const at = (voiceSecond: number) => Math.round(voiceSecond * FPS);

const T = {
  animation: at(1.3),
  title: at(2.85),
  flew: at(3.3),
  button: at(4.5),
  wont: at(4.95),
  spinning: at(5.45),
  yourAi: at(6.89),
  thisToo: at(7.75),
  skill: at(8.86),
  motion: at(9.65),
  oneLine: at(10.3),
  session: at(13.31),
  type: at(14.2),
  slash: at(14.76),
  typed: at(16.3),
  feel: at(16.92),
  pick: at(19.17),
  onePersonality: at(19.75),
  picked: at(23.9),
  check: at(24.4),
  rules: at(25.2),
  one: at(26.56),
  never: at(27.21),
  constant: at(28.2),
  eased: at(28.75),
  two: at(29.95),
  layers: at(30.57),
  main: at(31.6),
  supporting: at(32.45),
  quiet: at(33.72),
  three: at(35.13),
  third: at(35.75),
  atOnce: at(37.3),
  thatRule: at(38.95),
  myAi: at(39.7),
  broke: at(40.25),
  same: at(41.01),
  sameAi: at(42.07),
  nowWorks: at(43.51),
  tryIt: at(45.28),
  today: at(46.75),
  follow: at(47.7),
  test: at(48.19),
  out: at(48.55),
};

// Frames where the camera is the stickman's own eyes, looking at the laptop. Everything else is the wide shot.
// The video opens inside the POV, so the first range starts before frame 0.
const POV: [number, number][] = [
  [-12, T.yourAi - 5],
  [T.skill - 5, T.feel - 6],
  [T.pick - 5, T.check],
  [T.one - 5, T.same - 6],
  [T.nowWorks - 5, T.out],
];

// Motion identity, chosen with the motion-design skill. Feeling: frustration that turns calm.
// Personality: Playful. Signature entrance: rise and fade on the SNAPPY spring, about 13% overshoot.
// Exits accelerate (EXIT) and are shorter than entrances. Shot changes take 12 frames in, 9 out.
const text = { fontFamily, fontWeight: 900 } as const;
const SNAPPY = { damping: 14, stiffness: 170 };
const DECELERATE = { ...CLAMP, easing: Easing.out(Easing.cubic) };
const INK = "#11181c";
const BLUE = "#7fb6d9";
const RAIL = "#4a5078";
const MUTED = "#9aa0c4";
const PANEL = "#1a1e36";
const EXIT = { ...CLAMP, easing: Easing.in(Easing.cubic) };
const POINTER = "M0 0 V62 L16 48 L28 74 L40 68 L28 44 H48Z";

// The install command is shown in its real case, because viewers copy it.
const CHUNKS = [
  { text: "npx skills add", at: T.oneLine + 8 },
  { text: "LottieFiles/", at: T.oneLine + 26 },
  { text: "motion-design-skill", at: T.oneLine + 44 },
];
const COMMAND = "/motion-design";
const KEYS = Array.from({ length: COMMAND.length }, (_, i) =>
  Math.round(T.slash + (i * (T.typed - 8 - T.slash)) / COMMAND.length),
);

// Typing windows as [from, to, frames per keystroke]: quick for commands, calm once the design works.
const TYPING: [number, number, number][] = [
  [CHUNKS[0].at - 4, CHUNKS[2].at + 8, 2],
  [T.slash, T.typed - 6, 2],
  [T.nowWorks, T.tryIt - 6, 3.6],
];
const typing = (frame: number) => {
  const now = TYPING.find(([a, b]) => frame >= a && frame < b);
  if (!now) return { amount: 0, rate: 2 };
  return { amount: Math.min(1, (frame - now[0]) / 4, (now[1] - frame) / 4), rate: now[2] };
};
// Single presses of the right hand: picking a card, playing a preview, switching a layer on, clicking the button.
const TAPS = [T.picked, T.never - 3, T.eased - 3, T.main, T.supporting, T.quiet, T.follow + 1];

type Card = { label: string; color: string; dur: number; ease: (t: number) => number; at: number };
// Durations and curves follow the skill's emotion and personality tables.
const FEELS: Card[] = [
  { label: "JOY", color: AMBER, dur: 10, ease: Easing.out(Easing.back(2.2)) },
  { label: "CALM", color: BLUE, dur: 22, ease: Easing.inOut(Easing.sin) },
  { label: "URGENT", color: RED, dur: 5, ease: Easing.out(Easing.quad) },
  { label: "ELEGANT", color: CREAM, dur: 18, ease: Easing.bezier(0.4, 0, 0.2, 1) },
].map((card, i) => ({ ...card, at: T.feel + i * 12 }));
const STYLES: Card[] = [
  { label: "PLAYFUL", color: AMBER, dur: 8, ease: Easing.out(Easing.back(2.2)), at: at(21.05) },
  { label: "PREMIUM", color: CREAM, dur: 15, ease: Easing.bezier(0.4, 0, 0.2, 1), at: at(21.75) },
  { label: "CORPORATE", color: BLUE, dur: 9, ease: Easing.bezier(0.2, 0, 0, 1), at: at(22.47) },
  { label: "ENERGETIC", color: RED, dur: 5, ease: Easing.out(Easing.back(3)), at: at(23.47) },
];

// The design being animated: a launch card with nine layers in three groups (text, picture, accents).
// x and y are each layer's centre on the artboard, h is half its height, so it can squash against its base.
const ELEMENTS = [
  { name: "TITLE", x: 577, y: 880, h: 24, color: CREAM },
  { name: "SUBTITLE", x: 587, y: 944, h: 22, color: MUTED },
  { name: "BUTTON", x: 547, y: 1016, h: 26, color: AMBER },
  { name: "SUN", x: 890, y: 880, h: 54, color: AMBER },
  { name: "HILLS", x: 876, y: 1016, h: 50, color: GREEN },
  { name: "CLOUD", x: 806, y: 846, h: 30, color: CREAM },
  { name: "BADGE", x: 500, y: 812, h: 16, color: RED },
  { name: "SPARK", x: 962, y: 812, h: 22, color: BLUE },
  { name: "AVATARS", x: 700, y: 1016, h: 17, color: BLUE },
];
// Each layer drawn around its own centre.
const ART = [
  <text key="title" y={21} textAnchor="middle" fontSize={58} fill={CREAM} {...text}>
    LAUNCH
  </text>,
  <g key="subtitle" fill={MUTED}>
    <rect x={-125} y={-18} width={250} height={12} rx={6} />
    <rect x={-125} y={6} width={180} height={12} rx={6} />
  </g>,
  <g key="button">
    <rect x={-85} y={-26} width={170} height={52} rx={26} fill={AMBER} />
    <text y={9} textAnchor="middle" fontSize={24} fill={INK} {...text}>
      GET IT
    </text>
  </g>,
  <circle key="sun" r={54} fill={AMBER} />,
  <path key="hills" d="M-106 46 L-44 -40 L4 14 L44 -22 L106 46Z" fill={GREEN} stroke={GREEN} strokeWidth={8} strokeLinejoin="round" />,
  <g key="cloud" fill={CREAM}>
    <rect x={-44} y={-10} width={88} height={30} rx={15} />
    <circle cx={-8} cy={-12} r={20} />
  </g>,
  <g key="badge">
    <rect x={-38} y={-16} width={76} height={32} rx={16} fill={RED} />
    <text y={7} textAnchor="middle" fontSize={19} fill={INK} {...text}>
      NEW
    </text>
  </g>,
  <path key="spark" d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6Z" fill={BLUE} />,
  <g key="avatars" stroke="#20253f" strokeWidth={5}>
    {[BLUE, RED, GREEN].map((color, k) => (
      <circle key={color} cx={-26 + k * 26} r={17} fill={color} />
    ))}
  </g>,
];

// Rule 2: which of the three motion layers each design layer plays, -1 for none.
// Button is the main action, spark the supporting detail, sun, hills and cloud the quiet background.
const ROLE = [-1, -1, 0, 2, 2, 2, -1, 1, -1];
const ROLE_AT = [T.main, T.supporting, T.quiet];
const lit = (i: number, frame: number) =>
  ROLE[i] < 0 ? 0 : Math.min(enter(frame - ROLE_AT[ROLE[i]], SNAPPY), 1);

// Rule 3: the entrance plays on a loop. Each group gets one turn, then everything holds for a turn.
const TURN = 26;
const CYCLE = TURN * 4;
const turnOf = (i: number) => Math.floor(i / 3) * TURN + (i % 3) * 3;

// The AI's broken first attempt returns for a moment on "the rule my AI broke": 0 is clean, 1 is broken.
const flash = (frame: number) =>
  Math.max(0, Math.min(enter(frame - T.thatRule - 6, SNAPPY), 1 - enter(frame - T.broke - 2, SNAPPY)));
// True while the screen shows the broken animation: the whole hook, and that flashback.
const isBroken = (frame: number) => frame < T.skill || flash(frame) > 0.5;

// How each layer misbehaves in the AI's first attempt. Every layer has its own bug.
const STILL = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
const broken = (i: number, f: number) => {
  const bugs: Partial<typeof STILL>[] = [
    { dx: Math.sin(f * 1.9) * 7, rot: Math.sin(f / 2.3) * 5 }, // title shivers
    { sx: 1 + Math.sin(f / 4) * 0.7 }, // subtitle stretches
    { rot: f * 14 }, // button spins without end
    { dy: 148 * (1 - Math.abs(Math.sin(f / 7))) }, // sun bounces on the floor
    { rot: 180 + Math.sin(f / 5) * 8 }, // hills hang upside down
    { dx: [0, -120, 70, -50][Math.floor(f / 5) % 4] }, // cloud teleports
    { sx: 1 + Math.abs(Math.sin(f / 9)) * 2.4 }, // badge balloons
    { dx: Math.cos(f / 3) * 60, dy: Math.sin(f / 3) * 60, rot: f * 20 }, // spark orbits
    { dx: 220 * Math.sin(f / 11) - 60 }, // avatars slide over the text
  ];
  return { ...STILL, ...bugs[i] };
};

// Is this layer moving right now? Drives the layer list, the timeline bars and the status dots.
const moving = (i: number, frame: number) =>
  isBroken(frame) ||
  (frame >= T.two && frame < T.three && ROLE[i] >= 0 && frame >= ROLE_AT[ROLE[i]]) ||
  (frame >= T.third &&
    frame < T.tryIt &&
    Math.floor(((frame - T.third) % CYCLE) / TURN) === Math.floor(i / 3));

const SIT_YOU: Pose = { ...SIT, look: 0, eR: [320, 1190], hR: [392, 1130], smile: -0.2 };
const SIT_THINK: Pose = { ...SIT, eR: [318, 1160], hR: [286, 1086], smile: 0.2 };
const SIT_READY: Pose = { ...SIT, look: 0, eL: [120, 1050], hL: [92, 930], eR: [330, 1050], hR: [362, 930], smile: 1.4 };
const SIT_TADA: Pose = { ...SIT, look: 0, eL: [125, 1190], hL: [70, 1130], eR: [330, 1200], hR: [405, 1150], smile: 1.4 };
const SIT_THUMB: Pose = { ...SIT, look: 0, eL: [125, 1185], hL: [92, 1075], smile: 1.6 };

const POSES = [
  { at: 0, pose: SIT_SCRATCH },
  { at: T.thisToo - 6, pose: SIT_YOU },
  { at: T.skill, pose: SIT },
  { at: T.feel - 4, pose: SIT_THINK },
  { at: T.pick, pose: SIT },
  { at: T.check - 2, pose: SIT_READY },
  { at: T.one, pose: SIT },
  { at: T.same - 4, pose: SIT_TADA },
  { at: T.nowWorks, pose: { ...SIT, smile: 1 } },
  { at: T.out - 2, pose: SIT_THUMB },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 5;
  const drag = Math.sin((frame - 6) / 19) * 6;
  const keys = typing(frame);
  return {
    ...body,
    head: [mid.head[0] + sway, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0] + drag, tip.hL[1] - Math.abs(Math.sin(frame / keys.rate)) * 18 * keys.amount],
    hR: [tip.hR[0] + drag, tip.hR[1] - Math.abs(Math.cos(frame / keys.rate)) * 18 * keys.amount],
  };
};

// Crouch, jump with stretch, land with squash.
const hop = (frame: number, start: number, len: number, height: number) => {
  const u = (frame - start) / len;
  if (u < -0.35 || u > 1.4) return { dy: 0, sy: 1 };
  if (u < 0) return { dy: 0, sy: 1 - 0.1 * Math.sin((Math.PI * (u + 0.35)) / 0.35) };
  if (u <= 1) return { dy: -height * Math.sin(Math.PI * u), sy: 1 + 0.09 * Math.sin(Math.PI * u) };
  return { dy: 0, sy: 1 - 0.12 * Math.sin((Math.PI * (u - 1)) / 0.4) };
};

// Where one design layer is at this frame. The same nine layers play every part of the story:
// the AI's broken attempt, three motion layers, and the entrance taking turns.
const layer = (i: number, frame: number) => {
  const el = ELEMENTS[i];
  const group = Math.floor(i / 3);
  let [dx, dy, rot, sx, sy, opacity] = [0, 0, 0, 1, 1, 1];

  if (frame < T.skill + 10) {
    ({ dx, dy, rot, sx, sy } = broken(i, frame));
    if (i === 0) {
      // "The title flew away": a short pull back, then it accelerates off the artboard.
      const t = frame - T.flew;
      const back = Math.sin(Math.PI * Math.min(Math.max(t / 4, 0), 1));
      const gone = interpolate(t, [4, 22], [0, 1], EXIT);
      dx += 560 * gone - 16 * back;
      dy += 8 * back - 430 * gone;
      rot += 420 * gone;
    }
    opacity = interpolate(frame, [T.skill, T.skill + 9], [1, 0], EXIT);
  } else if (frame < T.one) {
    // Back in place, waiting under the terminal and the cards.
    const s = enter(frame - T.skill - 12 - i * 0.7, SNAPPY);
    dy = (1 - s) * 16;
    opacity = Math.min(s, 1);
  } else if (frame < T.two) {
    // Rule 1 borrows the artboard for the speed test.
    opacity = 0;
  } else if (frame < T.three) {
    const s = enter(frame - T.two - i * 0.7, SNAPPY);
    const on = lit(i, frame);
    // Once the main action starts the rest dims, then each layer lights up on its cue, then all of it.
    const dim = Math.min(enter(frame - T.main), 1) * (1 - on) * (1 - Math.min(enter(frame - T.quiet - 18), 1));
    dy = (1 - s) * 16;
    opacity = Math.min(s, 1) * (1 - 0.7 * dim) * interpolate(frame, [T.three - 5, T.three], [1, 0], EXIT);
    if (i === 2 && frame >= T.main) {
      const jump = hop((frame - T.main) % 34, 8, 16, 44);
      dy += jump.dy;
      sy = jump.sy;
      sx = 2 - jump.sy;
    }
    if (i === 7) {
      rot = Math.sin(frame / 7) * 30 * on;
      sx = sy = 1 + Math.sin(frame / 5) * 0.18 * on;
    }
    if (i === 3) sx = sy = 1 + Math.sin(frame / 22) * 0.05 * on;
    if (i === 4) dy += Math.sin(frame / 30) * 4 * on;
    if (i === 5) dx = Math.sin(frame / 40) * 20 * on;
  } else if (frame >= T.third) {
    const c = (frame - T.third) % CYCLE;
    const s = enter(c - turnOf(i), SNAPPY);
    const out = interpolate(c, [CYCLE - 6, CYCLE], [1, 0], EXIT);
    opacity = Math.min(s, 1) * out;
    // The text slides in, the picture rises, the accents pop: one group per turn.
    if (group === 0) dx = (s - 1) * 46;
    else if (group === 1) dy = (1 - s) * 46;
    else sx = sy = s;
    dy += (1 - out) * 14;
    const f = flash(frame);
    if (f > 0) {
      const b = broken(i, frame);
      dx += (b.dx - dx) * f;
      dy += (b.dy - dy) * f;
      rot += (b.rot - rot) * f;
      sx += (b.sx - sx) * f;
      sy += (b.sy - sy) * f;
      opacity += (1 - opacity) * f;
    }
  } else {
    opacity = 0;
  }
  return { ...el, dx, dy, rot, sx, sy, opacity };
};

const Design: React.FC = () => {
  const frame = useCurrentFrame();
  const layers = ELEMENTS.map((_, i) => layer(i, frame));
  const picture = interpolate(frame, [T.one - 4, T.one, T.two, T.two + 6], [1, 0, 0, 1], CLAMP);
  return (
    <g clipPath="url(#canvasClip)">
      <rect x={760} y={786} width={230} height={280} rx={16} fill="#2c3152" opacity={picture} />
      {frame >= T.two && frame < T.three ? (
        <>
          <ellipse
            cx={547}
            cy={1048}
            rx={76 * (1 + layers[2].dy / 110) * enter(frame - T.supporting, SNAPPY)}
            ry={8}
            fill="#05060d"
            opacity={0.8 * lit(7, frame)}
          />
          <circle
            cx={890}
            cy={880}
            r={72 + Math.sin(frame / 22) * 6}
            fill="none"
            stroke={AMBER}
            strokeWidth={6}
            opacity={0.3 * lit(3, frame)}
          />
        </>
      ) : null}
      {layers.map((l, i) =>
        l.opacity > 0.01 ? (
          <g
            key={l.name}
            opacity={l.opacity}
            // Turns around its centre, squashes against its base.
            transform={`translate(${l.x + l.dx} ${l.y + l.dy}) rotate(${l.rot}) translate(0 ${l.h}) scale(${l.sx} ${l.sy}) translate(0 ${-l.h})`}
          >
            {ART[i]}
          </g>
        ) : null,
      )}
    </g>
  );
};

const SkillCard: React.FC = () => (
  <g transform="rotate(-4 716 1010)">
    <rect x={546} y={790} width={340} height={440} rx={18} fill={CREAM} />
    <text x={576} y={868} fontSize={56} fill={INK} {...text}>
      SKILL.md
    </text>
    <rect x={576} y={900} width={280} height={62} rx={10} fill={AMBER} />
    <text x={716} y={945} textAnchor="middle" fontSize={34} fill={INK} fontFamily={fontFamily} fontWeight={700}>
      motion-design
    </text>
    {[240, 180, 260, 150].map((w, i) => (
      <rect key={i} x={576} y={996 + i * 40} width={w} height={14} rx={7} fill="#b9ad97" />
    ))}
    <text x={576} y={1198} fontSize={30} fill="#6b6253" {...text}>
      BY LOTTIEFILES
    </text>
  </g>
);

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const cursor = frame % 20 < 12 ? "_" : "";
  const typed = COMMAND.slice(0, KEYS.filter((k) => frame >= k).length);
  const loaded = enter(frame - T.typed + 4, SNAPPY);
  return (
    <g>
      <rect x={410} y={770} width={612} height={470} rx={24} fill="#0f1220" stroke={RAIL} strokeWidth={4} />
      <rect x={412} y={772} width={608} height={70} rx={22} fill={PANEL} />
      <Panel from={T.oneLine - 2} to={T.session}>
        <text x={442} y={819} fontSize={30} fill={AMBER} {...text}>
          TERMINAL
        </text>
        {CHUNKS.map((c, i) => {
          const s = enter(frame - c.at, SNAPPY);
          return (
            <text
              key={c.text}
              x={442}
              y={930 + i * 88}
              fontSize={50}
              fill={CREAM}
              fontFamily={fontFamily}
              fontWeight={700}
              opacity={Math.min(s, 1)}
              transform={`translate(0 ${(1 - s) * 16})`}
            >
              {c.text}
            </text>
          );
        })}
        <text x={442} y={1204} fontSize={28} fill={CREAM} opacity={0.7} {...text}>
          SKILL BY LOTTIEFILES
        </text>
      </Panel>
      <Panel from={T.session} to={T.feel}>
        <text x={442} y={819} fontSize={30} fill={AMBER} {...text}>
          NEW SESSION
        </text>
        <text x={442} y={960} fontSize={58} fill={GREEN} fontFamily={fontFamily} fontWeight={700}>
          {`> ${typed}${frame < T.typed - 6 ? cursor : ""}`}
        </text>
        <text
          x={442}
          y={1060}
          fontSize={36}
          fill={AMBER}
          opacity={Math.min(loaded, 1)}
          transform={`translate(${(1 - loaded) * -24} 0)`}
          {...text}
        >
          SKILL LOADED
        </text>
      </Panel>
    </g>
  );
};

// One dot per card shows how that feeling or personality moves. Cards take turns, so only one dot travels at a time.
const Cards: React.FC<{ cards: Card[]; picked?: number }> = ({ cards, picked }) => {
  const frame = useCurrentFrame();
  const chosen = picked === undefined ? 0 : enter(frame - picked, SNAPPY);
  const eased = (c: Card, f: number) => c.ease(Math.min(Math.max(f / c.dur, 0), 1));
  const reach =
    picked === undefined
      ? 0
      : interpolate(frame, [picked - 22, picked - 3], [0, 1], DECELERATE);
  return (
    <g>
      {cards.map((c, i) => {
        const x = 410 + (i % 2) * 316;
        const y = 780 + Math.floor(i / 2) * 240;
        const s = enter(frame - c.at, SNAPPY);
        const loop = picked === undefined || i > 0 || frame < picked ? -1 : (frame - picked) % 44;
        const travel = loop < 0 ? eased(c, frame - c.at - 5) : 1 - eased(c, loop) + eased(c, loop - 22);
        // The picked card grows a little while the others dim: scale for emphasis, not opacity alone.
        const grow = i === 0 ? 1 + 0.04 * chosen : 1;
        return (
          <g
            key={c.label}
            opacity={Math.min(s, 1) * (i > 0 ? 1 - 0.65 * Math.min(chosen, 1) : 1)}
            transform={`translate(${x + 148} ${y + 108 + (1 - s) * 40}) scale(${grow}) translate(${-x - 148} ${-y - 108})`}
          >
            <rect x={x} y={y} width={296} height={216} rx={22} fill="#343a5e" />
            {i === 0 && chosen > 0 ? (
              <rect x={x} y={y} width={296} height={216} rx={22} fill="none" stroke={AMBER} strokeWidth={9} opacity={Math.min(chosen, 1)} />
            ) : null}
            <text x={x + 24} y={y + 66} fontSize={38} fill={CREAM} {...text}>
              {c.label}
            </text>
            <path d={`M${x + 44} ${y + 150} H${x + 252}`} stroke={RAIL} strokeWidth={8} strokeLinecap="round" />
            <circle cx={x + 44 + travel * 208} cy={y + 150} r={24} fill={c.color} />
          </g>
        );
      })}
      {reach > 0 ? (
        <path
          d={POINTER}
          fill={CREAM}
          stroke={INK}
          strokeWidth={5}
          strokeLinejoin="round"
          transform={`translate(${900 - 290 * reach - Math.sin(Math.PI * reach) * 40} ${1300 - 390 * reach})`}
        />
      ) : null}
    </g>
  );
};

const Numbers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[1, 2, 3].map((n, i) => {
        const s = enter(frame - T.rules + 4 - i * 5, SNAPPY);
        return (
          <g key={n} opacity={Math.min(s, 1)} transform={`translate(${520 + i * 175} ${770 + (1 - s) * 60})`}>
            <circle r={72} fill={STAGE_WALL} stroke={AMBER} strokeWidth={12} />
            <text y={38} textAnchor="middle" fontSize={104} fill={CREAM} {...text}>
              {n}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// The skill's default on-screen curve, cubic-bezier(0.2, 0, 0, 1).
const EASED = Easing.bezier(0.2, 0, 0, 1);
const SPEEDS = [
  // The constant-speed pass is the bad example, so it is the one linear move in this video.
  { label: "LINEAR", color: RED, y: 866, start: T.never, len: 36, step: 4, ease: (t: number) => t, mark: "l26 26 m0 -26 l-26 26" },
  { label: "EASED", color: GREEN, y: 1016, start: T.eased, len: 24, step: 3, ease: EASED, mark: "m0 14 l11 12 l22 -30" },
];

// Rule 1 on the artboard: the same button slides in twice. Ghosts are left at equal time steps,
// so even gaps mean constant speed and bunched gaps mean easing.
const Speed: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {SPEEDS.map((r) => {
        const t = frame - r.start;
        const pos = (f: number) => 510 + 400 * r.ease(Math.min(Math.max(f / r.len, 0), 1));
        const ghosts = Math.max(0, Math.min(Math.floor(t / r.step), r.len / r.step));
        const done = t - r.len;
        // Error shake from the skill for the bad example: about 2.5 swings in a third of a second, no overshoot.
        const shake = r.color === RED && done >= 0 && done < 10 ? Math.sin(done * 1.6) * 12 * (1 - done / 10) : 0;
        return (
          <g key={r.label} opacity={Math.min(enter(t + 8), 1)} transform={`translate(${shake} 0)`}>
            <text x={462} y={r.y - 44} fontSize={30} fill={r.color} {...text}>
              {r.label}
            </text>
            <path d={`M466 ${r.y} H954`} stroke={RAIL} strokeWidth={6} strokeLinecap="round" />
            {Array.from({ length: ghosts }, (_, k) => (
              <rect key={k} x={pos(k * r.step) - 45} y={r.y - 22} width={90} height={44} rx={22} fill={r.color} opacity={0.22} />
            ))}
            <rect x={pos(t) - 45} y={r.y - 22} width={90} height={44} rx={22} fill={r.color} />
            <text x={pos(t)} y={r.y + 7} textAnchor="middle" fontSize={19} fill={INK} {...text}>
              GET IT
            </text>
            <path
              d={`M948 ${r.y - 68} ${r.mark}`}
              fill="none"
              stroke={r.color}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={interpolate(done, [0, 7], [1, 0], DECELERATE)}
              opacity={done > 0 ? 1 : 0}
            />
          </g>
        );
      })}
    </g>
  );
};

// Rule 1 below the artboard: the value curve. The straight line bends into the eased curve as its
// two handles are dragged, and a dot rides the curve in step with the button above.
const GraphEditor: React.FC = () => {
  const frame = useCurrentFrame();
  const good = frame >= T.eased - 12;
  const bend = enter(frame - T.eased + 12, SNAPPY);
  const color = good ? GREEN : RED;
  const [x0, y0, w, h] = [440, 1326, 250, 196];
  const p1 = [x0 + w * (1 / 3 + (0.2 - 1 / 3) * bend), y0 - (h / 3) * (1 - bend)];
  const p2 = [x0 + ((w * 2) / 3) * (1 - bend), y0 - h * (2 / 3 + bend / 3)];
  const run = SPEEDS[good ? 1 : 0];
  const t = Math.min(Math.max((frame - run.start) / run.len, 0), 1);
  return (
    <g>
      <rect x={400} y={1110} width={640} height={240} rx={12} fill={PANEL} />
      <rect x={x0} y={y0 - h} width={w} height={h} rx={8} fill="#12152a" />
      {[1, 2].map((k) => (
        <path
          key={k}
          d={`M${x0 + (w * k) / 3} ${y0 - h} V${y0} M${x0} ${y0 - (h * k) / 3} H${x0 + w}`}
          stroke={RAIL}
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      <path d={`M${x0} ${y0} L${p1[0]} ${p1[1]} M${x0 + w} ${y0 - h} L${p2[0]} ${p2[1]}`} stroke={MUTED} strokeWidth={3} />
      <path
        d={`M${x0} ${y0} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${x0 + w} ${y0 - h}`}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <circle cx={p1[0]} cy={p1[1]} r={8} fill={CREAM} />
      <circle cx={p2[0]} cy={p2[1]} r={8} fill={CREAM} />
      <circle cx={x0 + w * t} cy={y0 - h * run.ease(t)} r={11} fill={color} stroke={INK} strokeWidth={4} />
      <text x={722} y={1150} fontSize={20} fill={MUTED} {...text}>
        GRAPH EDITOR
      </text>
      <text x={722} y={1206} fontSize={46} fill={color} {...text}>
        {good ? "EASED" : "LINEAR"}
      </text>
      <text x={722} y={1246} fontSize={18} fill={MUTED} {...text}>
        CUBIC-BEZIER
      </text>
      <text x={722} y={1284} fontSize={32} fill={CREAM} fontFamily={fontFamily} fontWeight={700}>
        {good ? "0.2, 0, 0, 1" : "0, 0, 1, 1"}
      </text>
      <rect x={722} y={1300} width={150} height={32} rx={16} fill={color} />
      <text x={797} y={1323} textAnchor="middle" fontSize={19} fill={INK} {...text}>
        {good ? "NATURAL" : "ROBOTIC"}
      </text>
    </g>
  );
};

// Rule 2 below the artboard: the skill's three motion layers, switched on one by one.
const GROUPS = [
  { tag: "PRIMARY", label: "MAIN ACTION", color: AMBER, at: T.main, glyph: "M0 18 Q22 -40 44 18" },
  { tag: "SECONDARY", label: "SUPPORTING DETAIL", color: CREAM, at: T.supporting, glyph: "M0 14 Q14 -16 28 14 M42 14 Q54 -6 66 14" },
  { tag: "AMBIENT", label: "QUIET BACKGROUND", color: BLUE, at: T.quiet, glyph: "M0 0 Q15 -22 30 0 T60 0 T90 0" },
];
const LayerGroups: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={400} y={1110} width={640} height={240} rx={12} fill={PANEL} />
      {GROUPS.map((row, k) => {
        const s = enter(frame - row.at, SNAPPY);
        const y = 1124 + k * 74;
        return (
          <g key={row.tag} opacity={0.3 + 0.7 * Math.min(s, 1)} transform={`translate(${(s - 1) * 16} 0)`}>
            <rect x={412} y={y} width={616} height={62} rx={12} fill="#232846" />
            <path d={`M426 ${y + 31} q16 -18 32 0 q-16 18 -32 0Z`} fill="none" stroke={row.color} strokeWidth={4} />
            <circle cx={442} cy={y + 31} r={5} fill={row.color} />
            <rect x={472} y={y + 17} width={114} height={28} rx={14} fill={row.color} />
            <text x={529} y={y + 37} textAnchor="middle" fontSize={16} fill={INK} {...text}>
              {row.tag}
            </text>
            <text x={600} y={y + 41} fontSize={27} fill={row.color} {...text}>
              {row.label}
            </text>
            <path
              d={row.glyph}
              transform={`translate(922 ${y + 31})`}
              fill="none"
              stroke={row.color}
              strokeWidth={5}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
};

// One bar per layer. In the AI's broken attempt the bars are scattered and shaking, and the playhead jumps.
// For rule 3 the bars slide into a cascade, one group per turn, and the playhead sweeps the loop.
const TRACK = 546;
const Timeline: React.FC = () => {
  const frame = useCurrentFrame();
  const mess = isBroken(frame);
  const head = mess
    ? (Math.floor(frame / 4) * 173) % TRACK
    : frame < T.third
      ? 0
      : (TRACK * ((frame - T.third) % CYCLE)) / CYCLE;
  return (
    <g>
      <rect x={400} y={1110} width={640} height={240} rx={12} fill={PANEL} />
      {Array.from({ length: 14 }, (_, k) => (
        <path key={k} d={`M${484 + k * 42} 1118 v${k % 2 ? 8 : 14}`} stroke={RAIL} strokeWidth={2} />
      ))}
      {ELEMENTS.map((el, i) => {
        const y = 1140 + i * 22;
        const cascade = enter(frame - T.three - 6 - i * 0.7, SNAPPY) * (1 - flash(frame));
        const x0 = 484 + ((i * 137) % 300) + (mess ? Math.sin(frame / 2 + i * 3) * 8 : 0);
        const w0 = 70 + ((i * 89) % 230);
        const x = x0 + (484 + (turnOf(i) / CYCLE) * TRACK - x0) * cascade;
        const w = w0 + (94 - w0) * cascade;
        return (
          <g key={el.name}>
            <rect x={412} y={y + 2} width={12} height={12} rx={3} fill={el.color} />
            <rect x={430} y={y + 5} width={40} height={6} rx={3} fill={RAIL} />
            <rect x={484} y={y} width={TRACK} height={16} rx={8} fill="#232846" />
            <rect
              x={x}
              y={y + 2}
              width={w}
              height={12}
              rx={6}
              fill={cascade < 0.5 ? RED : GREEN}
              opacity={moving(i, frame) ? 1 : 0.4}
            />
            {[x + 3, x + w - 3].map((kx) => (
              <rect key={kx} x={-4.5} y={-4.5} width={9} height={9} fill={CREAM} transform={`translate(${kx} ${y + 8}) rotate(45)`} />
            ))}
          </g>
        );
      })}
      <path d={`M${484 + head} 1116 V1344`} stroke={AMBER} strokeWidth={4} />
      <path d={`M${475 + head} 1112 h18 l-9 13Z`} fill={AMBER} />
    </g>
  );
};

// Playful button press from the skill: anticipation to 0.97, squash to 1.04 by 0.96, then a spring that
// overshoots and settles. The shadow shrinks and the label dips as the supporting layer.
const FollowButton: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - T.tryIt - 10;
  if (t < 0) return null;
  const s = enter(t, { damping: 12, stiffness: 170 });
  const p = frame - T.follow;
  const back = enter(p - 4.5, { damping: 10, stiffness: 220 });
  const wide =
    p < 1.5
      ? interpolate(p, [0, 1.5], [1, 0.97], DECELERATE)
      : interpolate(p, [1.5, 4.5], [0.97, 1.04], EXIT) - 0.04 * back;
  const tall =
    p < 1.5
      ? interpolate(p, [0, 1.5], [1, 0.97], DECELERATE)
      : interpolate(p, [1.5, 4.5], [0.97, 0.96], EXIT) + 0.04 * back;
  const done = p >= 3;
  const reach = interpolate(frame, [T.tryIt + 18, T.follow - 4], [0, 1], DECELERATE);
  const float = Math.sin(frame / 16) * 5;

  return (
    <g opacity={Math.min(s, 1)}>
      <ellipse cx={716} cy={1178} rx={210 * (tall * 4 - 3)} ry={16} fill="#05060d" opacity={0.5} />
      <g transform={`translate(716 ${1040 + (1 - s) * 60 + float + (1 - tall) * 50}) scale(${wide} ${tall})`}>
        <rect x={-250} y={-88} width={500} height={176} rx={88} fill={done ? GREEN : AMBER} />
        <text y={26} textAnchor="middle" fontSize={done ? 66 : 76} fill={INK} {...text}>
          {done ? "FOLLOWING" : "FOLLOW"}
        </text>
      </g>
      {done && p < 12
        ? Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const r = 150 + (p - 3) * 16;
            return (
              <path
                key={i}
                d={`M${716 + Math.cos(a) * r * 1.7} ${1040 + Math.sin(a) * r} l${Math.cos(a) * 30} ${Math.sin(a) * 30}`}
                stroke={GREEN}
                strokeWidth={11}
                strokeLinecap="round"
                opacity={1 - (p - 3) / 9}
              />
            );
          })
        : null}
      <g
        transform={`translate(${1000 - 190 * reach - Math.sin(Math.PI * reach) * 50} ${1420 - 340 * reach + float}) scale(${p >= 0 && p < 4 ? 0.88 : 1})`}
      >
        <path d={POINTER} fill={CREAM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    </g>
  );
};

// Tool icons in the top bar, each drawn around its own centre: select, pen, shape, ellipse, text.
const TOOLS = [
  "M-7 -10 V8 L-2 4 L2 12 L6 10 L2 2 H8Z",
  "M-8 10 L-2 -10 L8 0Z M-8 10 L0 2",
  "M-9 -9 H9 V9 H-9Z",
  "M0 -10 A10 10 0 1 1 -0.1 -10Z",
  "M-9 -9 H9 M0 -9 V10",
];

// What the laptop shows: a made-up motion editor with a toolbar, a layer list, an artboard and a
// timeline. It is drawn once, in its own coordinates (x 190 to 1050, y 690 to 1360), for both shots.
const Screen: React.FC = () => {
  const frame = useCurrentFrame();
  const skillOn = Math.min(enter(frame - T.typed + 4, SNAPPY), 1);
  const bad = isBroken(frame);
  // The editor dims while the terminal, the cards or the follow button sit on top of it.
  const scrim = Math.max(
    Math.min(
      interpolate(frame, [T.skill + 4, T.skill + 12], [0, 1], CLAMP),
      interpolate(frame, [T.one - 6, T.one], [1, 0], CLAMP),
    ),
    interpolate(frame, [T.tryIt + 2, T.tryIt + 10], [0, 1], CLAMP),
  );
  return (
    <g clipPath="url(#screenClip)">
      <rect x={190} y={690} width={860} height={670} fill="#12152a" />

      <rect x={190} y={690} width={860} height={50} fill="#2c3152" />
      <text x={212} y={723} fontSize={21} fill={MUTED} {...text}>
        LAUNCH PROMO
      </text>
      <rect x={410} y={697} width={36} height={36} rx={8} fill={RAIL} />
      {TOOLS.map((d, k) => (
        <path
          key={d}
          d={d}
          transform={`translate(${428 + k * 44} 715)`}
          fill={k === 0 ? CREAM : "none"}
          stroke={k === 0 ? "none" : MUTED}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      <path d="M676 704 V726 L696 715Z" fill={moving(0, frame) ? AMBER : MUTED} />
      {/* What he asked the AI for, before the skill was installed. */}
      <g opacity={interpolate(frame, [T.skill, T.skill + 8], [1, 0], CLAMP)}>
        <rect x={760} y={699} width={274} height={32} rx={16} fill={RAIL} />
        <text x={897} y={722} textAnchor="middle" fontSize={19} fill={CREAM} {...text}>
          PROMPT: ANIMATE THIS
        </text>
      </g>
      <g opacity={skillOn} transform={`translate(${(1 - skillOn) * 30} 0)`}>
        <rect x={760} y={699} width={274} height={32} rx={16} fill={GREEN} />
        <text x={897} y={723} textAnchor="middle" fontSize={21} fill={INK} {...text}>
          MOTION-DESIGN ON
        </text>
      </g>

      <rect x={190} y={740} width={202} height={620} fill={PANEL} />
      <text x={210} y={776} fontSize={20} fill={MUTED} {...text}>
        LAYERS
      </text>
      {ELEMENTS.map((el, i) => {
        const y = 796 + i * 60;
        const live = moving(i, frame);
        return (
          <g key={el.name}>
            {live ? <rect x={198} y={y - 8} width={186} height={46} rx={10} fill="#2c3152" /> : null}
            <rect x={210} y={y} width={30} height={30} rx={8} fill={el.color} />
            <text x={252} y={y + 22} fontSize={19} fill={live ? CREAM : MUTED} {...text}>
              {el.name}
            </text>
            {/* Red while the animation is broken, green when a layer moves on its own turn. */}
            <circle cx={370} cy={y + 15} r={8} fill={live ? (bad ? RED : GREEN) : RAIL} />
          </g>
        );
      })}

      <rect x={400} y={746} width={640} height={356} rx={12} fill="#0f1220" />
      <rect x={430} y={766} width={580} height={320} rx={14} fill="#20253f" />
      <Design />
      {bad ? (
        <rect
          x={430}
          y={766}
          width={580}
          height={320}
          rx={14}
          fill="none"
          stroke={RED}
          strokeWidth={5}
          opacity={0.55 + Math.sin(frame / 3) * 0.35}
        />
      ) : null}
      <Panel from={T.one} to={T.two}>
        <Speed />
      </Panel>

      <Panel from={0} to={T.one}>
        <Timeline />
      </Panel>
      <Panel from={T.one} to={T.two}>
        <GraphEditor />
      </Panel>
      <Panel from={T.two} to={T.three}>
        <LayerGroups />
      </Panel>
      <Panel from={T.three} to={END + 1}>
        <Timeline />
      </Panel>

      <rect x={190} y={740} width={860} height={620} fill="#0a0c16" opacity={scrim * 0.8} />
      <Panel from={T.skill + 6} to={T.oneLine}>
        <SkillCard />
      </Panel>
      <Panel from={T.oneLine - 2} to={T.feel}>
        <Terminal />
      </Panel>
      <Panel from={T.feel} to={T.pick}>
        <Cards cards={FEELS} />
      </Panel>
      <Panel from={T.pick} to={T.one}>
        <Cards cards={STYLES} picked={T.picked} />
      </Panel>
      <FollowButton />
    </g>
  );
};

const SCREEN_SCALE = 980 / 860;
// The POV grows out of the laptop on the desk: at 0 it sits on that screen, at 1 it fills the frame.
const DESK = { scale: 516 / 980, x: 688 - (540 * 516) / 980, y: 1081 - (1072 * 516) / 980 };

// First-person view: the laptop screen, the keyboard, and the stickman's two arms reaching in from below.
const PointOfView: React.FC = () => {
  const frame = useCurrentFrame();
  const pov = Math.max(
    ...POV.map(([a, b]) =>
      Math.min(
        // A shot change is a context switch: 400 ms in, 300 ms out, so the entrance is the longer one.
        interpolate(frame, [a, a + 12], [0, 1], DECELERATE),
        interpolate(frame, [b, b + 9], [1, 0], EXIT),
      ),
    ),
  );
  if (pov <= 0) return null;
  const keys = typing(frame);
  // In the hook the hands hover off the keys, shaking. The POV is off screen by T.yourAi, so the reset is never seen.
  const recoil = frame < T.yourAi ? 100 + Math.sin(frame / 1.3) * 6 : 0;
  // Each press dips and returns on a sine, never at constant speed.
  const tap = TAPS.reduce((sum, t) => sum + Math.sin((Math.PI / 2) * Math.max(0, 1 - Math.abs(frame - t) / 4)) ** 2, 0);

  return (
    <g
      opacity={interpolate(pov, [0, 0.4], [0, 1], CLAMP)}
      transform={`translate(${DESK.x * (1 - pov)} ${DESK.y * (1 - pov)}) scale(${DESK.scale + (1 - DESK.scale) * pov})`}
    >
      {/* Large enough to cover the frame even at the smallest scale, so no edge shows during a shot change. */}
      <rect x={-800} y={-1000} width={2120} height={3700} fill="#0d0f1e" />
      <ellipse cx={540} cy={1072} rx={900} ry={760} fill="url(#povGlow)" opacity={0.8 + Math.sin(frame / 30) * 0.12} />
      <rect x={32} y={672} width={1016} height={802} rx={28} fill="#0a0c16" />
      <circle cx={540} cy={681} r={5} fill="#2c3152" />
      <g transform={`translate(${50 - 190 * SCREEN_SCALE} ${690 - 690 * SCREEN_SCALE}) scale(${SCREEN_SCALE})`}>
        <Screen />
      </g>
      <rect x={32} y={1470} width={1016} height={24} fill={PANEL} />
      <path d="M36 1494 H1044 L1150 1960 H-70Z" fill="#3a4064" />
      {[0, 1, 2, 3].map((row) => {
        const inset = 74 - row * 30;
        const width = (1080 - 2 * inset) / 11;
        return Array.from({ length: 11 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={inset + col * width + 5}
            y={1514 + row * 100}
            width={width - 10}
            height={76 + row * 6}
            rx={12}
            fill="#232846"
          />
        ));
      })}
      {[
        { from: 110, x: 370, bob: Math.abs(Math.sin(frame / keys.rate)) },
        { from: 970, x: 710, bob: Math.abs(Math.cos(frame / keys.rate)) },
      ].map((hand, i) => {
        const x = hand.x + Math.sin(frame / (keys.rate * 2.4) + i * 2) * 34 * keys.amount;
        const y =
          1668 + Math.sin(frame / 14 + i) * 4 - hand.bob * 26 * keys.amount + recoil + (i ? tap * 24 : 0);
        return (
          <path
            key={hand.from}
            d={`M${hand.from} 2000 Q${(hand.from + x) / 2 + (i ? 60 : -60)} 1850 ${x} ${y}`}
            fill="none"
            stroke={CREAM}
            strokeWidth={48}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Soundtrack: React.FC = () => (
  <>
    {/* This take came about 6.5 dB hotter than the other videos' voices, so it is brought down to match them. */}
    <Audio src={staticFile("voice-motion.mp3")} volume={0.47} />
    <Audio
      src={staticFile("sfx/bgm-motion.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    <Sfx name="error" from={4} volume={0.2} />
    <Sfx name="whoosh" from={T.flew + 2} volume={0.3} />
    <Sfx name="paper" from={T.skill + 6} volume={0.4} />
    <Sfx name="sparkle" from={T.motion} volume={0.36} />
    {CHUNKS.map((c, i) => (
      <Sfx key={c.text} name={`key${i}`} from={c.at} volume={0.5} />
    ))}
    {KEYS.filter((_, i) => i % 3 === 0).map((from, i) => (
      <Sfx key={from} name={`key${(i + 3) % 4}`} from={from} volume={0.42} />
    ))}
    <Sfx name="check" from={T.typed - 4} />
    <Sfx name="sweep" from={T.feel} volume={0.24} />
    {STYLES.map((c, i) => (
      <Sfx key={c.label} name={`thud${i}`} from={c.at + 2} volume={0.4} />
    ))}
    <Sfx name="ding" from={T.picked} volume={0.4} />
    {[T.one, T.two, T.three].map((from) => (
      <Sfx key={from} name="stamp" from={from} volume={0.42} />
    ))}
    <Sfx name="error" from={T.never + 37} volume={0.22} />
    <Sfx name="check" from={T.eased + 24} />
    <Sfx name="pop" from={T.main} volume={0.42} />
    <Sfx name="sparkle" from={T.quiet} volume={0.3} />
    <Sfx name="womp" from={T.broke} volume={0.3} />
    <Sfx name="pop" from={T.tryIt + 10} volume={0.45} />
    <Sfx name="click" from={T.follow + 3} volume={0.6} />
    <Sfx name="chime" from={T.follow + 5} volume={0.42} />
  </>
);

// Shot changes already push in or out, so the camera punch is kept for the beats inside a shot.
const PUNCHES = [0, T.one, T.two, T.three];
const SHAKES = [T.flew + 4];

export const MotionVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = animatePose(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: STAGE_WALL }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <radialGradient id="povGlow">
            <stop offset="0.3" stopColor="#3a4064" />
            <stop offset="1" stopColor="#3a4064" stopOpacity={0} />
          </radialGradient>
          <clipPath id="screenClip">
            <rect x={190} y={690} width={860} height={670} rx={10} />
          </clipPath>
          <clipPath id="canvasClip">
            <rect x={400} y={746} width={640} height={356} rx={12} />
          </clipPath>
        </defs>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          <Stage />
          <g transform={SCREEN_ON_DESK}>
            <Screen />
          </g>
          <Panel from={T.check + 4} to={T.one}>
            <Numbers />
          </Panel>
          <ellipse cx={215} cy={1662} rx={130} ry={13} fill="#0b0d1a" opacity={0.6} />
          <Stickman
            pose={pose}
            thumb={Math.min(enter(frame - T.out - 3), 1)}
            headFill={STAGE_WALL}
            bendy
          />
          <PointOfView />
        </g>
      </svg>

      <Caption
        plain
        from={0}
        to={T.title - 2}
        lines={[
          { text: "MY AI JUST BROKE", at: 2, size: 84 },
          { text: "MY ANIMATION", at: T.animation - 6, size: 112, boxes: { ANIMATION: RED } },
        ]}
      />
      <Caption
        plain
        from={T.title - 4}
        to={T.button - 2}
        lines={[
          { text: "THE TITLE", at: T.title - 4, size: 110 },
          { text: "FLEW AWAY", at: T.flew - 2, size: 140, boxes: { AWAY: RED } },
        ]}
      />
      <Caption
        plain
        from={T.button - 4}
        to={T.yourAi - 2}
        lines={[
          { text: "THE BUTTON", at: T.button - 4, size: 100 },
          { text: "WON'T STOP", at: T.wont, size: 100 },
          { text: "SPINNING", at: T.spinning - 2, size: 150, boxes: { SPINNING: RED } },
        ]}
      />
      <Caption
        plain
        from={T.yourAi - 4}
        to={T.skill - 2}
        lines={[
          { text: "YOUR AI DOES", at: T.yourAi - 4, size: 104 },
          { text: "THIS TOO", at: T.thisToo - 2, size: 150, boxes: { THIS: AMBER, TOO: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.skill - 4}
        to={T.session - 2}
        lines={[
          { text: "THIS SKILL TEACHES IT", at: T.skill - 4, size: 68 },
          { text: "MOTION", at: T.motion - 2, size: 190, boxes: { MOTION: AMBER } },
          { text: "ONE LINE IN YOUR TERMINAL", at: T.oneLine, size: 58, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.session - 4}
        to={T.feel - 2}
        lines={[
          { text: "START A NEW SESSION", at: T.session - 4, size: 76 },
          { text: "THEN TYPE", at: T.type, size: 76 },
          { text: COMMAND, at: T.slash, size: 104, boxes: { [COMMAND]: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.feel - 4}
        to={T.check - 2}
        lines={[
          { text: "HOW SHOULD IT FEEL?", at: T.feel - 4, size: 80 },
          { text: "THEN PICK", at: T.pick - 2, size: 80 },
          { text: "ONE PERSONALITY", at: T.onePersonality, size: 86, boxes: { ONE: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.check - 4}
        to={T.one - 2}
        lines={[
          { text: "THEN CHECK", at: T.check - 4, size: 100 },
          { text: "THREE RULES", at: T.rules - 4, size: 120, boxes: { THREE: AMBER, RULES: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.one - 4}
        to={T.two - 2}
        lines={[
          { text: "RULE 1", at: T.one - 4, size: 150, boxes: { RULE: AMBER, "1": AMBER } },
          { text: "NEVER MOVE ANYTHING", at: T.never, size: 74 },
          { text: "AT CONSTANT SPEED", at: T.constant, size: 80, boxes: { CONSTANT: RED, SPEED: RED } },
        ]}
      />
      <Caption
        plain
        from={T.two - 4}
        to={T.three - 2}
        lines={[
          { text: "RULE 2", at: T.two - 4, size: 150, boxes: { RULE: AMBER, "2": AMBER } },
          { text: "THREE LAYERS", at: T.layers, size: 110 },
          {
            text: "MAIN + DETAIL + BACKGROUND",
            at: T.main,
            ats: [T.main, T.supporting - 2, T.supporting, T.quiet - 2, T.quiet],
            size: 54,
          },
        ]}
      />
      <Caption
        plain
        from={T.three - 4}
        to={T.thatRule - 2}
        lines={[
          { text: "RULE 3", at: T.three - 4, size: 150, boxes: { RULE: AMBER, "3": AMBER } },
          { text: "ONLY 1/3 OF YOUR ELEMENTS", at: T.third, size: 60, boxes: { "1/3": GREEN } },
          { text: "MOVE AT ONCE", at: T.atOnce, size: 110 },
        ]}
      />
      <Caption
        plain
        from={T.thatRule - 4}
        to={T.same - 2}
        lines={[
          { text: "THAT'S THE RULE", at: T.thatRule - 4, size: 84 },
          { text: "MY AI BROKE", at: T.myAi - 2, ats: [T.myAi - 2, T.myAi + 4, T.broke - 2], size: 130, boxes: { BROKE: RED } },
        ]}
      />
      <Caption
        plain
        from={T.same - 4}
        to={T.tryIt - 2}
        lines={[
          { text: "SAME DESIGN", at: T.same - 4, size: 90 },
          { text: "SAME AI", at: T.sameAi, size: 90 },
          { text: "NOW IT WORKS", at: T.nowWorks, size: 120, boxes: { WORKS: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.tryIt - 4}
        to={T.follow - 2}
        lines={[
          { text: "TRY IT ON", at: T.tryIt - 4, size: 96 },
          { text: "ONE BUTTON", at: T.tryIt + 12, size: 130, boxes: { BUTTON: AMBER } },
          { text: "TODAY", at: T.today, size: 96 },
        ]}
      />
      <Caption
        plain
        from={T.follow - 4}
        to={END + 1}
        lines={[
          { text: "FOLLOW", at: T.follow - 4, size: 80 },
          { text: "STICKMAN SHIPS", at: T.follow + 4, size: 92, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "I TEST THE NEXT ONE FOR YOU", at: T.test, size: 52 },
          { text: "SKILL BY LOTTIEFILES", at: T.test + 24, size: 46, color: AMBER },
        ]}
      />
    </AbsoluteFill>
  );
};

export const MotionComposition = () => (
  <Composition
    id="MotionDesignTutorial"
    component={MotionVideo}
    durationInFrames={END}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
