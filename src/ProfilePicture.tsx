import { AbsoluteFill } from "remotion";
import { REPORT, Stickman, type Pose } from "./Stickman";
import { AMBER, CREAM, WALL, fontFamily } from "./theme";

const BUST: Pose = {
  ...REPORT,
  head: [180, 122],
  sh: [180, 205],
  hip: [180, 400],
  eL: [62, 255],
  hL: [100, 275],
  eR: [298, 255],
  hR: [260, 275],
  look: 0,
  smile: 1.3,
};

// Everything sits inside the circle that platforms crop avatars to.
export const ProfilePicture: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: WALL }}>
    <svg viewBox="0 0 1080 1080" width={1080} height={1080}>
      <g transform="scale(3)">
        <Stickman pose={BUST} thumb={0} />
      </g>
      <rect
        x={300}
        y={640}
        width={480}
        height={310}
        rx={30}
        fill="#11181c"
        stroke={AMBER}
        strokeWidth={18}
      />
      <text
        x={540}
        y={868}
        textAnchor="middle"
        fontFamily={fontFamily}
        fontWeight={900}
        fontSize={210}
        fill={AMBER}
      >
        {">_"}
      </text>
      <circle cx={300} cy={800} r={42} fill={CREAM} />
      <circle cx={780} cy={800} r={42} fill={CREAM} />
    </svg>
  </AbsoluteFill>
);
