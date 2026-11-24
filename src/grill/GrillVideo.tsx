import { AbsoluteFill, Audio, Composition, Freeze, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Room } from "../Room";
import { SIT, SIT_SCRATCH, Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, WALL, fontFamily } from "../theme";
import { VOICE } from "./lines";

// grill-me (mattpocock/skills): before it writes a line, the AI interrogates you about the plan, all in his own room.
const at = (second: number) => Math.round(second * FPS);
const L = VOICE.lines;
const END = at(VOICE.seconds + 0.7);
// Starts of the measured stretches are exact. A cue inside one sits at the share of it that its characters come before,
// which is an estimate: check those by ear.
const cue = (line: keyof typeof L, share = 0) => at(L[line][0] + L[line][1] * share);
const T = {
  never: cue("never"),
  skill: cue("skill"),
  interrogate: cue("skill", 0.42),
  say: cue("say"),
  tracker: cue("tracker"),
  sure: cue("sure", 0.6),
  wrong: cue("later"),
  wrongApp: cue("wrong", 0.55),
  install: cue("install"),
  type: cue("type"),
  installEnd: cue("matt", 0.75),
  then: cue("then"),
  grillMe: cue("then", 0.35),
  plan: cue("plan"),
  inter: cue("inter"),
  dark: cue("inter", 0.4),
  numbered: cue("numbered"),
  best: cue("best"),
  yes: cue("yes"),
  fight: cue("fight"),
  lookup: cue("lookup"),
  itself: cue("finds"),
  stops: cue("stops"),
  guess: cue("stops", 0.75),
  waits: cue("waits"),
  yours: cue("waits", 0.85),
  same: cue("same"),
  right: cue("right"),
  because: cue("because"),
  asked: cue("asked"),
  most: cue("most"),
};

const text = { fontFamily, fontWeight: 900 } as const;
const mono = { fontFamily, fontWeight: 700 } as const;
const BOUNCY = { damping: 11, stiffness: 190 };
const INK = "#11181c";
const CARD = "#1d2a30";
const typed = (s: string, frame: number, a: number, b: number) =>
  s.slice(0, Math.round(interpolate(frame, [a, b], [0, s.length], CLAMP)));
const spread = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => Math.round(a + (i * (b - a)) / n));
const cursor = (frame: number) => (frame % 20 < 12 ? "_" : "");

// Shown in its real case, because viewers copy it. From the Claude Code section of the README, read 2026-11-18.
const COMMAND = ["/plugin install", "mattpocock-skills@", "claude-plugins-official"];
// One round of the grilling skill: numbered, each with its recommended answer, worded so "yes" accepts it.
const QUESTIONS = [
  { q: "WHO USES IT?", a: "JUST YOU. NO LOGIN." },
  { q: "TRACK IT DAILY?", a: "YES, ONCE A DAY." },
  { q: "KEEP STREAKS?", a: "YES, RESET ON A MISS." },
];

// Seated poses: the chair is at x 96 to 326, so in this room he never stands up.
const sit = (o: Partial<Pose>): Pose => ({ ...SIT, ...o });
const FACEPALM = sit({ head: [240, 1015], eR: [325, 1090], hR: [268, 1005], eL: [300, 1215], hL: [400, 1272], smile: -1 });
const NERVOUS = sit({ head: [205, 1002], sh: [200, 1095], eL: [270, 1160], hL: [300, 1085], eR: [290, 1170], hR: [330, 1095], smile: -0.8 });
const THUMB_UP = sit({ head: [226, 1004], eR: [305, 1150], hR: [345, 1070], smile: 1.3 });
const RELAX = sit({ head: [212, 1000], sh: [205, 1095], eL: [140, 1040], hL: [205, 985], eR: [290, 1045], hR: [245, 985], smile: 1 });
const CHEER = sit({ look: 0, head: [222, 1000], eL: [150, 1020], hL: [130, 895], eR: [300, 1020], hR: [330, 895], smile: 1.6 });

// Every shot is his room; the variety comes from where the camera sits in it.
type Scene = "room" | "pov" | "wrong" | "install" | "grill" | "cards" | "lookup" | "answer" | "finale";
const CUTS: [number, Scene][] = [
  [0, "room"],
  [T.say - 2, "pov"],
  [T.wrong - 2, "wrong"],
  [T.install - 2, "install"],
  [T.then - 2, "grill"],
  [T.numbered - 2, "cards"],
  [T.lookup - 2, "lookup"],
  [T.stops - 2, "answer"],
  [T.same - 2, "finale"],
];
const sceneAt = (frame: number): Scene =>
  CUTS.reduce<Scene>((scene, [from, next]) => (frame >= from ? next : scene), "room");

// The mini agent that fetches a fact: out of the monitor, to the PC under the desk, and back.
const FETCH = { go: T.lookup + 8, there: T.lookup + 26, back: T.itself + 22 };
const HOME = T.itself + 40;

const POSES = [
  { at: 0, pose: SIT },
  { at: T.interrogate - 2, pose: SIT_SCRATCH },
  { at: T.wrong - 2, pose: SIT },
  { at: T.wrongApp - 6, pose: FACEPALM },
  { at: T.then - 2, pose: SIT },
  { at: T.dark - 2, pose: NERVOUS },
  { at: T.lookup - 2, pose: NERVOUS },
  { at: HOME - 4, pose: RELAX },
  { at: T.same - 2, pose: CHEER },
  { at: T.because, pose: THUMB_UP },
  { at: T.most - 4, pose: SIT },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };
const TYPING: [number, number][] = [
  [2, 22],
  [T.then, T.plan + 14],
  [T.most, END],
];

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 5;
  // Nervous: a quicker, shallower breath.
  const jitter = frame >= T.dark && frame < HOME - 4 ? Math.sin(frame / 2.2) * 3 : 0;
  const p: Pose = {
    ...body,
    head: [mid.head[0] + sway + jitter, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    eL: [mid.eL[0] + sway * 0.6, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.6, mid.eR[1]],
    hL: [tip.hL[0], tip.hL[1] + Math.sin(frame / 11) * 4],
    hR: [tip.hR[0], tip.hR[1] + Math.cos(frame / 11) * 4],
  };
  if (TYPING.some(([a, b]) => frame >= a && frame < b)) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 16];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 16];
  }
  return p;
};

// A blink now and then, so the face is alive between poses.
const blink = (frame: number) => {
  const p = (frame + 31) % 83;
  return p < 2 ? 0.4 : p < 5 ? 0 : p < 7 ? 0.5 : 1;
};

const Tick: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 0 l16 20 l34 -44"
    fill="none"
    stroke={GREEN}
    strokeWidth={12}
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);
// The recommended-answer arrow, drawn: the font has no emoji.
const Arrow: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-4} y={-14} width={44} height={28} rx={7} fill={GREEN} />
    <path d="M6 0 H28 M20 -8 L29 0 L20 8" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
const QMark: React.FC<{ x: number; y: number; r: number; pulse?: number }> = ({ x, y, r, pulse = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${pulse})`}>
    <circle r={r} fill={AMBER} />
    <text y={r * 0.42} textAnchor="middle" fontSize={r * 1.25} fill={INK} {...text}>
      ?
    </text>
  </g>
);

// Code lines spraying out of the monitor while the AI codes without asking.
const Flood: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  if (frame < from) return null;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const t = (frame - from + i * 9) % 54;
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

// The room monitor's screen is x 380 to 1010, y 802 to 1200.
const SX = 380;
const SY = 802;
const SW = 630;

const Rabbit: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={CREAM}>
    <ellipse cx={-14} cy={-62} rx={10} ry={30} transform="rotate(-12 -14 -62)" />
    <ellipse cx={12} cy={-62} rx={10} ry={30} transform="rotate(12 12 -62)" />
    <circle cy={-22} r={24} />
    <ellipse cx={6} cy={24} rx={34} ry={28} />
    <circle cx={-8} cy={-26} r={4} fill={INK} />
    <circle cx={8} cy={-26} r={4} fill={INK} />
  </g>
);

// "Most AIs never ask": the same screen the hook opens on, so the last shot loops into the first.
const NoQuestions: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <text x={SX + 30} y={SY + 66} fontSize={40} fill={CREAM} {...mono}>
        {`> ${typed("build me an app", frame, from + 2, from + 22)}${cursor(frame)}`}
      </text>
      <text x={SX + SW / 2} y={SY + 262} textAnchor="middle" fontSize={190} fill={RED} {...text}>
        0
      </text>
      <text x={SX + SW / 2} y={SY + 346} textAnchor="middle" fontSize={54} fill={RED} {...text}>
        QUESTIONS ASKED
      </text>
    </g>
  );
};

const HabitApp: React.FC<{ right: boolean }> = ({ right }) => {
  const frame = useCurrentFrame();
  if (!right) {
    return (
      <g>
        <text x={SX + 30} y={SY + 62} fontSize={36} fill={AMBER} {...text}>
          RABBIT TRACKER v1.0
        </text>
        <Rabbit x={SX + 150} y={SY + 250} s={1.6} />
        <text x={SX + 300} y={SY + 220} fontSize={64} fill={CREAM} {...text}>
          3 RABBITS
        </text>
        <text x={SX + 300} y={SY + 286} fontSize={44} fill={CREAM} opacity={0.7} {...text}>
          NEARBY
        </text>
      </g>
    );
  }
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <g>
      <text x={SX + 30} y={SY + 62} fontSize={36} fill={GREEN} {...text}>
        HABIT TRACKER
      </text>
      <text x={SX + 30} y={SY + 128} fontSize={44} fill={CREAM} {...text}>
        DRINK WATER
      </text>
      {days.map((d, i) => {
        const s = Math.min(enter(frame - T.same - i * 3, BOUNCY), 1);
        const x = SX + 30 + i * 84;
        return (
          <g key={i}>
            <rect x={x} y={SY + 160} width={70} height={70} rx={14} fill={s > 0.5 ? GREEN : CARD} />
            <text x={x + 35} y={SY + 270} textAnchor="middle" fontSize={30} fill={CREAM} {...mono}>
              {d}
            </text>
          </g>
        );
      })}
      <text x={SX + 30} y={SY + 350} fontSize={48} fill={AMBER} {...text}>
        {`STREAK: ${Math.round(interpolate(frame, [T.same, T.same + 24], [0, 7], CLAMP))} DAYS`}
      </text>
    </g>
  );
};

const GrillScreen: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.dark) {
    return (
      <g>
        <text x={SX + 30} y={SY + 70} fontSize={44} fill={AMBER} {...mono}>
          {`> ${typed("/grill-me", frame, T.then, T.grillMe + 8)}`}
        </text>
        <text x={SX + 30} y={SY + 140} fontSize={36} fill={CREAM} {...mono}>
          {typed("build me a habit tracker", frame, T.plan - 8, T.plan + 14) + cursor(frame)}
        </text>
      </g>
    );
  }
  const pulse = 1 + Math.sin((frame - T.dark) / 4) * 0.05;
  return (
    <g>
      <QMark x={SX + SW / 2} y={SY + 170} r={100} pulse={pulse} />
      <text x={SX + SW / 2} y={SY + 360} textAnchor="middle" fontSize={50} fill={CREAM} {...text}>
        ROUND 1
      </text>
    </g>
  );
};

// One round, up close: numbered questions with the recommended answer under each.
const Cards: React.FC = () => {
  const frame = useCurrentFrame();
  const yes = enter(frame - T.yes - 4, BOUNCY);
  const fight = interpolate(frame, [T.fight, T.fight + 8], [0, 1], CLAMP);
  return (
    <g>
      {QUESTIONS.map((row, i) => {
        const s = enter(frame - T.numbered - i * 8, BOUNCY);
        const ans = Math.min(enter(frame - T.best - i * 4, BOUNCY), 1);
        const y = SY + 10 + i * 128;
        return (
          <g key={row.q} opacity={Math.min(s, 1)} transform={`translate(${(1 - s) * 80} 0)`}>
            <rect x={SX + 6} y={y} width={SW - 12} height={118} rx={16} fill={CARD} />
            <QMark x={SX + 40} y={y + 36} r={20} />
            <text x={SX + 72} y={y + 48} fontSize={34} fill={AMBER} {...text}>
              {`Q${i + 1}`}
            </text>
            <text x={SX + 130} y={y + 48} fontSize={34} fill={CREAM} {...text}>
              {row.q}
            </text>
            <g opacity={ans}>
              <Arrow x={SX + 28} y={y + 88} />
              <text x={SX + 84} y={y + 99} fontSize={30} fill={GREEN} {...text}>
                {row.a}
              </text>
            </g>
          </g>
        );
      })}
      {/* "Say yes": Q1 accepted. */}
      <g
        opacity={Math.min(yes, 1)}
        transform={`translate(${SX + 520} ${SY + 50}) rotate(-8) scale(${2 - Math.min(yes, 1.15)})`}
      >
        <rect x={-74} y={-34} width={148} height={68} rx={12} fill="none" stroke={GREEN} strokeWidth={7} />
        <text y={20} textAnchor="middle" fontSize={50} fill={GREEN} {...text}>
          YES
        </text>
      </g>
      {/* "Or fight it": Q2's answer crossed out and overruled. */}
      <rect x={SX + 82} y={SY + 10 + 128 + 86} width={290 * fight} height={8} rx={4} fill={RED} />
      <text
        x={SX + 400}
        y={SY + 10 + 128 + 100}
        fontSize={32}
        fill={RED}
        opacity={interpolate(frame, [T.fight + 6, T.fight + 12], [0, 1], CLAMP)}
        {...text}
      >
        NO: 3x A WEEK
      </text>
    </g>
  );
};

const LookupScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const found = Math.min(enter(frame - FETCH.back - 6, BOUNCY), 1);
  return (
    <g>
      <QMark x={SX + 50} y={SY + 56} r={26} />
      <text x={SX + 92} y={SY + 70} fontSize={34} fill={AMBER} {...text}>
        Q4
      </text>
      <text x={SX + 150} y={SY + 70} fontSize={34} fill={CREAM} {...text}>
        WHERE DO HABITS SAVE?
      </text>
      {frame < FETCH.back + 6 ? (
        <text x={SX + 30} y={SY + 190} fontSize={46} fill={CREAM} opacity={0.75} {...text}>
          {`LOOKING IT UP${".".repeat(1 + (Math.floor(frame / 6) % 3))}`}
        </text>
      ) : (
        <g opacity={found}>
          <Tick x={SX + 34} y={SY + 186} s={1.3} />
          <text x={SX + 120} y={SY + 206} fontSize={60} fill={GREEN} {...text}>
            FOUND IT
          </text>
          <text x={SX + 34} y={SY + 290} fontSize={40} fill={CREAM} {...mono}>
            db.ts: SQLite
          </text>
        </g>
      )}
      <text x={SX + 30} y={SY + 370} fontSize={30} fill={CREAM} opacity={0.6} {...text}>
        ASKED YOU: NOTHING
      </text>
    </g>
  );
};

// The fact-finding sub-agent: a tiny monitor-head runner.
const Agent: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < FETCH.go - 2 || frame > FETCH.back + 4) return null;
  const out = interpolate(frame, [FETCH.go, FETCH.there], [0, 1], CLAMP);
  const ret = interpolate(frame, [FETCH.back - 18, FETCH.back], [0, 1], CLAMP);
  const u = out - ret;
  // From the monitor's foot (700, 1300) down to the PC top (865, 1430), in a hop.
  const x = 700 + u * 165;
  const y = 1300 + u * 130 - Math.sin(Math.PI * u) * 120;
  const reading = frame >= FETCH.there && frame < FETCH.back - 18;
  const step = Math.sin(frame / 1.6) * (reading ? 0 : 12);
  const grow = Math.min(enter(frame - FETCH.go + 2, BOUNCY), 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${grow * 1.7})`} strokeLinecap="round">
      <path d={`M0 -20 V-56 M0 -20 L${-10 + step} 0 M0 -20 L${10 - step} 0`} stroke={CREAM} strokeWidth={7} fill="none" />
      <path d={`M0 -46 L${reading ? 20 : -14} ${reading ? -40 : -30}`} stroke={CREAM} strokeWidth={7} />
      <rect x={-26} y={-96} width={52} height={40} rx={8} fill="#4f8a8b" stroke={CREAM} strokeWidth={5} />
      <circle cx={-9} cy={-76} r={5} fill={AMBER} />
      <circle cx={9} cy={-76} r={5} fill={AMBER} />
      {reading ? (
        <text x={34} y={-104} fontSize={44} fill={AMBER} {...text}>
          {frame - FETCH.there < 12 ? "?" : "!"}
        </text>
      ) : null}
      {/* Carrying the fact home on the way back. */}
      {ret > 0 ? <rect x={-50} y={-62} width={30} height={38} rx={4} fill={CREAM} /> : null}
    </g>
  );
};

// The stickman's own eyes: the screen up close, the keyboard and both arms. The screen spans x 66 to 1014, y 706 to 1444.
const Pov: React.FC<{ typing: [number, number]; children: React.ReactNode }> = ({ typing, children }) => {
  const frame = useCurrentFrame();
  const on = frame >= typing[0] && frame < typing[1];
  const left = on ? Math.abs(Math.sin(frame / 1.5)) * 30 : 0;
  const right = on ? Math.abs(Math.cos(frame / 1.5)) * 30 : 0;
  const key = on ? Math.floor(frame / 2) % 40 : -1;
  const arm = { stroke: CREAM, strokeWidth: 50, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      <rect x={-40} y={-40} width={1160} height={2000} fill="#0a0d12" />
      <rect x={50} y={690} width={980} height={770} rx={40} fill={INK} stroke="#2c363b" strokeWidth={6} />
      <rect x={66} y={706} width={948} height={738} rx={28} fill="#0f1619" />
      <text x={104} y={784} fontSize={38} fill={AMBER} {...mono}>
        CLAUDE CODE
      </text>
      {children}
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

const AskPov: React.FC = () => {
  const frame = useCurrentFrame();
  const reply = Math.min(enter(frame - T.sure, BOUNCY), 1);
  return (
    <g>
      <text x={104} y={900} fontSize={60} fill={CREAM} {...mono}>
        {`> ${typed("build me a", frame, T.say, T.tracker)}`}
      </text>
      <text x={150} y={980} fontSize={60} fill={CREAM} {...mono}>
        {typed("habit tracker", frame, T.tracker, T.sure - 10) + (frame < T.sure ? cursor(frame) : "")}
      </text>
      <g opacity={reply} transform={`translate(0 ${(1 - reply) * 40})`}>
        <text x={104} y={1110} fontSize={64} fill={GREEN} {...text}>
          SURE! BUILDING IT NOW
        </text>
        {Array.from({ length: 5 }, (_, i) => {
          const w = interpolate(frame, [T.sure + 6 + i * 5, T.sure + 16 + i * 5], [0, [700, 520, 780, 440, 620][i]], CLAMP);
          return <rect key={i} x={104} y={1170 + i * 48} width={w} height={22} rx={11} fill={CREAM} opacity={0.35} />;
        })}
      </g>
    </g>
  );
};

const InstallPov: React.FC = () => {
  const frame = useCurrentFrame();
  const total = COMMAND.join("").length;
  const count = Math.round(interpolate(frame, [T.type, T.installEnd], [0, total], CLAMP));
  const done = Math.min(enter(frame - T.installEnd - 4, BOUNCY), 1);
  let before = 0;
  return (
    <g>
      {COMMAND.map((line, i) => {
        const shown = line.slice(0, Math.max(0, count - before));
        const active = count >= before && (count < before + line.length || i === COMMAND.length - 1);
        before += line.length;
        return (
          <text key={line} x={104} y={920 + i * 100} fontSize={62} fill={CREAM} {...mono}>
            {(i === 0 ? "> " : "  ") + shown + (active && frame < T.installEnd + 4 ? cursor(frame) : "")}
          </text>
        );
      })}
      <g opacity={done}>
        <Tick x={112} y={1260} s={1.3} />
        <text x={200} y={1290} fontSize={60} fill={GREEN} {...text}>
          INSTALLED
        </text>
      </g>
    </g>
  );
};

// End of the interview: every branch settled, then it waits for his yes before it builds.
const AnswerPov: React.FC = () => {
  const frame = useCurrentFrame();
  const branches = ["WHO", "HOW OFTEN", "STREAKS", "STORAGE"];
  const ask = Math.min(enter(frame - T.waits, BOUNCY), 1);
  return (
    <g>
      {branches.map((b, i) => {
        const s = Math.min(enter(frame - T.stops - 4 - i * 6, BOUNCY), 1);
        return (
          <g key={b} opacity={0.35 + 0.65 * s}>
            <Tick x={112} y={870 + i * 74} s={0.8} />
            <text x={170} y={886 + i * 74} fontSize={46} fill={CREAM} {...text}>
              {b}
            </text>
          </g>
        );
      })}
      <text x={790} y={900} textAnchor="middle" fontSize={40} fill={AMBER} {...text}>
        QUESTIONS LEFT
      </text>
      <text x={790} y={1060} textAnchor="middle" fontSize={130} fill={AMBER} {...text}>
        {Math.round(interpolate(frame, [T.stops + 4, T.guess + 6], [7, 0], CLAMP))}
      </text>
      <g opacity={ask}>
        <text x={104} y={1260} fontSize={46} fill={CREAM} {...text}>
          SHARED UNDERSTANDING?
        </text>
        <text x={104} y={1350} fontSize={70} fill={GREEN} {...mono}>
          {`> ${typed("yes", frame, T.yours - 8, T.yours)}${frame < T.yours + 4 ? cursor(frame) : ""}`}
        </text>
      </g>
    </g>
  );
};

const RoomScreen: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  if (scene === "room") return <NoQuestions from={0} />;
  if (scene === "wrong") return <HabitApp right={false} />;
  if (scene === "grill") return <GrillScreen />;
  if (scene === "cards") return <Cards />;
  if (scene === "lookup") return <LookupScreen />;
  if (scene === "finale") return frame >= T.most - 2 ? <NoQuestions from={T.most - 2} /> : <HabitApp right />;
  return null;
};

const Soundtrack: React.FC = () => (
  <>
    {/* The take measures within 0.4 dB of the compact and leaks voices, so it plays at 1.2 like them. */}
    {VOICE.file ? <Audio src={staticFile(VOICE.file)} volume={1.2} /> : null}
    {/* shortcut: borrows the antislop video's bed; make one with scripts/make-sfx.mjs if this video needs its own. */}
    <Audio
      src={staticFile("sfx/bgm.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    {spread(2, 22, 3).map((from, i) => (
      <Sfx key={from} name={`key${i}`} from={from} volume={0.3} />
    ))}
    <Sfx name="womp" from={T.never + 20} volume={0.28} />
    <Sfx name="whoosh" from={T.say - 4} volume={0.28} />
    {spread(T.say, T.sure - 10, 5).map((from, i) => (
      <Sfx key={from} name={`key${i % 4}`} from={from} volume={0.44} />
    ))}
    <Sfx name="ding" from={T.sure} volume={0.36} />
    <Sfx name="pop" from={T.wrong} volume={0.35} />
    <Sfx name="error" from={T.wrongApp} volume={0.26} />
    <Sfx name="impact" from={T.wrongApp} volume={0.4} />
    <Sfx name="whoosh" from={T.install - 4} volume={0.28} />
    {spread(T.type, T.installEnd, 6).map((from, i) => (
      <Sfx key={from} name={`key${(i + 1) % 4}`} from={from} volume={0.44} />
    ))}
    <Sfx name="check" from={T.installEnd + 4} />
    {spread(T.then, T.plan + 14, 4).map((from, i) => (
      <Sfx key={from} name={`key${(i + 2) % 4}`} from={from} volume={0.4} />
    ))}
    {/* The lights snap off for the interrogation. */}
    <Sfx name="click" from={T.dark - 2} volume={0.55} />
    <Sfx name="impact" from={T.dark} volume={0.5} />
    {QUESTIONS.map((_, i) => (
      <Sfx key={i} name="pop" from={T.numbered + i * 8} volume={0.36} />
    ))}
    <Sfx name="sparkle" from={T.best} volume={0.28} />
    <Sfx name="stamp" from={T.yes + 6} volume={0.45} />
    <Sfx name="paper" from={T.fight} volume={0.42} />
    <Sfx name="whoosh" from={FETCH.go} volume={0.24} />
    <Sfx name="click" from={FETCH.there + 12} volume={0.35} />
    <Sfx name="whoosh" from={FETCH.back - 18} volume={0.22} />
    <Sfx name="ding" from={FETCH.back + 6} volume={0.4} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="check" from={T.stops + 4 + i * 6} volume={0.26} />
    ))}
    {spread(T.yours - 8, T.yours, 3).map((from, i) => (
      <Sfx key={from} name={`key${i}`} from={from} volume={0.44} />
    ))}
    <Sfx name="impact" from={T.yours + 2} volume={0.4} />
    <Sfx name="sweep" from={T.same - 8} volume={0.3} />
    <Sfx name="chime" from={T.same + 4} volume={0.42} />
    <Sfx name="womp" from={T.most + 2} volume={0.22} />
  </>
);

const PUNCHES = CUTS.map(([from]) => from);
// Three hits only: the wrong app, the lights going off, and his yes.
const SHAKES = [T.wrongApp, T.dark, T.yours + 2];
// The close-up of the monitor: its 670 px width fills the frame.
const CLOSE_UP = "translate(540 1080) scale(1.5) translate(-695 -1001)";

export const GrillVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = sceneAt(frame);
  const pose = animatePose(frame);
  const pov = scene === "pov" || scene === "install" || scene === "answer";
  // Dark from the moment the interview starts until the right app is on screen.
  const dark = scene === "grill" || scene === "cards" || scene === "lookup";
  const dim = dark ? (scene === "grill" ? interpolate(frame, [T.dark - 2, T.dark], [0, 1], CLAMP) : 1) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: WALL }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          {/* The only light left is the monitor's glare on him. */}
          <radialGradient id="grillSpot" cx="330" cy="1080" r="560" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#05080a" stopOpacity={0} />
            <stop offset="0.45" stopColor="#05080a" stopOpacity={0.35} />
            <stop offset="1" stopColor="#05080a" stopOpacity={0.88} />
          </radialGradient>
        </defs>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          {pov ? (
            <>
              {scene === "pov" ? (
                <Pov typing={[T.say, T.sure - 10]}>
                  <AskPov />
                </Pov>
              ) : null}
              {scene === "install" ? (
                <Pov typing={[T.type, T.installEnd]}>
                  <InstallPov />
                </Pov>
              ) : null}
              {scene === "answer" ? (
                <Pov typing={[T.yours - 8, T.yours]}>
                  <AnswerPov />
                </Pov>
              ) : null}
            </>
          ) : (
            <g transform={scene === "cards" ? CLOSE_UP : undefined}>
              <Room />
              {scene === "cards" ? null : (
                <Stickman pose={pose} thumb={0} headFill={WALL} bendy eyes={blink(frame)} />
              )}
              <rect x={-40} y={-40} width={1160} height={2000} fill="url(#grillSpot)" opacity={dim} />
              {/* Drawn over the dark, because the screen is the light. */}
              <RoomScreen scene={scene} />
              {scene === "room" || (scene === "finale" && frame >= T.most - 2) ? (
                <Flood from={scene === "room" ? 22 : T.most + 20} />
              ) : null}
              {scene === "lookup" ? <Agent /> : null}
            </g>
          )}
        </g>
      </svg>

      <Caption
        plain
        from={0}
        to={T.say - 2}
        lines={[
          { text: "YOUR AI NEVER", at: 2, size: 88 },
          { text: "ASKS QUESTIONS", at: T.never + 22, size: 88, boxes: { ASKS: RED, QUESTIONS: RED } },
          { text: "THIS SKILL MAKES IT", at: T.skill, size: 64 },
          { text: "INTERROGATE YOU", at: T.interrogate, size: 84, boxes: { INTERROGATE: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.say - 4}
        to={T.wrong - 2}
        lines={[
          { text: "YOU: BUILD ME", at: T.say - 4, size: 92 },
          { text: "A HABIT TRACKER", at: T.tracker, size: 92 },
          { text: "AI: SURE!", at: T.sure, size: 110, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.wrong - 4}
        to={T.install - 2}
        lines={[
          { text: "10 MINUTES LATER", at: T.wrong - 4, size: 92 },
          { text: "THE WRONG APP", at: T.wrongApp - 4, size: 112, boxes: { WRONG: RED } },
        ]}
      />
      <Caption
        plain
        from={T.install - 4}
        to={T.then - 2}
        lines={[
          { text: "IN CLAUDE CODE", at: T.install - 4, size: 92 },
          { text: "RUN THIS", at: T.install + 10, size: 118, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.then - 4}
        to={T.numbered - 2}
        lines={[
          { text: "THEN /grill-me", at: T.then - 4, size: 100, boxes: { "/grill-me": AMBER } },
          { text: "+ YOUR PLAN", at: T.plan, size: 84 },
          { text: "NOW IT'S AN", at: T.inter, size: 84 },
          { text: "INTERROGATION", at: T.dark, size: 110, boxes: { INTERROGATION: RED } },
        ]}
      />
      <Caption
        plain
        from={T.numbered - 4}
        to={T.lookup - 2}
        lines={[
          { text: "EVERY QUESTION NUMBERED", at: T.numbered - 4, size: 60 },
          { text: "WITH ITS BEST ANSWER", at: T.best, size: 64, color: GREEN },
          { text: "SAY YES, OR FIGHT IT", at: T.yes, ats: [T.yes, T.yes + 3, T.fight, T.fight + 3, T.fight + 6], size: 80, boxes: { "YES,": GREEN, FIGHT: RED } },
        ]}
      />
      <Caption
        plain
        from={T.lookup - 4}
        to={T.stops - 2}
        lines={[
          { text: "ANYTHING IT CAN LOOK UP", at: T.lookup - 4, size: 66 },
          { text: "IT FINDS OUT", at: T.itself, size: 100 },
          { text: "ITSELF", at: T.itself + 12, size: 130, boxes: { ITSELF: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.stops - 4}
        to={T.same - 2}
        lines={[
          { text: "IT STOPS WHEN", at: T.stops - 4, size: 92 },
          { text: "NOTHING IS LEFT TO GUESS", at: T.guess - 6, size: 64, color: AMBER },
          { text: "THEN IT WAITS", at: T.waits, size: 92 },
          { text: "FOR YOUR YES", at: T.yours - 6, size: 100, boxes: { YES: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.same - 4}
        to={END + 1}
        lines={[
          { text: "SAME IDEA.", at: T.same - 4, size: 100 },
          { text: "RIGHT APP.", at: T.right, size: 110, color: GREEN },
          { text: "THE AI ASKED FIRST", at: T.asked - 6, size: 80, boxes: { ASKED: AMBER } },
          { text: "FOLLOW STICKMAN SHIPS", at: T.most, size: 64, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
        ]}
      />
    </AbsoluteFill>
  );
};

// Review sheets: six frozen frames per image, so the owner can check every scene before a full render.
const SHOTS: [string, number][] = [
  ["1 ROOM, FIRST FRAME", 0],
  ["2 ROOM, 0 QUESTIONS", T.interrogate + 14],
  ["3 HIS VIEW, BUILD ME", T.tracker + 14],
  ["4 HIS VIEW, SURE!", T.sure + 12],
  ["5 ROOM, RABBIT TRACKER", T.wrongApp + 14],
  ["6 HIS VIEW, INSTALL", T.installEnd + 10],
  ["7 ROOM, /grill-me", T.plan + 16],
  ["8 ROOM, LIGHTS OFF", T.dark + 16],
  ["9 CLOSE-UP, CARDS", T.best + 16],
  ["10 CLOSE-UP, YES / FIGHT", T.fight + 20],
  ["11 ROOM, AGENT AT THE PC", FETCH.there + 16],
  ["12 ROOM, FOUND IT", FETCH.back + 20],
  ["13 HIS VIEW, 0 LEFT", T.guess + 10],
  ["14 HIS VIEW, YES", T.yours + 8],
  ["15 FINALE, RIGHT APP", T.right + 14],
  ["16 FINALE, ASKED FIRST", T.asked + 10],
  ["17 FINALE, MOST AIs", T.most + 24],
  ["18 LAST FRAME, LOOP", END - 1],
];

const Frames: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: INK, flexDirection: "row", flexWrap: "wrap" }}>
    {SHOTS.slice(from, from + 6).map(([label, shot]) => (
      <div key={label} style={{ width: 540, height: 1010, position: "relative" }}>
        <div style={{ position: "absolute", width: 1080, height: 1920, overflow: "hidden", transform: "scale(0.5)", transformOrigin: "0 0" }}>
          <Freeze frame={shot}>
            <GrillVideo />
          </Freeze>
        </div>
        <div style={{ position: "absolute", top: 968, left: 12, fontFamily, fontWeight: 700, fontSize: 24, color: CREAM }}>
          {`${label} · ${(shot / FPS).toFixed(1)} s (Lucan Rook)`}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

export const GrillComposition = () => (
  <>
    <Composition id="GrillMeTutorial" component={GrillVideo} durationInFrames={END} fps={FPS} width={1080} height={1920} />
    {/* Not a Still: a one-frame composition clamps every frozen frame to 0. */}
    <Composition
      id="GrillFrames"
      component={Frames}
      defaultProps={{ from: 0 }}
      durationInFrames={END}
      fps={FPS}
      width={1620}
      height={2020}
    />
  </>
);
