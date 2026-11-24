import { useCurrentFrame } from "remotion";
import { AMBER } from "../theme";
import { CAPE } from "./Rooftop";

export const HQ = "#2b2140";
export const BLUE = "#16407a";
export const DAY = "#2a3a86";
export const LAB = "#1c2b30";
const PAPER = "#e8f1ff";

const Backdrop: React.FC<{ fill: string }> = ({ fill }) => (
  <rect x={-40} y={-40} width={1160} height={2000} fill={fill} />
);

// Hero headquarters: two hanging lamps and a dark wainscot.
export const Hq: React.FC = () => (
  <g>
    <Backdrop fill={HQ} />
    {[120, 960].map((x) => (
      <g key={x}>
        <rect x={x - 3} y={-40} width={6} height={700} fill="#1a1329" />
        <path d={`M${x - 46} 706 L${x - 190} 1650 H${x + 190} L${x + 46} 706Z`} fill={AMBER} opacity={0.05} />
        <path d={`M${x - 46} 706 L${x} 652 L${x + 46} 706Z`} fill={AMBER} />
      </g>
    ))}
    <rect x={-40} y={1470} width={1160} height={180} fill="#231a36" />
    <rect x={-40} y={1464} width={1160} height={12} fill="#3d3059" />
    <rect x={-40} y={1650} width={1160} height={310} fill="#140e22" />
    <rect x={-40} y={1650} width={1160} height={10} fill="#3d3059" />
  </g>
);

// The AI as a small caped monitor on a pedestal. x, y is the monitor's top left corner.
export const Bot: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const wind = Math.sin(useCurrentFrame() / 7) * 10;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={90} y={170} width={60} height={1650 - y - 170} fill="#3d3059" />
      <rect x={50} y={1650 - y - 24} width={140} height={24} rx={8} fill="#4a3b6b" />
      <path
        d={`M228 10 Q${300 + wind} 40 ${322 + wind} 92 Q${298 + wind} 150 ${326 + wind * 1.4} 204 Q270 190 230 196Z`}
        fill={CAPE}
      />
      <rect width={240} height={180} rx={22} fill="#4a5290" />
      <rect x={-4} y={-8} width={248} height={16} rx={8} fill={CAPE} />
      <rect x={16} y={18} width={208} height={144} rx={12} fill="#0b0e1c" />
      <path transform="translate(120 90) scale(2.6)" d="M4 -20 L-12 3 L-2 3 L-5 20 L12 -4 L2 -4Z" fill={AMBER} />
    </g>
  );
};

// Drafting room: blueprint grid, a set square and rolled plans on the floor.
export const Blueprint: React.FC = () => (
  <g>
    <Backdrop fill={BLUE} />
    <g stroke="#2a5a9c" strokeWidth={3}>
      {Array.from({ length: 20 }, (_, i) => (
        <path key={`v${i}`} d={`M${i * 60 - 30} -40 V1650`} />
      ))}
      {Array.from({ length: 28 }, (_, i) => (
        <path key={`h${i}`} d={`M-40 ${i * 60} H1120`} />
      ))}
    </g>
    <rect x={-40} y={1650} width={1160} height={310} fill="#0e2c58" />
    <rect x={-40} y={1650} width={1160} height={10} fill={PAPER} opacity={0.5} />
    <path d="M800 1650 H1010 V1440Z" fill="none" stroke={PAPER} strokeWidth={12} strokeLinejoin="round" opacity={0.6} />
    {[0, 1].map((i) => (
      <g key={i} opacity={0.6}>
        <rect x={50 + i * 40} y={1570 - i * 56} width={210} height={64} rx={32} fill={PAPER} />
        <circle cx={82 + i * 40} cy={1602 - i * 56} r={16} fill={BLUE} />
      </g>
    ))}
  </g>
);

// Flying over the city: clouds, speed lines and rooftops all stream to the left.
export const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const loop = (start: number, speed: number, span: number) =>
    ((((start - frame * speed) % span) + span) % span) - 260;
  return (
    <g>
      <defs>
        <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a5d" stopOpacity={0} />
          <stop offset="1" stopColor="#f08a5d" stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <Backdrop fill={DAY} />
      <rect x={-40} y={1500} width={1160} height={460} fill="url(#dawn)" />
      {[
        [200, 1290, 7, 1],
        [800, 1560, 10, 1.2],
        [1200, 1330, 8, 0.8],
        [500, 700, 5, 0.7],
      ].map(([start, y, speed, s], i) => (
        <g key={i} transform={`translate(${loop(start, speed, 1600)} ${y}) scale(${s})`} fill="#4458ad">
          <ellipse cx={110} cy={40} rx={110} ry={34} />
          <ellipse cx={80} cy={18} rx={54} ry={30} />
          <ellipse cx={150} cy={12} rx={62} ry={36} />
        </g>
      ))}
      {[1270, 1385, 1520, 1600].map((y, i) => (
        <rect key={y} x={loop(i * 430, 46, 1700)} y={y} width={190} height={7} rx={4} fill="#e8f1ff" opacity={0.3} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={loop(i * 170, 9, 1530)} y={1700 + ((i * 53) % 110)} width={150} height={300} fill="#141a40" />
      ))}
    </g>
  );
};

// Test lab: tiled wall, hazard stripe and an alarm lamp. alarm is the lamp's color, or null when it is off.
export const Lab: React.FC<{ alarm: string | null }> = ({ alarm }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Backdrop fill={LAB} />
      {[820, 980, 1140, 1300, 1460].map((y) => (
        <rect key={y} x={-40} y={y} width={1160} height={4} fill="#24373d" />
      ))}
      <rect x={-40} y={1650} width={1160} height={310} fill="#10191c" />
      <g>
        {Array.from({ length: 20 }, (_, i) => (
          <path key={i} d={`M${i * 60 - 40} 1680 l30 -30 h30 l-30 30Z`} fill={AMBER} opacity={0.75} />
        ))}
      </g>
      {/* The glow stays near the lamp, so the wall behind the stickman keeps its color. */}
      {alarm ? (
        <>
          <defs>
            <radialGradient id="alarmGlow">
              <stop offset="0" stopColor={alarm} stopOpacity={0.5} />
              <stop offset="1" stopColor={alarm} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={150} cy={700} r={330} fill="url(#alarmGlow)" />
        </>
      ) : null}
      <rect x={96} y={700} width={108} height={22} rx={8} fill="#3a4f56" />
      <path d="M108 700 a42 42 0 0 1 84 0Z" fill={alarm ?? "#3a4f56"} />
      {alarm
        ? [0, 1, 2, 3, 4].map((i) => {
            const a = Math.PI + (i * Math.PI) / 4 + Math.sin(frame / 3) * 0.2;
            return (
              <path
                key={i}
                d={`M${150 + Math.cos(a) * 64} ${700 + Math.sin(a) * 64} l${Math.cos(a) * 34} ${Math.sin(a) * 34}`}
                stroke={alarm}
                strokeWidth={10}
                strokeLinecap="round"
              />
            );
          })
        : null}
    </g>
  );
};
