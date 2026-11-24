import { useCurrentFrame } from "remotion";
import { AMBER, WALL } from "./theme";

const BOOKS = [
  ["#c9583f", 34, 92],
  ["#e0b04a", 26, 76],
  ["#4f8a8b", 40, 96],
  ["#e8dcc4", 24, 70],
  ["#8c5a7a", 36, 88],
  ["#c9583f", 28, 80],
] as const;

export const Room: React.FC = () => {
  const frame = useCurrentFrame();
  const steam = Math.sin(frame / 12) * 8;
  const ledOn = Math.floor(frame / 18) % 2 === 0;
  let bookX = 450;

  return (
    <g>
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={AMBER} stopOpacity={0.3} />
          <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10203a" />
          <stop offset="100%" stopColor="#2d4468" />
        </linearGradient>
      </defs>

      <rect width={1080} height={1920} fill={WALL} />
      <ellipse cx={700} cy={960} rx={640} ry={520} fill="url(#glow)" />

      {/* Window with the city outside */}
      <rect x={44} y={680} width={290} height={320} rx={8} fill="url(#night)" />
      <circle cx={270} cy={750} r={34} fill="#f3e6bd" />
      <path
        d="M44 1000 V900 h50 V850 h60 V920 h50 V870 h70 V930 h60 V1000 Z"
        fill="#0b1626"
      />
      {[
        [66, 930],
        [118, 880],
        [176, 950],
        [232, 900],
        [244, 950],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={14} height={18} fill={AMBER} />
      ))}
      <path
        d="M44 680 h290 v320 h-290 Z M189 680 v320 M44 840 h290"
        fill="none"
        stroke="#5a4634"
        strokeWidth={14}
      />

      {/* Shelf above the monitor */}
      {BOOKS.map(([color, width, height]) => {
        const x = bookX;
        bookX += width + 5;
        return (
          <rect
            key={`${color}-${x}`}
            x={x}
            y={752 - height}
            width={width}
            height={height}
            rx={3}
            fill={color}
          />
        );
      })}
      <path d="M800 752 h76 l-10 -58 h-56 Z" fill="#c9734a" />
      <path
        d="M838 696 C818 650 790 650 776 640 M838 696 C840 640 862 628 880 622 M838 696 C850 660 900 668 916 664"
        fill="none"
        stroke="#6fb07a"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <rect x={420} y={752} width={620} height={18} fill="#6a4a33" />
      <rect x={430} y={770} width={600} height={6} fill={AMBER} />

      {/* Floor */}
      <rect y={1590} width={1080} height={330} fill="#3b2b26" />
      {[1660, 1740, 1830].map((y) => (
        <rect key={y} y={y} width={1080} height={5} fill="#2c1f1b" />
      ))}
      <ellipse cx={560} cy={1770} rx={480} ry={90} fill="#7a3f3a" />
      <ellipse cx={560} cy={1770} rx={400} ry={66} fill="#914f45" />

      {/* Monitor */}
      <rect x={640} y={1210} width={120} height={70} fill="#11181c" />
      <rect x={570} y={1270} width={260} height={30} rx={8} fill="#11181c" />
      <rect x={360} y={782} width={670} height={438} rx={18} fill="#11181c" />

      {/* Chair */}
      <rect x={96} y={1060} width={46} height={320} rx={22} fill="#b5493a" />
      <rect x={96} y={1372} width={230} height={40} rx={16} fill="#b5493a" />
      <rect x={196} y={1410} width={24} height={170} fill="#11181c" />
      <path
        d="M110 1640 L208 1570 L306 1640"
        fill="none"
        stroke="#11181c"
        strokeWidth={20}
        strokeLinecap="round"
      />

      {/* Desk */}
      <rect x={290} y={1300} width={770} height={36} fill="#a0704a" />
      <rect x={1000} y={1336} width={36} height={320} fill="#7a5236" />
      <rect x={330} y={1336} width={36} height={320} fill="#7a5236" />
      <rect x={350} y={1282} width={190} height={20} rx={5} fill="#d9d2c3" />

      {/* Mug */}
      <rect x={884} y={1236} width={66} height={66} rx={8} fill="#e8dcc4" />
      <path
        d="M950 1250 h20 q14 0 14 14 v8 q0 14 -14 14 h-20"
        fill="none"
        stroke="#e8dcc4"
        strokeWidth={10}
      />
      <path
        d={`M906 1230 q${steam} -13 0 -24 M932 1230 q${-steam} -13 0 -24`}
        fill="none"
        stroke="#e8dcc4"
        strokeOpacity={0.55}
        strokeWidth={8}
        strokeLinecap="round"
      />

      {/* PC and pizza box */}
      <rect x={790} y={1430} width={150} height={226} rx={10} fill="#11181c" />
      <circle cx={865} cy={1470} r={14} fill={ledOn ? "#7fe0a0" : "#2a4a38"} />
      {[1510, 1540, 1570].map((y) => (
        <rect key={y} x={815} y={y} width={100} height={10} fill="#2c363b" />
      ))}
      <path d="M760 1800 h280 l-28 -40 h-224 Z" fill="#c8a06c" />
      <rect x={760} y={1800} width={280} height={18} fill="#a9824f" />
    </g>
  );
};
