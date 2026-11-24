import { interpolateColors, useCurrentFrame } from "remotion";
import { fontFamily } from "../theme";

export const INK = "#11181c";
export const ICE = "#8fd3ff";
export const EMBER = "#ff8a3c";
export const NIGHT = "#12172e";
export const PLANK = "#33271f";
export const SCROLL_WALL = "#2b2530";
export const SCRAP_WALL = "#262b30";
export const PAPER = "#e9dcc0";
export const IRON = "#59626d";
const STONE = "#4a4146";

// heat 0 is the cold forge (cache gone), 1 is the lit one (cache warm).
export const wallAt = (heat: number) => interpolateColors(heat, [0, 1], ["#1d2530", "#33201b"]);
export const barAt = (heat: number) => interpolateColors(heat, [0, 1], ["#8792a0", "#ff9a3c"]);

export const Backdrop: React.FC<{ wall: string }> = ({ wall }) => (
  <g>
    <rect x={-40} y={-40} width={1160} height={2000} fill={wall} />
    {Array.from({ length: 60 }, (_, i) => (
      <rect
        key={i}
        x={-40 + (i % 5) * 250 + (Math.floor(i / 5) % 2) * 125}
        y={700 + Math.floor(i / 5) * 80}
        width={236}
        height={66}
        rx={8}
        fill="#000"
        opacity={0.1}
      />
    ))}
    <rect x={-40} y={1650} width={1160} height={310} fill="#120e10" />
  </g>
);

export const Forge: React.FC<{ heat: number }> = ({ heat }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <radialGradient id="forge-glow">
          <stop offset="0" stopColor={EMBER} stopOpacity={0.5} />
          <stop offset="1" stopColor={EMBER} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Backdrop wall={wallAt(heat)} />
      <path d="M560 800 L1040 800 L940 700 L660 700Z" fill="#3c3438" />
      <rect x={570} y={800} width={460} height={850} fill={STONE} />
      <path d="M640 1180 V960 Q800 800 960 960 V1180Z" fill="#120c0c" />
      {heat > 0.02 ? (
        (
          [
            [800, 150, 260, "#ff5a2b"],
            [735, 85, 190, EMBER],
            [865, 85, 205, EMBER],
            [800, 75, 160, "#ffd27a"],
          ] as const
        ).map(([x, w, h, fill], i) => {
          const top = 1180 - h * heat * (1 + Math.sin(frame / 2.3 + i * 2.1) * 0.08);
          const mid = (1180 + top) / 2;
          return (
            <path
              key={i}
              d={`M${x - w} 1180 Q${x - w * 1.15} ${mid} ${x} ${top} Q${x + w * 1.15} ${mid} ${x + w} 1180Z`}
              fill={fill}
            />
          );
        })
      ) : (
        <ellipse cx={800} cy={1172} rx={130} ry={20} fill="#5d6670" />
      )}
      <ellipse cx={800} cy={1100} rx={560} ry={420} fill="url(#forge-glow)" opacity={heat} />
      <g fill={IRON} stroke={INK} strokeWidth={8} strokeLinejoin="round">
        <path d="M450 1400 H810 V1456 H450 L350 1424Z" />
        <path d="M530 1456 H740 L716 1560 H554Z" />
        <rect x={500} y={1560} width={270} height={90} rx={10} />
      </g>
    </g>
  );
};

// The chat as a bar of iron on the anvil.
export const Slab: React.FC<{ heat: number; label: string; ink?: string; frost?: boolean; pop?: number }> = ({
  heat,
  label,
  ink,
  frost,
  pop = 1,
}) => (
  <g transform={`translate(630 1400) scale(${pop}) translate(-630 -1400)`}>
    <rect x={400} y={1250} width={460} height={170} rx={28} fill="#ffcf7a" opacity={heat * 0.35} />
    <rect x={420} y={1270} width={420} height={130} rx={14} fill={barAt(heat)} stroke={INK} strokeWidth={8} />
    {frost
      ? [446, 520, 590, 668, 742, 800].map((x, i) => (
          <path key={x} d={`M${x} 1400 l13 ${38 + (i % 3) * 16} l13 ${-38 - (i % 3) * 16}Z`} fill={ICE} />
        ))
      : null}
    <text
      x={630}
      y={1365}
      textAnchor="middle"
      fontSize={84}
      fontFamily={fontFamily}
      fontWeight={900}
      fill={ink ?? interpolateColors(heat, [0, 1], ["#1b222b", "#5a2100"])}
    >
      {label}
    </text>
  </g>
);

// Outside the smithy at night. moon runs 0 to 1 across the sky, heat is the light left in the doorway.
export const Yard: React.FC<{ heat: number; moon: number }> = ({ heat, moon }) => (
  <g>
    <rect x={-40} y={-40} width={1160} height={2000} fill={NIGHT} />
    {Array.from({ length: 14 }, (_, i) => (
      <circle key={i} cx={(i * 197) % 1080} cy={720 + ((i * 83) % 380)} r={3 + (i % 2)} fill="#f4ecd2" opacity={0.7} />
    ))}
    <circle cx={130 + moon * 820} cy={980 - Math.sin(Math.PI * moon) * 220} r={54} fill="#f4ecd2" />
    <rect x={-40} y={1650} width={1160} height={310} fill="#0b0f1e" />
    <path d="M600 1090 L860 900 L1120 1090Z" fill="#1d1a28" />
    <rect x={640} y={1090} width={480} height={560} fill="#2a2536" />
    <path d="M760 1650 V1390 Q860 1290 960 1390 V1650Z" fill={interpolateColors(heat, [0, 1], ["#0d1322", "#ff9a3c"])} />
    <path d="M760 1650 H960 L1060 1780 H640Z" fill={EMBER} opacity={heat * 0.3} />
  </g>
);
