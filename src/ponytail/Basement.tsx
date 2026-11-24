import { useCurrentFrame } from "remotion";
import { fontFamily } from "../theme";

export const BASEMENT_WALL = "#2b2421";
const WOOD = "#8a6a48";
const WOOD_DARK = "#5e4630";
const COPPER = "#8f6543";
const BINDERS = [
  ["#6f7d5c", 46, 108],
  ["#8d5a43", 40, 96],
  ["#b89a5c", 52, 112],
  ["#566a72", 42, 100],
  ["#8d5a43", 48, 110],
  ["#6f7d5c", 38, 92],
  ["#b89a5c", 46, 104],
] as const;

export const Basement: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = 0.92 + Math.sin(frame / 3.1) * 0.03 + Math.sin(frame / 7.7) * 0.05;
  const steam = Math.sin(frame / 12) * 7;
  let binderX = 462;

  return (
    <g>
      <defs>
        <pattern id="bricks" width={180} height={92} patternUnits="userSpaceOnUse">
          <path
            d="M0 0 H180 M0 46 H180 M0 0 V46 M90 46 V92"
            stroke="#3b312c"
            strokeWidth={5}
            fill="none"
          />
        </pattern>
        <radialGradient id="bulbGlow">
          <stop offset="0%" stopColor="#ffcf7a" stopOpacity={0.48} />
          <stop offset="100%" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect x={-40} y={-40} width={1160} height={2000} fill={BASEMENT_WALL} />
      <rect x={-40} y={650} width={1160} height={960} fill="url(#bricks)" />
      <ellipse cx={850} cy={930} rx={720} ry={620} fill="url(#bulbGlow)" opacity={flicker} />

      {/* Pipes */}
      <rect x={-40} y={662} width={1160} height={28} fill={COPPER} />
      <rect x={-40} y={700} width={1160} height={12} fill="#5f4a3a" />
      {[120, 520, 980].map((x) => (
        <rect key={x} x={x} y={652} width={34} height={70} rx={4} fill="#4e3b2d" />
      ))}

      {/* Poster */}
      <rect x={62} y={734} width={264} height={164} rx={4} fill="#d8cdb6" transform="rotate(-2 194 816)" />
      <text
        x={194}
        y={842}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontWeight={900}
        fontSize={70}
        fill="#2b2421"
        transform="rotate(-2 194 816)"
      >
        YAGNI
      </text>

      {/* Binder shelf */}
      {BINDERS.map(([color, width, height]) => {
        const x = binderX;
        binderX += width + 5;
        return (
          <rect
            key={`${color}-${x}`}
            x={x}
            y={830 - height}
            width={width}
            height={height}
            rx={3}
            fill={color}
          />
        );
      })}
      <rect x={440} y={830} width={480} height={16} fill={WOOD_DARK} />

      {/* Bulb */}
      <path d="M980 712 V770" stroke="#1b1614" strokeWidth={6} />
      <rect x={966} y={766} width={28} height={24} fill="#1b1614" />
      <circle cx={980} cy={812} r={30} fill="#ffe0a0" opacity={flicker} />

      {/* Floor */}
      <rect x={-40} y={1590} width={1160} height={370} fill="#3b3631" />
      <path
        d="M-40 1712 C200 1698 360 1740 620 1716 S980 1700 1120 1732 M240 1800 L420 1870 M760 1780 L690 1880"
        fill="none"
        stroke="#2c2824"
        strokeWidth={6}
      />

      {/* Chair */}
      <rect x={96} y={1060} width={46} height={320} rx={22} fill="#8e6a2d" />
      <rect x={96} y={1372} width={230} height={40} rx={16} fill="#8e6a2d" />
      <rect x={196} y={1410} width={24} height={170} fill="#1b1614" />
      <path
        d="M110 1640 L208 1570 L306 1640"
        fill="none"
        stroke="#1b1614"
        strokeWidth={20}
        strokeLinecap="round"
      />

      {/* Desk: an old door on two crates */}
      <rect x={330} y={1330} width={160} height={320} fill={WOOD_DARK} />
      <rect x={880} y={1330} width={160} height={320} fill={WOOD_DARK} />
      {[1400, 1480, 1560].map((y) => (
        <g key={y}>
          <rect x={330} y={y} width={160} height={10} fill="#49351f" />
          <rect x={880} y={y} width={160} height={10} fill="#49351f" />
        </g>
      ))}
      <rect x={290} y={1300} width={770} height={34} fill={WOOD} />
      <rect x={350} y={1282} width={190} height={20} rx={5} fill="#c7bda9" />

      {/* CRT */}
      <rect x={440} y={866} width={460} height={424} rx={26} fill="#c9bda4" />
      <rect x={470} y={905} width={400} height={290} rx={18} fill="#10160f" />
      <circle cx={800} cy={1244} r={20} fill="#8f8570" />
      <circle cx={850} cy={1244} r={20} fill="#8f8570" />
      <rect x={490} y={1232} width={200} height={14} rx={7} fill="#8f8570" />

      {/* Mug */}
      <rect x={950} y={1242} width={60} height={60} rx={8} fill="#b6533f" />
      <path
        d={`M968 1234 q${steam} -22 0 -44 M992 1234 q${-steam} -22 0 -44`}
        fill="none"
        stroke="#e8dcc4"
        strokeOpacity={0.5}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* Legacy box */}
      <path d="M760 1740 h290 v140 h-290 Z" fill="#a8824f" />
      <path d="M760 1740 l36 -36 h218 l36 36 Z" fill="#c29a62" />
      <text
        x={905}
        y={1830}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontWeight={900}
        fontSize={48}
        fill="#3b2a18"
      >
        LEGACY
      </text>
    </g>
  );
};
