import { spring } from "remotion";
import { WALL, FPS } from "./theme";

type P = [number, number];
export type Pose = {
  head: P;
  sh: P;
  hip: P;
  eL: P;
  hL: P;
  eR: P;
  hR: P;
  kL: P;
  fL: P;
  kR: P;
  fR: P;
  look: number; // -1 faces left, 0 faces the viewer, 1 faces right
  smile: number;
};

const INK = "#f6efe2";
const legsAt = (x: number) => ({
  hip: [x, 1370] as P,
  kL: [x - 30, 1510] as P,
  fL: [x - 40, 1650] as P,
  kR: [x + 30, 1510] as P,
  fR: [x + 40, 1650] as P,
});

const seatedLegs = {
  hip: [195, 1375] as P,
  kL: [350, 1400] as P,
  fL: [340, 1640] as P,
  kR: [335, 1410] as P,
  fR: [310, 1640] as P,
};

export const SIT: Pose = {
  ...seatedLegs,
  head: [232, 1005],
  sh: [215, 1095],
  eL: [300, 1215],
  hL: [410, 1272],
  eR: [290, 1235],
  hR: [395, 1282],
  look: 1,
  smile: 0,
};
export const SIT_WAVE: Pose = {
  ...SIT,
  head: [225, 1005],
  eR: [335, 1065],
  hR: [355, 925],
  look: 0,
  smile: 1,
};
export const SIT_SCRATCH: Pose = {
  ...SIT,
  head: [240, 1012],
  eR: [335, 1115],
  hR: [305, 975],
  smile: -1,
};
export const SIT_HAPPY: Pose = { ...SIT, smile: 1 };
export const STAND_BUILD: Pose = {
  ...legsAt(480),
  head: [470, 1040],
  sh: [480, 1130],
  eL: [410, 1215],
  hL: [375, 1320],
  eR: [425, 1240],
  hR: [385, 1345],
  look: -1,
  smile: 1,
};
export const INSPECT: Pose = {
  ...legsAt(630),
  head: [745, 1125],
  sh: [690, 1195],
  eL: [610, 1270],
  hL: [640, 1370],
  eR: [750, 1350],
  hR: [785, 1510],
  look: 1,
  smile: 0,
};
export const REPORT: Pose = {
  ...legsAt(540),
  head: [540, 1040],
  sh: [540, 1130],
  eL: [420, 1240],
  hL: [485, 1350],
  eR: [670, 1150],
  hR: [750, 1040],
  look: 0,
  smile: 1,
};
export const THUMB: Pose = {
  ...REPORT,
  eL: [410, 1190],
  hL: [320, 1085],
  smile: 1.6,
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpPose = (a: Pose, b: Pose, t: number): Pose => {
  const out = { ...a } as Record<string, number | P>;
  for (const key of Object.keys(a) as (keyof Pose)[]) {
    const x = a[key];
    const y = b[key];
    out[key] =
      typeof x === "number"
        ? mix(x, y as number, t)
        : [mix(x[0], (y as P)[0], t), mix(x[1], (y as P)[1], t)];
  }
  return out as unknown as Pose;
};

export const blendPoses = (
  frame: number,
  keys: { at: number; pose: Pose }[],
  config = { damping: 13, stiffness: 110, mass: 0.7 },
): Pose =>
  keys
    .slice(1)
    .reduce(
      (pose, key) =>
        lerpPose(
          pose,
          key.pose,
          spring({
            frame: Math.max(0, frame - key.at),
            fps: FPS,
            config,
          }),
        ),
      keys[0].pose,
    );

const straight = (...points: P[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

// Noodle limb: one curve that still passes through the joint.
const curved = (a: P, joint: P, b: P) =>
  `M${a[0]} ${a[1]} Q${2 * joint[0] - (a[0] + b[0]) / 2} ${2 * joint[1] - (a[1] + b[1]) / 2} ${b[0]} ${b[1]}`;

export const Stickman: React.FC<{
  pose: Pose;
  thumb: number;
  ponytail?: boolean;
  headFill?: string;
  bendy?: boolean;
  eyes?: number; // 1 open (the default, drawn as before), 0 closed; in between the lids droop
}> = ({ pose: p, thumb, ponytail = false, headFill = WALL, bendy = false, eyes = 1 }) => {
  const path = (...points: P[]) =>
    bendy && points.length === 3
      ? curved(points[0], points[1], points[2])
      : bendy
        ? // The spine bows away from where the head leans.
          curved(
            points[0],
            [
              (points[0][0] + points[1][0]) / 2 - (p.head[0] - p.sh[0]) * 0.5,
              (points[0][1] + points[1][1]) / 2,
            ],
            points[1],
          )
        : straight(...points);
  const faceX = p.head[0] + p.look * 24;
  const faceY = p.head[1];
  // -0.5, not 0: spring overshoot around a front-facing pose must not flip the hair.
  const back = p.look > -0.5 ? -1 : 1;
  const line = {
    stroke: INK,
    strokeWidth: 20,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <g>
      <path d={path(p.hip, p.kL, p.fL)} {...line} />
      <path d={path(p.hip, p.kR, p.fR)} {...line} />
      <path d={path(p.sh, p.hip)} {...line} />
      <path d={path(p.sh, p.eL, p.hL)} {...line} />
      <path d={path(p.sh, p.eR, p.hR)} {...line} />
      {thumb > 0.01 ? (
        <g opacity={thumb}>
          <rect
            x={p.hL[0] - 34}
            y={p.hL[1] - 30}
            width={68}
            height={60}
            rx={18}
            fill={INK}
          />
          <path
            d={`M${p.hL[0] - 24} ${p.hL[1] - 26} L${p.hL[0] - 30} ${p.hL[1] - 74}`}
            {...line}
            strokeWidth={24}
          />
          {[-10, 6, 20].map((dy) => (
            <path
              key={dy}
              d={`M${p.hL[0] + 4} ${p.hL[1] + dy} H${p.hL[0] + 30}`}
              stroke={WALL}
              strokeWidth={5}
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : null}
      {ponytail ? (
        <g>
          <path
            d={`M${p.head[0] + back * 52} ${faceY - 48} Q${p.head[0] + back * 165} ${faceY - 22} ${p.head[0] + back * 118} ${faceY + 165}`}
            fill="none"
            stroke="#b9b1a3"
            strokeWidth={32}
            strokeLinecap="round"
          />
          <circle cx={p.head[0] + back * 96} cy={faceY - 34} r={17} fill="#c9583f" />
        </g>
      ) : null}
      <circle
        cx={p.head[0]}
        cy={p.head[1]}
        r={72}
        fill={headFill}
        stroke={INK}
        strokeWidth={20}
      />
      {ponytail ? (
        <g fill="none" stroke={INK} strokeWidth={6}>
          <ellipse cx={faceX - 22} cy={faceY - 12} rx={23} ry={17} />
          <ellipse cx={faceX + 22} cy={faceY - 12} rx={23} ry={17} />
        </g>
      ) : null}
      {[-22, 22].map((dx) =>
        eyes >= 1 ? (
          <circle key={dx} cx={faceX + dx} cy={faceY - 12} r={10} fill={INK} />
        ) : eyes < 0.2 ? (
          <path key={dx} d={`M${faceX + dx - 13} ${faceY - 14} q13 11 26 0`} {...line} strokeWidth={7} />
        ) : (
          <ellipse key={dx} cx={faceX + dx} cy={faceY - 12 + (1 - eyes) * 4} rx={10} ry={10 * eyes} fill={INK} />
        ),
      )}
      <path
        d={`M${faceX - 26} ${faceY + 26} Q${faceX} ${faceY + 26 + p.smile * 26} ${faceX + 26} ${faceY + 26}`}
        {...line}
        strokeWidth={10}
      />
    </g>
  );
};
