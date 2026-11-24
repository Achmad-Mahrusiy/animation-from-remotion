import {
  AbsoluteFill,
  Audio,
  Composition,
  Freeze,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import {
  AD,
  AdSet,
  BaySet,
  CORK,
  CURTAIN,
  CorkSet,
  Curtains,
  DARK,
  DarkSet,
  SLATE,
  STAGE,
  STUDIO,
  SlateSet,
  StageSet,
  StudioSet,
  TheaterSet,
} from "./Sets";

// A TV ad parody that turns into an honest test: "Tired of your AI building THIS?!"
const END = Math.round(56.5 * FPS);
// shortcut: phrase starts are measured from the pauses in voice-uiux.mp3 (the 23_17_57 take); building, k150, work, system, n192, not, ships and computer fall inside a phrase and are estimates. Re-measure if the voice file changes.
const at = (voiceSecond: number) => Math.round(voiceSecond * FPS);

const T = {
  building: at(0.95),
  this: at(1.6),
  purple: at(2.33),
  rocket: at(3.61),
  unlock: at(4.8),
  intro: at(6.5),
  uiux: at(7.51),
  pro: at(8.71),
  skill: at(9.74),
  k150: at(10.6),
  stars: at(11.92),
  but: at(13.75),
  work: at(14.45),
  tested: at(15.62),
  claude: at(16.62),
  add: at(17.66),
  install: at(18.72),
  two: at(19.86),
  caption: at(20.56),
  same: at(21.5),
  build: at(22.83),
  time: at(24.61),
  before: at(25.29),
  made: at(26.62),
  system: at(27.3),
  layout: at(28.35),
  style: at(29.18),
  colors: at(30.06),
  n192: at(30.8),
  font: at(32.43),
  plus: at(33.39),
  not: at(34.3),
  like: at(35.41),
  noAi: at(35.79),
  purple2: at(36.58),
  check: at(37.72),
  ships: at(38.75),
  contrast: at(39.58),
  keyboard: at(40.39),
  phone: at(41.47),
  result: at(42.49),
  okay: at(43.64),
  real: at(44.54),
  catch: at(46.07),
  python: at(46.94),
  computer: at(47.75),
  name: at(48.78),
  by: at(50.94),
  follow: at(52.53),
  test: at(53.78),
  so: at(54.62),
};

const text = { fontFamily, fontWeight: 900 } as const;
const mono = { fontFamily, fontWeight: 700 } as const;
const SERIF = "Georgia, serif";
const BOUNCY = { damping: 11, stiffness: 190 };
const INK = "#11181c";
const PAPER = "#fbf6ea";
// The example the skill's README gives for a spa: its five colors, in its order.
const SPA = ["#E8B4B8", "#A8D5BA", "#D4AF37", "#FFF5F5", "#2D3436"];

const typed = (s: string, frame: number, a: number, b: number) =>
  s.slice(0, Math.round(interpolate(frame, [a, b], [0, s.length], CLAMP)));
const spread = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => Math.round(a + (i * (b - a)) / n));
const star = (points: number, outer: number, inner: number) =>
  Array.from({ length: points * 2 }, (_, i) => {
    const a = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");

// Shown in their real case, because viewers copy them.
const COMMANDS = [
  ["/plugin marketplace add", "nextlevelbuilder/", "ui-ux-pro-max-skill"],
  ["/plugin install", "ui-ux-pro-max@", "ui-ux-pro-max-skill"],
];
const PROMPT = "build a landing page for my spa";
const SYSTEM = [
  { label: "LAYOUT PATTERN", value: "Hero-Centric + Social Proof" },
  { label: "STYLE", value: "Soft UI Evolution" },
  { label: "COLORS", value: "Soft Pink · Sage Green · Gold" },
  { label: "TYPOGRAPHY", value: "Cormorant Garamond / Montserrat" },
];
const AVOID = ["BRIGHT NEON COLORS", "HARSH ANIMATIONS", "AI PURPLE GRADIENTS"];
const CHECKS = [
  { label: "CONTRAST", note: "4.5 : 1 OR MORE", at: T.contrast },
  { label: "KEYBOARD FOCUS", note: "A FOCUS RING YOU CAN SEE", at: T.keyboard },
  { label: "SCREEN SIZES", note: "375 · 768 · 1024 · 1440", at: T.phone },
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
const POINT = stand({ head: [215, 1040], sh: [200, 1130], eR: [290, 1150], hR: [350, 1105], smile: 0.8 });
const POINT_UP = stand({ eR: [255, 1060], hR: [275, 925], smile: 0.8 });
const THINK = stand({ head: [205, 1044], eR: [285, 1200], hR: [268, 1122], eL: [150, 1240], hL: [230, 1260], smile: 0.2 });
const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [300, 1090], hR: [330, 1000], smile: 1.6 });
const SHRUG = stand({ look: 0, eL: [90, 1210], hL: [30, 1150], eR: [290, 1210], hR: [350, 1150], smile: 0.6 });
const WINCE = stand({ head: [180, 1048], eR: [250, 1180], hR: [300, 1230], smile: -1 });
const BACK_OFF = stand({ head: [175, 1044], eL: [110, 1180], hL: [150, 1100], eR: [262, 1180], hR: [300, 1100], smile: -0.6 });
const FACEPALM = stand({ look: 0, head: [200, 1050], eR: [285, 1150], hR: [228, 1040], smile: -1 });
const HERO = stand({ look: 0, eL: [105, 1250], hL: [165, 1345], eR: [275, 1250], hR: [215, 1345], smile: 1.2 });
const WAG = stand({ look: 0, eR: [270, 1150], hR: [290, 1040], smile: -0.3 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], smile: 1.2 });
const THUMBS = stand({ look: 0, eL: [100, 1120], hL: [80, 1000], smile: 1.4 });
const SHOCK = stand({ head: [185, 1034], eL: [95, 1090], hL: [118, 980], eR: [285, 1090], hR: [262, 980], smile: -0.2 });
// The desk keyboard sits at x 262 to 394.
const TYPE = stand({ head: [205, 1046], eL: [150, 1250], hL: [290, 1296], eR: [262, 1240], hR: [356, 1296], smile: 0.4 });
const STAMP_UP = stand({ eR: [270, 1090], hR: [300, 960], smile: 0.6 });
const STAMP_DOWN = stand({ head: [215, 1046], sh: [202, 1132], eR: [285, 1170], hR: [345, 1215], smile: 1 });

// One background per beat, so no two neighbours share a set or a camera position.
type Scene =
  | "ad"
  | "stage"
  | "doubt"
  | "pov"
  | "desk"
  | "board"
  | "cards"
  | "donts"
  | "bay"
  | "theater"
  | "catch"
  | "outro";
const CUTS: [number, Scene][] = [
  [0, "ad"],
  [T.intro - 2, "stage"],
  [T.but - 2, "doubt"],
  [T.claude - 2, "pov"],
  [T.same - 2, "desk"],
  [T.time - 2, "board"],
  [T.layout - 3, "cards"],
  [T.plus - 2, "donts"],
  [T.check - 2, "bay"],
  [T.result - 2, "theater"],
  [T.catch - 2, "catch"],
  [T.name - 2, "outro"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "ad");

// Where the stickman stands in each scene: shift from x=190, mirrored, and size. wall is the color behind his head; under a lamp that is the lit wall.
const PLACE: Record<Scene, { tx: number; flip?: boolean; size?: number; wall: string }> = {
  ad: { tx: 0, wall: AD },
  stage: { tx: 700, flip: true, wall: STAGE },
  doubt: { tx: 350, wall: "#1c2326" },
  pov: { tx: 0, wall: DARK },
  desk: { tx: 0, wall: STUDIO },
  board: { tx: 700, flip: true, wall: CORK },
  cards: { tx: 740, flip: true, size: 0.5, wall: CORK },
  donts: { tx: 0, wall: SLATE },
  bay: { tx: 700, flip: true, wall: "#204736" },
  theater: { tx: 0, wall: CURTAIN },
  catch: { tx: 700, flip: true, wall: "#1c2326" },
  outro: { tx: 0, wall: AD },
};

const MOPE = { ...SHRUG, smile: -0.7 };
const POSES = [
  { at: 0, pose: MOPE },
  { at: T.this - 3, pose: { ...POINT, smile: -0.8 } },
  { at: T.purple, pose: WINCE },
  { at: T.rocket, pose: BACK_OFF },
  { at: T.unlock, pose: FACEPALM },
  { at: T.intro - 2, pose: { ...SHRUG, smile: 1.2 } },
  { at: T.uiux - 3, pose: CHEER },
  { at: T.skill - 2, pose: { ...POINT, smile: 1.1 } },
  { at: T.stars, pose: CHEER },
  { at: T.but - 2, pose: { ...THINK, look: 0, smile: -0.3 } },
  { at: T.tested - 2, pose: HERO },
  { at: T.same - 2, pose: TYPE },
  { at: T.time - 2, pose: { ...BACK_OFF, smile: 0.3 } },
  { at: T.made - 2, pose: { ...POINT_UP, smile: 1 } },
  { at: T.style, pose: { ...POINT, smile: 1 } },
  { at: T.colors, pose: POINT_UP },
  { at: T.font, pose: CHEER },
  { at: T.plus - 2, pose: POINT },
  { at: T.not, pose: WAG },
  { at: T.like, pose: STAMP_UP },
  { at: T.purple2 - 3, pose: STAMP_DOWN },
  { at: T.purple2 + 14, pose: HERO },
  { at: T.check - 2, pose: POINT },
  { at: T.result - 2, pose: { ...THINK, smile: 0 } },
  { at: T.okay, pose: SHOCK },
  { at: T.real, pose: CHEER },
  { at: T.catch - 2, pose: { ...SHRUG, smile: 0.2 } },
  { at: T.python, pose: { ...POINT_UP, look: 0 } },
  { at: T.name - 2, pose: CHEER },
  { at: T.by, pose: { ...POINT, smile: 1 } },
  { at: T.follow - 2, pose: WAVE },
  { at: T.test, pose: THUMBS },
  // Back to the first pose, so the video loops.
  { at: END - 12, pose: MOPE },
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

  if (within(T.but + 8, T.tested - 4)) {
    p.hR = [p.hR[0] + Math.sin(frame / 1.8) * 10, p.hR[1]];
  }
  if (within(T.build, T.time - 10)) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 18];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 18];
  }
  if (within(T.not + 6, T.like - 2)) {
    p.hR = [p.hR[0] + Math.sin(frame / 2.2) * 26, p.hR[1]];
  }
  // He jabs at the clipboard on each tick.
  for (const check of CHECKS) {
    if (within(check.at - 4, check.at + 6)) {
      p.hR = [p.hR[0] + (5 - Math.abs(frame - check.at - 1)) * 7, p.hR[1]];
    }
  }
  if (within(T.follow + 6, T.test - 2)) {
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
  [T.this, 12, 60],
  [T.uiux, 15, 110],
  [T.real, 14, 100],
  [T.name, 14, 90],
];

const Tick: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = GREEN }) => (
  <path
    d={`M${x} ${y} l16 20 l34 -44`}
    fill="none"
    stroke={color}
    strokeWidth={12}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

const Burst: React.FC<{ from: number; x: number; y: number; r: number; color?: string }> = ({
  from,
  x,
  y,
  r,
  color = AMBER,
}) => {
  const t = useCurrentFrame() - from;
  if (t < 0 || t > 9) return null;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const d = r + t * 20;
        return (
          <path
            key={i}
            d={`M${x + Math.cos(a) * d} ${y + Math.sin(a) * d} l${Math.cos(a) * 60} ${Math.sin(a) * 60}`}
            stroke={color}
            strokeWidth={13}
            strokeLinecap="round"
            opacity={1 - t / 9}
          />
        );
      })}
    </g>
  );
};

// A monitor on a stand. Its screen is drawn at 640 by 480 and clipped; x, y is the screen's top left corner.
const Monitor: React.FC<{ x?: number; y?: number; children: React.ReactNode }> = ({ x = 370, y = 770, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={290} y={494} width={60} height={50} fill="#0b0d12" />
    <rect x={220} y={536} width={200} height={16} rx={8} fill="#0b0d12" />
    <rect x={-16} y={-16} width={672} height={512} rx={26} fill="#0b0d12" />
    <svg width={640} height={480} viewBox="0 0 640 480">
      {children}
    </svg>
  </g>
);

// What the AI builds on its own: purple gradient, rocket, "unlock the power", three cards.
const SlopPage: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="slop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6a2cf5" />
        <stop offset="1" stopColor="#f0149c" />
      </linearGradient>
    </defs>
    <rect width={640} height={480} fill="url(#slop)" />
    <circle cx={36} cy={34} r={12} fill="#fff" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={430 + i * 64} y={28} width={46} height={12} rx={6} fill="#fff" opacity={0.7} />
    ))}
    <g transform="translate(320 116) rotate(45) scale(1.4)">
      <path d="M0 -44 C24 -22 24 18 14 34 H-14 C-24 18 -24 -22 0 -44Z" fill="#fff" />
      <circle cy={-10} r={9} fill="#6a2cf5" />
      <path d="M-15 14 L-34 40 L-14 34Z M15 14 L34 40 L14 34Z" fill="#ff5a79" />
      <path d="M-9 36 Q0 68 9 36Z" fill={AMBER} />
    </g>
    <text x={320} y={244} textAnchor="middle" fontSize={54} fill="#fff" {...text}>
      UNLOCK THE POWER
    </text>
    <rect x={190} y={266} width={260} height={12} rx={6} fill="#fff" opacity={0.6} />
    <rect x={220} y={298} width={200} height={52} rx={26} fill="#fff" />
    <text x={320} y={333} textAnchor="middle" fontSize={24} fill="#6a2cf5" {...text}>
      GET STARTED
    </text>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${28 + i * 200} 376)`}>
        <rect width={184} height={84} rx={16} fill="#fff" opacity={0.2} />
        <circle cx={38} cy={42} r={22} fill={AMBER} />
        <circle cx={30} cy={36} r={3.5} fill={INK} />
        <circle cx={46} cy={36} r={3.5} fill={INK} />
        <path d="M28 46 Q38 58 48 46" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <rect x={72} y={28} width={96} height={10} rx={5} fill="#fff" opacity={0.8} />
        <rect x={72} y={50} width={70} height={10} rx={5} fill="#fff" opacity={0.5} />
      </g>
    ))}
  </g>
);

// The same prompt with the skill: the README's spa example, drawn as a page.
const SpaPage: React.FC = () => (
  <g>
    <rect width={640} height={480} fill={SPA[3]} />
    <text x={28} y={47} fontSize={28} fill={SPA[4]} fontFamily={SERIF} fontStyle="italic">
      Serenity Spa
    </text>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={300 + i * 62} y={33} width={44} height={8} rx={4} fill={SPA[4]} opacity={0.35} />
    ))}
    <rect x={510} y={18} width={104} height={40} rx={20} fill={SPA[2]} />
    <text x={562} y={45} textAnchor="middle" fontSize={20} fill={SPA[4]} fontFamily={SERIF}>
      Book
    </text>
    <text x={28} y={152} fontSize={60} fill={SPA[4]} fontFamily={SERIF}>
      Rest,
    </text>
    <text x={28} y={214} fontSize={60} fill={SPA[4]} fontFamily={SERIF}>
      restored.
    </text>
    <rect x={28} y={240} width={250} height={9} rx={4.5} fill={SPA[4]} opacity={0.3} />
    <rect x={28} y={260} width={200} height={9} rx={4.5} fill={SPA[4]} opacity={0.3} />
    <rect x={28} y={292} width={180} height={50} rx={25} fill={SPA[2]} />
    <text x={118} y={325} textAnchor="middle" fontSize={22} fill={SPA[4]} fontFamily={SERIF}>
      Book a visit
    </text>
    <rect x={360} y={84} width={252} height={262} rx={44} fill={SPA[0]} />
    <circle cx={486} cy={215} r={78} fill={SPA[1]} />
    <path d="M486 272 C438 232 448 168 486 148 C524 168 534 232 486 272Z" fill={SPA[3]} opacity={0.9} />
    <path d="M486 270 V172" stroke={SPA[1]} strokeWidth={5} strokeLinecap="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <polygon key={i} transform={`translate(${40 + i * 28} 374)`} points={star(5, 12, 5)} fill={SPA[2]} />
    ))}
    <rect x={186} y={369} width={150} height={9} rx={4.5} fill={SPA[4]} opacity={0.3} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${28 + i * 200} 398)`}>
        <rect x={4} y={6} width={184} height={66} rx={18} fill={SPA[0]} opacity={0.45} />
        <rect width={184} height={66} rx={18} fill="#fff" />
        <circle cx={34} cy={33} r={16} fill={SPA[1]} />
        <rect x={62} y={22} width={96} height={8} rx={4} fill={SPA[4]} opacity={0.6} />
        <rect x={62} y={38} width={70} height={8} rx={4} fill={SPA[4]} opacity={0.3} />
      </g>
    ))}
  </g>
);

// Red rings drawn around each cliché as the voice names it.
const Rings: React.FC = () => {
  const frame = useCurrentFrame();
  const drawn = (from: number) => ({
    fill: "none",
    stroke: RED,
    strokeWidth: 12,
    strokeLinecap: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: interpolate(frame, [from, from + 8], [1, 0], CLAMP),
    opacity: frame < from ? 0 : 1,
  });
  return (
    <g>
      <rect x={10} y={10} width={620} height={460} rx={14} {...drawn(T.purple)} />
      <ellipse cx={320} cy={116} rx={84} ry={78} {...drawn(T.rocket)} />
      <ellipse cx={320} cy={226} rx={304} ry={50} {...drawn(T.unlock)} />
    </g>
  );
};

const Ad: React.FC = () => {
  const frame = useCurrentFrame();
  // The last frames flip back to the purple page, so the loop lands on "THIS".
  const slop = frame < T.intro || frame >= END - 10;
  return (
    <>
      <AdSet />
      <Monitor>
        {slop ? (
          <>
            <SlopPage />
            {frame < T.intro ? <Rings /> : null}
          </>
        ) : (
          <SpaPage />
        )}
      </Monitor>
      <Burst from={T.this} x={690} y={1010} r={430} color={RED} />
      <Burst from={T.name} x={690} y={1010} r={430} />
    </>
  );
};

// The product, as a boxed pack that drops onto the podium.
const Product: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = enter(frame - T.uiux + 3, { damping: 11, stiffness: 150 });
  const badge = enter(frame - T.k150, BOUNCY);
  return (
    <g>
      <g transform={`translate(110 ${1010 - (1 - drop) * 1900})`}>
        <path d="M400 0 L450 -34 V526 L400 560Z" fill="#c9bfa9" />
        <path d="M0 0 L50 -34 H450 L400 0Z" fill="#fffaf0" />
        <rect width={400} height={560} fill={CREAM} />
        <rect width={400} height={84} fill={AMBER} />
        <text x={200} y={56} textAnchor="middle" fontSize={34} fill={INK} {...text}>
          DESIGN SKILL
        </text>
        <text x={200} y={250} textAnchor="middle" fontSize={112} fill={INK} {...text}>
          UI UX
        </text>
        <text x={200} y={350} textAnchor="middle" fontSize={78} fill={INK} {...text}>
          PRO MAX
        </text>
        <rect x={40} y={386} width={320} height={6} rx={3} fill={INK} opacity={0.2} />
        {SPA.map((color, i) => (
          <circle key={color} cx={84 + i * 58} cy={448} r={24} fill={color} stroke={INK} strokeWidth={3} />
        ))}
        <text x={200} y={524} textAnchor="middle" fontSize={24} fill="#6b6252" {...text}>
          FOR AI CODING AGENTS
        </text>
      </g>
      <g transform={`translate(540 880) scale(${badge})`}>
        <polygon points={star(16, 158, 128)} fill={AMBER} transform={`rotate(${frame * 0.6})`} />
        <polygon points={star(5, 24, 10)} fill={INK} transform="translate(0 -72)" />
        <text y={18} textAnchor="middle" fontSize={84} fill={INK} {...text}>
          150K
        </text>
        <text y={56} textAnchor="middle" fontSize={24} fill={INK} {...text}>
          GITHUB STARS
        </text>
      </g>
      <Burst from={T.uiux + 3} x={310} y={1290} r={340} />
    </g>
  );
};

// The stickman's own eyes: the terminal up close, the keyboard and both arms.
const Pov: React.FC = () => {
  const frame = useCurrentFrame();
  const spans = [
    [T.add, T.install - 4],
    [T.install, T.two - 6],
  ];
  const typing = spans.some(([a, b]) => frame >= a && frame < b);
  const left = typing ? Math.abs(Math.sin(frame / 1.5)) * 30 : 0;
  const right = typing ? Math.abs(Math.cos(frame / 1.5)) * 30 : 0;
  const key = typing ? Math.floor(frame / 2) % 40 : -1;
  const arm = { stroke: CREAM, strokeWidth: 50, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      <rect x={-40} y={-40} width={1160} height={2000} fill="#0a0d14" />
      <ellipse cx={540} cy={1070} rx={720} ry={600} fill="#2a6a6a" opacity={0.18} />
      <rect x={50} y={690} width={980} height={770} rx={30} fill="#2b3140" />
      <rect x={66} y={706} width={948} height={738} rx={18} fill="#10131c" />
      {[RED, AMBER, GREEN].map((color, i) => (
        <circle key={color} cx={104 + i * 34} cy={750} r={10} fill={color} />
      ))}
      <text x={230} y={762} fontSize={32} fill={AMBER} {...mono}>
        CLAUDE CODE
      </text>
      {COMMANDS.map((lines, c) => {
        const [from, to] = spans[c];
        if (frame < from - 6) return null;
        const count = Math.round(interpolate(frame, [from, to], [0, lines.join("").length], CLAMP));
        let before = 0;
        return (
          <g key={lines[0]}>
            {lines.map((line, i) => {
              const shown = line.slice(0, Math.max(0, count - before));
              // The cursor sits on the line being typed.
              const active = frame < to && count >= before && count < before + line.length;
              before += line.length;
              return (
                <text key={line} x={i ? 152 : 100} y={868 + c * 290 + i * 78} fontSize={48} fill={CREAM} {...mono}>
                  {(i ? "" : "> ") + shown + (active && frame % 20 < 12 ? "_" : "")}
                </text>
              );
            })}
            {frame >= to ? <Tick x={900} y={838 + c * 290} /> : null}
          </g>
        );
      })}
      <rect x={90} y={1510} width={900} height={290} rx={26} fill="#2b3140" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={120 + (i % 10) * 85}
          y={1536 + Math.floor(i / 10) * 62}
          width={70}
          height={48}
          rx={9}
          fill={i === key ? AMBER : "#465066"}
        />
      ))}
      <path d={`M210 1960 Q280 1790 400 ${1650 - left}`} {...arm} />
      <path d={`M870 1960 Q800 1790 680 ${1650 - right}`} {...arm} />
    </g>
  );
};

// The chat on the desk monitor: last time's result above, the same prompt typed again below.
const Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const cursor = frame % 20 < 12 ? "_" : "";
  return (
    <g>
      <rect width={640} height={480} fill="#10131c" />
      <text x={24} y={42} fontSize={20} fill="#8b93a7" {...mono}>
        LAST TIME
      </text>
      <rect x={24} y={56} width={420} height={46} rx={23} fill="#232838" />
      <text x={46} y={87} fontSize={22} fill={CREAM} {...mono}>
        {PROMPT}
      </text>
      <g transform="translate(24 118) scale(0.3)">
        <SlopPage />
      </g>
      <path d="M40 132 L200 248 M200 132 L40 248" stroke={RED} strokeWidth={12} strokeLinecap="round" />
      <text x={244} y={178} fontSize={40} fill={RED} {...text}>
        BEFORE
      </text>
      <text x={244} y={220} fontSize={22} fill="#8b93a7" {...mono}>
        NO SKILL INSTALLED
      </text>
      <rect x={24} y={290} width={592} height={3} fill="#232838" />
      <text x={24} y={332} fontSize={20} fill={AMBER} {...mono}>
        NOW, WITH THE SKILL
      </text>
      <rect x={24} y={350} width={592} height={86} rx={16} fill="#181c28" stroke={AMBER} strokeWidth={3} />
      <text x={48} y={404} fontSize={28} fill={CREAM} {...mono}>
        {`> ${typed(PROMPT, frame, T.build, T.time - 12)}${cursor}`}
      </text>
    </g>
  );
};

// The design system the skill writes before any code, drawn at 960 by 600. cues are the frames each row appears.
const Sheet: React.FC<{ cues: number[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const chip = Math.min(enter(frame - T.n192, BOUNCY), 1);
  const visuals = [
    <g key="layout">
      <rect width={156} height={100} rx={10} fill="none" stroke={INK} strokeWidth={5} />
      <rect x={12} y={12} width={132} height={40} rx={6} fill={SPA[0]} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={12 + i * 46} y={62} width={40} height={26} rx={5} fill={INK} opacity={0.25} />
      ))}
    </g>,
    <g key="style">
      <rect x={8} y={30} width={230} height={62} rx={31} fill={SPA[0]} opacity={0.6} />
      <rect y={20} width={230} height={62} rx={31} fill="#fff" />
      <circle cx={34} cy={51} r={16} fill={SPA[1]} />
      <rect x={62} y={45} width={130} height={12} rx={6} fill={INK} opacity={0.3} />
    </g>,
    <g key="colors">
      {SPA.map((color, i) => (
        <circle key={color} cx={30 + i * 52} cy={52} r={28} fill={color} stroke={INK} strokeWidth={3} />
      ))}
    </g>,
    <g key="type">
      <text x={4} y={84} fontSize={84} fill={INK} fontFamily={SERIF}>
        Aa
      </text>
      <text x={136} y={84} fontSize={72} fill={INK} {...mono}>
        Aa
      </text>
    </g>,
  ];
  return (
    <g>
      <rect width={960} height={600} rx={20} fill={PAPER} />
      <text x={36} y={56} fontSize={40} fill={INK} {...text}>
        DESIGN SYSTEM
      </text>
      <text x={924} y={56} textAnchor="end" fontSize={36} fill="#9a5f66" fontFamily={SERIF} fontStyle="italic">
        Serenity Spa
      </text>
      <rect x={36} y={76} width={888} height={4} fill={INK} opacity={0.15} />
      {SYSTEM.map((row, i) => {
        const y = 86 + i * 128;
        if (frame < cues[i]) {
          return (
            <g key={row.label} opacity={0.14}>
              <rect x={36} y={y + 20} width={160} height={18} rx={9} fill={INK} />
              <rect x={36} y={y + 62} width={420} height={26} rx={13} fill={INK} />
              <rect x={670} y={y + 14} width={230} height={92} rx={14} fill={INK} />
            </g>
          );
        }
        const s = enter(frame - cues[i], BOUNCY);
        return (
          <g key={row.label} opacity={Math.min(s, 1)} transform={`translate(${(1 - s) * 80} 0)`}>
            <text x={36} y={y + 40} fontSize={24} fill="#9a8f7a" {...text}>
              {row.label}
            </text>
            <text x={36} y={y + 90} fontSize={32} fill={INK} {...mono}>
              {row.value}
            </text>
            <g transform={`translate(660 ${y + 10})`}>{visuals[i]}</g>
            {i === 2 ? (
              <g opacity={chip} transform={`translate(172 ${y + 12}) scale(${0.7 + 0.3 * chip})`}>
                <rect width={270} height={38} rx={19} fill={AMBER} />
                <text x={135} y={27} textAnchor="middle" fontSize={22} fill={INK} {...text}>
                  FROM 192 PALETTES
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

// "Before any code": the code window waits, then the design system drops onto the board.
const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const wait = Math.min(enter(frame - T.before, BOUNCY), 1);
  const sheet = enter(frame - T.made, { damping: 12, stiffness: 150 });
  const gone = interpolate(frame, [T.made - 2, T.made + 8], [0, 1], CLAMP);
  return (
    <g>
      <CorkSet />
      <g opacity={1 - gone} transform={`translate(0 ${gone * 500}) rotate(${gone * 14} 350 990)`}>
        <rect x={120} y={830} width={460} height={320} rx={22} fill="#10131c" stroke="#2b3140" strokeWidth={8} />
        {[RED, AMBER, GREEN].map((color, i) => (
          <circle key={color} cx={158 + i * 30} cy={868} r={9} fill={color} />
        ))}
        <text x={350} y={1010} textAnchor="middle" fontSize={96} fill="#465066" {...text}>
          {"</>"}
        </text>
        <text x={350} y={1100} textAnchor="middle" fontSize={40} fill={CREAM} {...text}>
          0 LINES OF CODE
        </text>
        <g opacity={wait} transform={`translate(520 840) scale(${0.6 + 0.4 * wait})`}>
          <circle r={64} fill={AMBER} />
          <rect x={-26} y={-30} width={18} height={60} rx={6} fill={INK} />
          <rect x={8} y={-30} width={18} height={60} rx={6} fill={INK} />
        </g>
      </g>
      {frame >= T.made ? (
        <g transform={`translate(50 ${800 - (1 - sheet) * 900}) scale(0.7)`}>
          <Sheet cues={[END, END, END, END]} />
          <circle cx={480} cy={8} r={22} fill={RED} />
        </g>
      ) : null}
    </g>
  );
};

// The skill's list of what not to do, drawn at 640 by 600.
const Avoid: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = frame - T.purple2;
  const stamp = enter(hit, BOUNCY);
  const chips = [
    <g key="neon">
      <rect width={110} height={100} rx={14} fill="#39ff14" />
      <rect y={34} width={110} height={32} fill="#ff00e5" />
    </g>,
    <g key="harsh">
      <rect width={110} height={100} rx={14} fill={INK} />
      <path d="M12 70 L32 26 L52 74 L72 26 L98 70" fill="none" stroke={AMBER} strokeWidth={9} strokeLinejoin="miter" />
    </g>,
    <g key="purple">
      <defs>
        <linearGradient id="slopChip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a2cf5" />
          <stop offset="1" stopColor="#f0149c" />
        </linearGradient>
      </defs>
      <rect width={110} height={100} rx={14} fill="url(#slopChip)" />
    </g>,
  ];
  return (
    <g>
      <rect width={640} height={600} rx={20} fill={PAPER} />
      <path d="M0 110 V20 a20 20 0 0 1 20 -20 H620 a20 20 0 0 1 20 20 V110Z" fill={RED} />
      <text x={32} y={80} fontSize={68} fill="#fff" {...text}>
        AVOID
      </text>
      <text x={608} y={72} textAnchor="end" fontSize={26} fill="#3a0f0a" {...text}>
        ANTI-PATTERNS
      </text>
      {AVOID.map((label, i) => {
        const y = 130 + i * 150;
        const s = enter(frame - T.plus - 6 - i * 8, BOUNCY);
        const lit = i === 2 && frame >= T.noAi;
        return (
          <g key={label} opacity={Math.min(s, 1)} transform={`translate(${(1 - s) * 90} 0)`}>
            {lit ? <rect x={10} y={y + 2} width={620} height={126} rx={16} fill={AMBER} opacity={0.35} /> : null}
            <g transform={`translate(24 ${y + 15})`}>{chips[i]}</g>
            <text x={156} y={y + 78} fontSize={34} fill={INK} {...text}>
              {label}
            </text>
          </g>
        );
      })}
      {hit >= 0 ? (
        <g opacity={Math.min(stamp, 1)} transform={`translate(330 495) rotate(-7) scale(${2 - Math.min(stamp, 1.15)})`}>
          <rect x={-170} y={-56} width={340} height={112} rx={16} fill={PAPER} opacity={0.82} />
          <rect x={-170} y={-56} width={340} height={112} rx={16} fill="none" stroke={RED} strokeWidth={11} />
          <text y={30} textAnchor="middle" fontSize={84} fill={RED} {...text}>
            NOPE
          </text>
        </g>
      ) : null}
    </g>
  );
};

// The rubber stamp he holds in the "do not" scene.
const Stamp: React.FC<{ hand: [number, number] }> = ({ hand }) => (
  <g transform={`translate(${hand[0]} ${hand[1]})`}>
    <rect x={-13} y={-78} width={26} height={66} rx={11} fill="#8f5a2e" />
    <rect x={-38} y={-16} width={76} height={34} rx={9} fill={RED} />
  </g>
);

// The checklist the skill runs before it ships, drawn at 600 by 690.
const Clipboard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect width={600} height={690} rx={26} fill="#b9824f" />
      <rect x={26} y={56} width={548} height={608} rx={10} fill={PAPER} />
      <rect x={210} y={-16} width={180} height={78} rx={16} fill="#8b93a7" />
      <circle cx={300} cy={14} r={14} fill="#465066" />
      <text x={300} y={130} textAnchor="middle" fontSize={30} fill={INK} {...text}>
        PRE-DELIVERY CHECKLIST
      </text>
      <rect x={60} y={152} width={480} height={4} fill={INK} opacity={0.15} />
      {CHECKS.map((check, i) => {
        const y = 176 + i * 158;
        const done = frame >= check.at;
        const pop = 1 + 0.25 * (1 - Math.min(enter(frame - check.at, BOUNCY), 1));
        return (
          <g key={check.label} opacity={done ? 1 : 0.4}>
            <rect x={56} y={y + 18} width={72} height={72} rx={12} fill="none" stroke={INK} strokeWidth={6} />
            {done ? (
              <g transform={`translate(92 ${y + 54}) scale(${pop}) translate(-92 ${-y - 54})`}>
                <Tick x={68} y={y + 56} color="#2e9e5b" />
              </g>
            ) : null}
            <text x={156} y={y + 58} fontSize={38} fill={INK} {...text}>
              {check.label}
            </text>
            <text x={156} y={y + 98} fontSize={24} fill="#7a705c" {...text}>
              {check.note}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const Confetti: React.FC = () => {
  const t = useCurrentFrame() - T.okay;
  if (t < 0) return null;
  return (
    <g opacity={interpolate(t, [45, 70], [1, 0], CLAMP)}>
      {Array.from({ length: 40 }, (_, i) => {
        const vx = (((i * 53) % 21) - 10) * 3.4;
        const vy = -(20 + ((i * 29) % 18));
        return (
          <rect
            key={i}
            x={-11}
            y={-6}
            width={22}
            height={12}
            rx={3}
            fill={[SPA[0], SPA[1], SPA[2], AMBER, CREAM][i % 5]}
            transform={`translate(${690 + vx * t} ${1010 + vy * t + 0.5 * t * t}) rotate(${t * ((i % 7) + 4)})`}
          />
        );
      })}
    </g>
  );
};

// The fine print, like the fast disclaimer at the end of a TV ad.
const FinePrint: React.FC = () => {
  const frame = useCurrentFrame();
  const card = enter(frame - T.catch, { damping: 13, stiffness: 150 });
  const need = Math.min(enter(frame - T.python, BOUNCY), 1);
  return (
    <g transform={`translate(70 ${830 + (1 - card) * 900}) rotate(-3)`}>
      <rect width={560} height={470} rx={22} fill={PAPER} />
      <text x={30} y={196} fontSize={220} fill="#c98a10" {...text}>
        *
      </text>
      <text x={170} y={104} fontSize={56} fill={INK} {...text}>
        ONE CATCH
      </text>
      <g opacity={need} transform={`translate(${(1 - need) * 60} 0)`}>
        <text x={36} y={278} fontSize={96} fill={INK} {...text}>
          PYTHON 3
        </text>
        <text x={36} y={334} fontSize={34} fill="#7a705c" {...text}>
          MUST BE INSTALLED
        </text>
        <rect x={36} y={364} width={488} height={68} rx={12} fill={INK} />
        <text x={58} y={409} fontSize={30} fill={CREAM} {...mono}>
          {"> python3 --version"}
        </text>
      </g>
    </g>
  );
};

const Flash: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > from + 8) return null;
  return (
    <rect
      x={-40}
      y={-40}
      width={1160}
      height={2000}
      fill={CREAM}
      opacity={interpolate(frame, [from, from + 8], [0.8, 0], CLAMP)}
    />
  );
};

// The voice measures 0.6 dB under the superpowers voice, so it plays as it is; the bed sits about 12 dB under it.
const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice-uiux.mp3")} />
    <Audio
      src={staticFile("sfx/bgm-uiux.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.08, 0.13, 0.13, 0], CLAMP)}
    />
    <Sfx name="impact" from={T.this} volume={0.5} />
    <Sfx name="pop" from={T.purple} volume={0.36} />
    <Sfx name="pop" from={T.rocket} volume={0.36} />
    <Sfx name="error" from={T.unlock} volume={0.22} />
    <Sfx name="sweep" from={T.intro - 2} volume={0.3} />
    <Sfx name="thud0" from={T.uiux + 3} volume={0.5} />
    <Sfx name="ding" from={T.k150} volume={0.4} />
    <Sfx name="womp" from={T.but - 2} volume={0.32} />
    <Sfx name="pop" from={T.tested} volume={0.42} />
    {spread(T.add, T.install - 4, 3).map((from, i) => (
      <Sfx key={from} name={`key${i}`} from={from} volume={0.42} />
    ))}
    {spread(T.install, T.two - 6, 2).map((from, i) => (
      <Sfx key={from} name={`key${i + 2}`} from={from} volume={0.42} />
    ))}
    <Sfx name="check" from={T.two - 6} volume={0.45} />
    <Sfx name="whoosh" from={T.same - 4} volume={0.28} />
    {spread(T.build, T.time - 12, 3).map((from, i) => (
      <Sfx key={from} name={`key${(i + 1) % 4}`} from={from} volume={0.4} />
    ))}
    <Sfx name="click" from={T.before} volume={0.45} />
    <Sfx name="paper" from={T.made} volume={0.45} />
    <Sfx name="pop" from={T.layout} volume={0.34} />
    <Sfx name="sparkle" from={T.n192} volume={0.3} />
    <Sfx name="paper" from={T.plus} volume={0.4} />
    <Sfx name="impact" from={T.purple2} volume={0.45} />
    <Sfx name="stamp" from={T.purple2} volume={0.5} />
    {CHECKS.map((check) => (
      <Sfx key={check.label} name="check" from={check.at} volume={0.4} />
    ))}
    <Sfx name="impact" from={T.okay + 2} volume={0.5} />
    <Sfx name="sparkle" from={T.okay + 6} volume={0.36} />
    <Sfx name="chime" from={T.real} volume={0.4} />
    <Sfx name="thud1" from={T.catch + 6} volume={0.4} />
    <Sfx name="whoosh" from={T.name - 4} volume={0.3} />
    <Sfx name="chime" from={T.test + 3} volume={0.38} />
  </>
);

const PUNCHES = CUTS.map(([from]) => from);
// The frame shakes on three hits only: "THIS", the stamp and the reveal.
const SHAKES = [T.this, T.purple2, T.okay + 2];

export const UiuxVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const pose = animatePose(frame);
  const jump = HOPS.map(([start, len, height]) => hop(frame, start, len, height));
  const dy = jump.reduce((sum, j) => sum + j.dy, 0);
  const sy = jump.reduce((product, j) => product * j.sy, 1);
  const size = place.size ?? 1;
  const open = Math.min(enter(frame - T.okay, { damping: 14, stiffness: 90 }), 1.04);
  const thumb = frame >= END - 12 ? 0 : Math.min(enter(frame - T.test - 3), 1);

  return (
    <AbsoluteFill style={{ backgroundColor: DARK }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "ad" || scene === "outro" ? <Ad /> : null}
          {scene === "stage" ? (
            <>
              <StageSet />
              <Product />
            </>
          ) : null}
          {scene === "doubt" ? <DarkSet cx={540} /> : null}
          {scene === "pov" ? <Pov /> : null}
          {scene === "desk" ? (
            <>
              <StudioSet />
              <Monitor>
                <Chat />
              </Monitor>
            </>
          ) : null}
          {scene === "board" ? <Board /> : null}
          {scene === "cards" ? (
            <>
              <CorkSet />
              <g transform="translate(60 690)">
                <Sheet cues={[T.layout, T.style, T.colors, T.font]} />
              </g>
            </>
          ) : null}
          {scene === "donts" ? (
            <>
              <SlateSet />
              <g transform="translate(390 740)">
                <Avoid />
              </g>
            </>
          ) : null}
          {scene === "bay" ? (
            <>
              <BaySet />
              <g transform="translate(50 740)">
                <Clipboard />
              </g>
            </>
          ) : null}
          {scene === "theater" ? (
            <>
              <TheaterSet />
              <Monitor>
                <SpaPage />
              </Monitor>
              <Curtains open={open} />
            </>
          ) : null}
          {scene === "catch" ? (
            <>
              <DarkSet cx={890} />
              <FinePrint />
            </>
          ) : null}
          {scene === "pov" ? null : (
            <g
              transform={`translate(${place.tx} ${dy}) translate(190 1650) scale(${(place.flip ? -1 : 1) * size * (2 - sy)} ${size * sy}) translate(-190 -1650)`}
            >
              <Stickman pose={pose} thumb={thumb} headFill={place.wall} bendy />
              {scene === "donts" && frame >= T.like - 2 ? <Stamp hand={pose.hR} /> : null}
            </g>
          )}
          {scene === "theater" ? <Confetti /> : null}
          <Flash from={T.uiux + 3} />
          <Flash from={T.okay + 2} />
        </g>
      </svg>

      <Caption
        plain
        from={0}
        to={T.purple - 2}
        lines={[
          { text: "TIRED OF YOUR AI", at: -30, size: 88 },
          { text: "BUILDING THIS?!", at: T.building, ats: [T.building, T.this], size: 96, boxes: { "THIS?!": RED } },
        ]}
      />
      <Caption
        plain
        from={T.purple - 4}
        to={T.intro - 2}
        lines={[
          { text: "PURPLE GRADIENT!", at: T.purple - 4, size: 88, color: "#c9a2ff" },
          { text: "ROCKET EMOJI!", at: T.rocket, size: 100 },
          { text: '"UNLOCK THE POWER"!', at: T.unlock, size: 72, color: AMBER },
        ]}
      />
      <Caption
        plain
        from={T.intro - 4}
        to={T.skill - 2}
        lines={[
          { text: "INTRODUCING...", at: T.intro - 4, size: 96 },
          {
            text: "UI UX PRO MAX",
            at: T.uiux,
            ats: [T.uiux, T.uiux + 16, T.pro, T.pro + 13],
            size: 108,
            boxes: { UI: AMBER, UX: AMBER, PRO: AMBER, MAX: AMBER },
          },
        ]}
      />
      <Caption
        plain
        from={T.skill - 4}
        to={T.but - 2}
        lines={[
          { text: "THE DESIGN SKILL WITH", at: T.skill - 4, size: 66 },
          { text: "150,000", at: T.k150, size: 170, color: AMBER },
          { text: "GITHUB STARS", at: T.stars, size: 110 },
        ]}
      />
      <Caption
        plain
        from={T.but - 4}
        to={T.claude - 2}
        lines={[
          { text: "...BUT DOES IT", at: T.but - 4, size: 96 },
          { text: "ACTUALLY WORK?", at: T.work, size: 100 },
          { text: "I TESTED IT", at: T.tested, size: 120, boxes: { I: GREEN, TESTED: GREEN, IT: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.claude - 4}
        to={T.two - 2}
        lines={[
          { text: "IN CLAUDE CODE", at: T.claude - 4, size: 84, color: AMBER },
          { text: "ADD THE MARKETPLACE", at: T.add, size: 72 },
          { text: "INSTALL THE PLUGIN", at: T.install, size: 76 },
        ]}
      />
      <Caption
        plain
        from={T.two - 4}
        to={T.same - 2}
        lines={[
          { text: "TWO LINES", at: T.two - 4, size: 120 },
          { text: "IN THE CAPTION", at: T.caption, size: 96, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.same - 4}
        to={T.time - 2}
        lines={[
          { text: "SAME PROMPT AS BEFORE", at: T.same - 4, size: 66, boxes: { SAME: AMBER } },
          { text: "BUILD A LANDING PAGE", at: T.build, size: 70 },
          { text: "FOR MY SPA", at: T.build + 26, size: 110 },
        ]}
      />
      <Caption
        plain
        from={T.time - 4}
        to={T.layout - 3}
        lines={[
          { text: "THIS TIME...", at: T.time - 4, size: 88 },
          { text: "BEFORE ANY CODE", at: T.before, size: 80, boxes: { BEFORE: AMBER } },
          { text: "IT MADE A", at: T.made, size: 72 },
          { text: "DESIGN SYSTEM", at: T.system, size: 96, boxes: { DESIGN: GREEN, SYSTEM: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.layout - 4}
        to={T.colors - 2}
        lines={[
          { text: "A LAYOUT", at: T.layout - 4, size: 116 },
          { text: "A STYLE", at: T.style, size: 116 },
        ]}
      />
      <Caption
        plain
        from={T.colors - 4}
        to={T.plus - 2}
        lines={[
          { text: "COLORS FROM", at: T.colors - 4, size: 88 },
          { text: "192 PALETTES", at: T.n192, size: 110, boxes: { "192": AMBER } },
          { text: "A FONT PAIR", at: T.font, size: 104 },
        ]}
      />
      <Caption
        plain
        from={T.plus - 4}
        to={T.like - 2}
        lines={[
          { text: "PLUS A LIST OF", at: T.plus - 4, size: 92 },
          {
            text: "WHAT NOT TO DO",
            at: T.not - 8,
            ats: [T.not - 8, T.not, T.not + 10, T.not + 16],
            size: 100,
            boxes: { NOT: RED },
          },
        ]}
      />
      <Caption
        plain
        from={T.like - 4}
        to={T.check - 2}
        lines={[
          { text: "LIKE:", at: T.like - 4, size: 88 },
          { text: "NO AI", at: T.noAi, size: 124 },
          { text: "PURPLE GRADIENTS", at: T.purple2, size: 86, boxes: { PURPLE: RED, GRADIENTS: RED } },
        ]}
      />
      <Caption
        plain
        from={T.check - 4}
        to={T.contrast - 2}
        lines={[
          { text: "AND A CHECKLIST", at: T.check - 4, size: 88, boxes: { CHECKLIST: AMBER } },
          { text: "BEFORE IT SHIPS", at: T.ships, size: 88 },
        ]}
      />
      <Caption
        plain
        from={T.contrast - 4}
        to={T.result - 2}
        lines={[
          { text: "CONTRAST", at: T.contrast - 4, size: 104, color: GREEN },
          { text: "KEYBOARD FOCUS", at: T.keyboard, size: 96, color: GREEN },
          { text: "PHONE SIZES", at: T.phone, size: 108, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.result - 4}
        to={T.okay - 2}
        lines={[{ text: "THE RESULT?", at: T.result - 4, size: 130 }]}
      />
      <Caption
        plain
        from={T.okay - 4}
        to={T.catch - 2}
        lines={[
          { text: "...OKAY.", at: T.okay - 4, size: 120 },
          { text: "THAT'S A", at: T.real, size: 90 },
          { text: "REAL WEBSITE", at: T.real + 8, size: 112, boxes: { REAL: GREEN, WEBSITE: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.catch - 4}
        to={T.name - 2}
        lines={[
          { text: "ONE CATCH:", at: T.catch - 4, size: 110, boxes: { ONE: AMBER, "CATCH:": AMBER } },
          { text: "IT NEEDS PYTHON", at: T.python, size: 90 },
          { text: "ON YOUR COMPUTER", at: T.computer, size: 84 },
        ]}
      />
      <Caption
        plain
        from={T.name - 4}
        to={T.follow - 2}
        lines={[
          {
            text: "UI UX PRO MAX",
            at: T.name - 4,
            size: 108,
            boxes: { UI: AMBER, UX: AMBER, PRO: AMBER, MAX: AMBER },
          },
          { text: "BY NEXT LEVEL BUILDER", at: T.by, size: 66 },
        ]}
      />
      <Caption
        plain
        from={T.follow - 4}
        to={END + 1}
        lines={[
          { text: "FOLLOW STICKMAN SHIPS", at: T.follow - 4, size: 66, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "I TEST THEM", at: T.test, size: 110, color: GREEN },
          { text: "SO YOU DON'T HAVE TO", at: T.so, size: 70, color: GREEN },
        ]}
      />
    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, so the owner can check every scene before a full render.
const SHOTS: [string, number][] = [
  ["1 AD, FIRST FRAME", 0],
  ["2 AD, THIS", T.this + 14],
  ["3 AD, THREE RINGS", T.unlock + 22],
  ["4 STAGE, INTRODUCING", T.intro + 20],
  ["5 STAGE, PRODUCT", T.pro + 18],
  ["6 STAGE, 150K", T.stars + 20],
  ["7 LIGHTS OFF, TESTED", T.tested + 16],
  ["8 HIS VIEW, COMMAND 1", T.install - 2],
  ["9 HIS VIEW, BOTH", T.caption + 16],
  ["10 DESK, SAME PROMPT", T.time - 10],
  ["11 BOARD, BEFORE CODE", T.before + 16],
  ["12 BOARD, SYSTEM LANDS", T.made + 26],
  ["13 SYSTEM, TWO ROWS", T.style + 16],
  ["14 SYSTEM, ALL ROWS", T.font + 20],
  ["15 AVOID LIST", T.like - 14],
  ["16 AVOID, STAMPED", T.purple2 + 18],
  ["17 CHECKLIST, TWO", T.keyboard + 14],
  ["18 CHECKLIST, DONE", T.phone + 20],
  ["19 CURTAIN CLOSED", T.okay - 16],
  ["20 REVEAL", T.real + 26],
  ["21 FINE PRINT", T.python + 34],
  ["22 AD AGAIN, CREDIT", T.by + 20],
  ["23 AD AGAIN, FOLLOW", T.so + 20],
  ["24 LAST FRAMES, LOOP", END - 3],
];

const Frames: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            width: 1080,
            height: 1920,
            overflow: "hidden",
            transform: "scale(0.5)",
            transformOrigin: "0 0",
          }}
        >
          <Freeze frame={shot}>
            <UiuxVideo />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const UiuxComposition = () => (
  <>
    <Composition
      id="UiuxProMaxTutorial"
      component={UiuxVideo}
      durationInFrames={END}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition
      id="UiuxFrames"
      component={Frames}
      defaultProps={{ from: 0 }}
      durationInFrames={END}
      fps={FPS}
      width={1620}
      height={2020}
    />
  </>
);
