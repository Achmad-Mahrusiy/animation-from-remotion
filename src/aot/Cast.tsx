import { CREAM, RED } from "../theme";
import { Stickman, type Pose } from "../Stickman";

type P = [number, number];
export type Who = "raka" | "ucup" | "sinta";

export const COLOR: Record<Who, string> = {
  raka: "#f4b942",
  ucup: "#7fe0a0",
  sinta: "#ef8fb0",
};

type Arm =
  | "down"
  | "gesture"
  | "up"
  | "mouth"
  | "forehead"
  | "hip"
  | "hold"
  | "forward"
  | "highfive"
  | "table";

export type Spec = {
  front: Arm;
  back: Arm;
  smile: number;
  slump?: number; // 0 standing tall, 1 slumped, 2 collapsed on the floor
  lean?: number;
};

export const SPECS = {
  idle: { front: "down", back: "down", smile: 0.3 },
  talk: { front: "gesture", back: "down", smile: 0.5 },
  excited: { front: "up", back: "up", smile: 1.4, lean: 0.6 },
  facepalm: { front: "forehead", back: "down", smile: -1 },
  hip: { front: "hip", back: "hip", smile: 0.9 },
  sad: { front: "down", back: "down", smile: -1, slump: 1 },
  cry: { front: "forehead", back: "up", smile: -1, slump: 0.6 },
  panic: { front: "forehead", back: "up", smile: -1 },
  collapse: { front: "down", back: "down", smile: -1, slump: 2 },
  holdIdle: { front: "down", back: "hold", smile: 0 },
  holdTalk: { front: "gesture", back: "hold", smile: 0.4 },
  eat: { front: "mouth", back: "hold", smile: 0.6 },
  dreamy: { front: "up", back: "hold", smile: 1.5 },
  raise: { front: "up", back: "down", smile: 0.8 },
  point: { front: "forward", back: "down", smile: -0.4, lean: 0.5 },
  cover: { front: "mouth", back: "down", smile: -0.6 },
  highfive: { front: "highfive", back: "down", smile: 1.5, lean: 0.4 },
  gavelUp: { front: "up", back: "down", smile: 0.2 },
  gavelDown: { front: "table", back: "down", smile: 0.2 },
  remote: { front: "forward", back: "down", smile: 1.2 },
  remoteUp: { front: "up", back: "down", smile: 1.5 },
} satisfies Record<string, Spec>;
export type SpecName = keyof typeof SPECS;

// Elbow and hand offsets from the shoulder; d = 1 points the arm the way the character faces.
const ARM: Record<Arm, (d: number) => [P, P]> = {
  down: (d) => [[d * 35, 115], [d * 45, 225]],
  gesture: (d) => [[d * 95, 85], [d * 165, 15]],
  up: (d) => [[d * 75, -80], [d * 100, -195]],
  mouth: (d) => [[d * 90, 95], [d * 34, -62]],
  forehead: (d) => [[d * 95, 30], [d * 35, -118]],
  hip: (d) => [[d * 80, 80], [d * 22, 150]],
  hold: (d) => [[d * 40, 110], [d * 75, 160]],
  forward: (d) => [[d * 110, 50], [d * 215, 40]],
  highfive: (d) => [[d * 110, -30], [d * 175, -130]],
  table: (d) => [[d * 95, 110], [d * 150, 185]],
};

export const buildPose = (x: number, f: number, look: number, spec: Spec): Pose => {
  const slump = spec.slump ?? 0;
  const lean = (spec.lean ?? 0) * f;
  const floor = Math.max(0, slump - 1); // 0 to 1: how far down to the floor
  const drop = Math.min(slump, 1) * 45 + floor * 230;
  const sh: P = [x + lean * 22, 1130 + drop];
  const arm = (a: Arm, d: number): [P, P] => {
    const [e, h] = ARM[a](d);
    return [
      [sh[0] + e[0], sh[1] + e[1] * (1 - floor * 0.4)],
      [sh[0] + h[0], sh[1] + h[1] * (1 - floor * 0.4)],
    ];
  };
  const [eF, hF] = arm(spec.front, f);
  const [eB, hB] = arm(spec.back, -f);
  const hipY = 1370 + Math.min(slump, 1) * 25 + floor * 230;
  const knee = Math.min(slump, 1) * 30;
  return {
    head: [x + lean * 34, 1040 + Math.min(slump, 1) * 60 + floor * 240],
    sh,
    hip: [x, hipY],
    eR: eF,
    hR: hF,
    eL: eB,
    hL: hB,
    kL: [x - 30 + f * knee + floor * -f * 90, 1510 + knee * 0.6 + floor * 120],
    fL: [x - 40 + floor * -f * 150, 1650],
    kR: [x + 30 + f * knee + floor * f * 60, 1510 + knee * 0.6 + floor * 110],
    fR: [x + 40 + floor * f * 170, 1650],
    look,
    smile: spec.smile,
  };
};

export type Look = {
  glasses?: boolean;
  glassesDrop?: number; // 0 on the nose, 1 slid to the mouth
  wig?: boolean;
  prop?: "popcorn" | "gavel" | "remote" | null;
};

const INK = CREAM;
const DARK = "#11181c";

const Glasses: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g fill="none" stroke={INK} strokeWidth={6}>
    <rect x={x - 48} y={y - 30} width={42} height={34} rx={8} />
    <rect x={x + 6} y={y - 30} width={42} height={34} rx={8} />
    <path d={`M${x - 6} ${y - 16} H${x + 6}`} />
  </g>
);

const Popcorn: React.FC<{ hand: P }> = ({ hand: [x, y] }) => (
  <g>
    {[[-30, -78], [-8, -92], [16, -84], [34, -72], [-20, -60], [6, -66]].map(([dx, dy]) => (
      <circle key={`${dx}${dy}`} cx={x + dx} cy={y + dy} r={17} fill="#fff4cf" stroke="#e6c46a" strokeWidth={4} />
    ))}
    <path d={`M${x - 52} ${y - 62} L${x + 52} ${y - 62} L${x + 38} ${y + 52} L${x - 38} ${y + 52} Z`} fill={RED} />
    {[-26, 0, 26].map((dx) => (
      <path key={dx} d={`M${x + dx} ${y - 62} L${x + dx * 0.75} ${y + 52}`} stroke="#fff4cf" strokeWidth={10} />
    ))}
  </g>
);

const Gavel: React.FC<{ hand: P; up: boolean }> = ({ hand: [x, y], up }) => (
  <g transform={`rotate(${up ? -35 : 20} ${x} ${y})`}>
    <path d={`M${x} ${y} L${x} ${y - 95}`} stroke="#9a6b3f" strokeWidth={14} strokeLinecap="round" />
    <rect x={x - 46} y={y - 132} width={92} height={46} rx={10} fill="#c08a52" />
  </g>
);

const Remote: React.FC<{ hand: P }> = ({ hand: [x, y] }) => (
  <g transform={`rotate(-20 ${x} ${y})`}>
    <rect x={x - 18} y={y - 70} width={36} height={100} rx={10} fill="#33373d" stroke={INK} strokeWidth={4} />
    <circle cx={x} cy={y - 48} r={7} fill={RED} />
  </g>
);

export const Character: React.FC<{
  who: Who;
  pose: Pose;
  mouth: number;
  headFill: string;
  look?: Look;
  propUp?: boolean;
}> = ({ who, pose: p, mouth, headFill, look = {}, propUp = false }) => {
  const faceX = p.head[0] + p.look * 24;
  const faceY = p.head[1];
  const [hx, hy] = p.head;
  const glasses = look.glasses ?? who === "raka";
  const drop = look.glassesDrop ?? 0;

  return (
    <g>
      {who === "sinta" && !look.wig ? (
        <path
          d={`M${hx - 70} ${hy - 10} Q${hx - 95} ${hy + 90} ${hx - 60} ${hy + 150} M${hx + 70} ${hy - 10} Q${hx + 95} ${hy + 90} ${hx + 60} ${hy + 150}`}
          stroke="#6b3f52"
          strokeWidth={26}
          fill="none"
          strokeLinecap="round"
        />
      ) : null}
      <Stickman pose={p} thumb={0} headFill={headFill} />
      {mouth > 0.08 ? (
        <ellipse cx={faceX} cy={faceY + 30} rx={17 + mouth * 5} ry={5 + mouth * 15} fill={DARK} stroke={INK} strokeWidth={8} />
      ) : null}
      {who === "raka" ? (
        <path
          d={`M${hx - 70} ${hy - 28} L${hx - 64} ${hy - 98} L${hx - 34} ${hy - 72} L${hx - 12} ${hy - 112} L${hx + 12} ${hy - 76} L${hx + 40} ${hy - 104} L${hx + 50} ${hy - 66} L${hx + 76} ${hy - 82} L${hx + 70} ${hy - 28}`}
          fill="#3a2b22"
          stroke={INK}
          strokeWidth={10}
          strokeLinejoin="round"
        />
      ) : null}
      {who === "ucup" ? (
        <g>
          <path d={`M${hx - 76} ${hy - 22} Q${hx} ${hy - 150} ${hx + 76} ${hy - 22} Z`} fill="#3f8f5f" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
          <rect x={hx - 82} y={hy - 34} width={164} height={26} rx={12} fill="#2d6b46" stroke={INK} strokeWidth={8} />
          <circle cx={hx} cy={hy - 104} r={16} fill={INK} />
        </g>
      ) : null}
      {who === "sinta" && !look.wig ? (
        <g>
          <path d={`M${hx - 72} ${hy - 8} Q${hx - 60} ${hy - 92} ${hx} ${hy - 82} Q${hx + 60} ${hy - 92} ${hx + 72} ${hy - 8} Q${hx + 20} ${hy - 50} ${hx - 72} ${hy - 8} Z`} fill="#6b3f52" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <circle cx={hx} cy={hy - 104} r={30} fill="#6b3f52" stroke={INK} strokeWidth={8} />
        </g>
      ) : null}
      {look.wig ? (
        <g fill="#f3efe6" stroke="#cfc6b6" strokeWidth={4}>
          {[[-70, -40], [-40, -82], [0, -96], [40, -82], [70, -40], [-88, 10], [88, 10], [-84, 60], [84, 60]].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={hx + dx} cy={hy + dy} r={34} />
          ))}
        </g>
      ) : null}
      {glasses ? <Glasses x={faceX} y={faceY - 2 + drop * 42} /> : null}
      {look.prop === "popcorn" ? <Popcorn hand={p.hL} /> : null}
      {look.prop === "gavel" ? <Gavel hand={p.hR} up={propUp} /> : null}
      {look.prop === "remote" ? <Remote hand={p.hR} /> : null}
    </g>
  );
};
