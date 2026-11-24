import { Easing, interpolate, useCurrentFrame } from "remotion";
import { STYLES } from "../aot/AotCaption";
import { Stickman, type Pose } from "../Stickman";

// Comic book kit: captions, lettering, bubbles and the inked stickman.
export const INK = "#17151c";
export const PAPER = "#f6ecd4";
export const WHITE = "#fffdf6";
export const YELLOW = "#ffd23f";
export const RED = "#e8433f";
export const BLUE = "#3d7fe6";
export const TEAL = "#22b5a0";
export const PURPLE = "#8358dc";
export const ORANGE = "#ff8c2e";
export const STEEL = "#c3cad8";
export const COMIC = STYLES.bangers.font;
export const MONO = STYLES.spaceMono.font;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Playful personality: entrances overshoot a little and land, exits are shorter and accelerate.
export const pop = (t: number, len = 8) =>
  interpolate(t, [0, len], [0, 1], { easing: Easing.out(Easing.back(1.8)), ...CLAMP });
export const ease = (t: number, len = 10) =>
  interpolate(t, [0, len], [0, 1], { easing: Easing.out(Easing.cubic), ...CLAMP });
export const leave = (t: number, len = 6) =>
  interpolate(t, [0, len], [0, 1], { easing: Easing.in(Easing.cubic), ...CLAMP });

export const ink = {
  stroke: INK,
  strokeWidth: 8,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export const Defs: React.FC = () => (
  <defs>
    <pattern id="dots" width={20} height={20} patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
      <circle cx={10} cy={10} r={3.4} fill={INK} />
    </pattern>
    {/* Puts a black ink line around the cream stickman, so he keeps his look on bright panels. */}
    <filter id="inked" x="-30%" y="-30%" width="160%" height="160%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={7} result="fat" />
      <feFlood floodColor={INK} />
      <feComposite in2="fat" operator="in" result="edge" />
      <feMerge>
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// Captions in comic lettering. Words pop in one by one like the older videos' captions, at the frames in `at` or `ats`.
type Line = { text: string; at: number; size: number; color?: string; ats?: number[]; boxes?: Record<string, string> };
export const Words: React.FC<{ from: number; to: number; top?: number; lines: Line[] }> = ({ from, to, top = 190, lines }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div style={{ position: "absolute", top, left: 70, right: 60, opacity: 1 - leave(frame - (to - 5), 5), fontFamily: COMIC }}>
      {lines.map((line) => (
        <div
          key={line.text}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "0.26em", fontSize: line.size, lineHeight: 1.18, letterSpacing: "0.03em", marginBottom: 14 }}
        >
          {line.text.split(" ").map((word, i) => {
            const start = line.ats?.[i] ?? line.at + i * 3;
            const s = pop(frame - start, 7);
            const box = line.boxes?.[word];
            return (
              <span
                key={`${word}-${i}`}
                style={{
                  display: "inline-block",
                  opacity: frame < start ? 0 : Math.min(s * 3, 1),
                  transform: `translateY(${(1 - s) * 60}px) rotate(${box ? -2 : 0}deg) scale(${0.7 + 0.3 * s})`,
                  transformOrigin: "left center",
                  ...(box
                    ? { background: box, color: INK, padding: "0 0.16em", border: `7px solid ${INK}`, boxShadow: `8px 9px 0 ${INK}` }
                    : { color: line.color ?? WHITE, WebkitTextStroke: `${Math.round(line.size * 0.17)}px ${INK}`, paintOrder: "stroke fill" }),
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Narration box. It slides in from the left a moment after its panel.
export const Box: React.FC<{
  x: number;
  y: number;
  text: string;
  at: number;
  size?: number;
  bg?: string;
  color?: string;
  mono?: boolean;
  tilt?: number;
}> = ({ x, y, text, at, size = 54, bg = YELLOW, color = INK, mono = false, tilt = -1.5 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = pop(frame - at, 7);
  const w = text.length * size * (mono ? 0.6 : 0.43) + 44;
  const h = size * 1.36;
  return (
    <g
      opacity={Math.min(s * 3, 1)}
      transform={`translate(${x - (1 - s) * 60} ${y}) rotate(${tilt}) scale(${0.9 + 0.1 * s})`}
    >
      <rect x={7} y={8} width={w} height={h} fill={INK} />
      <rect width={w} height={h} fill={bg} stroke={INK} strokeWidth={7} />
      <text
        x={22}
        y={size * 1.02}
        fontFamily={mono ? MONO : COMIC}
        fontWeight={mono ? 700 : 400}
        fontSize={size}
        fill={color}
        letterSpacing={mono ? 0 : 1.5}
      >
        {text}
      </text>
    </g>
  );
};

// Speech bubble. `tail` is where the tail points, in the same coordinates as x and y.
export const Bubble: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  tail: [number, number];
  lines: string[];
  at: number;
  size?: number;
}> = ({ x, y, w, h, tail, lines, at, size = 56 }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const s = pop(frame - at);
  const [cx, cy] = [x + w / 2, y + h / 2];
  const base = Math.max(x + 60, Math.min(x + w - 60, tail[0]));
  const edge = tail[1] > cy ? y + h - 4 : y + 4;
  // A speaker beside the bubble gets a tail from its side, not from underneath.
  const side = tail[0] < x ? x + 4 : tail[0] > x + w ? x + w - 4 : null;
  const mid = Math.max(y + 40, Math.min(y + h - 40, tail[1]));
  const tailPath =
    side === null
      ? `M${base - 34} ${edge} L${tail[0]} ${tail[1]} L${base + 34} ${edge}`
      : `M${side} ${mid - 30} L${tail[0]} ${tail[1]} L${side} ${mid + 30}`;
  return (
    <g
      opacity={Math.min(s * 3, 1)}
      transform={`translate(${tail[0]} ${tail[1]}) scale(${0.5 + 0.5 * s}) translate(${-tail[0]} ${-tail[1]})`}
    >
      <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, 56)} fill={WHITE} {...ink} />
      <path d={tailPath} fill={WHITE} {...ink} />
      {lines.map((line, i) => (
        <text
          key={line}
          x={cx}
          y={cy + size * 0.36 + (i - (lines.length - 1) / 2) * size * 1.06}
          textAnchor="middle"
          fontFamily={COMIC}
          fontSize={size}
          fill={INK}
          letterSpacing={1.5}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

// Sound-effect lettering: pops hard, then keeps wobbling a little.
export const Sfx: React.FC<{
  x: number;
  y: number;
  text: string;
  at: number;
  size?: number;
  fill?: string;
  rot?: number;
  until?: number;
}> = ({ x, y, text, at, size = 96, fill = YELLOW, rot = -8, until }) => {
  const frame = useCurrentFrame();
  if (frame < at || (until !== undefined && frame >= until)) return null;
  const s = pop(frame - at, 7);
  const wobble = Math.sin((frame - at) / 5) * 1.6;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontFamily={COMIC}
      fontSize={size}
      fill={fill}
      stroke={INK}
      strokeWidth={size * 0.13}
      strokeLinejoin="round"
      paintOrder="stroke"
      letterSpacing={2}
      opacity={Math.min(s * 3, 1)}
      transform={`translate(${x} ${y}) rotate(${rot + wobble}) scale(${0.4 + 0.6 * s}) translate(${-x} ${-y})`}
    >
      {text}
    </text>
  );
};

export const burst = (cx: number, cy: number, r1: number, r2: number, n: number) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 ? r2 : r1;
    return `${i ? "L" : "M"}${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r}`;
  }).join(" ") + "Z";

export const stand = (o: Partial<Pose>): Pose => ({
  head: [195, 1040],
  sh: [190, 1130],
  hip: [190, 1370],
  kL: [162, 1510],
  fL: [150, 1650],
  kR: [218, 1510],
  fR: [230, 1650],
  eL: [130, 1230],
  hL: [120, 1340],
  eR: [250, 1230],
  hR: [262, 1340],
  look: 1,
  smile: 0.5,
  ...o,
});
export const IDLE = stand({ look: 0, smile: 0.8 });
export const TYPE = stand({ eR: [270, 1200], hR: [345, 1165], eL: [245, 1235], hL: [330, 1210], smile: 0.6 });
export const REACH = stand({ head: [215, 1040], sh: [200, 1130], eR: [300, 1150], hR: [405, 1125], smile: 0.9 });
export const WRENCH_UP = stand({ look: 0, eR: [275, 1080], hR: [305, 950], smile: 1.2 });
export const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [300, 1090], hR: [330, 1000], smile: 1.6 });
export const HANDS_ON_HIPS = stand({ look: 0, eL: [105, 1250], hL: [165, 1345], eR: [275, 1080], hR: [305, 950], smile: 1.4 });
export const PULL = stand({ head: [180, 1050], sh: [182, 1136], eR: [270, 1090], hR: [340, 1010], smile: 0.4 });

// The stickman, placed with his feet at x, y. The plumber wears a red cap and can hold a wrench.
export const Hero: React.FC<{
  pose: Pose;
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  cap?: boolean;
  wrench?: boolean;
  typing?: boolean;
}> = ({ pose, x, y, s = 0.55, flip = false, cap = true, wrench = false, typing = false }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame / 14) * 4;
  const tap = typing ? Math.abs(Math.sin(frame / 1.6)) * 16 : 0;
  const p: Pose = {
    ...pose,
    head: [pose.head[0] + Math.sin(frame / 19) * 5, pose.head[1] + breathe],
    sh: [pose.sh[0], pose.sh[1] + breathe * 0.6],
    hL: [pose.hL[0], pose.hL[1] - (typing ? Math.abs(Math.cos(frame / 1.6)) * 16 : 0)],
    hR: [pose.hR[0] + Math.sin(frame / 11) * 4, pose.hR[1] - tap],
  };
  const [hx, hy] = p.head;
  const d = p.look < -0.5 ? -1 : 1;
  const [wx, wy] = p.hR;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-190 -1650)`}>
      {wrench ? (
        <g transform={`translate(${wx} ${wy}) rotate(${18 + Math.sin(frame / 11) * 3})`}>
          <rect x={-15} y={-190} width={30} height={230} rx={12} fill={STEEL} {...ink} strokeWidth={12} />
          <path d="M-52 -250 L-52 -190 L52 -190 L52 -250 L24 -250 L24 -216 L-24 -216 L-24 -250Z" fill={STEEL} {...ink} strokeWidth={12} />
        </g>
      ) : null}
      <g filter="url(#inked)">
        <Stickman pose={p} thumb={0} headFill={INK} bendy />
      </g>
      {cap ? (
        <g {...ink} strokeWidth={12}>
          <path d={`M${hx - 80} ${hy - 30} Q${hx - 76} ${hy - 118} ${hx} ${hy - 118} Q${hx + 76} ${hy - 118} ${hx + 80} ${hy - 30}Z`} fill={RED} />
          <rect x={d > 0 ? hx + 10 : hx - 150} y={hy - 52} width={140} height={26} rx={13} fill={RED} />
        </g>
      ) : null}
    </g>
  );
};

// The AI as a monitor with a face. `gaze` moves the eyes: [x, y] in -1 to 1.
export const Bot: React.FC<{ x: number; y: number; s?: number; gaze?: [number, number]; mouth?: number }> = ({
  x,
  y,
  s = 1,
  gaze = [0, 0],
  mouth = 0.5,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={76} y={150} width={48} height={50} fill={STEEL} {...ink} />
    <rect x={30} y={196} width={140} height={22} rx={8} fill={STEEL} {...ink} />
    <rect width={200} height={156} rx={22} fill={STEEL} {...ink} />
    <rect x={18} y={18} width={164} height={120} rx={12} fill={INK} />
    <circle cx={66 + gaze[0] * 12} cy={66 + gaze[1] * 12} r={15} fill={YELLOW} />
    <circle cx={134 + gaze[0] * 12} cy={66 + gaze[1] * 12} r={15} fill={YELLOW} />
    <path d={`M70 106 Q100 ${106 + mouth * 26} 130 106`} fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" />
  </g>
);
