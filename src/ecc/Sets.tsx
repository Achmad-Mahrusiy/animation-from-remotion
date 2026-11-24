import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "../Composition";
import { Stickman, type Pose } from "../Stickman";
import { AMBER, CREAM, GREEN, RED, fontFamily } from "../theme";

// A cooking show in a restaurant kitchen: the AI cooks alone, then ECC hands it a whole brigade.
// Flat vector drawings on 1080x1920: steel, copper and tomato on dark tiled walls. Floor line y=1650;
// captions own the space above y=640; the order ticket at the bottom covers y 1745-1850.
export const text = { fontFamily, fontWeight: 900 } as const;
export const INK = "#0f1416";
const STEEL = "#a3adb3";
const STEEL_DARK = "#5b656b";
const STEEL_DEEP = "#3a4246";
const COPPER = "#c77b45";
const COPPER_LIGHT = "#e39a62";
const COPPER_DARK = "#7a4524";
export const PAPER = "#f3ead8";
const PAPER_LINE = "#cbbfa6";
const WOOD = "#c9a56e";
const CARDBOARD = "#c79a5e";
const CARDBOARD_DARK = "#8f6a3c";
// Wall colours, also the head fill of the stickman (and the helpers) in that room.
export const LINE = "#1c3236";
export const DOORS = "#262b33";
export const RAIL = "#2c2721";
export const TASTE = "#1e2a39";
export const PASS = "#35251d";
export const BOOK = "#272238";
export const PANTRY = "#2b2218";
export const COUNTER = "#341f23";

// Subway tiles: a brick pattern of faint grout lines from the captions down to the floor.
const Tiles: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <rect x={-60} y={-60} width={1200} height={2040} fill={color} />
    <g stroke={CREAM} strokeOpacity={0.06} strokeWidth={3}>
      {Array.from({ length: 19 }, (_, r) => (
        <g key={r}>
          <path d={`M-60 ${620 + r * 56} H1140`} />
          {Array.from({ length: 10 }, (__, c) => (
            <path key={c} d={`M${-60 + c * 130 + (r % 2) * 65} ${620 + r * 56} v56`} />
          ))}
        </g>
      ))}
    </g>
  </g>
);

// Checkered kitchen floor below the floor line.
const Floor: React.FC = () => (
  <g>
    <rect x={-60} y={1650} width={1200} height={330} fill="#17191b" />
    {Array.from({ length: 13 }, (_, i) =>
      Array.from({ length: 4 }, (__, j) =>
        (i + j) % 2 ? <rect key={`${i}-${j}`} x={-60 + i * 95} y={1650 + j * 80} width={95} height={80} fill="#d9d2c4" opacity={0.1} /> : null,
      ),
    )}
    <rect x={-60} y={1644} width={1200} height={12} fill={STEEL_DARK} />
  </g>
);

// Chef's hat. (x, y) is the bottom of the band, which sits on the top of the head.
export const Toque: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g>
    {[
      [-40, -72, 36],
      [40, -72, 36],
      [0, -96, 44],
    ].map(([dx, dy, r]) => (
      <circle key={dx + "" + dy} cx={x + dx * s} cy={y + dy * s} r={r * s} fill={PAPER} stroke={PAPER_LINE} strokeWidth={4} />
    ))}
    <rect x={x - 58 * s} y={y - 40 * s} width={116 * s} height={40 * s} rx={6 * s} fill={PAPER} stroke={PAPER_LINE} strokeWidth={4} />
  </g>
);

// A point of a helper's pose, in screen space.
export const helperPoint = (x: number, y: number, s: number, p: [number, number]): [number, number] => [x + (p[0] - 190) * s, y + (p[1] - 1650) * s];

// A small brigade cook: the channel's stickman at a smaller scale, in a chef's hat. Feet at (x, y).
export const Helper: React.FC<{ x: number; y: number; s: number; pose: Pose; wall: string; eyes?: number; opacity?: number }> = ({
  x,
  y,
  s,
  pose,
  wall,
  eyes = 1,
  opacity = 1,
}) => (
  <g opacity={opacity} transform={`translate(${x - 190 * s} ${y - 1650 * s}) scale(${s})`}>
    <Stickman pose={pose} thumb={0} headFill={wall} bendy eyes={eyes} />
    <Toque x={pose.head[0]} y={pose.head[1] - 62} />
  </g>
);

// Order ticket at the bottom: the station the show is at.
export const OrderTicket: React.FC<{ n: number; label: string }> = ({ n, label }) => {
  const words = `#${n}  ${label}`;
  const w = Math.max(300, words.length * 25 + 90);
  const left = 540 - w / 2;
  const teeth = Math.floor(w / 30);
  return (
    <g>
      <path
        d={`M${left} 1748 H${left + w} V1830 ${Array.from({ length: teeth }, (_, i) => `L${left + w - (i + 0.5) * (w / teeth)} 1846 L${left + w - (i + 1) * (w / teeth)} 1830`).join(" ")} Z`}
        fill={PAPER}
      />
      <rect x={left} y={1748} width={18} height={82} fill={RED} />
      <text x={540 + 9} y={1804} textAnchor="middle" fontSize={40} fill={INK} letterSpacing={3} {...text}>
        {words}
      </text>
    </g>
  );
};

// Copper pot with code on its side. (x, y) is the middle of its base.
export const Pot: React.FC<{ x: number; y: number; s?: number; steam?: boolean }> = ({ x, y, s = 1, steam = true }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {steam
        ? [-50, 0, 50].map((dx, i) => {
            const t = ((frame + i * 17) % 50) / 50;
            return (
              <path
                key={dx}
                d={`M${x + dx * s} ${y - 175 * s - t * 90} q20 -25 0 -50 q-20 -25 0 -50`}
                stroke={CREAM}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
                opacity={0.28 * Math.sin(t * Math.PI)}
              />
            );
          })
        : null}
      <rect x={x - 135 * s} y={y - 120 * s} width={40 * s} height={22 * s} rx={10 * s} fill={COPPER_DARK} />
      <rect x={x + 95 * s} y={y - 120 * s} width={40 * s} height={22 * s} rx={10 * s} fill={COPPER_DARK} />
      <rect x={x - 110 * s} y={y - 150 * s} width={220 * s} height={150 * s} rx={18 * s} fill={COPPER} />
      <rect x={x - 120 * s} y={y - 166 * s} width={240 * s} height={22 * s} rx={10 * s} fill={COPPER_LIGHT} />
      <text x={x} y={y - 48 * s} textAnchor="middle" fontSize={64 * s} fill={COPPER_DARK} {...text}>
        {"</>"}
      </text>
    </g>
  );
};

// Wooden spoon from the hand to its tip.
export const Spoon: React.FC<{ from: [number, number]; to: [number, number] }> = ({ from, to }) => (
  <g>
    <path d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} stroke={WOOD} strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={to[0]} cy={to[1]} rx={22} ry={15} fill={WOOD} transform={`rotate(${(Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI} ${to[0]} ${to[1]})`} />
  </g>
);

// A red bug, about 130 px wide, legs wiggling.
export const Bug: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame / 1.6) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-1, 1].map((side) =>
        [-24, 0, 24].map((dy, i) => (
          <path
            key={`${side}${dy}`}
            d={`M${side * 30} ${dy} l${side * 34} ${(i - 1) * 10 + (i % 2 ? w : -w) * side}`}
            stroke={INK}
            strokeWidth={9}
            strokeLinecap="round"
          />
        )),
      )}
      <path d="M-14 -62 q-18 -26 -32 -26 M14 -62 q18 -26 32 -26" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={6} rx={44} ry={52} fill={RED} stroke={INK} strokeWidth={8} />
      <path d="M0 -44 V56" stroke={INK} strokeWidth={6} />
      <circle cx={0} cy={-56} r={24} fill={INK} />
      <circle cx={-9} cy={-60} r={6} fill={CREAM} />
      <circle cx={9} cy={-60} r={6} fill={CREAM} />
      <circle cx={-18} cy={4} r={8} fill={INK} />
      <circle cx={18} cy={24} r={8} fill={INK} />
    </g>
  );
};

// Station sign over the stove: the job, and that nobody is doing it.
const StationSign: React.FC<{ x: number; label: string; s: number }> = ({ x, label, s }) => (
  <g transform={`translate(${x} 850) scale(${s}) translate(${-x} -850)`} opacity={Math.min(1, s)}>
    <path d={`M${x} 760 V786`} stroke={STEEL} strokeWidth={5} />
    <rect x={x - 82} y={786} width={164} height={124} rx={14} fill="#11181c" stroke={STEEL} strokeWidth={5} />
    <text x={x} y={842} textAnchor="middle" fontSize={40} fill={PAPER} {...text}>
      {label}
    </text>
    <text x={x} y={886} textAnchor="middle" fontSize={26} fill={RED} letterSpacing={2} {...text}>
      EMPTY
    </text>
  </g>
);

// Stove line, the opening set: hood, stove with a pot, three station signs that pop on "plan, test and review".
export const TheLine: React.FC<{ signs?: number[]; flame?: boolean }> = ({ signs = [0, 0, 0] }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Tiles color={LINE} />
      <path d="M520 650 H1060 V720 L1010 760 H570 L520 720Z" fill={STEEL_DARK} />
      <rect x={540} y={700} width={500} height={12} fill={STEEL_DEEP} />
      {["PLAN", "TEST", "REVIEW"].map((label, i) => (signs[i] > 0.01 ? <StationSign key={label} x={600 + i * 180} label={label} s={signs[i]} /> : null))}
      {/* Pans hanging on the left wall, clear of his hat. */}
      {[70, 150].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 700 V760`} stroke={STEEL} strokeWidth={5} />
          <circle cx={x} cy={800 + i * 10} r={40 + i * 6} fill={COPPER} stroke={COPPER_DARK} strokeWidth={6} />
          <rect x={x - 6} y={760} width={12} height={36} fill={COPPER_DARK} />
        </g>
      ))}
      <Floor />
      {/* Stove */}
      <rect x={520} y={1334} width={540} height={316} fill={STEEL_DARK} />
      <rect x={510} y={1318} width={560} height={26} rx={6} fill={STEEL} />
      {[600, 700, 800, 900].map((x) => (
        <circle key={x} cx={x} cy={1384} r={16} fill={STEEL_DEEP} stroke={STEEL} strokeWidth={4} />
      ))}
      <rect x={570} y={1430} width={440} height={180} rx={10} fill={STEEL_DEEP} />
      <rect x={610} y={1470} width={360} height={100} rx={8} fill="#1d2326" />
      <rect x={640} y={1440} width={300} height={14} rx={7} fill={STEEL} />
      {/* Flames under the pot */}
      {[-60, -20, 20, 60].map((dx, i) => (
        <path
          key={dx}
          d={`M${650 + dx - 14} 1318 Q${650 + dx} ${1288 - ((frame + i * 3) % 6) * 2} ${650 + dx + 14} 1318Z`}
          fill={i % 2 ? AMBER : "#5aa9e6"}
          opacity={0.9}
        />
      ))}
    </g>
  );
};

// The opening set's pot (drawn after the spoon so the spoon dips inside).
export const LINE_POT: [number, number] = [650, 1318];

// Outro ticket pinned under the hood with the install command.
export const CommandTicket: React.FC<{ s: number }> = ({ s }) =>
  s > 0.01 ? (
    <g transform={`translate(790 850) scale(${s}) translate(-790 -850)`}>
      <path d="M790 760 V786" stroke={STEEL} strokeWidth={5} />
      <rect x={560} y={786} width={460} height={150} rx={10} fill={PAPER} />
      <text x={790} y={848} textAnchor="middle" fontSize={44} fill={INK} {...text}>
        /plugin install
      </text>
      <text x={790} y={906} textAnchor="middle" fontSize={50} fill={COPPER_DARK} {...text}>
        ecc@ecc
      </text>
    </g>
  ) : null;

// The brigade arrives: neon ECC sign, a back counter, and the shipping box the cooks jump out of.
export const Brigade: React.FC<{ neon: number }> = ({ neon }) => {
  const frame = useCurrentFrame();
  const flicker = neon > 0.9 ? 1 : neon * ((frame % 4) < 2 ? 1 : 0.5);
  return (
    <g>
      <Tiles color={DOORS} />
      <rect x={380} y={690} width={620} height={250} rx={30} fill="#141820" stroke={STEEL_DEEP} strokeWidth={8} />
      <rect x={380} y={690} width={620} height={250} rx={30} fill="none" stroke={AMBER} strokeWidth={10} opacity={flicker * 0.9} />
      <ellipse cx={690} cy={815} rx={330} ry={150} fill={AMBER} opacity={flicker * 0.12} />
      <text x={690} y={870} textAnchor="middle" fontSize={170} fill={AMBER} opacity={0.15 + flicker * 0.85} letterSpacing={18} {...text}>
        ECC
      </text>
      {/* Back counter with shelves */}
      <rect x={-60} y={1250} width={1200} height={20} fill={STEEL} />
      <rect x={-60} y={1270} width={1200} height={380} fill={STEEL_DEEP} />
      {[1390, 1510].map((y) => (
        <rect key={y} x={-60} y={y} width={1200} height={10} fill={STEEL_DARK} />
      ))}
      <Floor />
    </g>
  );
};

// Cardboard box with the plugin name. (x, y) is the middle of its base; open 0..1 swings the flaps.
export const Box: React.FC<{ x: number; y: number; s?: number; open?: number; label?: string }> = ({ x, y, s = 1, open = 0, label = "ecc@ecc" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g transform={`rotate(${-open * 120} -100 -150)`}>
      <rect x={-100} y={-170} width={100} height={22} fill={CARDBOARD_DARK} />
    </g>
    <g transform={`rotate(${open * 120} 100 -150)`}>
      <rect x={0} y={-170} width={100} height={22} fill={CARDBOARD_DARK} />
    </g>
    <rect x={-100} y={-150} width={200} height={150} fill={CARDBOARD} />
    {open < 0.05 ? <rect x={-14} y={-150} width={28} height={60} fill={PAPER_LINE} opacity={0.6} /> : null}
    <rect x={-80} y={-80} width={160} height={50} rx={6} fill={PAPER} />
    <text x={0} y={-44} textAnchor="middle" fontSize={32} fill={INK} {...text}>
      {label}
    </text>
  </g>
);

// Ticket rail with the plan ticket. slide 0..1 brings it in from the right; typed 0..1 types the command; ticks 0..1 each.
export const TicketRail: React.FC<{ slide: number; typed: number; ticks: number[] }> = ({ slide, typed, ticks }) => {
  const cmd = "/ecc:plan";
  const shown = cmd.slice(0, Math.round(typed * cmd.length));
  const x = interpolate(slide, [0, 1], [1160, 520]);
  return (
    <g>
      <Tiles color={RAIL} />
      {/* Two old tickets already hanging on the left of the rail */}
      {[60, 220].map((tx, i) => (
        <g key={tx} transform={`rotate(${i ? 4 : -3} ${tx + 70} 700)`}>
          <rect x={tx} y={708} width={140} height={200} rx={6} fill={PAPER} opacity={0.55} />
          {[0, 1, 2].map((k) => (
            <rect key={k} x={tx + 20} y={750 + k * 40} width={100 - k * 20} height={12} rx={6} fill={PAPER_LINE} opacity={0.7} />
          ))}
        </g>
      ))}
      <rect x={30} y={690} width={1020} height={20} rx={10} fill={STEEL} />
      <rect x={30} y={706} width={1020} height={6} fill={STEEL_DARK} />
      <g>
        <rect x={x} y={708} width={360} height={470} rx={8} fill={PAPER} />
        <rect x={x} y={708} width={360} height={16} fill={RED} />
        <text x={x + 30} y={800} fontSize={54} fill={INK} {...text}>
          {shown}
        </text>
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <rect x={x + 30} y={850 + k * 100} width={56} height={56} rx={8} fill="none" stroke={INK} strokeWidth={6} />
            <rect x={x + 110} y={868 + k * 100} width={200 - k * 40} height={20} rx={10} fill={PAPER_LINE} />
            {ticks[k] > 0.01 ? (
              <path
                d={`M${x + 40} ${878 + k * 100} l14 16 l28 -34`}
                fill="none"
                stroke="#2f9a5a"
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={Math.min(1, ticks[k])}
                transform={`translate(${x + 58} ${878 + k * 100}) scale(${ticks[k]}) translate(${-(x + 58)} ${-(878 + k * 100)})`}
              />
            ) : null}
          </g>
        ))}
      </g>
      <Floor />
      {/* Prep table on the right, behind the planner */}
      <rect x={640} y={1400} width={440} height={22} fill={STEEL} />
      <rect x={660} y={1422} width={18} height={228} fill={STEEL_DARK} />
      <rect x={1040} y={1422} width={18} height={228} fill={STEEL_DARK} />
      <rect x={660} y={1540} width={400} height={12} fill={STEEL_DARK} />
    </g>
  );
};

// The planner's clipboard in his hand.
export const Clipboard: React.FC<{ hand: [number, number] }> = ({ hand: [x, y] }) => (
  <g>
    <rect x={x - 70} y={y - 40} width={90} height={118} rx={8} fill={CARDBOARD_DARK} />
    <rect x={x - 62} y={y - 26} width={74} height={96} fill={PAPER} />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={x - 54} y={y - 10 + k * 24} width={56 - k * 10} height={8} rx={4} fill={PAPER_LINE} />
    ))}
  </g>
);

// Tasting station: a test gauge on the wall (needle from red to green) and a counter with a pot.
export const Tasting: React.FC<{ needle: number }> = ({ needle }) => {
  const cx = 800;
  const cy = 1010;
  const angle = interpolate(needle, [0, 1], [-62, 62]);
  const glow = needle < 0.5 ? RED : GREEN;
  return (
    <g>
      <Tiles color={TASTE} />
      <circle cx={cx} cy={cy - 60} r={230} fill={glow} opacity={0.1} />
      <rect x={cx - 210} y={cy - 250} width={420} height={330} rx={30} fill="#11181c" stroke={STEEL} strokeWidth={8} />
      <path d={`M${cx - 160} ${cy} A160 160 0 0 1 ${cx} ${cy - 160}`} stroke={RED} strokeWidth={36} fill="none" />
      <path d={`M${cx} ${cy - 160} A160 160 0 0 1 ${cx + 160} ${cy}`} stroke={GREEN} strokeWidth={36} fill="none" />
      <g transform={`rotate(${angle} ${cx} ${cy})`}>
        <path d={`M${cx - 10} ${cy} L${cx} ${cy - 140} L${cx + 10} ${cy}Z`} fill={PAPER} />
      </g>
      <circle cx={cx} cy={cy} r={20} fill={PAPER} />
      <text x={cx} y={cy + 60} textAnchor="middle" fontSize={44} fill={PAPER} letterSpacing={6} {...text}>
        TESTS
      </text>
      <Floor />
      <rect x={380} y={1400} width={760} height={24} fill={STEEL} />
      <rect x={400} y={1424} width={720} height={226} fill={STEEL_DARK} />
      {[560, 840].map((x) => (
        <rect key={x} x={x - 110} y={1460} width={220} height={150} rx={8} fill={STEEL_DEEP} />
      ))}
    </g>
  );
};
export const TASTE_POT: [number, number] = [560, 1400];

// The pass: heat lamps over a steel shelf where the dish waits for the check.
export const ThePass: React.FC<{ check: number }> = ({ check }) => (
  <g>
    <Tiles color={PASS} />
    {[520, 720, 920].map((x) => (
      <g key={x}>
        <path d={`M${x} 640 V770`} stroke={STEEL} strokeWidth={6} />
        <path d={`M${x - 70} 840 L${x + 70} 840 L${x + 120} 1280 L${x - 120} 1280Z`} fill={AMBER} opacity={0.08} />
        <path d={`M${x - 60} 840 L${x - 36} 770 H${x + 36} L${x + 60} 840Z`} fill={STEEL_DARK} />
        <ellipse cx={x} cy={842} rx={44} ry={10} fill={AMBER} />
      </g>
    ))}
    <Floor />
    <rect x={360} y={1290} width={760} height={24} fill={STEEL} />
    <rect x={380} y={1314} width={740} height={336} fill={STEEL_DEEP} />
    <rect x={380} y={1460} width={740} height={10} fill={STEEL_DARK} />
    {/* The dish: code on a plate */}
    <ellipse cx={660} cy={1284} rx={130} ry={24} fill={PAPER} />
    <path d="M580 1280 Q600 1200 660 1196 Q720 1200 740 1280Z" fill={COPPER} />
    <text x={660} y={1266} textAnchor="middle" fontSize={50} fill={COPPER_DARK} {...text}>
      {"</>"}
    </text>
    {check > 0.01 ? (
      <g transform={`translate(660 1140) scale(${check}) translate(-660 -1140)`} opacity={Math.min(1, check)}>
        <circle cx={660} cy={1140} r={70} fill="#2f9a5a" />
        <path d="M626 1142 l24 26 l44 -54" fill="none" stroke={PAPER} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ) : null}
  </g>
);

// The reviewer's magnifying glass, held toward the left.
export const Lens: React.FC<{ hand: [number, number] }> = ({ hand: [x, y] }) => (
  <g>
    <path d={`M${x} ${y} L${x - 34} ${y - 6}`} stroke={WOOD} strokeWidth={14} strokeLinecap="round" />
    <circle cx={x - 84} cy={y - 10} r={50} fill={CREAM} fillOpacity={0.2} stroke={AMBER} strokeWidth={12} />
  </g>
);

// Sparkle lines around a point, for "fresh eyes".
export const Shine: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s > 0.01 ? (
    <g opacity={Math.min(1, s)} stroke={AMBER} strokeWidth={8} strokeLinecap="round">
      {[-60, -20, 20, 60].map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return <path key={deg} d={`M${x + Math.cos(a) * 70 * s} ${y + Math.sin(a) * 70 * s} L${x + Math.cos(a) * 100 * s} ${y + Math.sin(a) * 100 * s}`} />;
      })}
    </g>
  ) : null;

// Recipe corner: a window that turns from night to morning, and a shelf of pans on the left.
export const RecipeCorner: React.FC<{ day: number }> = ({ day }) => {
  const sky = interpolate(day, [0, 1], [0, 1]);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * sky);
  const skyColor = `rgb(${mix(20, 124)}, ${mix(32, 196)}, ${mix(58, 232)})`;
  return (
    <g>
      <Tiles color={BOOK} />
      <rect x={620} y={720} width={380} height={400} rx={12} fill={skyColor} />
      <circle cx={900} cy={interpolate(day, [0, 1], [800, 1180], CLAMP)} r={42} fill={PAPER} opacity={1 - day} />
      <circle cx={760} cy={interpolate(day, [0, 1], [1200, 830], CLAMP)} r={56} fill={AMBER} opacity={day} />
      <rect x={620} y={720} width={380} height={400} rx={12} fill="none" stroke={STEEL} strokeWidth={14} />
      <path d="M810 720 V1120 M620 920 H1000" stroke={STEEL} strokeWidth={10} />
      <rect x={600} y={1120} width={420} height={22} fill={STEEL} />
      <Floor />
      <rect x={560} y={1400} width={520} height={24} fill={WOOD} />
      <rect x={580} y={1424} width={480} height={226} fill="#6a4a2c" />
      <Pot x={820} y={1400} s={0.7} steam={false} />
    </g>
  );
};

// Recipe book in both hands. open 0 closed, 1 open; saved shows the ribbon tag.
export const RecipeBook: React.FC<{ hands: [number, number]; open: number; saved: number }> = ({ hands: [x, y], open, saved }) => (
  <g>
    {open > 0.5 ? (
      <g>
        <path d={`M${x - 150} ${y - 110} L${x} ${y - 96} L${x + 150} ${y - 110} V${y + 60} L${x} ${y + 74} L${x - 150} ${y + 60}Z`} fill={RED} />
        <path d={`M${x - 138} ${y - 100} L${x - 4} ${y - 88} V${y + 62} L${x - 138} ${y + 50}Z M${x + 138} ${y - 100} L${x + 4} ${y - 88} V${y + 62} L${x + 138} ${y + 50}Z`} fill={PAPER} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M${x - 120} ${y - 60 + k * 34} L${x - 24} ${y - 52 + k * 34} M${x + 24} ${y - 52 + k * 34} L${x + 120} ${y - 60 + k * 34}`} stroke={PAPER_LINE} strokeWidth={8} strokeLinecap="round" />
        ))}
      </g>
    ) : (
      <g>
        <rect x={x - 80} y={y - 120} width={160} height={200} rx={10} fill={RED} />
        <rect x={x - 80} y={y - 120} width={22} height={200} fill="#a83526" />
        <text x={x + 10} y={y - 10} textAnchor="middle" fontSize={30} fill={PAPER} {...text}>
          ECC
        </text>
      </g>
    )}
    {saved > 0.01 ? (
      <g opacity={Math.min(1, saved)}>
        <path d={`M${x + 40} ${y - 120} V${y + 120} l-18 -18 l-18 18 V${y - 120}`} fill={GREEN} />
      </g>
    ) : null}
  </g>
);

// Pantry: six shelves of skill jars. pulled is the jar that leaves (row 2, jar 1); glow lights it first.
export const JARS = 8;
export const PULLED: [number, number] = [2, 1];
const SHELVES = [800, 960, 1120, 1280, 1440, 1600];
const JAR_COLORS = [AMBER, GREEN, RED, "#7fb6d9", COPPER_LIGHT, "#c7a6e6"];
export const jarSpot = (row: number, k: number): [number, number] => [430 + k * 82, SHELVES[row]];
export const Jar: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-30} y={-112} width={60} height={110} rx={12} fill={CREAM} opacity={0.22} />
    <rect x={-30} y={-62} width={60} height={60} rx={10} fill={color} opacity={0.85} />
    <rect x={-34} y={-128} width={68} height={20} rx={6} fill={color} />
    <rect x={-20} y={-90} width={40} height={20} rx={4} fill={PAPER} />
  </g>
);
export const Pantry: React.FC<{ glow: number; gone: boolean }> = ({ glow, gone }) => (
  <g>
    <Tiles color={PANTRY} />
    <rect x={380} y={650} width={700} height={1000} fill="#1f1912" />
    {SHELVES.map((y, row) => (
      <g key={y}>
        {Array.from({ length: JARS }, (_, k) => {
          if (gone && row === PULLED[0] && k === PULLED[1]) return null;
          const [x] = jarSpot(row, k);
          return <Jar key={k} x={x} y={y} color={JAR_COLORS[(row * 3 + k) % JAR_COLORS.length]} />;
        })}
        <rect x={380} y={y} width={700} height={18} fill={WOOD} />
      </g>
    ))}
    {glow > 0.01 && !gone ? (
      <circle cx={jarSpot(...PULLED)[0]} cy={jarSpot(...PULLED)[1] - 62} r={80} fill="none" stroke={AMBER} strokeWidth={10} opacity={glow} />
    ) : null}
    <Floor />
  </g>
);
export const PULLED_COLOR = JAR_COLORS[(PULLED[0] * 3 + PULLED[1]) % JAR_COLORS.length];

// The catch: one box on the counter is right. A second box lands on top of it, then everything on the counter doubles.
export const TheCounter: React.FC<{ beacon: number; once: number; double: number; box2: number }> = ({ beacon, once, double, box2 }) => {
  const frame = useCurrentFrame();
  const spin = frame / 3;
  const d = Math.min(1, double);
  const tag = (x: number, y: number, key: string) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${Math.min(1, Math.max(0, (double - 0.4) * 2))})`}>
      <rect x={-50} y={-36} width={100} height={64} rx={12} fill={RED} />
      <text x={0} y={14} textAnchor="middle" fontSize={42} fill={PAPER} {...text}>
        ×2
      </text>
    </g>
  );
  return (
    <g>
      <Tiles color={COUNTER} />
      {/* Warning beacon */}
      {beacon > 0.01 ? (
        <path d={`M940 760 L${940 + Math.cos(spin) * 420} ${760 + 160} L${940 + Math.cos(spin + 0.4) * 420} ${760 + 220}Z`} fill={RED} opacity={0.14 * beacon} />
      ) : null}
      <rect x={890} y={720} width={100} height={20} fill={STEEL_DARK} />
      <path d="M900 720 Q940 640 980 720Z" fill={RED} opacity={0.35 + 0.65 * beacon * (0.6 + 0.4 * Math.abs(Math.sin(spin)))} />
      <Floor />
      <rect x={340} y={1380} width={780} height={24} fill={STEEL} />
      <rect x={360} y={1404} width={740} height={246} fill={STEEL_DEEP} />
      {/* The originals: box, pot, one cook */}
      <Box x={480} y={1380} s={0.9} />
      <Pot x={730} y={1380} s={0.8} steam={false} />
      <Helper x={920} y={1380} s={0.42} pose={COUNTER_COOK} wall={COUNTER} />
      {/* The doubles: a pot stacked on the pot, a second cook beside the first */}
      {d > 0.01 ? (
        <g opacity={d}>
          <g transform={`translate(0 ${-133 * d})`}>
            <Pot x={730} y={1380} s={0.8} steam={false} />
          </g>
          <Helper x={920 + 90 * d} y={1380} s={0.42} pose={COUNTER_COOK} wall={COUNTER} />
        </g>
      ) : null}
      {/* The second box falls onto the first */}
      {box2 > 0 ? <Box x={480} y={interpolate(box2, [0, 1], [640, 1245], CLAMP)} s={0.9} /> : null}
      {once > 0.01 ? (
        <g transform={`translate(480 1470) scale(${once})`}>
          <circle cx={0} cy={0} r={40} fill="#2f9a5a" />
          <path d="M-18 2 l13 14 l24 -30" fill="none" stroke={PAPER} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {double > 0.4 ? [tag(480, 1060, "box"), tag(860, 1080, "pot"), tag(1000, 1000, "cook")] : null}
    </g>
  );
};

// A small cook standing on the counter, arms down: the same pose for the original and its double.
const COUNTER_COOK: Pose = {
  head: [190, 1040],
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
  look: 0,
  smile: 0.6,
};
