import { useCurrentFrame } from "remotion";

export const SKY = "#171c38";
export const CAPE = "#e2493f";
export const FAR = "#10142b";
const STEEL = "#2c335c";
const LIGHT = "#f3ecd0";

// [x, width, top]. Tops left of x=380 stay below y=1150, so the sky behind the stickman's head is plain.
const BUILDINGS: [number, number, number][] = [
  [-40, 150, 1230],
  [110, 120, 1170],
  [230, 150, 1290],
  [380, 130, 1010],
  [510, 170, 880],
  [680, 120, 1060],
  [800, 160, 820],
  [960, 160, 960],
];
const STARS = Array.from({ length: 26 }, (_, i) => [
  (i * 397) % 1080,
  40 + ((i * 251) % 1050),
  2 + (i % 3),
]);

// signal: 0 is dark, 1 is the bolt lit in the sky. cape: 0 to 1, the monitor's cape. desk: false leaves the roof empty.
export const Rooftop: React.FC<{ signal: number; cape: number; desk?: boolean }> = ({ signal, cape, desk = true }) => {
  const frame = useCurrentFrame();
  const wind = Math.sin(frame / 7) * 14;

  return (
    <g>
      <defs>
        <linearGradient id="roofHaze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3f86" stopOpacity={0} />
          <stop offset="1" stopColor="#3a3f86" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <rect x={-40} y={-40} width={1160} height={2000} fill={SKY} />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={LIGHT} opacity={0.3 + 0.2 * Math.sin(frame / 9 + i)} />
      ))}
      <rect x={-40} y={1100} width={1160} height={560} fill="url(#roofHaze)" />

      {signal > 0.01 ? (
        <g opacity={Math.min(signal, 1) * (0.95 + Math.sin(frame / 3) * 0.04)}>
          <path d="M930 1650 L768 770 L952 770Z" fill={LIGHT} opacity={0.1} />
          <g transform={`translate(860 770) scale(${0.6 + 0.4 * signal})`}>
            <circle r={92} fill={LIGHT} opacity={0.92} />
            <path d="M12 -62 L-36 8 L-6 8 L-16 62 L36 -12 L6 -12Z" fill={SKY} />
          </g>
        </g>
      ) : null}

      {BUILDINGS.map(([x, w, top], b) => (
        <g key={x}>
          <rect x={x} y={top} width={w} height={1650 - top} fill={FAR} />
          {Array.from({ length: Math.min(9, Math.floor((1620 - top) / 46)) }, (_, r) =>
            Array.from({ length: Math.floor((w - 24) / 34) }, (_, c) =>
              (b * 7 + r * 3 + c * 5) % 4 === 0 ? (
                <rect key={`${r}-${c}`} x={x + 18 + c * 34} y={top + 24 + r * 46} width={16} height={22} fill="#f4d27a" opacity={0.45} />
              ) : null,
            ),
          )}
        </g>
      ))}

      <rect x={-40} y={1650} width={1160} height={310} fill="#0b0e1f" />
      <rect x={-40} y={1650} width={1160} height={12} fill={STEEL} />

      {/* Antenna with a blinking light, and the searchlight under the beam. */}
      <path d="M1010 1650 V1370 M980 1440 H1040 M990 1500 H1030" stroke={STEEL} strokeWidth={10} strokeLinecap="round" />
      <circle cx={1010} cy={1362} r={9} fill={CAPE} opacity={frame % 40 < 20 ? 1 : 0.25} />
      <rect x={900} y={1612} width={60} height={38} rx={8} fill={STEEL} />

      {/* Air-conditioning unit. */}
      <rect x={104} y={1396} width={188} height={254} rx={12} fill={STEEL} />
      {[1450, 1490, 1530].map((y) => (
        <rect key={y} x={128} y={y} width={140} height={10} rx={5} fill={FAR} />
      ))}

      {desk ? (
        <g>
          {cape > 0.01 ? (
            <g transform={`translate(896 892) scale(${cape}) translate(-896 -892)`}>
              <path
                d={`M880 892 Q${990 + wind} 930 ${1040 + wind} 1010 Q${1004 + wind} 1120 ${1046 + wind * 1.4} 1216 Q960 1190 884 1200Z`}
                fill={CAPE}
              />
            </g>
          ) : null}
          <path d="M382 1650 L390 1328 H452 L462 1650Z M798 1650 L806 1328 H868 L878 1650Z" fill={STEEL} />
          <rect x={350} y={1290} width={550} height={42} rx={14} fill="#3b4378" />
          <rect x={640} y={1205} width={60} height={88} fill={STEEL} />
          <rect x={444} y={879} width={452} height={332} rx={34} fill="#4a5290" />
          <rect x={438} y={868} width={464} height={22} rx={11} fill={CAPE} opacity={Math.min(cape, 1)} />
          <rect x={470} y={905} width={400} height={280} rx={16} fill="#0b0e1c" />
          <rect x={372} y={1268} width={150} height={24} rx={7} fill="#525b9c" />
        </g>
      ) : null}
    </g>
  );
};
