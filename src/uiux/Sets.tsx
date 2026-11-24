import { useCurrentFrame } from "remotion";
import { AMBER, CREAM } from "../theme";

export const AD = "#a8322a";
export const STAGE = "#141a3a";
export const DARK = "#11181c";
export const STUDIO = "#1d4a4a";
export const CORK = "#5a3d2b";
export const SLATE = "#2a2f3a";
export const BAY = "#17402f";
export const CURTAIN = "#7a2231";
// Top of every desk and plinth a monitor stands on.
export const DESK_Y = 1322;

const Backdrop: React.FC<{ fill: string }> = ({ fill }) => (
  <rect x={-40} y={-40} width={1160} height={2000} fill={fill} />
);

const Floor: React.FC<{ fill: string; edge: string }> = ({ fill, edge }) => (
  <>
    <rect x={-40} y={1650} width={1160} height={310} fill={fill} />
    <rect x={-40} y={1650} width={1160} height={10} fill={edge} />
  </>
);

// TV ad studio: a turning sunburst behind the monitor and a row of blinking bulbs.
export const AdSet: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Backdrop fill={AD} />
      <g transform={`rotate(${frame * 0.25} 690 1010)`}>
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            transform={`rotate(${i * 30} 690 1010)`}
            d="M690 1010 L2380 788 L2380 1232Z"
            fill={CREAM}
            opacity={0.06}
          />
        ))}
      </g>
      <rect x={590} y={DESK_Y} width={200} height={330} fill="#7d251f" />
      <rect x={530} y={DESK_Y} width={320} height={30} rx={8} fill="#8f2c25" />
      <Floor fill="#6e1f1a" edge="#8f2c25" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx={i * 84 - 6}
          cy={1655}
          r={10}
          fill={(Math.floor(frame / 6) + i) % 2 ? AMBER : "#7d4a1e"}
        />
      ))}
    </g>
  );
};

// Product stage: two sweeping spotlights on a podium.
export const StageSet: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 22) * 60;
  return (
    <g>
      <Backdrop fill={STAGE} />
      {[
        [-40, 310 + sway],
        [1120, 310 - sway],
      ].map(([from, to], i) => (
        <path key={i} d={`M${from} -40 L${to - 260} 1650 H${to + 260}Z`} fill={CREAM} opacity={0.07} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <circle
          key={i}
          cx={60 + ((i * 263) % 980)}
          cy={700 + ((i * 197) % 560)}
          r={5}
          fill={AMBER}
          opacity={0.25 + 0.25 * Math.sin(frame / 5 + i * 2)}
        />
      ))}
      <Floor fill="#0c1026" edge="#2a3270" />
      <rect x={70} y={1570} width={480} height={84} rx={14} fill="#2a3270" />
      <rect x={70} y={1570} width={480} height={14} rx={7} fill={AMBER} />
    </g>
  );
};

// The honest room: lights off, one lamp. cx is where the light falls.
export const DarkSet: React.FC<{ cx: number }> = ({ cx }) => (
  <g>
    <Backdrop fill={DARK} />
    <path d={`M${cx - 70} -40 L${cx - 330} 1650 H${cx + 330} L${cx + 70} -40Z`} fill={CREAM} opacity={0.05} />
    <Floor fill="#0a0f12" edge="#26343b" />
    <ellipse cx={cx} cy={1668} rx={330} ry={24} fill={CREAM} opacity={0.07} />
  </g>
);

// Design studio: pegboard wall and a standing desk with a keyboard.
export const StudioSet: React.FC = () => (
  <g>
    <Backdrop fill={STUDIO} />
    {Array.from({ length: 77 }, (_, i) => (
      <circle key={i} cx={50 + (i % 7) * 46} cy={720 + Math.floor(i / 7) * 46} r={6} fill="#163c3c" />
    ))}
    <Floor fill="#123434" edge="#2a6a6a" />
    <rect x={310} y={DESK_Y + 30} width={30} height={300} fill="#a87545" />
    <rect x={1000} y={DESK_Y + 30} width={30} height={300} fill="#a87545" />
    <rect x={250} y={DESK_Y} width={870} height={30} rx={8} fill="#c98f5a" />
    <rect x={262} y={DESK_Y - 18} width={132} height={18} rx={6} fill="#0b0d12" />
  </g>
);

// Moodboard wall: cork with a wooden rail.
export const CorkSet: React.FC = () => (
  <g>
    <Backdrop fill={CORK} />
    {Array.from({ length: 70 }, (_, i) => (
      <circle key={i} cx={((i * 197) % 1160) - 40} cy={660 + ((i * 331) % 980)} r={5} fill="#4d3323" />
    ))}
    <rect x={-40} y={648} width={1160} height={16} fill="#3c281b" />
    <Floor fill="#2e1f16" edge="#7a573d" />
  </g>
);

// The "do not" wall: slate with warning tape along the floor.
export const SlateSet: React.FC = () => (
  <g>
    <Backdrop fill={SLATE} />
    {[780, 1000, 1220, 1440].map((y) => (
      <rect key={y} x={-40} y={y} width={1160} height={4} fill="#323846" />
    ))}
    <Floor fill="#191c24" edge="#191c24" />
    {Array.from({ length: 20 }, (_, i) => (
      <path key={i} d={`M${i * 60 - 40} 1680 l30 -30 h30 l-30 30Z`} fill="#ef6a56" opacity={0.8} />
    ))}
  </g>
);

// Inspection bay: tiled green wall and a hanging lamp.
export const BaySet: React.FC = () => (
  <g>
    <Backdrop fill={BAY} />
    {[860, 1060, 1260, 1460].map((y) => (
      <rect key={y} x={-40} y={y} width={1160} height={4} fill="#1d4d39" />
    ))}
    <rect x={836} y={664} width={48} height={14} rx={7} fill="#0d271c" />
    <path d="M814 726 L1080 1650 H640 L906 726Z" fill={CREAM} opacity={0.04} />
    <path d="M806 730 L860 672 L914 730Z" fill={CREAM} />
    <Floor fill="#0d271c" edge="#2c6a50" />
  </g>
);

// Theater stage behind the curtain.
export const TheaterSet: React.FC = () => (
  <g>
    <Backdrop fill="#1a0f14" />
    <circle cx={690} cy={1010} r={520} fill={CREAM} opacity={0.05} />
    <rect x={590} y={DESK_Y} width={200} height={330} fill="#2a1a20" />
    <rect x={530} y={DESK_Y} width={320} height={30} rx={8} fill="#3a2530" />
    <Floor fill="#3a2418" edge={AMBER} />
  </g>
);

// open: 0 closed, 1 parted. The left panel stays wide enough for the stickman to stand in front of it.
export const Curtains: React.FC<{ open: number }> = ({ open }) => {
  const panel = (from: number, to: number) => (
    <g>
      <rect x={from} y={640} width={to - from} height={1012} fill={CURTAIN} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={from + ((i + 0.5) * (to - from)) / 9 - 4} y={640} width={8} height={1012} fill="#651a28" />
      ))}
      <rect x={from} y={1626} width={to - from} height={26} fill={AMBER} opacity={0.85} />
    </g>
  );
  return (
    <g>
      {panel(-40, 540 - open * 210)}
      {panel(540 + open * 500, 1120)}
      <rect x={-40} y={620} width={1160} height={90} fill="#651a28" />
      {Array.from({ length: 13 }, (_, i) => (
        <circle key={i} cx={i * 96 - 36} cy={710} r={48} fill="#651a28" />
      ))}
      <rect x={-40} y={620} width={1160} height={10} fill={AMBER} />
    </g>
  );
};
