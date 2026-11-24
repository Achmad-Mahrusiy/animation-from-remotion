import { useCurrentFrame } from "remotion";

export const STAGE_WALL = "#1d2136";
const WOOD = "#8a6a48";
const CANVAS = "#c9583f";

// Maps the laptop screen's own coordinates (190..1050 by 690..1360) onto the laptop on the desk.
export const SCREEN_ON_DESK = "translate(316 466) scale(0.6)";

// Animation studio: a light rig, a director's chair and a desk with a laptop.
// The beam and the dust are the quiet background layer the video talks about.
export const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = 0.3 + Math.sin(frame / 38) * 0.06;

  return (
    <g>
      <defs>
        <linearGradient id="stageBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4d9a0" stopOpacity={0.7} />
          <stop offset="1" stopColor="#f4d9a0" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={1160} height={2000} fill={STAGE_WALL} />

      <rect x={-40} y={52} width={1160} height={14} fill="#33395c" />
      {[250, 720, 940].map((x) => (
        <path key={x} d={`M${x - 8} 66 V92 M${x - 34} 92 H${x + 34} L${x + 46} 132 H${x - 46}Z`} fill="#33395c" stroke="#33395c" strokeWidth={8} />
      ))}

      <g opacity={0.45} fill="none" stroke="#565d8a" strokeWidth={7} strokeLinejoin="round">
        {[52, 150, 248].map((x, i) => (
          <g key={x}>
            <rect x={x} y={760} width={84} height={64} rx={8} />
            <path d={[`M${x + 14} 806 q28 -44 56 0`, `M${x + 16} 792 h52`, `M${x + 42} 776 v32`][i]} />
          </g>
        ))}
      </g>

      <path d="M640 132 L800 132 L1032 1650 H400Z" fill="url(#stageBeam)" opacity={glow} />
      {Array.from({ length: 9 }, (_, i) => {
        const t = ((frame * (0.5 + (i % 3) * 0.2) + i * 97) % 900) / 900;
        return (
          <circle
            key={i}
            cx={430 + ((i * 71) % 580) + Math.sin(frame / 50 + i) * 14}
            cy={1600 - t * 860}
            r={3 + (i % 3)}
            fill="#f4d9a0"
            opacity={0.3 * Math.sin(Math.PI * t)}
          />
        );
      })}

      <rect x={-40} y={1650} width={1160} height={310} fill="#14172a" />
      <ellipse cx={716} cy={1672} rx={330} ry={20} fill="#262b47" opacity={0.7} />

      <path d="M124 1400 V1180" stroke={WOOD} strokeWidth={16} strokeLinecap="round" />
      <rect x={110} y={1180} width={30} height={112} rx={8} fill={CANVAS} />
      <path d="M124 1322 H300" stroke={WOOD} strokeWidth={12} strokeLinecap="round" />
      <path d="M120 1416 L302 1650 M302 1416 L120 1650" stroke={WOOD} strokeWidth={16} strokeLinecap="round" />
      <rect x={108} y={1392} width={204} height={24} rx={8} fill={CANVAS} />

      <rect x={420} y={1342} width={20} height={308} fill="#6b5137" />
      <rect x={990} y={1342} width={20} height={308} fill="#6b5137" />
      <rect x={360} y={1312} width={690} height={30} rx={8} fill={WOOD} />
      <rect x={420} y={870} width={536} height={424} rx={16} fill="#0a0c16" />
      <path d="M388 1312 L420 1292 H956 L988 1312Z" fill="#565d8a" />
    </g>
  );
};
