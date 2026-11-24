import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Sfx as Sound, cameraTransform } from "../Composition";
import { blendPoses, type Pose } from "../Stickman";
import { FPS } from "../theme";
import {
  BLUE,
  Bot,
  Box,
  Bubble,
  CHEER,
  COMIC,
  Defs,
  HANDS_ON_HIPS,
  Hero,
  INK,
  MONO,
  ORANGE,
  PAPER,
  PURPLE,
  REACH,
  RED,
  STEEL,
  Sfx,
  TEAL,
  WHITE,
  WRENCH_UP,
  Words,
  YELLOW,
  burst,
  ease,
  ink,
  pop,
  stand,
} from "./Comic";
import { VOICE } from "./lines";

// A stickman plumber explains three token-saving skills. Drawn like a comic book, animated like the older videos:
// full scenes, one stickman acting all the way through, a camera, and captions that follow the voice.
// The voice is one take, so each beat sits on the second its line starts in the recording.
const LEAD = 8;
const at = (second: number) => LEAD + Math.round(second * FPS);
const START = Object.fromEntries(Object.entries(VOICE.lines).map(([id, second]) => [id, at(second)])) as Record<
  keyof typeof VOICE.lines,
  number
>;
const END = at(VOICE.seconds) + 30;

const T = {
  leaking: START.h1,
  leaks: START.h2,
  skills: START.h3,
  each: START.h4,
  s1: START.a1,
  answer: START.a2,
  short: at(10.4), // shortcut: inside a phrase with no pause, an estimate
  type1: START.a3,
  exact: START.a4,
  jetbrains: START.a5,
  number: at(16.97),
  patch: START.a6,
  easy: at(20.22),
  s2: START.b1,
  reads: START.b2,
  rewrites: START.b3,
  type2: START.b4,
  fileName: at(30.88),
  backup: START.b5,
  s3: START.c1,
  long: START.c2,
  every: at(37.25),
  type3: START.c3,
  packs: START.c4,
  fresh: START.c5,
  carry: at(43.64),
  cta: START.e1,
  command: START.e2,
  inCaption: at(47.18),
  follow: START.e3,
  fix: START.e4,
  keep: START.e5,
};

// One set per beat, so no two neighbours share a background or a standing spot.
type Scene = "boiler" | "cave" | "pov" | "gauge" | "patch" | "desk" | "press" | "chat" | "note" | "relay" | "cover";
const CUTS: [number, Scene][] = [
  [0, "boiler"],
  [T.s1 - 2, "cave"],
  [T.type1 - 2, "pov"],
  [T.jetbrains - 2, "gauge"],
  [T.patch - 2, "patch"],
  [T.s2 - 2, "desk"],
  [T.rewrites - 2, "press"],
  [T.type2 - 2, "pov"],
  [T.s3 - 2, "chat"],
  [T.type3 - 2, "pov"],
  [T.packs - 2, "note"],
  [T.fresh - 2, "relay"],
  [T.cta - 2, "cover"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "boiler");

// Where the plumber's feet are in each scene. The POV scene shows only his arms.
type Place = { x: number; flip?: boolean; s?: number };
const FLOOR = 1680;
const PLACE: Partial<Record<Scene, Place>> = {
  boiler: { x: 200 },
  cave: { x: 880, flip: true },
  gauge: { x: 200 },
  patch: { x: 705, flip: true },
  desk: { x: 200 },
  press: { x: 860, flip: true },
  chat: { x: 200 },
  note: { x: 840, flip: true },
  relay: { x: 230, s: 0.9 },
  cover: { x: 200 },
};
const HELPER: Place = { x: 850, flip: true, s: 0.9 };
// A point of the pose, in screen coordinates.
const spot = (place: Place, [px, py]: [number, number], dy = 0): [number, number] => {
  const s = place.s ?? 1;
  return [place.x + (place.flip ? -1 : 1) * s * (px - 190), FLOOR + s * (py - 1650) + dy];
};

const ALARM = stand({ eL: [110, 1180], hL: [80, 1080], eR: [270, 1180], hR: [300, 1080], smile: -1 });
const POINT = stand({ head: [215, 1040], sh: [200, 1130], eR: [280, 1120], hR: [330, 1050], smile: -0.2 });
const THINK = stand({ head: [205, 1044], eR: [285, 1200], hR: [268, 1122], eL: [150, 1240], hL: [230, 1260], smile: -0.2 });
const SHRUG = stand({ look: 0, eL: [90, 1210], hL: [30, 1150], eR: [290, 1210], hR: [350, 1150], smile: 0.2 });
const WIND = stand({ head: [180, 1046], eR: [240, 1180], hR: [250, 1090], smile: 0.4 });
const PATCH = stand({ head: [215, 1040], sh: [200, 1130], eR: [300, 1110], hR: [405, 1060], smile: 0.9 });
const PROUD = stand({ look: 0, eL: [105, 1250], hL: [165, 1345], eR: [275, 1250], hR: [215, 1345], smile: 1.2 });
const SLAM_UP = stand({ head: [185, 1036], eR: [270, 1060], hR: [300, 960], smile: 0.6 });
const SLAM = stand({ head: [215, 1052], sh: [200, 1136], eR: [290, 1130], hR: [330, 1195], smile: 1 });
const CROSSED = stand({ eL: [140, 1240], hL: [240, 1255], eR: [250, 1245], hR: [150, 1265], smile: -0.9 });
const FACEPALM = stand({ head: [200, 1052], eR: [280, 1150], hR: [215, 1050], smile: -1 });
const POINT_DOWN = stand({ look: 0, eL: [110, 1300], hL: [95, 1430], eR: [275, 1080], hR: [305, 950], smile: 1 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], eR: [275, 1080], hR: [305, 950], smile: 1.3 });

const POSES = [
  { at: 0, pose: ALARM },
  { at: T.leaks - 2, pose: POINT },
  { at: T.skills - 3, pose: WRENCH_UP },
  { at: T.each - 2, pose: HANDS_ON_HIPS },
  { at: T.s1 - 2, pose: POINT },
  { at: T.answer + 10, pose: THINK },
  { at: T.short, pose: { ...POINT, smile: 1.2 } },
  { at: T.jetbrains - 2, pose: POINT },
  { at: T.number + 2, pose: SHRUG },
  { at: T.patch - 2, pose: WIND },
  { at: T.patch + 10, pose: PATCH },
  { at: T.easy + 8, pose: PROUD },
  { at: T.s2 - 2, pose: POINT },
  { at: T.reads + 6, pose: THINK },
  { at: T.reads + 50, pose: FACEPALM },
  { at: T.rewrites - 2, pose: SLAM_UP },
  { at: T.rewrites + 3, pose: SLAM },
  { at: T.rewrites + 26, pose: PROUD },
  { at: T.s3 - 2, pose: CROSSED },
  { at: T.long + 4, pose: POINT },
  { at: T.every, pose: FACEPALM },
  { at: T.packs - 2, pose: { ...WRENCH_UP, smile: 1 } },
  { at: T.fresh - 2, pose: REACH },
  { at: T.carry + 4, pose: PROUD },
  { at: T.cta - 2, pose: WRENCH_UP },
  { at: T.command, pose: POINT_DOWN },
  { at: T.follow - 2, pose: WAVE },
  { at: T.fix - 2, pose: HANDS_ON_HIPS },
  { at: T.keep - 2, pose: CHEER },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const within = (a: number, b: number) => frame >= a && frame < b;
  const sway = Math.sin(frame / 19) * 7;
  const drag = Math.sin((frame - 6) / 19) * 10;
  const p: Pose = {
    ...body,
    head: [mid.head[0] + sway, mid.head[1]],
    sh: [body.sh[0] + sway * 0.7, body.sh[1]],
    hip: [body.hip[0] + sway * 0.2, body.hip[1]],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0] + drag, tip.hL[1] + Math.sin(frame / 11) * 5],
    hR: [tip.hR[0] + drag, tip.hR[1] + Math.cos(frame / 11) * 5],
  };
  // Panic at the leaks: both hands shake.
  if (within(0, T.leaks - 2)) {
    p.hL = [p.hL[0], p.hL[1] + Math.sin(frame / 1.6) * 12];
    p.hR = [p.hR[0], p.hR[1] + Math.cos(frame / 1.6) * 12];
  }
  if (within(T.follow + 6, T.fix - 2)) {
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
  [T.skills, 13, 80],
  [T.easy + 10, 11, 46],
  [T.keep, 14, 100],
];

const typed = (s: string, frame: number, a: number, b: number) =>
  s.slice(0, Math.round(interpolate(frame, [a, b], [0, s.length], CLAMP)));

// The take measures 1.8 dB quieter than the superpowers voice; 1.2 brings it level without clipping.
const VOICE_VOLUME = 1.2;

const lettering = { fontFamily: COMIC, letterSpacing: 1.5 } as const;
const outlined = { stroke: INK, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

// A full-screen comic panel: flat color, halftone dots and an inked floor.
const Backdrop: React.FC<{ bg: string }> = ({ bg }) => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2040} fill={bg} />
    <rect x={-60} y={-60} width={1200} height={2040} fill="url(#dots)" opacity={0.13} />
    <rect x={-60} y={1640} width={1200} height={400} fill={INK} opacity={0.22} />
    <path d="M-60 1640 H1140" {...ink} strokeWidth={10} />
  </g>
);

// The token tank on its stand. Hole 0 is caveman's, 1 is caveman-compress's, 2 is handoff's.
// `patched` holes are taped, the rest drip.
const HOLES: [number, number, number][] = [
  [1, 0.52, 1],
  [0, 0.3, -1],
  [1, 0.8, 1],
];
const Tank: React.FC<{ x: number; y: number; w: number; h: number; level: number; patched: number }> = ({
  x,
  y,
  w,
  h,
  level,
  patched,
}) => {
  const frame = useCurrentFrame();
  const top = y + h * (1 - level) + Math.sin(frame / 9) * 4;
  return (
    <g>
      <rect x={x + w / 2 - 24} y={700} width={48} height={y - 700} fill={STEEL} {...ink} />
      <rect x={x + 50} y={y + h - 10} width={32} height={1660 - y - h} fill={STEEL} {...ink} />
      <rect x={x + w - 82} y={y + h - 10} width={32} height={1660 - y - h} fill={STEEL} {...ink} />
      <rect x={x} y={y} width={w} height={h} rx={26} fill={WHITE} {...ink} strokeWidth={12} />
      <path
        d={`M${x + 8} ${top} Q${x + w / 4} ${top - 14} ${x + w / 2} ${top} T${x + w - 8} ${top} V${y + h - 8} H${x + 8}Z`}
        fill={YELLOW}
      />
      <rect x={x} y={y} width={w} height={h} rx={26} fill="none" {...ink} strokeWidth={12} />
      <rect x={x + 22} y={y + 20} width={18} height={h * 0.5} rx={9} fill={WHITE} opacity={0.7} />
      <rect x={x - 22} y={y - 34} width={w + 44} height={40} rx={12} fill={STEEL} {...ink} strokeWidth={10} />
      <text x={x + w / 2} y={y + h * 0.66} textAnchor="middle" fontSize={w * 0.2} fill={INK} {...lettering}>
        TOKENS
      </text>
      {HOLES.map(([side, f, dir], i) => {
        const hx = x + side * w;
        const hy = y + h * f;
        if (i < patched) {
          return (
            <g key={i} transform={`translate(${hx} ${hy})`} {...ink} strokeWidth={7}>
              <rect x={-44} y={-13} width={88} height={26} rx={5} fill={STEEL} transform="rotate(38)" />
              <rect x={-44} y={-13} width={88} height={26} rx={5} fill={STEEL} transform="rotate(-38)" />
            </g>
          );
        }
        return (
          <g key={i}>
            <circle cx={hx} cy={hy} r={15} fill={INK} />
            <path d={`M${hx} ${hy} q${dir * 46} 6 ${dir * 62} 120`} fill="none" stroke={INK} strokeWidth={24} strokeLinecap="round" />
            <path d={`M${hx} ${hy} q${dir * 46} 6 ${dir * 62} 120`} fill="none" stroke={YELLOW} strokeWidth={12} strokeLinecap="round" />
            {[0, 1, 2].map((k) => {
              const t = ((frame + k * 9 + i * 5) % 27) / 27;
              return (
                <path
                  key={k}
                  transform={`translate(${hx + dir * 62} ${hy + 130 + t * t * 240})`}
                  d="M0 -20 Q16 6 0 16 Q-16 6 0 -20Z"
                  fill={YELLOW}
                  {...ink}
                  strokeWidth={6}
                  opacity={1 - t * 0.5}
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

// The boiler room: a pipe along the wall, the tank, and the puddle under it.
const Boiler: React.FC<{ x: number; level: number; patched: number; children?: React.ReactNode }> = ({
  x,
  level,
  patched,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Backdrop bg={BLUE} />
      <rect x={-60} y={676} width={1200} height={48} fill={STEEL} {...ink} />
      {[150, 520, 900].map((jx) => (
        <rect key={jx} x={jx} y={664} width={36} height={72} rx={8} fill={STEEL} {...ink} />
      ))}
      <ellipse cx={x + 180} cy={1700} rx={Math.min(300, 190 + frame * 0.5)} ry={36} fill={YELLOW} {...ink} />
      <Tank x={x} y={820} w={360} h={520} level={level} patched={patched} />
      {children}
    </g>
  );
};

const SkillHeader: React.FC<{ n: number; name: string; at: number; color: string }> = ({ n, name, at: start, color }) => {
  const frame = useCurrentFrame();
  const s = pop(frame - start, 8);
  const badge = pop(frame - start - 3, 8);
  return (
    <g>
      <g opacity={Math.min(s * 3, 1)} transform={`translate(${(1 - s) * -80} 0)`}>
        <rect x={74} y={186} width={952} height={130} fill={INK} />
        <rect x={64} y={174} width={952} height={130} fill={color} {...ink} strokeWidth={10} />
        <text x={270} y={264} fontFamily={MONO} fontWeight={700} fontSize={name.length > 12 ? 62 : 78} fill={WHITE} strokeWidth={10} {...outlined}>
          {name}
        </text>
      </g>
      <g opacity={Math.min(badge * 3, 1)} transform={`translate(160 238) rotate(${-10 + (1 - badge) * -30}) scale(${0.5 + 0.5 * badge})`}>
        <path d={burst(0, 0, 108, 82, 12)} fill={YELLOW} {...ink} />
        <text y={-12} textAnchor="middle" fontSize={40} fill={INK} {...lettering}>
          SKILL
        </text>
        <text y={52} textAnchor="middle" fontSize={76} fill={RED} strokeWidth={8} {...outlined} {...lettering}>
          {`#${n}`}
        </text>
      </g>
    </g>
  );
};

// A sheet of paper with ruled lines, drawn around its top left corner.
const Sheet: React.FC<{ w: number; h: number; title?: string; lines?: number }> = ({ w, h, title, lines = 4 }) => (
  <g>
    <rect x={8} y={9} width={w} height={h} fill={INK} />
    <rect width={w} height={h} fill={WHITE} {...ink} />
    {title ? (
      <text x={20} y={54} fontFamily={MONO} fontWeight={700} fontSize={Math.min(44, (w - 40) / (title.length * 0.6))} fill={INK}>
        {title}
      </text>
    ) : null}
    {Array.from({ length: lines }, (_, i) => (
      <rect key={i} x={20} y={(title ? 84 : 28) + i * 34} width={(w - 40) * [1, 0.8, 0.92, 0.6, 0.86, 0.7][i % 6]} height={12} rx={6} fill={INK} opacity={0.35} />
    ))}
  </g>
);

const Tick: React.FC<{ x: number; y: number; at: number; s?: number }> = ({ x, y, at: start, s = 1 }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const p = pop(frame - start, 7);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.4 + 0.6 * p)})`} opacity={Math.min(p * 3, 1)}>
      <circle r={44} fill={TEAL} {...ink} />
      <path d="M-20 2 L-6 18 L22 -16" fill="none" stroke={WHITE} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// Hook: the numbers land on the three leaks as he counts them.
const LeakNumbers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {HOLES.map(([side, f, dir], i) => {
        const s = pop(frame - T.leaks - 3 - i * 5, 7);
        return (
          <g
            key={i}
            opacity={frame < T.leaks + 3 + i * 5 ? 0 : 1}
            transform={`translate(${590 + side * 360 + dir * 34} ${820 + 520 * f - 66}) scale(${0.4 + 0.6 * s})`}
          >
            <circle r={40} fill={RED} {...ink} />
            <text y={22} textAnchor="middle" fontSize={62} fill={WHITE} {...lettering}>
              {i + 1}
            </text>
          </g>
        );
      })}
      <Sfx x={440} y={1560} text="DRIP!" at={10} size={76} rot={-10} until={T.skills - 3} />
    </g>
  );
};

// Skill one: the AI on its rock talks and talks, then answers like a caveman.
const Cave: React.FC = () => {
  const frame = useCurrentFrame();
  const open = pop(frame - T.answer, 8);
  const squash = ease(frame - T.short, 6);
  const flick = Math.sin(frame / 2.3) * 10;
  return (
    <g>
      <Backdrop bg={ORANGE} />
      <g stroke="#9c4a16" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.5}>
        <path d="M500 1380 q30 -90 120 -60 q60 -50 110 10 v80 M540 1350 v70 M690 1330 v90 M500 1380 q-36 16 -24 60" />
        <circle cx={610} cy={1150} r={24} />
        <path d="M610 1174 v64 M610 1196 l-34 26 M610 1196 l38 -30 M610 1238 l-26 40 M610 1238 l26 40" />
      </g>
      <path d="M20 1660 Q30 1500 110 1470 H400 Q470 1500 490 1660Z" fill={STEEL} {...ink} />
      <Bot x={80} y={1100} s={1.7} gaze={[1, -0.4]} mouth={frame < T.short ? Math.sin(frame / 2) : 0.7} />
      <g transform="translate(610 1640)">
        <path d={`M-60 0 Q-74 -80 ${flick * 0.4} ${-150 - flick} Q74 -80 60 0Z`} fill={RED} {...ink} />
        <path d={`M-30 0 Q-36 -44 ${-flick * 0.3} ${-84 + flick * 0.6} Q36 -44 30 0Z`} fill={YELLOW} />
        <path d="M-90 10 L90 -14 M-90 -14 L90 10" stroke={INK} strokeWidth={30} strokeLinecap="round" />
        <path d="M-90 10 L90 -14 M-90 -14 L90 10" stroke="#9c4a16" strokeWidth={16} strokeLinecap="round" />
      </g>
      {/* The long answer squashes flat, then the short one pops in its place. */}
      {frame >= T.answer ? (
        <g
          opacity={Math.min(open * 3, 1) * (1 - squash)}
          transform={`translate(290 1090) scale(${(0.5 + 0.5 * open) * (1 - squash * 0.5)} ${(0.5 + 0.5 * open) * (1 - squash * 0.75)}) translate(-290 -1090)`}
        >
          <rect x={200} y={690} width={560} height={340} rx={56} fill={WHITE} {...ink} />
          <path d="M300 1026 L280 1094 L390 1026" fill={WHITE} {...ink} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={246}
              y={736 + i * 46}
              width={Math.min([460, 420, 470, 360, 440, 280][i], Math.max(0, (frame - T.answer - 4 - i * 4) * 60))}
              height={18}
              rx={9}
              fill={INK}
              opacity={0.45}
            />
          ))}
        </g>
      ) : null}
      <Bubble x={200} y={830} w={470} h={170} tail={[285, 1092]} lines={["FIX LINE 42."]} at={T.short + 3} size={82} />
      <Sfx x={690} y={760} text="ZIP!" at={T.short + 2} size={104} rot={10} />
    </g>
  );
};

// His own eyes: the terminal up close, the keyboard and both arms. One per skill, in the skill's color.
const POVS = [
  { cmd: "/caveman", from: T.type1 + 10, to: T.type1 + 38, color: RED },
  { cmd: "/caveman-compress", from: T.type2 + 8, to: T.type2 + 52, color: PURPLE },
  { cmd: "/handoff", from: T.type3 + 10, to: T.type3 + 38, color: BLUE },
];
const Pov: React.FC = () => {
  const frame = useCurrentFrame();
  const i = frame < T.s2 ? 0 : frame < T.s3 ? 1 : 2;
  const { cmd, from, to, color } = POVS[i];
  // Shown in its real case, because viewers copy it.
  const text = typed(cmd, frame, from, to) + (i === 1 ? typed(" CLAUDE.md", frame, T.fileName, T.fileName + 18) : "");
  const typing = (frame >= from && frame < to) || (i === 1 && frame >= T.fileName && frame < T.fileName + 18);
  const left = typing ? Math.abs(Math.sin(frame / 1.5)) * 34 : 0;
  const right = typing ? Math.abs(Math.cos(frame / 1.5)) * 34 : 0;
  const key = typing ? Math.floor(frame / 2) % 40 : -1;
  const arms = `M200 1980 Q270 1830 390 ${1690 - left} M880 1980 Q810 1830 690 ${1690 - right}`;
  return (
    <g>
      <Backdrop bg="#3b3350" />
      <rect x={82} y={734} width={940} height={500} rx={30} fill={INK} />
      <rect x={70} y={720} width={940} height={500} rx={30} fill="#221f2b" {...ink} strokeWidth={12} />
      <path d="M70 806 V750 Q70 720 100 720 H980 Q1010 720 1010 750 V806Z" fill={color} {...ink} strokeWidth={12} />
      {[0, 1, 2].map((d) => (
        <circle key={d} cx={116 + d * 40} cy={763} r={13} fill={[WHITE, YELLOW, TEAL][d]} {...ink} strokeWidth={5} />
      ))}
      <text x={980} y={778} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={36} fill={WHITE}>
        CLAUDE CODE
      </text>
      <text x={104} y={950} fontFamily={MONO} fontWeight={700} fontSize={i === 1 ? 48 : 92} fill={WHITE}>
        <tspan fill={YELLOW}>{"> "}</tspan>
        {text + (frame % 16 < 9 ? "_" : "")}
      </text>
      {i === 0 ? (
        <>
          <Tick x={160} y={1100} at={T.exact + 3} />
          <Box x={230} y={1058} text="CODE STAYS EXACT" at={T.exact + 6} size={62} bg={TEAL} color={WHITE} />
        </>
      ) : null}
      {i === 1 ? (
        <>
          <Tick x={160} y={1100} at={T.backup + 3} />
          <Box x={230} y={1058} text="BACKUP KEPT" at={T.backup + 6} size={62} />
        </>
      ) : null}
      {i === 2 ? <Sfx x={540} y={1130} text="SNIP!" at={to + 2} size={120} rot={-6} fill={WHITE} /> : null}
      <rect x={112} y={1412} width={880} height={300} rx={26} fill={INK} />
      <rect x={100} y={1400} width={880} height={300} rx={26} fill={STEEL} {...ink} strokeWidth={12} />
      {Array.from({ length: 40 }, (_, k) => (
        <rect
          key={k}
          x={128 + (k % 10) * 83}
          y={1424 + Math.floor(k / 10) * 66}
          width={68}
          height={50}
          rx={9}
          fill={k === key ? YELLOW : WHITE}
          {...ink}
          strokeWidth={5}
        />
      ))}
      <Sfx x={880} y={1350} text="TAP TAP!" at={from} until={to} size={64} rot={8} />
      <path d={arms} fill="none" stroke={INK} strokeWidth={70} strokeLinecap="round" />
      <path d={arms} fill="none" stroke="#f6efe2" strokeWidth={50} strokeLinecap="round" />
    </g>
  );
};

// The measurement: two bars, and the small gap between them.
const Gauge: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = ease(frame - T.jetbrains - 2, 14);
  const hit = pop(frame - T.number, 8);
  const bars = [
    { x: 470, h: 440, label: "BEFORE", fill: STEEL },
    { x: 730, h: 440 * 0.915, label: "CAVEMAN", fill: YELLOW },
  ];
  return (
    <g>
      <Backdrop bg={PURPLE} />
      {bars.map((b) => (
        <g key={b.label}>
          <rect x={b.x + 12} y={1600 - b.h * grow + 12} width={200} height={b.h * grow} fill={INK} />
          <rect x={b.x} y={1600 - b.h * grow} width={200} height={b.h * grow} fill={b.fill} {...ink} strokeWidth={10} />
          <Box x={b.x + 6} y={1668} text={b.label} at={T.jetbrains + 8} size={44} bg={WHITE} tilt={0} />
        </g>
      ))}
      {frame >= T.number ? (
        <g opacity={Math.min(hit * 3, 1)}>
          <path d="M440 1160 H960" stroke={INK} strokeWidth={8} strokeDasharray="18 14" />
          <rect x={730} y={1160} width={200} height={440 * 0.085} fill={RED} {...ink} strokeWidth={8} />
        </g>
      ) : null}
      <g
        opacity={frame < T.number ? 0 : 1}
        transform={`translate(700 900) scale(${0.3 + 0.7 * hit}) rotate(${-6 + Math.sin(frame / 7) * 1.5})`}
      >
        <path d={burst(0, 0, 186, 134, 14)} fill={RED} {...ink} />
        <text y={50} textAnchor="middle" fontSize={146} fill={YELLOW} strokeWidth={16} {...outlined} {...lettering}>
          8.5%
        </text>
      </g>
    </g>
  );
};

// Skill two: the AI reads the whole memory file again at the start of every session.
const Desk: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - T.s2 - 16);
  const session = 1 + Math.floor(t / 36);
  return (
    <g>
      <Backdrop bg={TEAL} />
      <rect x={620} y={1420} width={440} height={40} fill="#9c4a16" {...ink} />
      <rect x={660} y={1456} width={30} height={200} fill="#9c4a16" {...ink} />
      <rect x={990} y={1456} width={30} height={200} fill="#9c4a16" {...ink} />
      <Bot x={700} y={1093} s={1.5} gaze={[-1, Math.sin(frame / 4)]} mouth={-0.5} />
      <clipPath id="feed">
        <rect x={350} y={740} width={300} height={690} />
      </clipPath>
      <g clipPath="url(#feed)">
        <g transform={`translate(380 ${1420 - ((t % 36) / 36) * 1250})`}>
          <Sheet w={240} h={560} title="CLAUDE.md" lines={13} />
        </g>
      </g>
      <rect x={340} y={1420} width={300} height={34} rx={10} fill={STEEL} {...ink} />
      <Box key={session} x={660} y={960} text={`SESSION ${session}`} at={Math.max(T.reads, T.s2 + 16 + (session - 1) * 36)} size={58} bg={WHITE} />
      <Sfx x={880} y={890} text="UGH..." at={T.reads + 30} size={72} rot={8} fill={WHITE} />
    </g>
  );
};

// He hits the button, the press squashes the fat file thin.
const Press: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - T.rewrites;
  const squish = ease(t - 8, 6);
  const head = squish - ease(t - 22, 10);
  const sheetH = 260 * (1 - 0.7 * squish);
  return (
    <g>
      <Backdrop bg={YELLOW} />
      <rect x={170} y={800} width={34} height={770} fill={STEEL} {...ink} />
      <rect x={546} y={800} width={34} height={770} fill={STEEL} {...ink} />
      <rect x={140} y={770} width={470} height={70} rx={12} fill={STEEL} {...ink} strokeWidth={10} />
      <rect x={140} y={1560} width={470} height={70} rx={12} fill={STEEL} {...ink} strokeWidth={10} />
      <g transform={`translate(260 ${1560 - sheetH}) scale(1 ${sheetH / 260})`}>
        <Sheet w={230} h={260} title="CLAUDE.md" lines={5} />
      </g>
      <rect x={356} y={830} width={38} height={120 + head * 422} fill={STEEL} {...ink} />
      <rect x={220} y={940 + head * 422} width={310} height={120} rx={10} fill={RED} {...ink} strokeWidth={10} />
      <rect x={672} y={1262} width={120} height={400} fill={INK} />
      <rect x={660} y={1250} width={120} height={400} fill={STEEL} {...ink} strokeWidth={10} />
      <rect x={676} y={1224 + ease(t - 6, 3) * 14 - ease(t - 16, 6) * 14} width={88} height={40} rx={14} fill={RED} {...ink} />
      <Sfx x={810} y={880} text="SQUISH!" at={T.rewrites + 12} size={100} rot={-6} fill={RED} />
      <Tick x={560} y={1500} at={T.rewrites + 30} />
    </g>
  );
};

// Skill three: the whole chat scrolls past the AI again, on every message.
const Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.max(1, Math.floor((frame - T.long) / 7));
  return (
    <g>
      <Backdrop bg={RED} />
      <rect x={492} y={794} width={530} height={800} rx={30} fill={INK} />
      <rect x={480} y={780} width={530} height={800} rx={30} fill={WHITE} {...ink} strokeWidth={12} />
      <clipPath id="chat">
        <rect x={486} y={786} width={518} height={788} rx={26} />
      </clipPath>
      <g clipPath="url(#chat)">
        {Array.from({ length: 12 }, (_, i) => {
          const y = ((i * 110 - frame * 8) % 1320 + 1320) % 1320 + 600;
          const mine = i % 2 === 0;
          return (
            <g key={i} transform={`translate(${mine ? 660 : 510} ${y})`}>
              <rect width={320} height={78} rx={36} fill={mine ? YELLOW : "#dcd6ee"} {...ink} strokeWidth={7} />
              <rect x={30} y={32} width={[230, 170, 250, 140][i % 4]} height={14} rx={7} fill={INK} opacity={0.4} />
            </g>
          );
        })}
      </g>
      <Bot x={750} y={1360} s={1.25} gaze={[-0.6, Math.sin(frame / 3)]} mouth={-0.9} />
      {frame >= T.long ? (
        <g transform={`translate(840 1000) rotate(-4) scale(${0.86 + pop((frame - T.long) % 7, 5) * 0.08})`}>
          <path d={burst(0, 0, 196, 104, 16)} fill={YELLOW} {...ink} />
          <text y={-6} textAnchor="middle" fontSize={50} fill={INK} {...lettering}>
            READ AGAIN
          </text>
          <text y={62} textAnchor="middle" fontSize={72} fill={RED} strokeWidth={8} {...outlined} {...lettering}>
            {`x${count}`}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// The chat bubbles fly into the one note he holds up.
const Note: React.FC<{ hand: [number, number] }> = ({ hand }) => {
  const frame = useCurrentFrame();
  const glow = pop(frame - T.packs - 16, 8);
  return (
    <g>
      {frame >= T.packs + 16 ? (
        <path
          d={burst(hand[0], hand[1] - 180, 230, 150, 14)}
          fill={YELLOW}
          {...ink}
          opacity={0.9}
          transform={`rotate(${frame / 3} ${hand[0]} ${hand[1] - 180}) translate(${hand[0]} ${hand[1] - 180}) scale(${0.4 + 0.6 * glow}) translate(${-hand[0]} ${-hand[1] + 180})`}
        />
      ) : null}
      {Array.from({ length: 8 }, (_, i) => {
        const fold = ease(frame - T.packs - 2 - i * 2, 12);
        const [x, y] = [
          [90, 760],
          [330, 840],
          [120, 980],
          [380, 1090],
          [80, 1200],
          [340, 1310],
          [140, 1420],
          [400, 1500],
        ][i];
        return (
          <g
            key={i}
            opacity={1 - ease(frame - T.packs - 10 - i * 2, 4)}
            transform={`translate(${x + (hand[0] - 80 - x) * fold} ${y + (hand[1] - 200 - y) * fold - Math.sin(fold * Math.PI) * 90}) scale(${1 - fold * 0.6})`}
          >
            <rect width={230} height={70} rx={32} fill={i % 2 ? WHITE : YELLOW} {...ink} strokeWidth={7} />
            <rect x={26} y={28} width={[150, 110, 170][i % 3]} height={13} rx={6} fill={INK} opacity={0.4} />
          </g>
        );
      })}
      <Sfx x={300} y={1120} text="PACKED!" at={T.packs + 20} size={104} rot={-8} />
      <g transform={`translate(${hand[0]} ${hand[1] - 180}) rotate(-5) scale(${1 + 0.1 * Math.sin(Math.min(1, glow) * Math.PI)}) translate(-110 -120)`}>
        <Sheet w={220} h={240} title="HANDOFF" lines={4} />
      </g>
    </g>
  );
};

// He hands the note to a fresh session, which carries on.
const Relay: React.FC<{ hand: [number, number] }> = ({ hand }) => {
  const frame = useCurrentFrame();
  const pass = ease(frame - T.fresh - 6, 12);
  const to = spot(HELPER, REACH.hR);
  return (
    <g>
      <rect x={652} y={794} width={380} height={640} rx={26} fill={INK} />
      <rect x={640} y={780} width={380} height={640} rx={26} fill={WHITE} {...ink} strokeWidth={12} />
      <path d="M640 860 V806 Q640 780 666 780 H994 Q1020 780 1020 806 V860Z" fill={TEAL} {...ink} strokeWidth={12} />
      <text x={830} y={840} textAnchor="middle" fontSize={50} fill={WHITE} strokeWidth={8} {...outlined} {...lettering}>
        NEW SESSION
      </text>
      <Hero pose={REACH} x={HELPER.x} y={FLOOR} s={HELPER.s} flip cap={false} />
      <g
        transform={`translate(${hand[0] + (to[0] - hand[0]) * pass} ${hand[1] + (to[1] - hand[1]) * pass - Math.sin(pass * Math.PI) * 70}) rotate(${-8 + pass * 16}) translate(-60 -150)`}
      >
        <Sheet w={120} h={140} title="NOTE" lines={2} />
      </g>
    </g>
  );
};

// The call to action: all three leaks taped, the tank fills back up.
const NAMES = ["caveman", "caveman-compress", "handoff"];
const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [T.cta, T.keep + 10], [0.45, 0.92], CLAMP);
  return (
    <g>
      <Backdrop bg={YELLOW} />
      <g transform={`rotate(${frame / 5} 540 1000)`} opacity={0.55}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M540 1000 L400 -700 L680 -700Z" fill={WHITE} transform={`rotate(${i * 30} 540 1000)`} />
        ))}
      </g>
      <rect x={-60} y={1640} width={1200} height={400} fill={ORANGE} />
      <path d="M-60 1640 H1140" {...ink} strokeWidth={10} />
      <Tank x={420} y={900} w={300} h={440} level={fill} patched={3} />
      {NAMES.map((name, i) => (
        <g key={name}>
          <Box x={766} y={960 + i * 130} text={name} at={T.cta + 8 + i * 5} size={i === 1 ? 23 : 36} bg={INK} color={WHITE} mono tilt={i === 1 ? 1.5 : -1.5} />
        </g>
      ))}
    </g>
  );
};

const Soundtrack: React.FC = () => (
  <>
    <Sequence from={LEAD} layout="none">
      <Audio src={staticFile("voice-leaks.mp3")} volume={VOICE_VOLUME} />
    </Sequence>
    <Audio
      src={staticFile("sfx/bgm-leaks.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    <Sound name="pop" from={T.leaks + 3} volume={0.45} />
    <Sound name="thud1" from={T.skills} volume={0.4} />
    <Sound name="whoosh" from={T.s1 - 4} volume={0.26} />
    <Sound name="thud2" from={T.s1} volume={0.4} />
    <Sound name="sweep" from={T.short - 22} volume={0.24} />
    <Sound name="pop" from={T.short + 3} volume={0.5} />
    <Sound name="key0" from={T.type1 + 12} volume={0.42} />
    <Sound name="key2" from={T.type1 + 24} volume={0.42} />
    <Sound name="check" from={T.exact + 5} volume={0.45} />
    <Sound name="impact" from={T.number} volume={0.5} />
    <Sound name="stamp" from={T.patch + 16} volume={0.45} />
    <Sound name="whoosh" from={T.s2 - 4} volume={0.26} />
    <Sound name="thud2" from={T.s2} volume={0.4} />
    <Sound name="womp" from={T.reads + 30} volume={0.28} />
    <Sound name="click" from={T.rewrites + 7} volume={0.5} />
    <Sound name="thud0" from={T.rewrites + 12} volume={0.5} />
    <Sound name="key1" from={T.type2 + 12} volume={0.42} />
    <Sound name="key3" from={T.type2 + 30} volume={0.42} />
    <Sound name="key0" from={T.fileName + 4} volume={0.42} />
    <Sound name="ding" from={T.backup + 5} volume={0.4} />
    <Sound name="whoosh" from={T.s3 - 4} volume={0.26} />
    <Sound name="thud2" from={T.s3} volume={0.4} />
    <Sound name="error" from={T.long + 18} volume={0.2} />
    <Sound name="key2" from={T.type3 + 14} volume={0.42} />
    <Sound name="click" from={T.type3 + 40} volume={0.55} />
    <Sound name="sparkle" from={T.packs + 14} volume={0.34} />
    <Sound name="whoosh" from={T.fresh + 6} volume={0.26} />
    <Sound name="impact" from={T.cta} volume={0.5} />
    <Sound name="thud2" from={T.follow} volume={0.42} />
    <Sound name="chime" from={T.keep} volume={0.42} />
  </>
);

const PUNCHES = CUTS.map(([from]) => from);
// The owner wants a steady frame: it shakes only on the three hits (the 8.5%, the patch, the press).
const SHAKES = [T.number, T.patch + 16, T.rewrites + 12];
const HEADERS = [
  { name: "caveman", at: T.s1, color: RED },
  { name: "caveman-compress", at: T.s2, color: PURPLE },
  { name: "handoff", at: T.s3, color: BLUE },
];

export const LeaksVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const pose = animatePose(frame);
  const jump = HOPS.map(([start, len, height]) => hop(frame, start, len, height));
  const dy = jump.reduce((sum, j) => sum + j.dy, 0);
  const sy = jump.reduce((product, j) => product * j.sy, 1);
  const hand = place ? spot(place, pose.hR, dy) : ([0, 0] as [number, number]);
  const skill = frame < T.s1 - 2 || frame >= T.cta - 2 ? 0 : frame < T.s2 - 2 ? 1 : frame < T.s3 - 2 ? 2 : 3;
  // With a skill's header on screen, the captions sit under it.
  const top = skill ? 344 : 190;

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <Defs />
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {scene === "boiler" ? (
            <Boiler x={590} level={interpolate(frame, [0, T.s1], [0.82, 0.5], CLAMP)} patched={0}>
              <LeakNumbers />
            </Boiler>
          ) : null}
          {scene === "cave" ? <Cave /> : null}
          {scene === "pov" ? <Pov /> : null}
          {scene === "gauge" ? <Gauge /> : null}
          {scene === "patch" ? (
            <Boiler x={120} level={0.5} patched={frame >= T.patch + 16 ? 1 : 0}>
              <Sfx x={880} y={860} text="PATCH!" at={T.patch + 16} size={108} rot={-8} />
            </Boiler>
          ) : null}
          {scene === "desk" ? <Desk /> : null}
          {scene === "press" ? <Press /> : null}
          {scene === "chat" ? <Chat /> : null}
          {scene === "note" ? <Backdrop bg={TEAL} /> : null}
          {scene === "relay" ? <Backdrop bg={ORANGE} /> : null}
          {scene === "cover" ? <Cover /> : null}
          {scene === "relay" ? <Relay hand={hand} /> : null}
          {scene === "note" ? <Note hand={hand} /> : null}
          {place ? (
            <g
              transform={`translate(0 ${dy}) translate(${place.x} ${FLOOR}) scale(${2 - sy} ${sy}) translate(${-place.x} ${-FLOOR})`}
            >
              <Hero
                pose={pose}
                x={place.x}
                y={FLOOR}
                s={place.s ?? 1}
                flip={place.flip}
                wrench={(frame >= T.skills - 3 && frame < T.s1 - 2) || frame >= T.cta - 2}
              />
            </g>
          ) : null}
        </g>
        {/* The page edge: one inked frame around every scene. */}
        <path d="M0 0 H1080 V1920 H0Z M26 26 V1894 H1054 V26Z" fill={PAPER} fillRule="evenodd" />
        <rect x={26} y={26} width={1028} height={1868} fill="none" stroke={INK} strokeWidth={12} />
        {skill ? <SkillHeader n={skill} {...HEADERS[skill - 1]} /> : null}
      </svg>

      <Words
        from={0}
        to={T.leaks - 2}
        lines={[
          { text: "YOUR AI IS", at: T.leaking + 2, size: 112 },
          { text: "LEAKING TOKENS!", at: T.leaking + 16, size: 118, boxes: { LEAKING: RED, "TOKENS!": YELLOW } },
        ]}
      />
      <Words
        from={T.leaks - 4}
        to={T.s1 - 2}
        lines={[
          { text: "3 LEAKS.", at: T.leaks, size: 124, boxes: { "LEAKS.": RED } },
          { text: "3 SKILLS.", at: T.skills, size: 124, boxes: { "SKILLS.": TEAL } },
          { text: "HERE'S WHAT EACH ONE DOES", at: T.each, size: 66 },
        ]}
      />
      <Words
        top={top}
        from={T.answer - 4}
        to={T.type1 - 2}
        lines={[
          { text: "IT MAKES YOUR AI ANSWER", at: T.answer, size: 74 },
          { text: "SHORT AND BLUNT", at: T.short, size: 108, boxes: { SHORT: YELLOW, BLUNT: YELLOW } },
        ]}
      />
      <Words
        top={top}
        from={T.type1 - 4}
        to={T.jetbrains - 2}
        lines={[
          { text: "TYPE THIS", at: T.type1, size: 112, boxes: { THIS: YELLOW } },
          { text: "YOUR CODE STAYS EXACT", at: T.exact, size: 76 },
        ]}
      />
      <Words
        top={top}
        from={T.jetbrains - 4}
        to={T.patch - 2}
        lines={[
          { text: "JETBRAINS MEASURED IT:", at: T.jetbrains, size: 78 },
          { text: "FEWER OUTPUT TOKENS", at: T.number + 14, size: 84, boxes: { FEWER: YELLOW } },
        ]}
      />
      <Words
        top={top}
        from={T.patch - 4}
        to={T.s2 - 2}
        lines={[
          { text: "SMALL LEAK.", at: T.patch, size: 108 },
          { text: "EASY PATCH.", at: T.easy, size: 118, boxes: { EASY: YELLOW, "PATCH.": YELLOW } },
        ]}
      />
      <Words
        top={top}
        from={T.reads - 4}
        to={T.rewrites - 2}
        lines={[
          { text: "YOUR AI READS YOUR", at: T.reads, size: 80 },
          { text: "MEMORY FILE", at: T.reads + 22, size: 104, boxes: { MEMORY: YELLOW, FILE: YELLOW } },
          { text: "EVERY SESSION", at: T.reads + 54, size: 84 },
        ]}
      />
      <Words
        top={top}
        from={T.rewrites - 4}
        to={T.type2 - 2}
        lines={[
          { text: "THIS REWRITES IT", at: T.rewrites, size: 92 },
          { text: "SHORTER", at: T.rewrites + 16, size: 130, boxes: { SHORTER: YELLOW } },
        ]}
      />
      <Words
        top={top}
        from={T.type2 - 4}
        to={T.s3 - 2}
        lines={[
          { text: "TYPE THIS", at: T.type2, size: 112, boxes: { THIS: YELLOW } },
          { text: "THEN THE FILE NAME", at: T.fileName, size: 76 },
        ]}
      />
      <Words
        top={top}
        from={T.long - 4}
        to={T.type3 - 2}
        lines={[
          { text: "A LONG CHAT GETS", at: T.long, size: 84 },
          { text: "READ AGAIN", at: T.long + 28, size: 116, boxes: { READ: YELLOW, AGAIN: YELLOW } },
          { text: "ON EVERY MESSAGE", at: T.every, size: 84 },
        ]}
      />
      <Words
        top={top}
        from={T.type3 - 4}
        to={T.packs - 2}
        lines={[{ text: "TYPE THIS", at: T.type3, size: 112, boxes: { THIS: YELLOW } }]}
      />
      <Words
        top={top}
        from={T.packs - 4}
        to={T.fresh - 2}
        lines={[
          { text: "THE WHOLE CHAT", at: T.packs + 4, size: 96 },
          { text: "IN ONE NOTE", at: T.packs + 30, size: 120, boxes: { ONE: YELLOW, NOTE: YELLOW } },
        ]}
      />
      <Words
        top={top}
        from={T.fresh - 4}
        to={T.cta - 2}
        lines={[
          { text: "OPEN A NEW SESSION", at: T.fresh, size: 88 },
          { text: "AND CARRY ON", at: T.carry, size: 112, boxes: { CARRY: YELLOW, ON: YELLOW } },
        ]}
      />
      <Words
        from={T.cta - 4}
        to={T.follow - 2}
        lines={[
          { text: "3 SKILLS", at: T.cta, size: 170, boxes: { SKILLS: RED } },
          { text: "ONE COMMAND EACH", at: T.command, size: 92 },
          { text: "IN THE CAPTION", at: T.inCaption, size: 100, boxes: { CAPTION: WHITE } },
        ]}
      />
      <Words
        from={T.follow - 4}
        to={END + 1}
        lines={[
          { text: "FOLLOW STICKMAN SHIPS", at: T.follow, size: 96, boxes: { STICKMAN: RED, SHIPS: RED } },
          { text: "I FIX THE LEAKS.", at: T.fix, size: 104 },
          { text: "YOU KEEP THE TOKENS!", at: T.keep, size: 96, boxes: { "TOKENS!": WHITE } },
        ]}
      />
    </AbsoluteFill>
  );
};

export const LeaksComposition = () => (
  <Composition id="TokenLeaks" component={LeaksVideo} durationInFrames={END} fps={FPS} width={1080} height={1920} />
);
