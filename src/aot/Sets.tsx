import { fontFamily } from "../theme";

// Each set keeps a flat wall behind the heads, so the Stickman headFill can match it.
export const WALLS = {
  bedroom: "#1f2a44",
  court: "#3a2a22",
  community: "#24362d",
  cafe: "#3b2c2a",
  living: "#2b2d42",
} as const;
export type SetName = keyof typeof WALLS;

const FLOOR = 1650;
const label = { fontFamily, fontWeight: 900 } as const;

const Floor: React.FC<{ color: string }> = ({ color }) => (
  <rect x={-60} y={FLOOR} width={1200} height={400} fill={color} />
);

const Bedroom: React.FC<{ tv: number }> = ({ tv }) => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2100} fill={WALLS.bedroom} />
    <rect x={-60} y={-60} width={1200} height={2100} fill="#5aa9ff" opacity={0.05 + tv * 0.04} />
    <rect x={820} y={820} width={190} height={150} rx={8} fill="#2a375a" stroke="#3c4c74" strokeWidth={8} />
    <circle cx={950} cy={860} r={26} fill="#f6efe2" opacity={0.7} />
    <rect x={60} y={1320} width={330} height={330} rx={14} fill="#33456e" />
    <rect x={60} y={1300} width={140} height={70} rx={20} fill="#e9e2d2" />
    <rect x={40} y={1450} width={380} height={40} rx={10} fill="#283658" />
    <rect x={930} y={1430} width={120} height={220} rx={8} fill="#283658" />
    <path d="M990 1430 L990 1340 M960 1340 H1020 L1005 1300 H975 Z" stroke="#e9c46a" strokeWidth={8} fill="#e9c46a" />
    <Floor color="#151d31" />
  </g>
);

const Court: React.FC = () => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2100} fill={WALLS.court} />
    {[120, 300, 780, 960].map((x) => (
      <rect key={x} x={x - 30} y={820} width={60} height={830} fill="#4a372c" />
    ))}
    <rect x={300} y={830} width={480} height={70} rx={8} fill="#c9a26b" />
    <text x={540} y={878} textAnchor="middle" fontSize={36} fill="#3a2a22" {...label}>
      PENGADILAN KARDUS
    </text>
    <Floor color="#24180f" />
  </g>
);

export const CourtTable: React.FC = () => (
  <g>
    <rect x={330} y={1330} width={420} height={330} fill="#c9a26b" />
    <path d="M330 1330 H750 L730 1300 H350 Z" fill="#dcb987" />
    <path d="M380 1420 L470 1520 M620 1400 L700 1480" stroke="#a9834f" strokeWidth={6} />
    <text x={540} y={1600} textAnchor="middle" fontSize={34} fill="#8a6639" {...label}>
      FRAGILE ↑
    </text>
  </g>
);

const Community: React.FC = () => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2100} fill={WALLS.community} />
    <path d="M90 760 Q540 810 990 760 L980 870 Q540 915 100 870 Z" fill="#efe6d2" />
    <text x={540} y={845} textAnchor="middle" fontSize={50} fill="#2f4a3b" {...label}>
      KOMUNITAS BELUM MOVE ON
    </text>
    {[150, 420, 690].map((x) => (
      <g key={x} fill="none" stroke="#5f7f6b" strokeWidth={12} strokeLinecap="round">
        <path d={`M${x} 1520 H${x + 110} M${x + 10} 1520 L${x} 1650 M${x + 100} 1520 L${x + 110} 1650 M${x + 100} 1520 L${x + 100} 1400`} />
      </g>
    ))}
    <Floor color="#16231c" />
  </g>
);

export const SnackTable: React.FC = () => (
  <g>
    <rect x={880} y={1440} width={180} height={24} rx={6} fill="#a07a52" />
    <path d="M900 1464 L890 1650 M1040 1464 L1050 1650" stroke="#7a5a3a" strokeWidth={14} />
    <ellipse cx={970} cy={1432} rx={70} ry={16} fill="#f6efe2" />
    <text x={970} y={1400} textAnchor="middle" fontSize={30} fill="#efe6d2" {...label}>
      SNACK
    </text>
  </g>
);

const Cafe: React.FC = () => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2100} fill={WALLS.cafe} />
    {[160, 420].map((x) => (
      <g key={x}>
        <path d={`M${x} 780 V830`} stroke="#6b5048" strokeWidth={4} />
        <path d={`M${x - 40} 870 Q${x} 810 ${x + 40} 870 Z`} fill="#e9c46a" />
      </g>
    ))}
    <Floor color="#21171a" />
  </g>
);

export const CafeTable: React.FC = () => (
  <g>
    <rect x={340} y={1420} width={240} height={22} rx={8} fill="#8c6a50" />
    <path d="M460 1442 V1640 M410 1650 H510" stroke="#6b5048" strokeWidth={14} strokeLinecap="round" />
    <rect x={370} y={1370} width={46} height={52} rx={6} fill="#f6efe2" />
    <rect x={500} y={1370} width={46} height={52} rx={6} fill="#f6efe2" />
  </g>
);

export const Plant: React.FC = () => (
  <g>
    {[-60, -25, 10, 45, 80].map((dx, i) => (
      <ellipse key={dx} cx={990 + dx} cy={1180 + (i % 2) * 70} rx={52} ry={130} fill={i % 2 ? "#3f8f5f" : "#2f7a4f"} transform={`rotate(${dx / 3} ${990 + dx} 1300)`} />
    ))}
    <path d="M900 1470 H1080 L1060 1650 H920 Z" fill="#b5654a" />
  </g>
);

const Living: React.FC = () => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2100} fill={WALLS.living} />
    <rect x={700} y={820} width={260} height={150} rx={8} fill="#363a55" stroke="#4a4f72" strokeWidth={8} />
    <Floor color="#1a1b2a" />
  </g>
);

export const Sofa: React.FC = () => (
  <g>
    <rect x={300} y={1400} width={480} height={150} rx={30} fill="#7b5ea7" />
    <rect x={260} y={1440} width={70} height={190} rx={26} fill="#6a4f93" />
    <rect x={750} y={1440} width={70} height={190} rx={26} fill="#6a4f93" />
    <rect x={330} y={1520} width={420} height={110} rx={20} fill="#8a6bb8" />
  </g>
);

export const SetBackdrop: React.FC<{ name: SetName; tv?: number }> = ({ name, tv = 0 }) => {
  if (name === "bedroom") return <Bedroom tv={tv} />;
  if (name === "court") return <Court />;
  if (name === "community") return <Community />;
  if (name === "cafe") return <Cafe />;
  return <Living />;
};
