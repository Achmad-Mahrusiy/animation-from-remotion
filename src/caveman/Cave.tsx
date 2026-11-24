import { useCurrentFrame } from "remotion";

export const CAVE_WALL = "#25212b";
const OCHRE = "#b5653a";
const paint = {
  fill: "none",
  stroke: OCHRE,
  strokeWidth: 9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// fire: 0 is out, 1 is a normal campfire, above 1 is a flare.
export const Cave: React.FC<{ fire: number }> = ({ fire }) => {
  const frame = useCurrentFrame();
  const flicker =
    0.86 + Math.sin(frame / 2.3) * 0.08 + Math.sin(frame / 5.1) * 0.06;
  const flame = Math.max(fire, 0.12) * flicker;

  return (
    <g>
      <defs>
        <radialGradient id="caveGlow">
          <stop offset="0" stopColor="#f08a3c" stopOpacity={0.55} />
          <stop offset="1" stopColor="#f08a3c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-40} y={-40} width={1160} height={2000} fill={CAVE_WALL} />
      <path d="M-40 520 Q200 440 420 560 T760 520 T1120 600 V1700 H-40Z" fill="#2c2733" />
      <path d="M-40 980 Q260 900 520 1010 T1120 960 V1700 H-40Z" fill="#221e28" opacity={0.7} />
      {[60, 210, 330, 520, 700, 860, 1000].map((x, i) => (
        <path
          key={x}
          d={`M${x - 46} -40 L${x} ${70 + (i % 3) * 46} L${x + 46} -40Z`}
          fill="#17141b"
        />
      ))}
      <ellipse
        cx={965}
        cy={1520}
        rx={1000}
        ry={1000}
        fill="url(#caveGlow)"
        opacity={Math.min(flame, 1.5) * 0.75}
      />

      <g opacity={0.5}>
        <path d="M70 830 q10 -80 80 -86 q70 -6 96 44 l8 62 M92 830 v-40 M150 830 v-36 M210 830 v-40 M70 790 q-30 10 -24 54 M70 770 q-34 -30 -52 6" {...paint} />
        <path d="M300 760 v60 M300 780 l-22 22 M300 780 l26 -18 M300 820 l-18 30 M300 820 l18 30 M330 700 l-40 96" {...paint} />
        <circle cx={300} cy={742} r={13} {...paint} />
        <path d="M960 720 a26 26 0 1 1 -26 -26 a44 44 0 1 1 44 44" {...paint} />
        <path d="M800 690 h70 v48 h-70z M818 760 h34 M835 738 v22" {...paint} />
      </g>

      <path d="M-40 1650 Q300 1632 540 1650 T1120 1644 V1960 H-40Z" fill="#17141b" />
      {[60, 330, 610, 760, 1030].map((x, i) => (
        <ellipse key={x} cx={x} cy={1700 + (i % 2) * 60} rx={26} ry={10} fill="#2a2631" />
      ))}

      <path d="M104 1650 L118 1420 Q190 1372 276 1404 L292 1650Z" fill="#4b4651" />
      <path d="M382 1650 L390 1328 H452 L462 1650Z M798 1650 L806 1328 H868 L878 1650Z" fill="#55505b" />
      <rect x={350} y={1290} width={550} height={42} rx={14} fill="#6a6470" />
      <rect x={640} y={1205} width={60} height={88} fill="#5b5560" />
      <rect x={444} y={879} width={452} height={332} rx={34} fill="#77717d" />
      <path d="M470 879 l20 30 l-14 22 M880 1190 l-30 -16" fill="none" stroke="#55505b" strokeWidth={6} />
      <rect x={470} y={905} width={400} height={280} rx={16} fill="#101410" />
      <rect x={372} y={1268} width={150} height={24} rx={7} fill="#7d7783" />

      <g transform="translate(965 1650)">
        <rect x={-70} y={-26} width={140} height={24} rx={12} fill="#6b4a30" transform="rotate(14)" />
        <rect x={-70} y={-26} width={140} height={24} rx={12} fill="#7d5c3f" transform="rotate(-14)" />
        <g transform={`translate(0 -16) scale(${flame})`}>
          <path d="M0 0 C-70 -30 -48 -120 0 -200 C48 -120 70 -30 0 0Z" fill="#f08a3c" />
          <path d="M0 0 C-36 -20 -24 -70 0 -112 C24 -70 36 -20 0 0Z" fill="#f9d262" />
        </g>
        {fire < 0.5
          ? [0, 1, 2].map((i) => {
              const t = ((frame * 2 + i * 44) % 132) / 132;
              return (
                <circle
                  key={i}
                  cx={Math.sin(t * 6 + i) * 18}
                  cy={-50 - t * 190}
                  r={14 + t * 20}
                  fill="#8d8794"
                  opacity={(1 - t) * 0.45}
                />
              );
            })
          : null}
      </g>
    </g>
  );
};
