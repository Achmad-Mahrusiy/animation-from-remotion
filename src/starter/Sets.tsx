import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, enter } from "../Composition";
import { AMBER, CREAM, GREEN, RED, fontFamily } from "../theme";

// An original adventure-game world for the starter-pack video. Every set is a flat storybook drawing on 1080x1920;
// the floor line is y=1650 and the five-slot inventory bar sits under it.
export const text = { fontFamily, fontWeight: 900 } as const;
export const INK = "#11181c";
export const MEADOW = "#3b6e8f";
export const SHOP = "#4a2f24";
export const FOREST = "#22404a";
export const CANYON = "#6b3440";
export const VILLAGE = "#2b3a66";
export const TRAIL = "#35577a";
export const NIGHT = "#151d36";
const LEATHER = "#c9913f";
const WOOD = "#8a5a3a";
const WOOD_DARK = "#5e3a24";

const Sky: React.FC<{ color: string }> = ({ color }) => <rect x={-60} y={-60} width={1200} height={2040} fill={color} />;

const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.5 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={CREAM} opacity={o}>
    <ellipse cx={0} cy={0} rx={90} ry={34} />
    <ellipse cx={-50} cy={8} rx={60} ry={26} />
    <ellipse cx={60} cy={10} rx={56} ry={24} />
  </g>
);

// A signboard on a post, used at the start and the finale.
const Signpost: React.FC<{ x: number; label: string; color: string; pop?: number }> = ({ x, label, color, pop = 1 }) => (
  <g>
    <rect x={x - 14} y={1250} width={28} height={410} rx={6} fill={WOOD_DARK} />
    <g transform={`translate(${x} 1280) scale(${pop}) translate(${-x} -1280)`}>
      <rect x={x - 170} y={1200} width={340} height={150} rx={18} fill={WOOD} stroke={WOOD_DARK} strokeWidth={10} />
      <text x={x} y={1302} textAnchor="middle" fontSize={78} fill={color} {...text}>
        {label}
      </text>
    </g>
  </g>
);

export const Meadow: React.FC<{ level: number; levelPop?: number }> = ({ level, levelPop = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Sky color={MEADOW} />
      <rect x={-60} y={1180} width={1200} height={200} fill="#5b8fa6" />
      <circle cx={860} cy={900} r={90} fill={AMBER} opacity={0.9} />
      <Cloud x={((frame * 0.6 + 200) % 1400) - 160} y={760} s={1.1} />
      <Cloud x={((frame * 0.35 + 900) % 1400) - 160} y={900} s={0.7} o={0.35} />
      <path d="M-60 1360 Q200 1230 460 1330 T1140 1300 V1700 H-60Z" fill="#3f7451" />
      <rect x={-60} y={1440} width={1200} height={560} fill="#5a9a52" />
      <path d="M-60 1440 Q300 1400 600 1440 T1140 1430 V1460 H-60Z" fill="#5a9a52" />
      {/* The dirt path to the right edge. */}
      <path d="M-60 1640 Q400 1600 640 1560 T1140 1500 V1560 Q700 1640 400 1700 T-60 1720Z" fill="#c7a46a" />
      <rect x={-60} y={1650} width={1200} height={8} fill="#3d6e3b" opacity={0.5} />
      {[120, 330, 990, 620, 880].map((x, i) => (
        <g key={x} transform={`translate(${x} ${1480 + (i % 2) * 40})`}>
          <path d="M0 0 V-26" stroke="#3d6e3b" strokeWidth={5} />
          <circle cy={-30} r={9} fill={i % 2 ? AMBER : CREAM} />
        </g>
      ))}
      <Signpost x={790} label={`LEVEL ${level}`} color={level > 1 ? GREEN : AMBER} pop={levelPop} />
    </g>
  );
};

// The item shop: shelves with five slots that light up one after another.
export const Shop: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const glow = 0.7 + Math.sin(frame / 6) * 0.15;
  const slots = [
    [150, 860],
    [330, 860],
    [510, 860],
    [240, 1090],
    [420, 1090],
  ];
  return (
    <g>
      <Sky color={SHOP} />
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x={-60} y={700 + i * 100} width={1200} height={4} fill="#3a241b" />
      ))}
      {/* Lantern. */}
      <path d="M800 640 V720" stroke={WOOD_DARK} strokeWidth={6} />
      <circle cx={800} cy={760} r={150} fill={AMBER} opacity={0.08 * glow + 0.04} />
      <rect x={770} y={720} width={60} height={80} rx={14} fill={AMBER} opacity={glow} />
      {[926, 1156].map((y) => (
        <rect key={y} x={60} y={y} width={580} height={22} rx={6} fill={WOOD} />
      ))}
      {slots.map(([x, y], i) => {
        const s = Math.min(enter(frame - from - 6 - i * 5, { damping: 12, stiffness: 180 }), 1.1);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * s})`} opacity={Math.min(s, 1)}>
            <circle r={78} fill={AMBER} opacity={0.18} />
            <rect x={-62} y={-62} width={124} height={124} rx={20} fill="#2a1a14" stroke={AMBER} strokeWidth={6} />
            <text y={26} textAnchor="middle" fontSize={76} fill={AMBER} {...text}>
              ?
            </text>
          </g>
        );
      })}
      {/* Counter in front. */}
      <rect x={-60} y={1330} width={760} height={40} rx={8} fill={WOOD} />
      <rect x={-60} y={1370} width={720} height={300} fill={WOOD_DARK} />
      <text x={330} y={1540} textAnchor="middle" fontSize={64} fill={AMBER} opacity={0.85} {...text}>
        ITEMS
      </text>
      <rect x={-60} y={1650} width={1200} height={300} fill="#2e1d16" />
    </g>
  );
};

const Tree: React.FC<{ x: number; y: number; s: number; fill: string }> = ({ x, y, s, fill }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <rect x={-14} y={-40} width={28} height={80} />
    <path d="M0 -330 L110 -150 H60 L140 -20 H-140 L-60 -150 H-110Z" />
  </g>
);

// session-report: a quest board in the forest. Three prompts, one of them ate the tokens.
export const QuestBoard: React.FC<{ bars: number[]; stamp: number }> = ({ bars, stamp }) => {
  const frame = useCurrentFrame();
  const rows = [
    { label: "PROMPT 1", share: 0.2, c: GREEN },
    { label: "PROMPT 2", share: 1, c: RED },
    { label: "PROMPT 3", share: 0.28, c: GREEN },
  ];
  const s = Math.min(stamp, 1.3);
  const chomp = Math.abs(Math.sin(frame / 3)) * 18;
  return (
    <g>
      <Sky color={FOREST} />
      {[380, 520, 980, 1080].map((x, i) => (
        <Tree key={x} x={x} y={1300} s={0.9 + (i % 2) * 0.25} fill="#1a3330" />
      ))}
      <rect x={-60} y={1300} width={1200} height={700} fill="#2f5a3c" />
      <path d="M-60 1700 Q400 1640 620 1560 T1140 1540 V1620 Q760 1700 520 1720 T-60 1760Z" fill="#9b8a63" />
      <Tree x={-30} y={1600} s={1.2} fill="#14282a" />
      {/* The board on two posts. */}
      {[460, 980].map((x) => (
        <rect key={x} x={x - 13} y={1100} width={26} height={560} rx={6} fill={WOOD_DARK} />
      ))}
      <rect x={400} y={720} width={640} height={520} rx={22} fill={WOOD} stroke={WOOD_DARK} strokeWidth={10} />
      <text x={720} y={800} textAnchor="middle" fontSize={50} fill={CREAM} {...text}>
        TOKENS USED
      </text>
      {rows.map((r, i) => {
        const y = 850 + i * 125;
        const w = 340 * r.share * Math.min(bars[i], 1.05);
        return (
          <g key={r.label}>
            <text x={430} y={y + 50} fontSize={36} fill={CREAM} {...text}>
              {r.label}
            </text>
            <rect x={640} y={y} width={360} height={72} rx={14} fill={WOOD_DARK} opacity={0.6} />
            {w > 2 ? <rect x={640} y={y} width={w} height={72} rx={14} fill={r.c} /> : null}
            {/* The hungry one has teeth. */}
            {i === 1 && bars[i] > 0.9 ? (
              <g transform={`translate(${640 + w} ${y + 36})`}>
                <path d={`M-40 -36 L-20 ${-14 + chomp * 0.3} L0 -36 Z M-40 36 L-20 ${14 - chomp * 0.3} L0 36 Z`} fill={CREAM} />
                <circle cx={-60} cy={-12} r={9} fill={INK} />
              </g>
            ) : null}
          </g>
        );
      })}
      {/* The ring stamped round the prompt that ate them. */}
      {stamp > 0.01 ? (
        <g transform={`translate(720 1011) scale(${2.2 - s}) rotate(-4)`} opacity={Math.min(stamp * 1.5, 1)}>
          <ellipse rx={260} ry={66} fill="none" stroke={RED} strokeWidth={14} />
          <ellipse rx={260} ry={66} fill="none" stroke="#ff9b8a" strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

// claude-md-improver: the memory file on a stone tablet in the village square. Stale lines are fixed, the grade goes up.
const TABLET = [
  { old: "run: npm start" },
  { old: "db: mysql", now: "db: sqlite" },
  { old: "test: npm test" },
  { old: "node 14", now: "node 22" },
  { old: "style: tabs" },
];
export const Tablet: React.FC<{ fix: number[]; grade: number }> = ({ fix, grade }) => {
  let n = -1;
  const g = Math.min(grade, 1.3);
  return (
    <g>
      <Sky color={VILLAGE} />
      {[730, 1050].map((x, i) => (
        <g key={x} transform={`translate(${x} 1250)`}>
          <rect x={-70} y={-160 - i * 30} width={140} height={260 + i * 30} fill="#202a4c" />
          <path d={`M-90 ${-160 - i * 30} L0 ${-250 - i * 30} L90 ${-160 - i * 30}Z`} fill="#1a2240" />
          <rect x={-30} y={-110 - i * 30} width={60} height={60} fill={AMBER} opacity={0.75} />
        </g>
      ))}
      <rect x={-60} y={1350} width={1200} height={700} fill="#4b4f6b" />
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={i} x={(i % 11) * 110 - 40 + (i > 10 ? 55 : 0)} y={1420 + (i > 10 ? 110 : 0)} width={90} height={40} rx={12} fill="#585d7c" />
      ))}
      {/* Stand and tablet. */}
      <rect x={300} y={1380} width={60} height={280} fill="#6d7290" />
      <rect x={220} y={1630} width={220} height={30} rx={8} fill="#6d7290" />
      <rect x={60} y={760} width={560} height={640} rx={36} fill="#c9c3b4" stroke="#6d7290" strokeWidth={10} />
      <rect x={60} y={760} width={560} height={96} rx={36} fill={INK} />
      <text x={110} y={826} fontSize={46} fill={CREAM} fontFamily="monospace" fontWeight={700}>
        CLAUDE.md
      </text>
      {TABLET.map((row, i) => {
        const y = 940 + i * 96;
        if (!row.now) {
          return (
            <text key={i} x={100} y={y} fontSize={38} fill={INK} fontFamily="monospace" fontWeight={700}>
              {row.old}
            </text>
          );
        }
        n += 1;
        const p = Math.max(0, Math.min(fix[n], 1.1));
        const strike = interpolate(p, [0, 0.5], [0, 1], CLAMP);
        const swap = interpolate(p, [0.55, 1], [0, 1], CLAMP);
        const width = row.old.length * 23;
        return (
          <g key={i}>
            <g opacity={1 - swap} transform={`translate(${-swap * 60} 0)`}>
              <text x={100} y={y} fontSize={38} fill={RED} fontFamily="monospace" fontWeight={700}>
                {row.old}
              </text>
              {strike > 0.01 ? <rect x={94} y={y - 16} width={(width + 12) * strike} height={8} rx={4} fill={RED} /> : null}
            </g>
            {swap > 0.01 ? (
              <text x={100} y={y} fontSize={38} fill="#2f7a4a" opacity={swap} transform={`translate(${(1 - swap) * 60} 0)`} fontFamily="monospace" fontWeight={700}>
                {row.now}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* The grade: a red D that is stamped into a green A. */}
      <g transform={`translate(540 1010) scale(${grade > 0.01 ? 2.2 - g : 1})`}>
        <circle r={62} fill={grade > 0.5 ? GREEN : RED} stroke={INK} strokeWidth={6} />
        <text y={30} textAnchor="middle" fontSize={84} fill={INK} {...text}>
          {grade > 0.5 ? "A" : "D"}
        </text>
      </g>
    </g>
  );
};

// research: a campsite at night with a library tower where the side agent goes to read.
export const Camp: React.FC<{ reading: number }> = ({ reading }) => {
  const frame = useCurrentFrame();
  const flick = Math.sin(frame / 2.3) * 8 + Math.sin(frame / 3.7) * 6;
  return (
    <g>
      <Sky color={NIGHT} />
      {Array.from({ length: 18 }, (_, i) => (
        <circle key={i} cx={(i * 197) % 1080} cy={640 + ((i * 131) % 400)} r={i % 3 ? 3 : 5} fill={CREAM} opacity={0.4 + 0.4 * Math.sin(frame / 9 + i)} />
      ))}
      <circle cx={180} cy={760} r={60} fill={CREAM} opacity={0.8} />
      <circle cx={204} cy={744} r={56} fill={NIGHT} />
      <path d="M-60 1360 Q300 1260 600 1340 T1140 1320 V1460 H-60Z" fill="#0e1426" />
      {/* The tower of docs on the hill. */}
      <g>
        <rect x={720} y={880} width={160} height={480} fill="#2a3352" />
        <path d="M700 880 L800 760 L900 880Z" fill="#1a2240" />
        <rect x={770} y={930} width={60} height={80} rx={30} fill={AMBER} opacity={0.6 + 0.4 * reading} />
        <rect x={770} y={1060} width={60} height={80} rx={30} fill={AMBER} opacity={0.5} />
        <rect x={730} y={1200} width={140} height={60} rx={10} fill={CREAM} />
        <text x={800} y={1246} textAnchor="middle" fontSize={40} fill={INK} {...text}>
          DOCS
        </text>
      </g>
      <rect x={-60} y={1400} width={1200} height={700} fill="#1f2a3a" />
      <g transform="translate(960 1650)">
        <path d="M-70 0 L70 -20 M-70 -20 L70 0" stroke={WOOD_DARK} strokeWidth={18} strokeLinecap="round" />
        <circle cy={-60} r={130} fill={AMBER} opacity={0.12} />
        <path d={`M-50 -14 Q-60 ${-90 - flick} 0 ${-150 - flick} Q60 ${-90 + flick} 50 -14Z`} fill="#ef8a3c" />
        <path d={`M-26 -14 Q-30 ${-60 + flick} 0 ${-100 - flick} Q30 ${-60 - flick} 26 -14Z`} fill={AMBER} />
      </g>
    </g>
  );
};

// The side agent: a small flying helper. Pages flutter round it while it reads.
export const Helper: React.FC<{ x: number; y: number; s: number; reading: number; carry: boolean }> = ({ x, y, s, reading, carry }) => {
  const frame = useCurrentFrame();
  if (s <= 0.01) return null;
  const spin = Math.cos(frame / 1.5);
  return (
    <g transform={`translate(${x} ${y}) scale(${1.4 * Math.min(s, 1.15)})`}>
      {reading > 0.01
        ? [0, 1, 2].map((i) => {
            const a = frame / 7 + (i * Math.PI * 2) / 3;
            return (
              <rect key={i} x={Math.cos(a) * 90 - 18} y={Math.sin(a) * 40 - 60} width={36} height={46} rx={4} fill={CREAM} opacity={reading} transform={`rotate(${Math.sin(a) * 20})`} />
            );
          })
        : null}
      <path d="M0 -36 V-52" stroke={INK} strokeWidth={6} />
      <rect x={-50 * Math.abs(spin)} y={-60} width={100 * Math.abs(spin)} height={10} rx={5} fill={CREAM} />
      <circle r={38} fill="#8fb3c9" stroke={INK} strokeWidth={6} />
      <rect x={-26} y={-16} width={52} height={26} rx={12} fill={INK} />
      <circle cx={-11} cy={-3} r={6} fill={GREEN} />
      <circle cx={11} cy={-3} r={6} fill={GREEN} />
      {carry ? (
        <g transform="translate(0 56) rotate(-6)">
          <rect x={-30} y={-22} width={60} height={44} rx={6} fill={CREAM} stroke={INK} strokeWidth={4} />
          <path d="M-30 -22 L0 2 L30 -22" fill="none" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
    </g>
  );
};

export const Note: React.FC<{ hand: [number, number]; s: number }> = ({ hand, s }) => {
  if (s <= 0.01) return null;
  const k = Math.min(s, 1.15);
  return (
    <g transform={`translate(${hand[0] + 30} ${hand[1] - 40}) scale(${k}) rotate(-8)`}>
      <circle r={90} fill={AMBER} opacity={0.18} />
      <rect x={-60} y={-44} width={120} height={88} rx={10} fill={CREAM} stroke={INK} strokeWidth={5} />
      <path d="M-60 -44 L0 6 L60 -44" fill="none" stroke={INK} strokeWidth={5} />
    </g>
  );
};

// prototype: a canyon. A small cardboard model of a fancy bridge is tested on a crate first, and falls over;
// then one plain plank goes across.
const MODEL = [
  { x: 430, y: 1150, w: 34, h: 490 },
  { x: 696, y: 1150, w: 34, h: 490 },
  { x: 400, y: 1628, w: 360, h: 26 },
  { x: 470, y: 1520, w: 220, h: 70 },
  { x: 490, y: 1430, w: 180, h: 70 },
  { x: 510, y: 1340, w: 140, h: 70 },
  { x: 525, y: 1250, w: 110, h: 70 },
  { x: 380, y: 1130, w: 140, h: 40 },
  { x: 646, y: 1130, w: 140, h: 40 },
];
// The model is the old full-size bridge drawn at 0.38 on top of the crate (crate top at y 1530).
const MS = 0.38;
const MX = 232 - 380 * MS;
const MY = 1530 - 1654 * MS;
export const Canyon: React.FC<{ collapse: number; plank: number }> = ({ collapse, plank }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - collapse);
  const falling = frame >= collapse;
  return (
    <g>
      <Sky color={CANYON} />
      <circle cx={930} cy={820} r={90} fill="#e0875a" opacity={0.55} />
      <path d="M-60 1330 L120 1330 L160 1250 L330 1250 L360 1330 L720 1330 L760 1210 L960 1210 L1000 1330 H1140 V1500 H-60Z" fill="#8a4a45" />
      <rect x={380} y={1500} width={400} height={500} fill="#2a1418" />
      <path d="M-60 1650 H400 L380 2000 H-60Z" fill="#a65a3f" />
      <path d="M760 1650 H1140 V2000 H780Z" fill="#a65a3f" />
      <rect x={-60} y={1650} width={460} height={14} fill="#c77a55" />
      <rect x={760} y={1650} width={380} height={14} fill="#c77a55" />
      {/* The crate with the model on it. */}
      <rect x={226} y={1530} width={170} height={120} rx={8} fill={WOOD} stroke={WOOD_DARK} strokeWidth={6} />
      <text x={311} y={1608} textAnchor="middle" fontSize={40} fill={CREAM} {...text}>
        TEST
      </text>
      <g transform={`translate(${MX} ${MY}) scale(${MS})`}>
        {MODEL.map((b, i) => {
          // Each piece falls until it lands on the crate, then stays in the heap.
          const land = Math.max(0, 1654 - (i % 3) * 20 - (b.y + b.h));
          const k = 0.9 * (0.8 + (i % 4) * 0.12);
          const tt = falling ? Math.min(t, Math.sqrt(land / k)) : 0;
          const dy = k * tt * tt;
          const dx = ((i % 3) - 1) * tt * 4;
          const r = (((i % 3) - 1) * 2.6 + (i % 2 ? 1 : -1)) * tt;
          return (
            <g key={i} transform={`translate(${dx} ${dy}) rotate(${r} ${b.x + b.w / 2} ${b.y + b.h / 2})`}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} fill={i < 3 ? "#b88a52" : "#d8b47a"} stroke="#7a5530" strokeWidth={8} />
            </g>
          );
        })}
      </g>
      {/* The real thing: one plank, exactly as long as the gap. */}
      {plank > 0.001 ? (
        <g transform={`translate(${(1 - Math.min(plank, 1.05)) * -380} 0)`}>
          <rect x={392} y={1632} width={376} height={26} rx={8} fill={WOOD} stroke={WOOD_DARK} strokeWidth={5} />
        </g>
      ) : null}
    </g>
  );
};

// diagnosing-bugs: a mountain trail with a bug in the grass, a jar, and a test lamp.
export const Trail: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Sky color={TRAIL} />
      <Cloud x={((frame * 0.5 + 500) % 1400) - 160} y={820} s={0.9} o={0.3} />
      <path d="M-60 1400 L40 1180 L120 1260 L200 1200 L400 1400Z" fill="#273f5c" />
      <path d="M700 1400 L900 1000 L1140 1400Z" fill="#273f5c" />
      <path d="M900 1000 L950 1100 L925 1092 L900 1115 L875 1092 L850 1100Z" fill={CREAM} opacity={0.85} />
      <path d="M-60 1380 Q540 1300 1140 1380 V2000 H-60Z" fill="#4c6b4a" />
      <path d="M-60 1700 Q300 1630 600 1650 T1140 1600 V1700 Q700 1720 400 1720 T-60 1760Z" fill="#a89470" />
    </g>
  );
};

export const BugHunt: React.FC<{ jar: number; red: number; green: number }> = ({ jar, red, green }) => {
  const frame = useCurrentFrame();
  const caught = jar > 0.5;
  // It scurries until the jar comes down, then it is stuck at x 540.
  const bx = caught ? 522 : 540 + Math.sin(frame / 7) * 150;
  const dir = caught ? 1 : Math.cos(frame / 7) >= 0 ? 1 : -1;
  const legs = Math.sin(frame / (caught ? 4 : 1.5)) * 8;
  const gone = green;
  const jy = interpolate(Math.min(jar, 1.1), [0, 1], [-520, 0]);
  return (
    <g>
      {/* Test lamp. */}
      <rect x={848} y={1100} width={24} height={560} fill="#4b4f6b" />
      <rect x={790} y={890} width={140} height={230} rx={24} fill={INK} stroke={CREAM} strokeWidth={4} strokeOpacity={0.4} />
      <text x={860} y={870} textAnchor="middle" fontSize={44} fill={CREAM} {...text}>
        TEST
      </text>
      <circle cx={860} cy={950} r={40} fill={RED} opacity={0.2 + 0.8 * red * (1 - green)} />
      <circle cx={860} cy={1060} r={40} fill={GREEN} opacity={0.2 + 0.8 * green} />
      {red * (1 - green) > 0.5 ? <circle cx={860} cy={950} r={70} fill={RED} opacity={0.25} /> : null}
      {green > 0.5 ? <circle cx={860} cy={1060} r={70} fill={GREEN} opacity={0.25} /> : null}
      {/* The bug. */}
      {gone < 0.98 ? (
        <g transform={`translate(${bx} 1630) scale(${dir * (1 - gone)} ${1 - gone})`}>
          {[-24, 0, 24].map((lx, i) => (
            <path key={lx} d={`M${lx} 0 L${lx - 12 + (i % 2 ? legs : -legs)} 22 M${lx} 0 L${lx + 12 + (i % 2 ? -legs : legs)} 22`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
          ))}
          <ellipse rx={46} ry={28} cy={-8} fill="#9b3fbf" stroke={INK} strokeWidth={6} />
          <path d="M0 -36 V20" stroke={INK} strokeWidth={4} />
          <circle cx={44} cy={-18} r={20} fill="#9b3fbf" stroke={INK} strokeWidth={6} />
          <circle cx={50} cy={-22} r={6} fill={CREAM} />
          <path d="M54 -36 Q66 -66 80 -62 M42 -38 Q46 -70 60 -72" fill="none" stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      {/* The jar that proves it is there. */}
      {jar > 0.01 && green < 0.98 ? (
        <g transform={`translate(540 ${1650 + jy})`} opacity={1 - green}>
          <rect x={-90} y={-150} width={180} height={150} rx={24} fill={CREAM} opacity={0.18} stroke={CREAM} strokeWidth={6} />
          <rect x={-100} y={-172} width={200} height={30} rx={10} fill={AMBER} stroke={WOOD_DARK} strokeWidth={5} />
          <path d="M-60 -120 V-40" stroke={CREAM} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};

// The token pouch on his hip. It follows the hip, so it moves with every pose.
export const Pouch: React.FC<{ hip: [number, number]; bulge: number }> = ({ hip, bulge }) => {
  const x = hip[0] - 62;
  const y = hip[1] + 20;
  const b = 1 + 0.12 * bulge;
  return (
    <g transform={`translate(${x} ${y}) scale(${b})`}>
      <path d="M-34 -30 Q-56 30 0 40 Q56 30 34 -30Z" fill={LEATHER} stroke={WOOD_DARK} strokeWidth={6} />
      <path d="M-34 -30 Q0 -14 34 -30" fill="none" stroke={WOOD_DARK} strokeWidth={6} />
      <circle cx={-8} cy={-32} r={13} fill={AMBER} stroke={WOOD_DARK} strokeWidth={4} />
      <circle cx={14} cy={-36} r={11} fill={AMBER} stroke={WOOD_DARK} strokeWidth={4} />
      <text y={16} textAnchor="middle" fontSize={34} fill={WOOD_DARK} {...text}>
        T
      </text>
    </g>
  );
};

// The five item icons, drawn at 0,0 in about 100 px.
export const ItemIcon: React.FC<{ i: number }> = ({ i }) => {
  if (i === 0)
    return (
      <g>
        <rect x={-46} y={40} width={92} height={8} rx={4} fill={CREAM} />
        <rect x={-40} y={10} width={22} height={30} rx={4} fill={GREEN} />
        <rect x={-11} y={-44} width={22} height={84} rx={4} fill={RED} />
        <rect x={18} y={0} width={22} height={40} rx={4} fill={GREEN} />
      </g>
    );
  if (i === 1)
    return (
      <g>
        <rect x={-36} y={-46} width={72} height={92} rx={8} fill={CREAM} />
        <rect x={-24} y={-30} width={36} height={7} rx={3} fill={INK} />
        <rect x={-24} y={-14} width={28} height={7} rx={3} fill={INK} />
        <circle cx={14} cy={20} r={22} fill={GREEN} stroke={INK} strokeWidth={4} />
        <text x={14} y={31} textAnchor="middle" fontSize={30} fill={INK} {...text}>
          A
        </text>
      </g>
    );
  if (i === 2)
    return (
      <g>
        <path d="M0 -30 Q-26 -42 -50 -34 V36 Q-26 28 0 40 Z" fill={CREAM} stroke={INK} strokeWidth={4} />
        <path d="M0 -30 Q26 -42 50 -34 V36 Q26 28 0 40 Z" fill={CREAM} stroke={INK} strokeWidth={4} />
        <path d="M-38 -16 H-12 M-38 0 H-12 M12 -16 H38 M12 0 H38" stroke="#8a8478" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  if (i === 3)
    return (
      <g>
        <rect x={-46} y={10} width={92} height={36} rx={6} fill={WOOD} stroke={WOOD_DARK} strokeWidth={4} />
        <rect x={-38} y={-40} width={12} height={50} rx={3} fill="#d8b47a" />
        <rect x={26} y={-40} width={12} height={50} rx={3} fill="#d8b47a" />
        <rect x={-44} y={-8} width={88} height={10} rx={3} fill="#b88a52" />
      </g>
    );
  return (
    <g>
      <rect x={-38} y={-34} width={76} height={74} rx={14} fill={CREAM} opacity={0.25} stroke={CREAM} strokeWidth={5} />
      <rect x={-44} y={-46} width={88} height={16} rx={6} fill={AMBER} />
      <ellipse cy={14} rx={22} ry={14} fill="#9b3fbf" stroke={INK} strokeWidth={4} />
      <circle cx={22} cy={6} r={9} fill="#9b3fbf" stroke={INK} strokeWidth={4} />
    </g>
  );
};

// The bar under every scene: level, a token gauge, and five slots that fill one per skill.
export const Hud: React.FC<{ level: number; tokens: number; got: number[]; active: number }> = ({ level, tokens, got, active }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={30} y={1712} width={1020} height={168} rx={30} fill={INK} opacity={0.88} stroke={CREAM} strokeWidth={4} strokeOpacity={0.3} />
      <rect x={58} y={1740} width={100} height={52} rx={14} fill={level > 1 ? GREEN : AMBER} />
      <text x={108} y={1779} textAnchor="middle" fontSize={34} fill={INK} {...text}>
        {`LV ${level}`}
      </text>
      <rect x={180} y={1752} width={160} height={28} rx={14} fill="#33424a" />
      <rect x={180} y={1752} width={160 * Math.max(0, Math.min(tokens, 1))} height={28} rx={14} fill={tokens < 0.95 ? RED : GREEN} />
      <text x={199} y={1840} textAnchor="middle" fontSize={30} fill={CREAM} opacity={0.85} {...text}>
        T
      </text>
      <circle cx={199} cy={1830} r={22} fill="none" stroke={AMBER} strokeWidth={5} />
      <text x={232} y={1842} fontSize={32} fill={CREAM} {...text}>
        TOKENS
      </text>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 380 + i * 132;
        const pop = Math.min(got[i], 1.15);
        const on = active === i;
        return (
          <g key={i}>
            <rect
              x={x}
              y={1730}
              width={118}
              height={132}
              rx={20}
              fill="#1d2a30"
              stroke={on ? AMBER : CREAM}
              strokeOpacity={on ? 0.6 + 0.4 * Math.sin(frame / 4) : 0.3}
              strokeWidth={on ? 7 : 4}
            />
            {pop > 0.01 ? (
              <g transform={`translate(${x + 59} 1782) scale(${0.85 * pop})`}>
                <ItemIcon i={i} />
              </g>
            ) : null}
            <text x={x + 59} y={1850} textAnchor="middle" fontSize={26} fill={pop > 0.01 ? AMBER : "#5b6a72"} {...text}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// A ring of stars for "Level up".
export const Burst: React.FC<{ from: number; x: number; y: number }> = ({ from, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0 || t > 40) return null;
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 40 + t * 14;
        return (
          <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={14 - t * 0.3} fill={i % 2 ? AMBER : GREEN} opacity={1 - t / 40} />
        );
      })}
    </g>
  );
};
