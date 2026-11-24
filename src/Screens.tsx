import { interpolate, spring, useCurrentFrame } from "remotion";
import { AMBER, CREAM, FPS, GREEN, T, fontFamily } from "./theme";

const X = 380;
const Y = 802;
const W = 630;
const H = 398;
const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const text = { fontFamily, fontWeight: 900 } as const;

const pop = (frame: number) =>
  spring({ frame: Math.max(0, frame), fps: FPS, config: { damping: 15 } });

export const Panel: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const enter = pop(frame - from);
  const exit = interpolate(frame, [to - 6, to], [1, 0], CLAMP);
  return (
    <g
      opacity={Math.min(enter, exit)}
      transform={`translate(0 ${(1 - enter) * 50})`}
    >
      {children}
    </g>
  );
};

const Code: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = [240, 380, 170, 460, 300, 410, 220, 340, 180, 430, 260, 360];
  const offset = (frame * 1.2) % (rows.length * 46);
  return (
    <g>
      {[...rows, ...rows].map((width, i) => (
        <rect
          key={`${width}-${i}`}
          x={X + 34 + ((i * 2) % 3) * 30}
          y={Y + 24 + i * 46 - offset}
          width={width}
          height={20}
          rx={10}
          fill={[GREEN, AMBER, "#7fb6d9", CREAM][i % 4]}
          opacity={0.75}
        />
      ))}
    </g>
  );
};

const SlopVsClean: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = spring({
    frame: Math.max(0, frame - T.filter),
    fps: FPS,
    config: { damping: 200 },
    durationInFrames: 30,
  });
  const barY = Y - 8 + sweep * (H + 16);
  const cards = [0, 1, 2, 3].map((i) => ({
    x: X + 28 + (i % 2) * 296,
    y: Y + 28 + Math.floor(i / 2) * 178,
  }));
  return (
    <g>
      <defs>
        <linearGradient id="slopCard" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c4dff" />
          <stop offset="100%" stopColor="#3f8cff" />
        </linearGradient>
        <clipPath id="belowBar">
          <rect x={X} y={barY} width={W} height={H + 40} />
        </clipPath>
        <clipPath id="aboveBar">
          <rect x={X} y={Y - 40} width={W} height={barY - Y + 40} />
        </clipPath>
      </defs>
      <g clipPath="url(#belowBar)">
        {cards.map(({ x, y }) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={278} height={164} rx={28} fill="url(#slopCard)" />
            <text x={x + 139} y={y + 74} textAnchor="middle" fontSize={34} fill="#fff" {...text}>
              UNLOCK
            </text>
            <text x={x + 139} y={y + 118} textAnchor="middle" fontSize={34} fill="#fff" {...text}>
              THE POWER
            </text>
          </g>
        ))}
      </g>
      <g clipPath="url(#aboveBar)">
        <text x={X + W / 2} y={Y + 236} textAnchor="middle" fontSize={118} fill={GREEN} {...text}>
          NO SLOP
        </text>
      </g>
      {sweep > 0.001 && sweep < 0.999 ? (
        <rect x={X} y={barY - 7} width={W} height={14} fill={AMBER} />
      ) : null}
    </g>
  );
};

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const command = "NPX ANTISLOP-AI";
  const typed = Math.round(
    interpolate(frame, [T.type, T.typeEnd], [0, command.length], CLAMP),
  );
  const cursor = Math.floor(frame / 8) % 2 === 0 ? "▌" : "";
  return (
    <g>
      <rect x={X} y={Y} width={W} height={70} fill="#2c363b" />
      <circle cx={X + 40} cy={Y + 35} r={13} fill="#ef6a56" />
      <circle cx={X + 80} cy={Y + 35} r={13} fill={AMBER} />
      <circle cx={X + 120} cy={Y + 35} r={13} fill={GREEN} />
      <text x={X + 160} y={Y + 47} fontSize={32} fill={CREAM} {...text}>
        TERMINAL
      </text>
      <text x={X + 34} y={Y + 150} fontSize={38} fill={AMBER} {...text}>
        MY-PROJECT
      </text>
      <text x={X + 34} y={Y + 262} fontSize={54} fill={GREEN} {...text}>
        {`> ${command.slice(0, typed)}${cursor}`}
      </text>
    </g>
  );
};

const CheckRow: React.FC<{ y: number; label: string; at: number }> = ({
  y,
  label,
  at,
}) => {
  const frame = useCurrentFrame();
  const tick = pop(frame - at);
  return (
    <g>
      <rect
        x={X + 40}
        y={y}
        width={60}
        height={60}
        rx={8}
        fill="none"
        stroke={CREAM}
        strokeWidth={7}
      />
      <path
        d={`M${X + 52} ${y + 30} l14 16 l24 -32`}
        fill="none"
        stroke={GREEN}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - tick}
      />
      <text x={X + 130} y={y + 48} fontSize={48} fill={CREAM} {...text}>
        {label}
      </text>
    </g>
  );
};

const Installer: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = pop(frame - T.session);
  return (
    <g>
      <CheckRow y={Y + 26} label="SKILLS" at={T.pick + 6} />
      <CheckRow y={Y + 110} label="LOCATION" at={T.tick2} />
      <CheckRow y={Y + 194} label="AI AGENT" at={T.tick3} />
      <g
        opacity={Math.min(enter, 1)}
        transform={`translate(0 ${(1 - enter) * 40})`}
      >
        <rect x={X + 40} y={Y + 284} width={W - 80} height={90} rx={12} fill={GREEN} />
        <text
          x={X + W / 2}
          y={Y + 346}
          textAnchor="middle"
          fontSize={48}
          fill="#10231a"
          {...text}
        >
          NEW SESSION
        </text>
      </g>
    </g>
  );
};

export const Screens: React.FC = () => (
  <g>
    <defs>
      <clipPath id="screen">
        <rect x={X} y={Y} width={W} height={H} rx={8} />
      </clipPath>
    </defs>
    <rect x={X} y={Y} width={W} height={H} rx={8} fill="#0e1b1e" />
    <g clipPath="url(#screen)">
      <Panel from={0} to={T.generic}>
        <Code />
      </Panel>
      <Panel from={T.generic} to={T.terminal}>
        <SlopVsClean />
      </Panel>
      <Panel from={T.terminal} to={T.pick}>
        <Terminal />
      </Panel>
      <Panel from={T.pick} to={T.during}>
        <Installer />
      </Panel>
      <Panel from={T.during} to={T.end + 1}>
        <Code />
      </Panel>
    </g>
  </g>
);
