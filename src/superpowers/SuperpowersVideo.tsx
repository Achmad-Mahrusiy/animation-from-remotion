import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Room } from "../Room";
import { SIT, SIT_SCRATCH, SIT_WAVE, Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, WALL, fontFamily } from "../theme";
import { CAPE, FAR, Rooftop, SKY } from "./Rooftop";
import { BLUE, Blueprint, Bot, DAY, HQ, Hq, LAB, Lab, Sky } from "./Sets";

// A movie-trailer parody: "In a world... where AI writes code before you finish your sentence".
const END = 37 * FPS;
// shortcut: phrase starts are measured from the pauses in voice-superpowers.mp3; before, sentence, powers, beforeCode and jesse fall inside a phrase and are estimates. Re-measure if the voice file changes.
const at = (voiceSecond: number) => Math.round(voiceSecond * FPS);

const T = {
  where: at(1.38),
  before: at(2.6),
  sentence: at(3.6),
  oneDev: at(4.96),
  typed: at(6.19),
  cmd: at(7.82),
  cmdEnd: at(9.83),
  now: at(10.17),
  powers: at(11.4),
  power1: at(12.87),
  asks: at(13.73),
  beforeCode: at(14.9),
  power2: at(15.85),
  plan: at(16.66),
  tiny: at(18.08),
  minutes: at(19.13),
  power3: at(20.67),
  test: at(21.49),
  red: at(22.83),
  green: at(23.48),
  written: at(24.56),
  deleted: at(26.04),
  every: at(27.24),
  review: at(28.57),
  by: at(29.99),
  jesse: at(30.7),
  link: at(31.75),
  title: at(32.84),
  soon: at(34.11),
  terminal: at(35.06),
};

const text = { fontFamily, fontWeight: 900 } as const;
const mono = { fontFamily, fontWeight: 700 } as const;
const BOUNCY = { damping: 11, stiffness: 190 };
const CARD = "#1a2150";
const INK = "#11181c";

const typed = (s: string, frame: number, a: number, b: number) =>
  s.slice(0, Math.round(interpolate(frame, [a, b], [0, s.length], CLAMP)));
const spread = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => Math.round(a + (i * (b - a)) / n));

// Shown in its real case, because viewers copy it.
const COMMAND = ["/plugin install", "superpowers@", "claude-plugins-official"];
const QUESTIONS = ["WHO IS IT FOR?", "WHAT MUST IT DO?", "WHAT CAN WAIT?"];
const TASKS = [
  { label: "TODO DATA MODEL", min: 3 },
  { label: "LIST COMPONENT", min: 4 },
  { label: "ADD ITEM FORM", min: 2 },
  { label: "TOGGLE DONE", min: 5 },
  { label: "SAVE TO STORAGE", min: 3 },
];
const SEVERITY = [
  { label: "CRITICAL", count: 0, color: RED },
  { label: "IMPORTANT", count: 1, color: AMBER },
  { label: "MINOR", count: 2, color: CREAM },
];

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
const REST = stand({ eR: [270, 1210], hR: [330, 1130], smile: 1 });
const POINT = stand({ head: [215, 1040], sh: [200, 1130], eR: [280, 1120], hR: [315, 1040], smile: 0.8 });
const THINK = stand({ head: [205, 1044], eR: [285, 1200], hR: [268, 1122], eL: [150, 1240], hL: [230, 1260], smile: 0.2 });
const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [300, 1090], hR: [330, 1000], smile: 1.6 });
const GUARD = stand({ look: 0, eL: [80, 1150], hL: [30, 1240], eR: [270, 1200], hR: [300, 1300], smile: -0.3 });
const SHRUG = stand({ look: 0, eL: [90, 1210], hL: [30, 1150], eR: [290, 1210], hR: [350, 1150], smile: 0.6 });
const WINCE = stand({ head: [180, 1048], eR: [250, 1180], hR: [300, 1230], smile: -1 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], smile: 1.2 });
const POINT_UP = stand({ look: 0, eR: [255, 1060], hR: [275, 925], smile: 0.8 });
const HERO = stand({ look: 0, eL: [105, 1250], hL: [165, 1345], eR: [275, 1250], hR: [215, 1345], smile: 1.2 });
const KICK_BACK = stand({ head: [208, 1040], kR: [205, 1480], fR: [130, 1560], smile: -0.4 });
const KICK = stand({ head: [165, 1046], sh: [170, 1134], eL: [110, 1200], hL: [60, 1150], eR: [240, 1200], hR: [290, 1150], kR: [270, 1440], fR: [348, 1500], smile: 1 });
// Flying is drawn where it happens on screen, not at the standing spot.
const FLY: Pose = {
  head: [700, 1400],
  sh: [615, 1425],
  hip: [390, 1460],
  kL: [270, 1470],
  fL: [150, 1485],
  kR: [275, 1450],
  fR: [160, 1440],
  eR: [790, 1385],
  hR: [885, 1350],
  eL: [520, 1470],
  hL: [430, 1490],
  look: 1,
  smile: 1.4,
};

// One background per beat, so no two neighbours share a set or a camera position.
type Scene = "room" | "pov" | "roof" | "hq" | "plan" | "lab" | "review" | "finale" | "sky";
const CUTS: [number, Scene][] = [
  [0, "room"],
  [T.typed - 2, "pov"],
  [T.now, "roof"],
  [T.power1, "hq"],
  [T.power2, "plan"],
  [T.power3, "lab"],
  [T.every, "review"],
  [T.by, "finale"],
  [T.title, "sky"],
  [T.terminal, "room"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "room");

// Where the stickman stands in each scene: shift from x=190, mirrored, and size.
const PLACE: Record<Scene, { tx: number; ty?: number; flip?: boolean; size?: number; wall: string }> = {
  room: { tx: 0, wall: WALL },
  pov: { tx: 0, wall: SKY },
  roof: { tx: 0, wall: SKY },
  hq: { tx: 700, flip: true, wall: HQ },
  plan: { tx: 350, size: 0.55, wall: BLUE },
  lab: { tx: 0, wall: LAB },
  review: { tx: 700, flip: true, wall: HQ },
  // He stands in front of a tower there, so the head takes the tower's color.
  finale: { tx: 350, wall: FAR },
  sky: { tx: 0, ty: -300, wall: DAY },
};

const POSES = [
  { at: 0, pose: SIT },
  { at: T.before, pose: SIT_SCRATCH },
  { at: T.oneDev - 2, pose: SIT_WAVE },
  { at: T.now - 2, pose: { ...REST, smile: 0.3 } },
  { at: T.powers - 4, pose: CHEER },
  { at: T.power1 - 2, pose: THINK },
  { at: T.beforeCode - 2, pose: POINT },
  { at: T.power2 - 2, pose: POINT_UP },
  { at: T.minutes + 10, pose: HERO },
  { at: T.power3 - 2, pose: POINT },
  { at: T.red, pose: WINCE },
  { at: T.green, pose: CHEER },
  { at: T.written - 2, pose: GUARD },
  { at: T.deleted - 12, pose: KICK_BACK },
  { at: T.deleted - 4, pose: KICK },
  { at: T.deleted + 16, pose: REST },
  { at: T.every - 2, pose: POINT },
  { at: T.review + 14, pose: SHRUG },
  { at: T.by - 2, pose: HERO },
  { at: T.jesse, pose: WAVE },
  { at: T.link - 2, pose: HERO },
  { at: T.title - 2, pose: FLY },
  { at: T.terminal - 2, pose: { ...SIT, smile: 1.3 } },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const within = (a: number, b: number) => frame >= a && frame < b;
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 7;
  const drag = Math.sin((frame - 6) / 19) * 10;
  const p: Pose = {
    ...body,
    head: [mid.head[0] + sway, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    hip: [body.hip[0] + sway * 0.2, body.hip[1]],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0] + drag, tip.hL[1] + Math.sin(frame / 11) * 5],
    hR: [tip.hR[0] + drag, tip.hR[1] + Math.cos(frame / 11) * 5],
  };

  if (within(2, T.before)) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 18];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 18];
  }
  if (within(T.before + 8, T.oneDev - 2)) {
    p.hR = [p.hR[0] + Math.sin(frame / 1.8) * 10, p.hR[1]];
  }
  if (within(T.jesse + 8, T.link - 2)) {
    p.hL = [p.hL[0] + Math.sin(frame / 2.6) * 30, p.hL[1]];
  }
  return p;
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
  [T.powers, 15, 110],
  [T.green, 14, 90],
];

const Bolt: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = AMBER }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M4 -20 L-12 3 L-2 3 L-5 20 L12 -4 L2 -4Z" fill={fill} />
);

const Tick: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <path
    d={`M${x} ${y} l16 20 l34 -44`}
    fill="none"
    stroke={GREEN}
    strokeWidth={12}
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity={opacity}
  />
);

// The room's monitor screen.
const RX = 380;
const RY = 802;
const RW = 630;

const RoomScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(interpolate(frame, [8, T.sentence + 12], [0, 847], CLAMP));
  const cursor = frame % 20 < 12 ? "_" : "";

  if (frame < T.terminal) {
    return (
      <g>
        <text x={RX + 30} y={RY + 70} fontSize={40} fill={CREAM} {...mono}>
          {`> ${typed("build me a to", frame, 0, T.before)}${cursor}`}
        </text>
        <text x={RX + RW / 2} y={RY + 262} textAnchor="middle" fontSize={176} fill={RED} {...text}>
          {count}
        </text>
        <text x={RX + RW / 2} y={RY + 346} textAnchor="middle" fontSize={56} fill={RED} {...text}>
          LINES OF CODE
        </text>
      </g>
    );
  }
  // The last shot leaves the command on screen for viewers to copy, in the same room the hook starts in.
  return (
    <g>
      <Bolt x={RX + 46} y={RY + 62} s={1.3} />
      <text x={RX + 78} y={RY + 76} fontSize={38} fill={AMBER} {...mono}>
        CLAUDE CODE
      </text>
      {COMMAND.map((line, i) => (
        <text key={line} x={RX + 30} y={RY + 168 + i * 72} fontSize={44} fill={CREAM} {...mono}>
          {line + (i === COMMAND.length - 1 ? cursor : "")}
        </text>
      ))}
    </g>
  );
};

// Code lines spraying out of the monitor while the AI codes without asking.
const Flood: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 8) return null;
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const t = (frame + i * 9) % 54;
        const dir = ((i % 5) - 2) * 0.9;
        const w = [150, 96, 180, 120, 70][i % 5];
        const x = 695 + dir * t * 6 - w / 2;
        const y = 776 - t * 6 + 0.11 * t * t;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={16}
            rx={8}
            fill={i % 3 ? CREAM : RED}
            opacity={(1 - t / 54) * 0.9}
            transform={`rotate(${t * dir * 3} ${x + w / 2} ${y + 8})`}
          />
        );
      })}
    </g>
  );
};

const Burst: React.FC = () => {
  const t = useCurrentFrame() - T.powers;
  if (t < 0 || t > 9) return null;
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        const r = 110 + t * 20;
        return (
          <path
            key={i}
            d={`M${860 + Math.cos(a) * r} ${770 + Math.sin(a) * r} l${Math.cos(a) * 60} ${Math.sin(a) * 60}`}
            stroke={AMBER}
            strokeWidth={13}
            strokeLinecap="round"
            opacity={1 - t / 9}
          />
        );
      })}
    </g>
  );
};

const Header: React.FC<{ children: string }> = ({ children }) => (
  <g>
    <Bolt x={426} y={786} s={0.9} />
    <text x={448} y={797} fontSize={32} fill={AMBER} {...mono}>
      {children}
    </text>
  </g>
);

const Install: React.FC = () => {
  const frame = useCurrentFrame();
  const total = COMMAND.join("").length;
  const count = Math.round(interpolate(frame, [T.cmd, T.cmdEnd], [0, total], CLAMP));
  const done = Math.min(enter(frame - T.cmdEnd - 6, BOUNCY), 1);
  let before = 0;
  return (
    <g>
      <Header>CLAUDE CODE</Header>
      {COMMAND.map((line, i) => {
        const shown = line.slice(0, Math.max(0, count - before));
        // The cursor sits on the line being typed.
        const active = count >= before && (count < before + line.length || i === COMMAND.length - 1);
        before += line.length;
        return (
          <text key={line} x={412} y={900 + i * 88} fontSize={52} fill={CREAM} {...mono}>
            {shown + (active && frame < T.cmdEnd + 6 && frame % 20 < 12 ? "_" : "")}
          </text>
        );
      })}
      <g opacity={done}>
        <Tick x={418} y={1172} />
        <text x={486} y={1196} fontSize={48} fill={GREEN} {...text}>
          INSTALLED
        </text>
      </g>
    </g>
  );
};

// The AI's questions, as speech bubbles rising from the caped monitor.
const Bubbles: React.FC = () => {
  const frame = useCurrentFrame();
  const zero = Math.min(enter(frame - T.beforeCode, BOUNCY), 1);
  return (
    <g>
      {QUESTIONS.map((q, i) => {
        const s = enter(frame - T.asks - i * 13, BOUNCY);
        const x = [60, 150, 60][i];
        const y = 720 + i * 116;
        return (
          <g
            key={q}
            opacity={Math.min(s, 1)}
            transform={`translate(${x + 280} ${y + 48}) scale(${0.6 + 0.4 * s}) translate(${-x - 280} ${-y - 48})`}
          >
            {i === 2 ? <path d={`M${x + 70} ${y + 88} l-24 70 l84 -72Z`} fill={CREAM} /> : null}
            <rect x={x} y={y} width={560} height={96} rx={48} fill={CREAM} />
            <circle cx={x + 52} cy={y + 48} r={28} fill={AMBER} />
            <text x={x + 52} y={y + 63} textAnchor="middle" fontSize={42} fill={INK} {...text}>
              ?
            </text>
            <text x={x + 98} y={y + 63} fontSize={42} fill={INK} {...text}>
              {q}
            </text>
          </g>
        );
      })}
      <g opacity={zero} transform={`translate(0 ${(1 - zero) * 40})`}>
        <rect x={370} y={1226} width={330} height={150} rx={22} fill={CARD} />
        <text x={535} y={1278} textAnchor="middle" fontSize={32} fill={CREAM} {...text}>
          CODE SO FAR
        </text>
        <text x={535} y={1350} textAnchor="middle" fontSize={64} fill={GREEN} {...text}>
          0 LINES
        </text>
      </g>
    </g>
  );
};

// A tiny caped subagent that flies across one task row.
const MiniHero: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} strokeLinecap="round">
    <path d="M-14 -6 L-82 -18 L-68 2 L-88 16 L-18 10Z" fill={CAPE} />
    <path d="M-12 6 L-60 14 L-88 20 M-6 10 L34 4" stroke={CREAM} strokeWidth={8} fill="none" />
    <circle r={15} fill={CARD} stroke={CREAM} strokeWidth={7} />
  </g>
);

const Tasks: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Header>writing-plans</Header>
      {TASKS.map((task, i) => {
        const s = enter(frame - T.plan - i * 5, BOUNCY);
        const chip = Math.min(enter(frame - T.minutes - i * 3, BOUNCY), 1);
        const y = 818 + i * 82;
        return (
          <g key={task.label} opacity={Math.min(s, 1)} transform={`translate(0 ${(1 - s) * 50})`}>
            <rect x={404} y={y} width={614} height={68} rx={16} fill={CARD} />
            <text x={430} y={y + 47} fontSize={36} fill={AMBER} {...text}>
              {i + 1}
            </text>
            <text x={474} y={y + 46} fontSize={32} fill={CREAM} {...text}>
              {task.label}
            </text>
            <g opacity={chip}>
              <rect x={872} y={y + 12} width={128} height={44} rx={22} fill={AMBER} />
              <text x={936} y={y + 44} textAnchor="middle" fontSize={27} fill={INK} {...text}>
                {`${task.min} MIN`}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
};

const Tdd: React.FC = () => {
  const frame = useCurrentFrame();
  const state = frame < T.red ? 0 : frame < T.green ? 1 : 2;
  const pop = 1 + 0.08 * (1 - enter(frame - (state === 2 ? T.green : T.red), BOUNCY));
  const gone = frame - T.deleted;
  return (
    <g>
      <Header>test-driven-development</Header>
      <text x={412} y={864} fontSize={36} fill={CREAM} {...mono}>
        todo.test.ts
      </text>
      <g transform={`translate(711 940) scale(${state ? pop : 1}) translate(-711 -940)`}>
        <rect x={412} y={886} width={602} height={108} rx={20} fill={[CARD, RED, GREEN][state]} />
        <text x={711} y={962} textAnchor="middle" fontSize={62} fill={state ? INK : CREAM} {...text}>
          {["RUNNING", "1 FAILED", "1 PASSED"][state]}
        </text>
      </g>
      <g opacity={Math.min(enter(frame - T.written), 1)}>
        <rect x={412} y={1022} width={602} height={192} rx={16} fill={CARD} />
        <text x={711} y={1100} textAnchor="middle" fontSize={44} fill={AMBER} {...text}>
          CODE WITH NO TEST
        </text>
        <rect x={436} y={1078} width={interpolate(gone, [2, 9], [0, 554], CLAMP)} height={14} rx={7} fill={RED} />
        {gone >= 6 ? (
          <text
            x={711}
            y={1186}
            textAnchor="middle"
            fontSize={76}
            fill={RED}
            opacity={Math.min(enter(gone - 6, BOUNCY), 1)}
            transform="rotate(-4 711 1160)"
            {...text}
          >
            DELETED
          </text>
        ) : null}
      </g>
    </g>
  );
};

// The untested code as a crate: it drops in, then the stickman kicks it out of the lab.
const Crate: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - T.deleted);
  if (frame < T.written || t > 26) return null;
  const drop = enter(frame - T.written, { damping: 12, stiffness: 160 });
  return (
    <g
      transform={`translate(${500 + t * 52} ${1540 - (1 - drop) * 1000 - t * 34 + t * t * 1.3}) rotate(${t * 16})`}
      opacity={interpolate(t, [16, 26], [1, 0], CLAMP)}
    >
      <rect x={-120} y={-110} width={240} height={220} rx={16} fill="#3a4f56" stroke={CREAM} strokeWidth={8} />
      {[160, 110, 180].map((w, i) => (
        <rect key={w} x={-90} y={-74 + i * 34} width={w} height={14} rx={7} fill={CREAM} opacity={0.6} />
      ))}
      <text y={84} textAnchor="middle" fontSize={40} fill={AMBER} {...text}>
        NO TEST
      </text>
    </g>
  );
};

const Review: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = enter(frame - T.review - 14, BOUNCY);
  return (
    <g>
      <Header>requesting-code-review</Header>
      {SEVERITY.map((row, i) => {
        const s = enter(frame - T.every - 6 - i * 7, BOUNCY);
        const y = 826 + i * 96;
        return (
          <g key={row.label} opacity={Math.min(s, 1)} transform={`translate(${(1 - s) * 100} 0)`}>
            <rect x={404} y={y} width={614} height={80} rx={18} fill={CARD} />
            <circle cx={446} cy={y + 40} r={15} fill={row.color} />
            <text x={482} y={y + 55} fontSize={40} fill={CREAM} {...text}>
              {row.label}
            </text>
            <text x={992} y={y + 57} textAnchor="end" fontSize={46} fill={row.color} {...text}>
              {row.count}
            </text>
          </g>
        );
      })}
      <g
        opacity={Math.min(stamp, 1)}
        transform={`translate(711 1164) rotate(-5) scale(${2 - Math.min(stamp, 1.2)}) translate(-711 -1164)`}
      >
        <rect x={500} y={1120} width={422} height={88} rx={14} fill="none" stroke={GREEN} strokeWidth={9} />
        <text x={711} y={1186} textAnchor="middle" fontSize={62} fill={GREEN} {...text}>
          REVIEWED
        </text>
      </g>
    </g>
  );
};

// The agent's screen. Its content is drawn once at x 372 to 1050, y 722 to 1254, and each scene places and sizes it.
const Frame: React.FC<{ x?: number; y?: number; size?: number; edge?: string; children: React.ReactNode }> = ({
  x = 372,
  y = 722,
  size = 1,
  edge = "#4c5bd4",
  children,
}) => (
  <g transform={`translate(${x} ${y}) scale(${size}) translate(-372 -722)`}>
    <rect x={372} y={722} width={678} height={532} rx={30} fill={edge} />
    <rect x={382} y={732} width={658} height={512} rx={22} fill="#0e1330" />
    {children}
  </g>
);

// The stickman's own eyes: the screen up close, the keyboard and both arms.
const Pov: React.FC = () => {
  const frame = useCurrentFrame();
  const typing = frame >= T.cmd && frame < T.cmdEnd;
  const left = typing ? Math.abs(Math.sin(frame / 1.5)) * 30 : 0;
  const right = typing ? Math.abs(Math.cos(frame / 1.5)) * 30 : 0;
  const key = typing ? Math.floor(frame / 2) % 40 : -1;
  const arm = { stroke: CREAM, strokeWidth: 50, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      <rect x={-40} y={-40} width={1160} height={2000} fill="#080a18" />
      <ellipse cx={540} cy={1070} rx={720} ry={600} fill="#3340b8" opacity={0.2} />
      <Frame x={58} y={690} size={1.42}>
        <Install />
      </Frame>
      <rect x={110} y={1500} width={860} height={280} rx={26} fill="#2c335c" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={138 + (i % 10) * 81}
          y={1524 + Math.floor(i / 10) * 60}
          width={66}
          height={46}
          rx={9}
          fill={i === key ? AMBER : "#454d85"}
        />
      ))}
      <path d={`M210 1960 Q280 1790 400 ${1650 - left}`} {...arm} />
      <path d={`M870 1960 Q800 1790 680 ${1650 - right}`} {...arm} />
    </g>
  );
};

// The title shot: subagents fly in formation around him.
const Squad: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[
        [250, 880],
        [150, 1330],
        [900, 1420],
      ].map(([x, y], i) => (
        <g key={x} transform={`translate(${x} ${y + Math.sin(frame / 6 + i * 2) * 18}) scale(2.2)`}>
          <MiniHero x={0} y={0} />
        </g>
      ))}
    </g>
  );
};

const Cape: React.FC<{ pose: Pose; amount: number; angle: number }> = ({ pose, amount, angle }) => {
  const frame = useCurrentFrame();
  if (amount < 0.01) return null;
  const [x, y] = pose.sh;
  const wind = Math.sin(frame / (angle ? 3 : 7)) * 16;
  const len = 330 * amount;
  return (
    <path
      transform={`rotate(${angle} ${x} ${y})`}
      d={`M${x + 16} ${y - 14} L${x - 22} ${y - 14} Q${x - 120} ${y + len * 0.4} ${x - 150 + wind} ${y + len} Q${x - 80 + wind} ${y + len + 22} ${x - 30 + wind * 0.6} ${y + len - 6} Q${x - 30} ${y + len * 0.5} ${x + 16} ${y - 14}Z`}
      fill={CAPE}
    />
  );
};

const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice-superpowers.mp3")} />
    <Audio
      src={staticFile("sfx/bgm-superpowers.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    {spread(T.where, T.before, 2).map((from, i) => (
      <Sfx key={from} name={`key${i}`} from={from} volume={0.4} />
    ))}
    <Sfx name="womp" from={T.sentence + 8} volume={0.3} />
    <Sfx name="pop" from={T.oneDev} volume={0.45} />
    <Sfx name="whoosh" from={T.typed - 4} volume={0.28} />
    {spread(T.cmd, T.cmdEnd, 4).map((from, i) => (
      <Sfx key={from} name={`key${(i + 1) % 4}`} from={from} volume={0.44} />
    ))}
    <Sfx name="check" from={T.cmdEnd + 6} />
    <Sfx name="sweep" from={T.powers - 28} volume={0.3} />
    <Sfx name="impact" from={T.powers} volume={0.55} />
    <Sfx name="sparkle" from={T.powers + 8} volume={0.36} />
    <Sfx name="pop" from={T.asks} volume={0.4} />
    <Sfx name="check" from={T.beforeCode} volume={0.45} />
    <Sfx name="paper" from={T.power2} volume={0.4} />
    <Sfx name="click" from={T.minutes} volume={0.5} />
    <Sfx name="error" from={T.red} volume={0.24} />
    <Sfx name="ding" from={T.green} volume={0.44} />
    <Sfx name="thud0" from={T.written + 7} volume={0.5} />
    <Sfx name="impact" from={T.deleted} volume={0.5} />
    <Sfx name="stamp" from={T.deleted + 6} volume={0.45} />
    <Sfx name="stamp" from={T.review + 16} volume={0.4} />
    <Sfx name="whoosh" from={T.title - 4} volume={0.34} />
    <Sfx name="chime" from={T.terminal + 4} volume={0.42} />
  </>
);

const PUNCHES = CUTS.map(([from]) => from);
const SHAKES = [T.powers, T.deleted];

export const SuperpowersVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const pose = animatePose(frame);
  const jump = HOPS.map(([start, len, height]) => hop(frame, start, len, height));
  const dy =
    jump.reduce((sum, j) => sum + j.dy, 0) + (place.ty ?? 0) + (scene === "sky" ? Math.sin(frame / 7) * 16 : 0);
  const sy = jump.reduce((product, j) => product * j.sy, 1);
  const powers = enter(frame - T.powers, BOUNCY);
  const size = place.size ?? 1;
  const alarm = frame >= T.green ? (frame < T.green + 24 ? GREEN : null) : frame >= T.red ? RED : null;
  // Cinema bars slide in at the start, for the trailer look.
  const bars = Math.min(enter(frame, { damping: 20, stiffness: 120 }), 1) * 96;

  return (
    <AbsoluteFill style={{ backgroundColor: SKY }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "room" ? (
            <>
              <Room />
              <RoomScreen />
              {frame < T.terminal ? <Flood /> : null}
            </>
          ) : null}
          {scene === "pov" ? <Pov /> : null}
          {scene === "roof" ? (
            <>
              <Rooftop signal={powers} cape={powers} />
              {frame < T.powers ? (
                <text x={670} y={1062} textAnchor="middle" fontSize={44} fill={CREAM} {...text}>
                  {`LOADING${".".repeat(1 + (Math.floor(frame / 6) % 3))}`}
                </text>
              ) : (
                <>
                  <Bolt x={670} y={1013} s={4.4} />
                  <text x={670} y={1151} textAnchor="middle" fontSize={40} fill={GREEN} {...text}>
                    POWERS ON
                  </text>
                </>
              )}
              <Burst />
            </>
          ) : null}
          {scene === "hq" ? (
            <>
              <Hq />
              <Bot x={90} y={1190} />
              <Bubbles />
            </>
          ) : null}
          {scene === "plan" ? (
            <>
              <Blueprint />
              <Frame x={184} y={690} size={1.05} edge="#e8f1ff">
                <Tasks />
              </Frame>
            </>
          ) : null}
          {scene === "lab" ? (
            <>
              <Lab alarm={alarm} />
              <Frame>
                <Tdd />
              </Frame>
              <Crate />
            </>
          ) : null}
          {scene === "review" ? (
            <>
              <Hq />
              <Frame x={30}>
                <Review />
              </Frame>
            </>
          ) : null}
          {scene === "finale" ? <Rooftop signal={1} cape={0} desk={false} /> : null}
          {scene === "sky" ? (
            <>
              <Sky />
              <Squad />
            </>
          ) : null}
          {scene === "pov" ? null : (
            <g
              transform={`translate(${place.tx} ${dy}) translate(190 1650) scale(${(place.flip ? -1 : 1) * size * (2 - sy)} ${size * sy}) translate(-190 -1650)`}
            >
              <Cape pose={pose} amount={frame < T.powers ? 0 : Math.min(powers, 1.1)} angle={scene === "sky" ? 78 : 0} />
              <Stickman pose={pose} thumb={0} headFill={place.wall} bendy />
            </g>
          )}
          {/* White flash when the powers arrive. */}
          <rect
            x={-40}
            y={-40}
            width={1160}
            height={2000}
            fill={CREAM}
            opacity={frame < T.powers ? 0 : interpolate(frame, [T.powers, T.powers + 8], [0.9, 0], CLAMP)}
          />
        </g>
        <rect x={0} y={bars - 96} width={1080} height={96} fill="#05060d" />
        <rect x={0} y={1920 - bars} width={1080} height={96} fill="#05060d" />
      </svg>

      <Caption
        plain
        from={0}
        to={T.oneDev - 2}
        lines={[
          { text: "IN A WORLD...", at: 2, size: 100 },
          { text: "WHERE AI WRITES CODE", at: T.where, size: 72 },
          { text: "BEFORE YOU FINISH", at: T.before, size: 84 },
          { text: "YOUR SENTENCE", at: T.sentence, size: 100, boxes: { YOUR: RED, SENTENCE: RED } },
        ]}
      />
      <Caption
        plain
        from={T.oneDev - 4}
        to={T.cmd - 2}
        lines={[
          { text: "ONE DEVELOPER...", at: T.oneDev - 4, size: 96 },
          { text: "TYPED ONE COMMAND", at: T.typed, size: 84, boxes: { COMMAND: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.cmd - 4}
        to={T.now - 2}
        lines={[
          { text: "IN CLAUDE CODE", at: T.cmd - 4, size: 84 },
          { text: "RUN THIS", at: T.cmd + 6, size: 110, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.now - 4}
        to={T.power1 - 2}
        lines={[
          { text: "NOW HIS AI", at: T.now - 4, size: 96 },
          { text: "HAS POWERS", at: T.powers - 2, size: 122, boxes: { HAS: AMBER, POWERS: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.power1 - 4}
        to={T.power2 - 2}
        lines={[
          { text: "THE POWER...", at: T.power1 - 4, size: 92, color: AMBER },
          { text: "TO ASK WHAT YOU", at: T.asks, size: 88 },
          { text: "ACTUALLY WANT", at: T.asks + 20, size: 100, boxes: { ACTUALLY: GREEN, WANT: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.power2 - 4}
        to={T.power3 - 2}
        lines={[
          { text: "THE POWER...", at: T.power2 - 4, size: 92, color: AMBER },
          { text: "TO WRITE A PLAN", at: T.plan, size: 92, boxes: { PLAN: AMBER } },
          { text: "TINY TASKS", at: T.tiny, size: 92 },
          { text: "2 TO 5 MINUTES EACH", at: T.minutes, size: 72, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.power3 - 4}
        to={T.written - 2}
        lines={[
          { text: "THE POWER...", at: T.power3 - 4, size: 92, color: AMBER },
          { text: "TO TEST FIRST", at: T.test, size: 104 },
          { text: "RED THEN GREEN", at: T.red, ats: [T.red, T.green, T.green + 7], size: 92, boxes: { RED, GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.written - 4}
        to={T.every - 2}
        lines={[
          { text: "CODE WITH NO TEST...", at: T.written - 4, size: 76 },
          { text: "GETS DELETED", at: T.deleted - 2, size: 116, boxes: { GETS: RED, DELETED: RED } },
        ]}
      />
      <Caption
        plain
        from={T.every - 4}
        to={T.by - 2}
        lines={[
          { text: "AND EVERY TASK...", at: T.every - 4, size: 84 },
          { text: "GETS A", at: T.review, size: 80 },
          { text: "CODE REVIEW", at: T.review + 8, size: 124, boxes: { CODE: GREEN, REVIEW: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.by - 4}
        to={T.title - 2}
        lines={[
          { text: "A PLUGIN BY", at: T.by - 4, size: 80 },
          { text: "JESSE VINCENT", at: T.jesse, size: 108, color: AMBER },
          { text: "LINK IN THE CAPTION", at: T.link, size: 70 },
        ]}
      />
      <Caption
        plain
        from={T.title - 4}
        to={T.terminal - 2}
        lines={[
          { text: "SUPERPOWERS", at: T.title - 4, size: 112, boxes: { SUPERPOWERS: AMBER } },
          { text: "COMING SOON...", at: T.soon, size: 100 },
        ]}
      />
      <Caption
        plain
        from={T.terminal - 4}
        to={END + 1}
        lines={[
          { text: "TO YOUR TERMINAL", at: T.terminal - 4, size: 90, color: GREEN },
          { text: "FOLLOW STICKMAN SHIPS", at: T.terminal + 22, size: 66, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
        ]}
      />
    </AbsoluteFill>
  );
};

export const SuperpowersComposition = () => (
  <Composition
    id="SuperpowersTutorial"
    component={SuperpowersVideo}
    durationInFrames={END}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
