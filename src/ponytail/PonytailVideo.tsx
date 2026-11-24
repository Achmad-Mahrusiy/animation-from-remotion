import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  CLAMP,
  Caption,
  Magnifier,
  Sfx,
  cameraTransform,
  enter,
} from "../Composition";
import { Panel } from "../Screens";
import {
  SIT,
  SIT_SCRATCH,
  Stickman,
  blendPoses,
  type Pose,
} from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import { BASEMENT_WALL, Basement } from "./Basement";

const VOICE_SECONDS = 54.204063;
const VIDEO_SECONDS = 50;
const VOICE_RATE = VOICE_SECONDS / VIDEO_SECONDS;
const END = VIDEO_SECONDS * FPS;
// shortcut: pause-detected voice timings, re-measure if the voice file changes.
const at = (voiceSecond: number) =>
  Math.round((voiceSecond / VOICE_RATE) * FPS);

const T = {
  lines: at(2.64),
  withPonytail: at(5.48),
  lazyDev: at(6.54),
  ten: at(8.4),
  how: at(9.73),
  read: at(10.61),
  ladder: at(13.18),
  onlyThen: at(23.86),
  minimum: at(24.94),
  lazy: at(26.68),
  notCareless: at(27.7),
  neverCut: at(33.07),
  test: at(34.17),
  level: at(36.93),
  lite: at(37.92),
  full: at(38.49),
  ultra: at(39.05),
  review: at(40.04),
  audit: at(42.34),
  debt: at(45.05),
  install: at(48.22),
  never: at(51.25),
  zero: at(52.73),
};

const RUNGS = [
  { label: "NEED IT?", question: "DOES THIS NEED TO EXIST?", at: at(14.74) },
  { label: "IN YOUR CODE?", question: "ALREADY IN YOUR CODE?", at: at(17.25) },
  { label: "STANDARD LIB?", question: "STANDARD LIBRARY?", at: at(18.9) },
  { label: "PLATFORM?", question: "PLATFORM FEATURE?", at: at(20.19) },
  { label: "PACKAGE?", question: "INSTALLED PACKAGE?", at: at(21.46) },
  { label: "ONE LINE?", question: "ONE LINE?", at: at(22.77) },
  { label: "MINIMUM", question: "ONLY THEN,", at: T.onlyThen },
];

const LOCKS = [
  { label: "VALIDATION", x: 300, y: 720, at: at(29.19) },
  { label: "ERRORS", x: 680, y: 720, at: at(30.18) },
  { label: "SECURITY", x: 300, y: 1075, at: at(31.05) },
  { label: "ACCESS", x: 680, y: 1075, at: at(31.9) },
];

const rungY = (i: number) => 1560 - i * 125;
const text = { fontFamily, fontWeight: 900 } as const;

const STAND: Pose = {
  head: [310, 1040],
  sh: [300, 1130],
  hip: [300, 1370],
  eL: [370, 1210],
  hL: [400, 1150],
  eR: [370, 1130],
  hR: [400, 1040],
  kL: [270, 1510],
  fL: [260, 1650],
  kR: [330, 1510],
  fR: [340, 1650],
  look: 1,
  smile: 1,
};
const READ: Pose = {
  ...STAND,
  head: [335, 1040],
  sh: [320, 1130],
  eL: [260, 1240],
  hL: [290, 1340],
  eR: [400, 1130],
  hR: [420, 1060],
  smile: 0,
};
const ARMS_CROSSED: Pose = {
  ...STAND,
  eL: [230, 1240],
  hL: [335, 1250],
  eR: [370, 1240],
  hR: [265, 1250],
  smile: 0.4,
};
const LISTEN: Pose = { ...SIT, head: [240, 1005], look: 0, smile: 0.2 };
const GRIN: Pose = { ...LISTEN, smile: 1.5 };
const WHISPERER: Pose = {
  head: [405, 1000],
  sh: [410, 1125],
  hip: [425, 1370],
  eL: [335, 1135],
  hL: [335, 1068],
  eR: [480, 1230],
  hR: [450, 1320],
  kL: [405, 1510],
  fL: [385, 1650],
  kR: [455, 1510],
  fR: [475, 1650],
  look: -1,
  smile: 0.3,
};
const FEET_UP: Pose = {
  ...SIT,
  head: [215, 1000],
  sh: [195, 1100],
  hip: [190, 1375],
  kL: [350, 1290],
  fL: [480, 1270],
  kR: [340, 1300],
  fR: [460, 1270],
  eL: [110, 1240],
  hL: [170, 1330],
  eR: [295, 1180],
  hR: [290, 1075],
  smile: 1.4,
};

const POSES = [
  { at: 0, pose: SIT },
  { at: T.lines, pose: SIT_SCRATCH },
  { at: T.withPonytail - 4, pose: LISTEN },
  { at: T.ten - 4, pose: GRIN },
  { at: T.how, pose: SIT },
  { at: T.read - 8, pose: READ },
  { at: T.ladder, pose: STAND },
  { at: T.lazy, pose: ARMS_CROSSED },
  { at: T.install, pose: SIT },
  { at: T.never, pose: FEET_UP },
];

type Place = { fx: number; fy: number; s: number };
const HOME: Place = { fx: 300, fy: 1650, s: 1 };
const PLACES: (Place & { at: number })[] = [
  { at: 0, ...HOME },
  { at: T.ladder, fx: 300, fy: rungY(0), s: 0.42 },
  ...RUNGS.slice(1).map((rung, i) => ({
    at: rung.at,
    fx: 300,
    fy: rungY(i + 1),
    s: 0.42,
  })),
  { at: T.lazy, fx: 165, fy: 1610, s: 0.55 },
  { at: T.install, ...HOME },
];

const placeAt = (frame: number): Place =>
  PLACES.slice(1).reduce<Place>(
    (p, key) => {
      const t = enter(frame - key.at, { damping: 15, stiffness: 150 });
      return {
        fx: p.fx + (key.fx - p.fx) * t,
        fy: p.fy + (key.fy - p.fy) * t,
        s: p.s + (key.s - p.s) * t,
      };
    },
    { fx: PLACES[0].fx, fy: PLACES[0].fy, s: PLACES[0].s },
  );

const animatePose = (frame: number): Pose => {
  const pose = blendPoses(frame, POSES);
  const breathe = Math.sin(frame / 14) * 3;
  const p: Pose = {
    ...pose,
    head: [pose.head[0], pose.head[1] + breathe],
    sh: [pose.sh[0], pose.sh[1] + breathe * 0.6],
  };
  if (frame >= T.lines + 8 && frame < T.withPonytail) {
    p.hR = [p.hR[0] + Math.sin(frame / 1.8) * 10, p.hR[1]];
  }
  if (frame >= T.install + 8 && frame < T.never) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 18];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 18];
  }
  return p;
};

const SX = 470;
const SY = 905;
const SW = 400;

const CrtScreens: React.FC = () => {
  const frame = useCurrentFrame();
  const count =
    frame < T.ten
      ? Math.round(interpolate(frame, [15, T.lines + 8], [0, 335], CLAMP))
      : 10;
  const color = frame < T.ten ? RED : GREEN;
  const progress = interpolate(
    frame,
    [T.install + 6, T.never - 14],
    [0, 1],
    CLAMP,
  );
  const scan = ((frame - T.read) * 9) % 280;

  return (
    <g>
      <Panel from={0} to={T.how}>
        <text x={SX + SW / 2} y={SY + 170} textAnchor="middle" fontSize={140} fill={color} {...text}>
          {count}
        </text>
        <text x={SX + SW / 2} y={SY + 250} textAnchor="middle" fontSize={58} fill={color} {...text}>
          LINES
        </text>
      </Panel>
      <Panel from={T.how} to={T.ladder + 8}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={SX + 30 + (i % 3) * 22}
            y={SY + 26 + i * 44}
            width={[250, 190, 300, 210, 280, 170][i]}
            height={20}
            rx={10}
            fill={GREEN}
            opacity={0.7}
          />
        ))}
        <rect x={SX} y={SY + scan} width={SW} height={10} fill={AMBER} opacity={0.75} />
      </Panel>
      <Panel from={T.install} to={T.never}>
        <text x={SX + SW / 2} y={SY + 120} textAnchor="middle" fontSize={52} fill={AMBER} {...text}>
          INSTALLING
        </text>
        <rect x={SX + 40} y={SY + 170} width={SW - 80} height={36} rx={18} fill="#2a3429" />
        <rect
          x={SX + 40}
          y={SY + 170}
          width={(SW - 80) * progress}
          height={36}
          rx={18}
          fill={GREEN}
        />
      </Panel>
      <Panel from={T.never} to={END + 1}>
        <text x={SX + SW / 2} y={SY + 170} textAnchor="middle" fontSize={84} fill={GREEN} {...text}>
          0 BUGS
        </text>
      </Panel>
    </g>
  );
};

const Robot: React.FC = () => {
  const frame = useCurrentFrame();
  const printing = frame >= T.lines - 12 && frame < T.ten;
  const jitter = printing ? Math.sin(frame * 1.7) * 5 : 0;
  const sad = enter(frame - T.ten);
  const opacity = interpolate(frame, [T.ladder, T.ladder + 10], [1, 0], CLAMP);
  const pileIn = interpolate(frame, [T.lines - 12, T.withPonytail], [0, 1], CLAMP);
  const pileH = 18 + 300 * pileIn * (1 - Math.min(enter(frame - T.ten), 1));
  const sheets = Array.from({ length: 14 }, (_, i) => T.lines - 12 + i * 7);

  return (
    <g opacity={opacity}>
      <rect x={560} y={1650 - pileH} width={190} height={pileH} rx={4} fill="#ece4d3" />
      {Array.from({ length: Math.floor(pileH / 34) }, (_, i) => (
        <rect key={i} x={560} y={1640 - i * 34} width={190} height={5} fill="#b7ad98" />
      ))}
      {sheets.map((start) => {
        const t = (frame - start) / 12;
        if (t < 0 || t > 1 || frame >= T.ten) return null;
        return (
          <rect
            key={start}
            x={790 - t * 150}
            y={1500 - Math.sin(t * Math.PI) * 90 + t * 60}
            width={92}
            height={60}
            fill="#f3ecdd"
            transform={`rotate(${t * -40} ${790 - t * 150} ${1500 + t * 60})`}
          />
        );
      })}
      <g transform={`translate(${jitter} 0)`}>
        <path d="M900 1412 V1370" stroke={CREAM} strokeWidth={10} />
        <circle cx={900} cy={1362} r={16} fill={printing ? RED : GREEN} />
        <rect x={790} y={1412} width={220} height={150} rx={22} fill="#6b7a80" />
        <circle cx={860} cy={1472} r={22} fill="#11181c" />
        <circle cx={940} cy={1472} r={22} fill="#11181c" />
        <path
          d={`M860 ${1528 + sad * 10} Q900 ${1528 + (1 - sad) * 22 - sad * 12} 940 ${1528 + sad * 10}`}
          fill="none"
          stroke="#11181c"
          strokeWidth={10}
          strokeLinecap="round"
        />
        <rect x={820} y={1562} width={160} height={88} rx={10} fill="#53626a" />
        <rect x={780} y={1490} width={20} height={60} fill="#11181c" />
      </g>
    </g>
  );
};

const WHISPER_IN = T.withPonytail - 16;
const WHISPER_OUT = at(9.15);

const Whisperer: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < WHISPER_IN || frame > WHISPER_OUT + 30) return null;
  const walk = { damping: 18, stiffness: 95 };
  const offset =
    (1 - enter(frame - WHISPER_IN, walk)) * 800 +
    enter(frame - WHISPER_OUT, walk) * 800;
  const walking = frame < WHISPER_IN + 22 || frame >= WHISPER_OUT;
  const swing = walking ? Math.sin(frame / 2) * 30 : 0;
  const bob = Math.sin(frame / 3) * 3;
  const pose: Pose = {
    ...WHISPERER,
    head: [WHISPERER.head[0], WHISPERER.head[1] + bob],
    kL: [WHISPERER.kL[0] + swing, WHISPERER.kL[1]],
    fL: [WHISPERER.fL[0] + swing * 1.8, WHISPERER.fL[1]],
    kR: [WHISPERER.kR[0] - swing, WHISPERER.kR[1]],
    fR: [WHISPERER.fR[0] - swing * 1.8, WHISPERER.fR[1]],
  };
  const psst = walking ? 0 : 0.75 + Math.sin(frame / 4) * 0.25;

  return (
    <g transform={`translate(${offset} 0)`}>
      <Stickman pose={pose} thumb={0} headFill={BASEMENT_WALL} />
      <path
        d={`M335 1068 Q320 1040 330 1006`}
        fill="none"
        stroke={CREAM}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <text
        x={378}
        y={900}
        textAnchor="middle"
        fontSize={46}
        fill={AMBER}
        opacity={psst}
        {...text}
      >
        PSST
      </text>
    </g>
  );
};

const Ladder: React.FC = () => {
  const frame = useCurrentFrame();
  const s = enter(frame - T.ladder, { damping: 15, stiffness: 120 });
  const exit = interpolate(frame, [T.lazy - 8, T.lazy], [1, 0], CLAMP);
  if (frame < T.ladder || frame >= T.lazy) return null;

  return (
    <g opacity={Math.min(s, 1) * exit} transform={`translate(0 ${(1 - s) * 900})`}>
      <rect x={362} y={690} width={18} height={960} fill="#7d5c3f" />
      <rect x={1020} y={690} width={18} height={960} fill="#7d5c3f" />
      {RUNGS.map((rung, i) => {
        const y = rungY(i);
        const reached = frame >= rung.at;
        const next = RUNGS[i + 1]?.at ?? Infinity;
        const passed = frame >= next;
        const current = reached && !passed;
        const last = i === RUNGS.length - 1;
        const fill = current ? (last ? GREEN : AMBER) : passed ? "#3a312c" : "#55483f";
        return (
          <g key={rung.label}>
            <rect x={235} y={y - 5} width={140} height={10} fill="#7d5c3f" />
            <rect x={380} y={y - 84} width={640} height={84} fill={fill} />
            <text
              x={420}
              y={y - 26}
              fontSize={48}
              fill={current ? "#11181c" : CREAM}
              opacity={passed ? 0.55 : 1}
              {...text}
            >
              {rung.label}
            </text>
            {passed ? (
              <path
                d={`M950 ${y - 62} l40 40 M990 ${y - 62} l-40 40`}
                stroke={RED}
                strokeWidth={12}
                strokeLinecap="round"
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const Locks: React.FC = () => {
  const frame = useCurrentFrame();
  const test = enter(frame - T.test);
  if (frame < T.lazy || frame >= T.level) return null;
  const exit = interpolate(frame, [T.level - 8, T.level], [1, 0], CLAMP);
  const inS = enter(frame - T.lazy);

  return (
    <g opacity={Math.min(exit, inS, 1)}>
      {LOCKS.map((lock) => {
        const s = enter(frame - lock.at, { damping: 12, stiffness: 170 });
        const locked = frame >= lock.at;
        return (
          <g key={lock.label}>
            <rect x={lock.x} y={lock.y} width={360} height={335} rx={18} fill="#1d1a18" />
            <path
              d={`M${lock.x + 125} ${lock.y + 145 - (1 - s) * 44} V${lock.y + 95 - (1 - s) * 44} a55 55 0 0 1 110 0 V${lock.y + 145 - (1 - s) * 44}`}
              fill="none"
              stroke={locked ? AMBER : "#6d6358"}
              strokeWidth={22}
            />
            <rect
              x={lock.x + 90}
              y={lock.y + 130}
              width={180}
              height={110}
              rx={14}
              fill={locked ? AMBER : "#6d6358"}
            />
            <circle cx={lock.x + 180} cy={lock.y + 180} r={15} fill="#11181c" />
            <text
              x={lock.x + 180}
              y={lock.y + 298}
              textAnchor="middle"
              fontSize={46}
              fill={CREAM}
              {...text}
            >
              {lock.label}
            </text>
          </g>
        );
      })}
      <g
        opacity={Math.min(test, 1)}
        transform={`translate(0 ${(1 - test) * 60})`}
      >
        <rect x={300} y={1430} width={740} height={130} rx={18} fill={GREEN} />
        <path
          d="M350 1496 l28 32 l54 -70"
          fill="none"
          stroke="#10231a"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={470} y={1518} fontSize={60} fill="#10231a" {...text}>
          ONE SMALL TEST
        </text>
      </g>
    </g>
  );
};

type Row = { text: string; color: string; at: number };

const Rows: React.FC<{ rows: Row[]; fontSize: number }> = ({
  rows,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const step = 688 / rows.length;
  const height = step - 16;
  return (
    <g>
      {rows.map((row, i) => {
        const s = enter(frame - row.at, { damping: 13, stiffness: 170 });
        const y = 766 + i * step;
        return (
          <g
            key={row.text}
            opacity={Math.min(s, 1)}
            transform={`translate(${(1 - s) * -60} 0)`}
          >
            <rect x={338} y={y} width={664} height={height} rx={12} fill="#2a2522" />
            <circle cx={384} cy={y + height / 2} r={20} fill={row.color} />
            <text
              x={424}
              y={y + height / 2 + fontSize * 0.36}
              fontSize={fontSize}
              fill={CREAM}
              {...text}
            >
              {row.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const stagger = (from: number, items: [string, string][]): Row[] =>
  items.map(([label, color], i) => ({
    text: label,
    color,
    at: from + 6 + i * 7,
  }));

const BigCrt: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.level || frame >= T.install) return null;
  const s = enter(frame - T.level);
  const exit = interpolate(frame, [T.install - 8, T.install], [1, 0], CLAMP);

  return (
    <g opacity={Math.min(exit, s, 1)} transform={`translate(0 ${(1 - s) * 160})`}>
      <rect x={300} y={720} width={740} height={780} rx={34} fill="#c9bda4" />
      <rect x={326} y={746} width={688} height={728} rx={22} fill="#10160f" />
      <Panel from={T.level} to={T.review}>
        <Rows
          fontSize={100}
          rows={[
            { text: "LITE", color: GREEN, at: T.lite },
            { text: "FULL", color: AMBER, at: T.full },
            { text: "ULTRA", color: RED, at: T.ultra },
          ]}
        />
      </Panel>
      <Panel from={T.review} to={T.audit}>
        <Rows
          fontSize={56}
          rows={stagger(T.review, [
            ["BUGS", GREEN],
            ["SECURITY", GREEN],
            ["REAL LOAD", GREEN],
            ["MISSING TESTS", GREEN],
            ["SPEED", GREEN],
            ["WHAT TO CUT", GREEN],
          ])}
        />
      </Panel>
      <Panel from={T.audit} to={T.debt}>
        <Rows
          fontSize={66}
          rows={stagger(T.audit, [
            ["1. MUST FIX", RED],
            ["2. MUST FIX", RED],
            ["3. SHOULD FIX", AMBER],
            ["4. NICE TO HAVE", GREEN],
          ])}
        />
      </Panel>
      <Panel from={T.debt} to={T.install}>
        <Rows
          fontSize={50}
          rows={stagger(T.debt, [
            ["SHORTCUT: NO RETRY", AMBER],
            ["SHORTCUT: ONE USER", AMBER],
            ["SHORTCUT: NO QUEUE", AMBER],
          ])}
        />
      </Panel>
    </g>
  );
};

const PUNCHES = [
  0,
  T.withPonytail,
  T.how,
  T.ladder,
  T.lazy,
  T.level,
  T.review,
  T.audit,
  T.debt,
  T.install,
  T.never,
];
const SHAKES = [T.lines, T.ten, ...LOCKS.map((l) => l.at), T.neverCut, T.zero];

const PAPERS = Array.from({ length: 10 }, (_, i) => T.lines - 12 + i * 7);
const WHOOSHES = [T.withPonytail, T.how, T.ladder, T.lazy, T.level, T.review, T.audit, T.debt, T.install, T.never];
const KEY_TAPS = Array.from({ length: 12 }, (_, i) => T.install + 8 + i * 4);

const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice-ponytail.mp3")} playbackRate={VOICE_RATE} />
    <Audio
      src={staticFile("sfx/bgm-ponytail.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.16, 0.16, 0], CLAMP)}
    />
    <Sfx name="impact" from={0} volume={0.5} />
    <Sfx name="womp" from={T.lines} volume={0.4} />
    {PAPERS.map((from) => (
      <Sfx key={from} name="paper" from={from} volume={0.24} />
    ))}
    <Sfx name="sweep" from={T.ten - 22} volume={0.3} />
    <Sfx name="sparkle" from={T.ten} volume={0.42} />
    {WHOOSHES.map((from) => (
      <Sfx key={from} name="whoosh" from={from} volume={0.28} />
    ))}
    {RUNGS.slice(0, -1).map((rung, i) => (
      <Sfx key={rung.label} name={`thud${Math.min(i, 3)}`} from={rung.at + 4} volume={0.42} />
    ))}
    <Sfx name="ding" from={T.onlyThen + 4} volume={0.44} />
    {LOCKS.map((lock) => (
      <Sfx key={lock.label} name="stamp" from={lock.at} volume={0.5} />
    ))}
    <Sfx name="impact" from={T.neverCut} volume={0.36} />
    <Sfx name="check" from={T.test} />
    {[T.lite, T.full, T.ultra].map((from) => (
      <Sfx key={from} name="pop" from={from} volume={0.5} />
    ))}
    {[T.review, T.audit, T.debt].map((from) => (
      <Sfx key={from} name="click" from={from} volume={0.55} />
    ))}
    {KEY_TAPS.map((from, i) => (
      <Sfx key={from} name={`key${i % 4}`} from={from} volume={0.45} />
    ))}
    <Sfx name="ding" from={T.never - 12} volume={0.36} />
    <Sfx name="chime" from={T.zero} volume={0.42} />
  </>
);

export const PonytailVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = animatePose(frame);
  const place = placeAt(frame);
  const dim = interpolate(
    frame,
    [T.ladder, T.ladder + 10, T.install - 8, T.install],
    [0, 0.68, 0.68, 0],
    CLAMP,
  );
  const magnifier = Math.min(
    enter(frame - T.read),
    interpolate(frame, [T.ladder - 6, T.ladder], [1, 0], CLAMP),
    1,
  );
  const mug = Math.min(enter(frame - T.never - 6), 1);

  return (
    <AbsoluteFill style={{ backgroundColor: BASEMENT_WALL }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          <Basement />
          <CrtScreens />
          <Robot />
          <rect x={-40} y={-40} width={1160} height={2000} fill="#0b0908" opacity={dim} />
          <Ladder />
          <Locks />
          <BigCrt />
          <g transform={`translate(${place.fx} ${place.fy}) scale(${place.s}) translate(-300 -1650)`}>
            <Stickman pose={pose} thumb={0} ponytail headFill={BASEMENT_WALL} />
            <Magnifier hand={pose.hR} opacity={magnifier} />
            {mug > 0 ? (
              <rect
                x={pose.hR[0] - 6}
                y={pose.hR[1] - 40}
                width={58}
                height={58}
                rx={8}
                fill="#b6533f"
                opacity={mug}
              />
            ) : null}
          </g>
          <Whisperer />
        </g>
      </svg>

      <Caption
        from={0}
        to={T.withPonytail - 2}
        lines={[
          { text: "YOU ASK AI FOR A", at: 2, size: 84 },
          { text: "DATE PICKER", at: at(1.3), ats: [at(1.3), at(1.6)], size: 112, boxes: { DATE: AMBER, PICKER: AMBER } },
          { text: "335 LINES", at: T.lines, size: 148, boxes: { "335": RED, LINES: RED } },
        ]}
      />
      <Caption
        from={T.withPonytail - 4}
        to={T.how - 2}
        lines={[
          { text: "WITH PONYTAIL", at: T.withPonytail - 4, size: 104 },
          { text: "LAZY SENIOR DEV", at: T.lazyDev, size: 84, color: AMBER },
          { text: "10 LINES", at: T.ten - 3, size: 148, boxes: { "10": GREEN, LINES: GREEN } },
          { text: "FROM PONYTAIL'S OWN BENCHMARK", at: T.lazyDev + 20, size: 34 },
        ]}
      />
      <Caption
        from={T.how - 4}
        to={T.ladder + 30}
        lines={[
          { text: "HOW?", at: T.how - 4, size: 176, boxes: { "HOW?": AMBER } },
          { text: "READ FIRST", at: T.read - 3, size: 112 },
          { text: "THEN CLIMB THE LADDER", at: T.ladder - 3, size: 72, color: GREEN },
        ]}
      />
      {RUNGS.slice(0, -1).map((rung, i) => (
        <Caption
          key={rung.label}
          from={rung.at - 3}
          to={RUNGS[i + 1].at - 3}
          lines={[{ text: rung.question, at: rung.at - 3, size: 112 }]}
        />
      ))}
      <Caption
        from={T.onlyThen - 3}
        to={T.lazy - 2}
        lines={[
          { text: "ONLY THEN,", at: T.onlyThen - 3, size: 92 },
          { text: "THE MINIMUM THAT WORKS", at: T.minimum - 3, size: 76, boxes: { MINIMUM: GREEN } },
        ]}
      />
      <Caption
        from={T.lazy - 4}
        to={T.level - 2}
        lines={[
          { text: "LAZY", at: T.lazy - 4, size: 124, boxes: { LAZY: AMBER } },
          { text: "NOT CARELESS", at: T.notCareless, size: 96 },
          { text: "NEVER CUT", at: T.neverCut - 3, size: 112, boxes: { NEVER: RED, CUT: RED } },
        ]}
      />
      <Caption
        from={T.level - 4}
        to={T.review - 2}
        lines={[{ text: "SET THE LEVEL", at: T.level - 4, size: 124 }]}
      />
      {[
        { from: T.review, to: T.audit, name: "/PONYTAIL-REVIEW", line: "CHECKS YOUR CHANGES" },
        { from: T.audit, to: T.debt, name: "/PONYTAIL-AUDIT", line: "RANKS YOUR WHOLE REPO" },
        { from: T.debt, to: T.install, name: "/PONYTAIL-DEBT", line: "LISTS EVERY SHORTCUT" },
      ].map((item) => (
        <Caption
          key={item.name}
          from={item.from - 4}
          to={item.to - 2}
          lines={[
            { text: item.name, at: item.from - 4, size: 88, boxes: { [item.name]: AMBER } },
            { text: item.line, at: item.from + 8, size: 72 },
          ]}
        />
      ))}
      <Caption
        from={T.install - 4}
        to={T.never - 2}
        lines={[
          { text: "INSTALL AS A PLUGIN", at: T.install - 4, size: 104 },
          { text: "DIETRICHGEBERT/PONYTAIL", at: T.install + 24, size: 62, color: AMBER },
        ]}
      />
      <Caption
        from={T.never - 4}
        to={END + 1}
        lines={[
          { text: "THE CODE YOU NEVER WRITE", at: T.never - 4, size: 100 },
          { text: "ZERO BUGS", at: T.zero - 3, size: 150, boxes: { ZERO: GREEN, BUGS: GREEN } },
        ]}
      />
    </AbsoluteFill>
  );
};

export const PonytailComposition = () => (
  <Composition
    id="PonytailExplainer"
    component={PonytailVideo}
    durationInFrames={END}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
