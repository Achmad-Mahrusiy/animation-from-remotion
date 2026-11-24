import { AbsoluteFill, Audio, Composition, Freeze, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import {
  Backdrop,
  Forge,
  ICE,
  INK,
  IRON,
  NIGHT,
  PAPER,
  PLANK,
  SCRAP_WALL,
  SCROLL_WALL,
  Slab,
  Yard,
  barAt,
  wallAt,
} from "./Forge";
import { VOICE } from "./lines";

// A blacksmith: hot iron is the warm prompt cache, cold iron is the expired one.
const at = (second: number) => Math.round(second * FPS);
const L = VOICE.lines;
const END = at(VOICE.seconds + 0.7);
// Starts of the measured stretches are exact. A cue inside one sits at the share of it that its characters come before,
// which is an estimate: check those by ear.
const cue = (line: keyof typeof L, share = 0) => at(L[line][0] + L[line][1] * share);
const T = {
  number: at(1.91), // the dip before "three hundred" in the take: a guess, check by ear
  compact: cue("compact"),
  chat: cue("chat"),
  hours: cue("chat", 0.47),
  read: cue("read"),
  hasTo: cue("hasTo"),
  all: cue("hasTo", 0.62),
  work: cue("work"),
  cached: cue("cached"),
  hot: cue("hot"),
  cheap: cue("cheap"),
  leave: cue("leave"),
  goes: cue("leave", 0.45),
  cold: cue("leave", 0.89),
  again: cue("again"),
  rule: cue("rule"),
  before: cue("rule", 0.34),
  notAfter: cue("notAfter"),
  done: cue("done"),
  clear: cue("clear"),
  nothing: cue("nothing"),
  follow: cue("follow"),
  strike: cue("strike"),
  isHot: cue("strike", 0.43),
};

// The size of the owner's chat when they ran /compact on 2026-11-09 (preTokens in the session log).
const TOKENS = 348408;
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const text = { fontFamily, fontWeight: 900 } as const;
const mono = { fontFamily, fontWeight: 700 } as const;
const BOUNCY = { damping: 11, stiffness: 190 };
const spread = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => Math.round(a + (i * (b - a)) / n));
const typed = (s: string, frame: number, a: number, b: number) =>
  s.slice(0, Math.round(interpolate(frame, [a, b], [0, s.length], CLAMP)));

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
const SLUMP = stand({ head: [215, 1075], sh: [196, 1150], eL: [150, 1260], hL: [150, 1370], eR: [240, 1262], hR: [250, 1372], smile: -0.8 });
const WINCE = stand({ head: [180, 1048], eL: [110, 1150], hL: [150, 1040], eR: [240, 1250], hR: [262, 1350], smile: -1 });
const REST = stand({ eR: [270, 1210], hR: [330, 1130], smile: 0.8 });
const POINT = stand({ head: [215, 1040], sh: [200, 1130], eL: [280, 1120], hL: [330, 1050], smile: 0.4 });
const SHRUG = stand({ look: 0, eL: [90, 1210], hL: [30, 1150], eR: [290, 1210], hR: [350, 1150], smile: 0.8 });
const POINT_UP = stand({ look: 0, eL: [125, 1060], hL: [105, 925], smile: 0.8 });
const GUARD = stand({ look: 0, eL: [80, 1150], hL: [30, 1240], eR: [270, 1200], hR: [300, 1300], smile: -0.3 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], smile: 1.2 });
const TOSS = stand({ head: [215, 1046], eR: [285, 1110], hR: [350, 1030], smile: 1 });
// The hammer follows the right forearm, so these two poses are the whole swing.
const RAISE = stand({ head: [185, 1036], eR: [270, 1050], hR: [250, 930], smile: 0.6 });
const STRIKE = stand({ head: [215, 1050], sh: [200, 1135], eR: [245, 1125], hR: [315, 1160], smile: 1 });
const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [280, 1050], hR: [300, 920], smile: 1.6 });
// Asleep on his side. It is a standing pose that Sleeper turns 90 degrees, so the face turns with the body:
// here x is the height above the ground and y runs from head to feet.
const ASLEEP = stand({
  head: [272, 1050],
  sh: [226, 1140],
  hip: [222, 1380],
  kR: [236, 1500],
  fR: [226, 1600],
  kL: [220, 1505],
  fL: [214, 1612],
  // Both arms lie along the body under the blanket. The arm on top of it is drawn by Sleeper.
  eL: [220, 1220],
  hL: [220, 1300],
  eR: [222, 1260],
  hR: [222, 1340],
  look: 0,
  smile: 0.15,
});

type Scene = "forge" | "pov" | "scroll" | "hot" | "away" | "again" | "rule" | "scrap" | "finale";
const CUTS: [number, Scene][] = [
  [0, "forge"],
  [T.compact - 2, "pov"],
  [T.read - 2, "scroll"],
  [T.work - 2, "hot"],
  [T.leave - 2, "away"],
  [T.again - 2, "again"],
  [T.rule - 2, "rule"],
  [T.done - 2, "scrap"],
  [T.follow - 2, "finale"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "forge");

// Where the stickman stands in each scene: shift from x=190, mirrored, and size. The forge scenes take their wall from the heat.
const PLACE: Record<Scene, { tx: number; flip?: boolean; size?: number; wall?: string }> = {
  forge: { tx: 0 },
  pov: { tx: 0 },
  scroll: { tx: 700, flip: true, wall: SCROLL_WALL },
  hot: { tx: 0 },
  away: { tx: 40, wall: NIGHT },
  again: { tx: 0 },
  rule: { tx: 350, size: 0.7, wall: PLANK },
  scrap: { tx: 700, flip: true, wall: SCRAP_WALL },
  finale: { tx: 0 },
};

// The frames the hammer lands on. It gets there LAND frames after its STRIKE key: the loose spring plus the trailing hand.
const LAND = 9;
const HITS = [T.hot, T.cheap, T.strike + 6];
const swing = (hit: number) => [
  { at: hit - 20, pose: RAISE },
  { at: hit - LAND, pose: STRIKE },
];

const POSES = [
  { at: 0, pose: SLUMP },
  { at: T.number - 2, pose: WINCE },
  { at: T.read - 2, pose: POINT },
  { at: T.all - 2, pose: SHRUG },
  { at: T.work - 2, pose: REST },
  ...swing(HITS[0]),
  ...swing(HITS[1]),
  { at: T.cheap + 14, pose: REST },
  // The yard scene draws Sleeper instead of this timeline, so the wince has settled by the cut back to the forge.
  { at: T.leave, pose: WINCE },
  { at: T.rule - 2, pose: POINT_UP },
  { at: T.notAfter - 2, pose: GUARD },
  { at: T.done - 2, pose: REST },
  { at: T.clear - 2, pose: TOSS },
  { at: T.nothing - 2, pose: SHRUG },
  { at: T.follow - 2, pose: WAVE },
  ...swing(HITS[2]),
  { at: T.isHot, pose: CHEER },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 7;
  const drag = Math.sin((frame - 6) / 19) * 10;
  return {
    ...body,
    head: [mid.head[0] + sway, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    hip: [body.hip[0] + sway * 0.2, body.hip[1]],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0] + drag, tip.hL[1] + Math.sin(frame / 11) * 5],
    hR: [tip.hR[0] + drag, tip.hR[1] + Math.cos(frame / 11) * 5],
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

const Apron: React.FC<{ pose: Pose }> = ({ pose }) => {
  const [sx, sy] = pose.sh;
  const dx = pose.hip[0] - sx;
  const dy = pose.hip[1] - sy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const [ax, ay] = [sx + dx * 0.18, sy + dy * 0.18];
  const [bx, by] = [sx + dx * 1.2, sy + dy * 1.2];
  return (
    <path
      d={`M${ax - nx * 26} ${ay - ny * 26} L${ax + nx * 26} ${ay + ny * 26} L${bx + nx * 46} ${by + ny * 46} L${bx - nx * 46} ${by - ny * 46}Z`}
      fill="#8a5a3a"
    />
  );
};

const Hammer: React.FC<{ pose: Pose }> = ({ pose }) => {
  const [hx, hy] = pose.hR;
  const angle = (Math.atan2(hy - pose.eR[1], hx - pose.eR[0]) * 180) / Math.PI;
  return (
    <g transform={`translate(${hx} ${hy}) rotate(${angle})`}>
      <rect x={-30} y={-9} width={170} height={18} rx={9} fill="#a9744a" />
      <rect x={102} y={-46} width={62} height={92} rx={10} fill={IRON} stroke={INK} strokeWidth={6} />
    </g>
  );
};

// A chat rolled up. fresh is the empty one a new session starts with.
const Roll: React.FC<{ x: number; y: number; angle?: number; fresh?: boolean }> = ({ x, y, angle = -20, fresh }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <rect x={-70} y={-24} width={140} height={48} rx={24} fill={fresh ? "#fffaf0" : PAPER} stroke={INK} strokeWidth={6} />
    {fresh ? null : <path d="M-40 -6 H30 M-40 8 H10" stroke="#6d6255" strokeWidth={6} strokeLinecap="round" />}
  </g>
);

const Sparks: React.FC<{ hit: number }> = ({ hit }) => {
  const t = useCurrentFrame() - hit;
  if (t < 0 || t > 10) return null;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI * (0.1 + i * 0.1);
        const r = 20 + t * 22;
        return (
          <path
            key={i}
            d={`M${450 + Math.cos(a) * r} ${1268 + Math.sin(a) * r} l${Math.cos(a) * 36} ${Math.sin(a) * 36}`}
            stroke={i % 2 ? AMBER : "#ffe9a8"}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={1 - t / 10}
          />
        );
      })}
    </g>
  );
};

const Tick: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path d={`M${x} ${y} l16 20 l34 -44`} fill="none" stroke={GREEN} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
);
const Cross: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <path d={`M${x} ${y - 24} l48 48 M${x + 48} ${y - 24} l-48 48`} stroke={RED} strokeWidth={14} strokeLinecap="round" />
);

// The stickman's own eyes: the screen up close, the keyboard and both arms.
const Pov: React.FC = () => {
  const frame = useCurrentFrame();
  const typing = frame >= T.compact && frame < T.chat - 6;
  const left = typing ? Math.abs(Math.sin(frame / 1.5)) * 30 : 0;
  const right = typing ? Math.abs(Math.cos(frame / 1.5)) * 30 : 0;
  const key = typing ? Math.floor(frame / 2) % 40 : -1;
  const chip = enter(frame - T.hours, BOUNCY);
  const arm = { stroke: CREAM, strokeWidth: 50, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      <rect x={-40} y={-40} width={1160} height={2000} fill="#0a0d12" />
      <rect x={50} y={690} width={980} height={770} rx={40} fill={IRON} />
      <rect x={66} y={706} width={948} height={738} rx={28} fill="#10151c" />
      <text x={104} y={784} fontSize={38} fill={AMBER} {...mono}>
        CLAUDE CODE
      </text>
      {/* The long chat above the prompt, drawn as lines: his on the right, the AI's on the left. */}
      {Array.from({ length: 9 }, (_, i) => {
        const mine = i % 3 === 0;
        const w = mine ? 240 + ((i * 37) % 120) : 480 + ((i * 53) % 260);
        return <rect key={i} x={mine ? 970 - w : 104} y={830 + i * 40} width={w} height={20} rx={10} fill={mine ? AMBER : CREAM} opacity={0.3} />;
      })}
      <text x={104} y={1250} fontSize={40} fill={CREAM} opacity={0.75} {...mono}>
        {`${fmt(TOKENS)} tokens in this chat`}
      </text>
      <text x={104} y={1372} fontSize={78} fill={CREAM} {...mono}>
        {`> ${typed("/compact", frame, T.compact, T.chat - 8)}${frame % 20 < 12 ? "_" : ""}`}
      </text>
      <g opacity={Math.min(chip, 1)} transform={`translate(700 906) scale(${0.6 + 0.4 * chip}) rotate(-4) translate(-700 -906)`}>
        <rect x={420} y={846} width={560} height={120} rx={20} fill={RED} />
        <text x={700} y={928} textAnchor="middle" fontSize={54} fill={INK} {...text}>
          LEFT 14 HOURS AGO
        </text>
      </g>
      <rect x={110} y={1500} width={860} height={280} rx={26} fill="#2a3038" />
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={138 + (i % 10) * 81}
          y={1524 + Math.floor(i / 10) * 60}
          width={66}
          height={46}
          rx={9}
          fill={i === key ? AMBER : "#454d58"}
        />
      ))}
      <path d={`M210 1960 Q280 1790 400 ${1650 - left}`} {...arm} />
      <path d={`M870 1960 Q800 1790 680 ${1650 - right}`} {...arm} />
    </g>
  );
};

// The whole chat as a scroll on the wall. A band reads it top to bottom while the count runs up.
const ChatScroll: React.FC = () => {
  const frame = useCurrentFrame();
  const u = interpolate(frame, [T.read, T.all + 16], [0, 1], CLAMP);
  const rows = 15;
  return (
    <g>
      <Backdrop wall={SCROLL_WALL} />
      <rect x={116} y={740} width={492} height={870} fill={PAPER} />
      <rect x={84} y={722} width={556} height={36} rx={18} fill="#8a5a3a" />
      {Array.from({ length: rows }, (_, i) => {
        const mine = i % 3 === 0;
        const w = mine ? 180 + ((i * 37) % 120) : 300 + ((i * 53) % 130);
        return (
          <rect
            key={i}
            x={mine ? 580 - w : 144}
            y={790 + i * 46}
            width={w}
            height={24}
            rx={12}
            fill={mine ? "#b7793f" : "#6d6255"}
            opacity={u * rows > i + 0.5 ? 1 : 0.35}
          />
        );
      })}
      <rect x={116} y={780 + u * (rows - 1) * 46} width={492} height={44} fill={AMBER} opacity={u < 1 ? 0.5 : 0} />
      <text x={362} y={1568} textAnchor="middle" fontSize={50} fill={INK} {...text}>
        {`${fmt(u * TOKENS)} TOKENS`}
      </text>
    </g>
  );
};

// The rule, as two boards: the same command with the cache hot, and with it cold.
const Boards: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Backdrop wall={PLANK} />
      {[
        { at: T.before, y: 730, heat: 1, state: "CACHE HOT", when: ["BEFORE", "YOU LEAVE"] },
        { at: T.notAfter, y: 960, heat: 0, state: "CACHE COLD", when: ["AFTER", "YOU'RE BACK"] },
      ].map((row) => {
        const s = enter(frame - row.at, BOUNCY);
        return (
          <g key={row.state} opacity={Math.min(s, 1)} transform={`translate(0 ${(s - 1) * 70})`}>
            <rect x={90} y={row.y} width={900} height={210} rx={22} fill="#6b4a2e" stroke={INK} strokeWidth={8} />
            <rect x={122} y={row.y + 30} width={330} height={84} rx={14} fill="#10151c" />
            <text x={144} y={row.y + 90} fontSize={56} fill={CREAM} {...mono}>
              /compact
            </text>
            <rect x={122} y={row.y + 136} width={150} height={44} rx={8} fill={barAt(row.heat)} stroke={INK} strokeWidth={6} />
            <text x={292} y={row.y + 172} fontSize={38} fill={row.heat ? AMBER : ICE} {...text}>
              {row.state}
            </text>
            <text x={690} y={row.y + 96} textAnchor="middle" fontSize={60} fill={CREAM} {...text}>
              {row.when[0]}
            </text>
            <text x={690} y={row.y + 156} textAnchor="middle" fontSize={40} fill={CREAM} opacity={0.8} {...text}>
              {row.when[1]}
            </text>
            {row.heat ? <Tick x={880} y={row.y + 100} /> : <Cross x={880} y={row.y + 105} />}
          </g>
        );
      })}
    </g>
  );
};

// /clear: the old chat goes in the scrap barrel and a fresh one takes its place.
const Scrap: React.FC = () => {
  const frame = useCurrentFrame();
  const fly = interpolate(frame, [T.clear + 4, T.clear + 18], [0, 1], CLAMP);
  const done = enter(frame - T.nothing, BOUNCY);
  return (
    <g>
      <Backdrop wall={SCRAP_WALL} />
      <rect x={90} y={760} width={540} height={170} rx={26} fill={IRON} />
      <rect x={104} y={774} width={512} height={142} rx={16} fill="#10151c" />
      <text x={136} y={872} fontSize={76} fill={CREAM} {...mono}>
        {`> ${typed("/clear", frame, T.clear - 4, T.clear + 6)}`}
      </text>
      <g opacity={Math.min(done, 1)}>
        <Tick x={530} y={846} />
      </g>
      {fly > 0 && fly < 1 ? (
        <Roll x={730 - fly * 445} y={1040 + fly * 330 - Math.sin(Math.PI * fly) * 130} angle={-20 - fly * 300} />
      ) : null}
      <g stroke={INK} strokeWidth={8}>
        <path d="M160 1390 H410 L392 1650 H178Z" fill="#6b4a2e" />
        <path d="M166 1470 H404 M174 1580 H396" fill="none" stroke={IRON} strokeWidth={16} />
      </g>
      <text x={285} y={1545} textAnchor="middle" fontSize={44} fill={CREAM} {...text}>
        SCRAP
      </text>
    </g>
  );
};

// He really sleeps: the head sinks into the pillow and the lids close, then one slow breath lifts the shoulder and the
// blanket, and the Zs leave on the breath out. When the forge goes cold he shivers and pulls the blanket closer.
const Sleeper: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - (T.leave - 2);
  const settle = enter(t, { damping: 14, stiffness: 90 });
  const breath = t < 14 ? 0 : (1 - Math.cos((2 * Math.PI * (t - 14)) / 64)) / 2;
  const chill = frame - T.cold;
  const shiver = chill >= 0 && chill < 18 ? Math.sin(chill * 2.4) * 3 * (1 - chill / 18) : 0;
  const tuck = Math.min(enter(chill - 4, { damping: 16, stiffness: 100 }), 1);
  const lift = (1 - settle) * 46;
  const pose: Pose = {
    ...ASLEEP,
    head: [ASLEEP.head[0] + lift + breath * 1.5, ASLEEP.head[1]],
    sh: [ASLEEP.sh[0] + lift * 0.3, ASLEEP.sh[1]],
    smile: interpolate(t, [0, 14], [0.5, 0.15], CLAMP),
  };
  // The blanket's outline, left to right: shoulder, waist, hip, then down the legs. The feet stick out.
  const shoulder = 1546 - breath * 10 - lift * 0.3;
  const waist = 1576 - breath * 6;
  const hip = 1556 - breath * 3;
  const edge = 246 - tuck * 14;
  const hand = [470 - tuck * 90, 1590 - breath * 4 - tuck * 16];
  return (
    <g transform={`translate(${shiver} 0)`}>
      <rect x={40} y={1640} width={740} height={18} rx={9} fill="#3d3226" />
      <ellipse cx={150} cy={1612} rx={150} ry={50 - settle * 8} fill="#d9cdb4" />
      {/* Straight limbs here: the bendy curves loop when the pose lies down. */}
      <g transform="translate(570 0) rotate(-90 190 1650)">
        <Stickman pose={pose} thumb={0} headFill={NIGHT} eyes={interpolate(t, [3, 13], [0.55, 0], CLAMP)} />
      </g>
      {/* His apron as the blanket, pulled up to the chin. */}
      <path
        d={`M${edge} 1650 V1610 Q${edge + 30} ${shoulder + 8} 330 ${shoulder} Q372 ${shoulder + 2} 410 ${waist} Q455 ${hip - 10} 500 ${hip} Q600 ${hip + 8} 688 1606 L694 1650Z`}
        fill="#8a5a3a"
      />
      <path
        d={`M${edge} 1612 Q${edge + 30} ${shoulder + 8} 330 ${shoulder} Q372 ${shoulder + 2} 410 ${waist}`}
        fill="none"
        stroke="#a9744a"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* The arm that rests on top of the blanket. */}
      <path
        d={`M322 ${shoulder + 12} Q${(322 + hand[0]) / 2 + 20} ${shoulder + 4} ${hand[0]} ${hand[1]}`}
        fill="none"
        stroke={CREAM}
        strokeWidth={20}
        strokeLinecap="round"
      />
      {[0, 1, 2].map((i) => {
        const z = (t - 46 - i * 9) / 34;
        if (z < 0 || z > 1) return null;
        return (
          <text key={i} x={240 + z * 70 + i * 34} y={1450 - z * 150} fontSize={40 + z * 34} fill={CREAM} opacity={Math.sin(Math.PI * z)} {...text}>
            Z
          </text>
        );
      })}
    </g>
  );
};

const Soundtrack: React.FC = () => (
  <>
    {/* The take measures 1.7 dB under the superpowers voice, so it plays at 1.2 like the leaks voice. */}
    <Audio src={staticFile(VOICE.file)} volume={1.2} />
    <Audio
      src={staticFile("sfx/bgm-compact.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    {spread(4, T.number - 6, 3).map((from, i) => (
      <Sfx key={from} name={`key${i}`} from={from} volume={0.3} />
    ))}
    <Sfx name="impact" from={T.number} volume={0.5} />
    <Sfx name="whoosh" from={T.compact - 4} volume={0.28} />
    {spread(T.compact, T.chat - 8, 4).map((from, i) => (
      <Sfx key={from} name={`key${(i + 1) % 4}`} from={from} volume={0.44} />
    ))}
    <Sfx name="pop" from={T.hours} volume={0.4} />
    <Sfx name="paper" from={T.read} volume={0.4} />
    <Sfx name="click" from={T.all} volume={0.45} />
    {/* The hammer on the iron: a thud with a ring on top. */}
    {HITS.flatMap((hit, i) => [
      <Sfx key={`thud${hit}`} name={`thud${i + 1}`} from={hit} volume={0.5} />,
      <Sfx key={`ring${hit}`} name="ding" from={hit} volume={0.28} />,
    ])}
    <Sfx name="crickets" from={T.leave + 4} volume={0.28} />
    <Sfx name="crickets" from={T.leave + 52} volume={0.22} />
    <Sfx name="impact" from={T.again} volume={0.45} />
    <Sfx name="error" from={T.again + 8} volume={0.22} />
    <Sfx name="check" from={T.before + 4} volume={0.45} />
    <Sfx name="stamp" from={T.notAfter + 2} volume={0.4} />
    {spread(T.clear - 4, T.clear + 6, 2).map((from, i) => (
      <Sfx key={from} name={`key${i + 2}`} from={from} volume={0.44} />
    ))}
    <Sfx name="whoosh" from={T.clear + 4} volume={0.3} />
    <Sfx name="thud0" from={T.clear + 18} volume={0.45} />
    <Sfx name="sparkle" from={T.nothing} volume={0.34} />
    <Sfx name="pop" from={T.follow} volume={0.35} />
    <Sfx name="impact" from={HITS[2]} volume={0.4} />
    <Sfx name="chime" from={T.isHot + 6} volume={0.42} />
  </>
);

// A blink now and then, so the face is alive between poses.
const blink = (frame: number) => {
  const p = (frame + 31) % 83;
  return p < 2 ? 0.4 : p < 5 ? 0 : p < 7 ? 0.5 : 1;
};

const PUNCHES = CUTS.map(([from]) => from);
const SHAKES = [T.number, T.again, HITS[2]];

export const CompactVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const place = PLACE[scene];
  const smithy = scene === "forge" || scene === "hot" || scene === "again" || scene === "finale";
  // The last frames go cold again, so the video loops into its first frame.
  const heat = scene === "hot" || (scene === "finale" && frame < END - 7) ? 1 : 0;
  const pose = animatePose(frame);
  // Tired, half-closed eyes until the number lands.
  const eyes = Math.min(blink(frame), frame < T.number - 4 ? 0.6 : 1);
  const jump = hop(frame, T.isHot, 14, 80);
  const size = place.size ?? 1;
  const leaving = interpolate(frame, [T.leave, T.again], [0, 1], CLAMP);
  const count =
    scene === "again"
      ? interpolate(frame, [T.again, T.rule - 10], [0, TOKENS], CLAMP)
      : interpolate(frame, [2, T.number], [0, TOKENS], CLAMP);
  const held = scene === "scrap" && (frame < T.clear + 4 || frame >= T.nothing);

  return (
    <AbsoluteFill style={{ backgroundColor: wallAt(0) }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {/* The cold-again shot is a close-up of the anvil. */}
          <g transform={scene === "again" ? "translate(380 1400) scale(1.2) translate(-380 -1400)" : undefined}>
            {smithy ? (
              <>
                <Forge heat={heat} />
                <Slab
                  heat={heat}
                  label={heat ? "CACHED" : fmt(count)}
                  ink={scene === "again" ? "#8a1f14" : undefined}
                  frost={scene === "again"}
                  pop={scene === "forge" ? 1 + 0.14 * (1 - enter(frame - T.number, BOUNCY)) : 1}
                />
                {HITS.map((hit) => (
                  <Sparks key={hit} hit={hit} />
                ))}
              </>
            ) : null}
            {scene === "pov" ? <Pov /> : null}
            {scene === "scroll" ? <ChatScroll /> : null}
            {scene === "away" ? (
              <>
                <Yard heat={interpolate(frame, [T.goes, T.cold + 8], [1, 0], CLAMP)} moon={leaving} />
                <Sleeper />
              </>
            ) : null}
            {scene === "rule" ? <Boards /> : null}
            {scene === "scrap" ? <Scrap /> : null}
            {scene === "pov" || scene === "away" ? null : (
              <g
                transform={`translate(${place.tx} ${jump.dy}) translate(190 1650) scale(${(place.flip ? -1 : 1) * size * (2 - jump.sy)} ${size * jump.sy}) translate(-190 -1650)`}
              >
                <Apron pose={pose} />
                <Stickman pose={pose} thumb={0} headFill={place.wall ?? wallAt(heat)} bendy eyes={eyes} />
                {smithy ? <Hammer pose={pose} /> : null}
                {held ? <Roll x={pose.hR[0]} y={pose.hR[1]} fresh={frame >= T.nothing} /> : null}
              </g>
            )}
          </g>
        </g>
      </svg>

      <Caption
        plain
        from={0}
        to={T.compact - 2}
        lines={[
          { text: "ONE COMMAND RE-READ", at: -16, size: 76 },
          { text: "348,408", at: T.number - 2, size: 176, boxes: { "348,408": RED } },
          { text: "TOKENS", at: T.number + 8, size: 108 },
        ]}
      />
      <Caption
        plain
        from={T.compact - 4}
        to={T.read - 2}
        lines={[
          { text: "/compact", at: T.compact - 4, size: 150, color: AMBER },
          { text: "ON A CHAT I LEFT", at: T.chat, size: 86 },
          { text: "14 HOURS AGO", at: T.hours, size: 112, boxes: { "14": RED, HOURS: RED } },
        ]}
      />
      <Caption
        plain
        from={T.read - 4}
        to={T.work - 2}
        lines={[
          { text: "TO SUMMARIZE YOUR CHAT", at: T.read - 4, size: 66 },
          { text: "IT HAS TO READ", at: T.hasTo, size: 96 },
          { text: "ALL OF IT", at: T.all, size: 136, boxes: { ALL: AMBER, OF: AMBER, IT: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.work - 4}
        to={T.leave - 2}
        lines={[
          { text: "WHILE YOU WORK", at: T.work - 4, size: 88 },
          { text: "THAT CHAT IS CACHED", at: T.cached, size: 68, boxes: { CACHED: GREEN } },
          { text: "HOT.", at: T.hot, size: 116, boxes: { "HOT.": AMBER } },
          { text: "CHEAP TO READ", at: T.cheap, size: 88, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.leave - 4}
        to={T.again - 2}
        lines={[
          { text: "LEAVE IT FOR HOURS", at: T.leave - 4, size: 78 },
          { text: "THE CACHE GOES", at: T.goes, size: 88 },
          { text: "COLD", at: T.cold, size: 156, boxes: { COLD: ICE } },
        ]}
      />
      <Caption
        plain
        from={T.again - 4}
        to={T.rule - 2}
        lines={[
          { text: "IT PROCESSES", at: T.again - 4, size: 100 },
          { text: "EVERYTHING AGAIN", at: T.again + 14, size: 82, boxes: { AGAIN: RED } },
        ]}
      />
      <Caption
        plain
        from={T.rule - 4}
        to={T.done - 2}
        lines={[
          { text: "SO COMPACT", at: T.rule - 4, size: 110, boxes: { COMPACT: AMBER } },
          { text: "BEFORE YOU WALK AWAY", at: T.before, size: 70, color: GREEN },
          { text: "NOT AFTER", at: T.notAfter, size: 116, boxes: { NOT: RED, AFTER: RED } },
        ]}
      />
      <Caption
        plain
        from={T.done - 4}
        to={T.follow - 2}
        lines={[
          { text: "DONE WITH THAT CHAT?", at: T.done - 4, size: 70 },
          { text: "/clear", at: T.clear, size: 150, color: AMBER },
          { text: "COSTS NOTHING", at: T.nothing, size: 96, boxes: { COSTS: GREEN, NOTHING: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.follow - 4}
        to={END + 1}
        lines={[
          { text: "FOLLOW STICKMAN SHIPS", at: T.follow - 4, size: 66, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "STRIKE WHILE", at: T.strike, size: 104 },
          { text: "THE CACHE IS HOT", at: T.strike + 20, size: 84, boxes: { HOT: AMBER } },
        ]}
      />
    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, so the owner can check every scene before a full render.
const SHOTS: [string, number][] = [
  ["1 FORGE, FIRST FRAME", 0],
  ["2 FORGE, THE NUMBER", T.number + 16],
  ["3 HIS VIEW, /compact", T.chat - 2],
  ["4 HIS VIEW, 14 HOURS", T.hours + 18],
  ["5 SCROLL, READING", T.hasTo + 14],
  ["6 SCROLL, ALL OF IT", T.all + 20],
  ["7 HOT, WHILE YOU WORK", T.cached + 16],
  ["8 HOT, STRIKE", HITS[0] + 1],
  ["9 HOT, CHEAP", T.cheap + 18],
  ["10 YARD, LYING DOWN", T.leave + 4],
  ["11 YARD, ASLEEP", T.leave + 44],
  ["11B YARD, COLD", T.cold + 12],
  ["12 COLD AGAIN, CLOSE-UP", T.again + 30],
  ["13 RULE, BEFORE", T.before + 20],
  ["14 RULE, NOT AFTER", T.notAfter + 18],
  ["15 SCRAP, DONE?", T.done + 20],
  ["16 SCRAP, THROW", T.clear + 11],
  ["17 SCRAP, COSTS NOTHING", T.nothing + 18],
  ["18 FINALE, FOLLOW", T.follow + 18],
  ["19 FINALE, STRIKE", HITS[2] + 1],
  ["20 FINALE, HOT", T.isHot + 18],
  ["21 LAST FRAMES, LOOP", END - 3],
];

const Frames: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div style={{ position: "absolute", width: 1080, height: 1920, overflow: "hidden", transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Freeze frame={shot}>
            <CompactVideo />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s (Roger)`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const CompactComposition = () => (
  <>
    <Composition id="CompactTutorial" component={CompactVideo} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition
      id="CompactFrames"
      component={Frames}
      defaultProps={{ from: 0 }}
      durationInFrames={END}
      fps={FPS}
      width={1620}
      height={2020}
    />
  </>
);
