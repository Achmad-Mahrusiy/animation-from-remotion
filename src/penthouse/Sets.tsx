import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "../Composition";
import { CREAM, GREEN, fontFamily } from "../theme";

// A luxury penthouse told like a property tour: every skill gets its own room. Flat vector drawings on 1080x1920,
// warm gold on deep green, plum and walnut. The floor line is y=1650; captions own the space above y=640.
export const text = { fontFamily, fontWeight: 900 } as const;
export const INK = "#0e1311";
export const GOLD = "#d9ad55";
const GOLD_DARK = "#8c6a2c";
const MARBLE = "#1b1d21";
const MARBLE_VEIN = "#34373d";
const WALNUT = "#5b3a24";
const WALNUT_DARK = "#3a2416";
const SILK = "#efe9dd";
const VELVET = "#2f5a48";
// Wall colours, also the head fill of the stickman in that room.
export const SUITE = "#1f3a33";
export const FOYER = "#2b2722";
export const BOARD = "#3d2a1d";
export const GALLERY = "#183a31";
export const LIBRARY = "#2e2119";
export const BOUTIQUE = "#3b2533";
export const MEDIA = "#151d2b";

const Wall: React.FC<{ color: string }> = ({ color }) => <rect x={-60} y={-60} width={1200} height={2040} fill={color} />;

// Black marble floor from the baseboard down, with a few light veins.
const MarbleFloor: React.FC<{ y?: number; checker?: boolean }> = ({ y = 1500, checker = false }) => (
  <g>
    <rect x={-60} y={y} width={1200} height={1980 - y} fill={MARBLE} />
    {checker
      ? Array.from({ length: 8 }, (_, i) =>
          Array.from({ length: 4 }, (__, j) =>
            (i + j) % 2 ? <rect key={`${i}-${j}`} x={-60 + i * 160} y={y + j * 110} width={160} height={110} fill={SILK} opacity={0.12} /> : null,
          ),
        )
      : null}
    <path d={`M-60 ${y + 120} Q300 ${y + 60} 520 ${y + 150} T1140 ${y + 110}`} stroke={MARBLE_VEIN} strokeWidth={5} fill="none" />
    <path d={`M200 ${y + 400} Q500 ${y + 300} 760 ${y + 380} T1140 ${y + 330}`} stroke={MARBLE_VEIN} strokeWidth={4} fill="none" />
    <rect x={-60} y={y - 16} width={1200} height={16} fill={GOLD_DARK} />
  </g>
);

const Sconce: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y - 10} rx={70} ry={90} fill={GOLD} opacity={0.1} />
    <rect x={x - 6} y={y} width={12} height={46} fill={GOLD_DARK} />
    <path d={`M${x - 26} ${y} L${x + 26} ${y} L${x + 16} ${y - 44} L${x - 16} ${y - 44}Z`} fill={GOLD} />
  </g>
);

// Night skyline in a tall window, with windows that twinkle slowly.
const Skyline: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const frame = useCurrentFrame();
  const towers = [0.12, 0.55, 0.3, 0.8, 0.45, 0.68, 0.22, 0.6];
  const tw = w / towers.length;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0d1a2c" />
      <circle cx={x + w * 0.78} cy={y + h * 0.16} r={26} fill={SILK} opacity={0.85} />
      {towers.map((t, i) => {
        const top = y + h * (0.35 + t * 0.4);
        return (
          <g key={i}>
            <rect x={x + i * tw + 4} y={top} width={tw - 8} height={y + h - top} fill="#1b2c44" />
            {Array.from({ length: 6 }, (_, k) => (
              <rect
                key={k}
                x={x + i * tw + 14 + (k % 2) * (tw / 2 - 10)}
                y={top + 16 + Math.floor(k / 2) * 36}
                width={10}
                height={14}
                fill={GOLD}
                opacity={(i * 7 + k * 3 + Math.floor(frame / 20)) % 5 === 0 ? 0.25 : 0.8}
              />
            ))}
          </g>
        );
      })}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={GOLD_DARK} strokeWidth={14} />
      <rect x={x + w / 2 - 5} y={y} width={10} height={h} fill={GOLD_DARK} />
    </g>
  );
};

// A gold medallion with an icon, for the three promises of the hook.
const Medallion: React.FC<{ x: number; y: number; s: number; icon: "book" | "tie" | "cal" }> = ({ x, y, s, icon }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={78} fill={INK} stroke={GOLD} strokeWidth={10} />
      {icon === "book" ? (
        <g fill="none" stroke={CREAM} strokeWidth={8} strokeLinejoin="round">
          <path d="M-44 -26 Q-22 -36 0 -24 Q22 -36 44 -26 V30 Q22 20 0 32 Q-22 20 -44 30Z" />
          <path d="M0 -24 V32" />
        </g>
      ) : null}
      {icon === "tie" ? (
        <g fill={CREAM}>
          <path d="M-16 -40 H16 L8 -22 H-8Z" />
          <path d="M-8 -20 H8 L20 26 L0 44 L-20 26Z" />
        </g>
      ) : null}
      {icon === "cal" ? (
        <g>
          <rect x={-42} y={-36} width={84} height={76} rx={10} fill="none" stroke={CREAM} strokeWidth={8} />
          <rect x={-42} y={-36} width={84} height={20} fill={CREAM} />
          <text y={30} textAnchor="middle" fontSize={40} fill={GOLD} {...text}>
            30
          </text>
        </g>
      ) : null}
    </g>
  );

// Master suite: window over the city, a king bed with a green velvet headboard, a leather armchair, a pendant light.
export const Suite: React.FC<{ badges?: number[] }> = ({ badges = [0, 0, 0] }) => (
  <g>
    <Wall color={SUITE} />
    {/* The window ends at y=890, above his head while he sits. */}
    <Skyline x={40} y={680} w={380} h={210} />
    <rect x={20} y={670} width={50} height={250} fill={VELVET} />
    <rect x={390} y={670} width={50} height={250} fill={VELVET} />
    <Sconce x={520} y={1020} />
    <Sconce x={1010} y={1020} />
    {/* Headboard and bed, seen from the side, on the right. */}
    <rect x={960} y={1100} width={110} height={420} rx={30} fill={VELVET} />
    {[1150, 1240, 1330, 1420].map((y) => (
      <circle key={y} cx={1015} cy={y} r={7} fill={GOLD} />
    ))}
    <rect x={600} y={1380} width={470} height={90} rx={22} fill={SILK} />
    <rect x={600} y={1460} width={470} height={50} fill={WALNUT} />
    <rect x={880} y={1330} width={110} height={60} rx={26} fill="#ffffff" />
    <rect x={600} y={1405} width={300} height={70} rx={18} fill={GOLD} opacity={0.85} />
    <MarbleFloor />
    {/* Cream rug, and a small side table with a lamp beside his armchair. */}
    <ellipse cx={520} cy={1700} rx={460} ry={70} fill={SILK} opacity={0.85} />
    <rect x={450} y={1500} width={110} height={16} rx={6} fill={WALNUT} />
    <rect x={498} y={1516} width={14} height={134} fill={WALNUT_DARK} />
    <rect x={494} y={1440} width={22} height={60} fill={GOLD_DARK} />
    <path d="M464 1450 h82 l-14 -60 h-54Z" fill={SILK} />
    <Medallion x={580} y={810} s={badges[0]} icon="book" />
    <Medallion x={750} y={810} s={badges[1]} icon="tie" />
    <Medallion x={920} y={810} s={badges[2]} icon="cal" />
  </g>
);

// A leather armchair seen from the side, facing right, for a stickman sitting with his hip at (x, 1375).
// The back sits behind his spine and the far armrest behind his thighs; the front edge ends past his knees.
export const Armchair: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 110} y={1140} width={80} height={330} rx={36} fill="#6e3f22" />
    <rect x={x - 70} y={1300} width={250} height={40} rx={18} fill="#6e3f22" />
    <rect x={x - 100} y={1385} width={290} height={80} rx={26} fill="#8f5732" />
    <rect x={x - 86} y={1465} width={16} height={185} fill={WALNUT_DARK} />
    <rect x={x + 158} y={1465} width={16} height={185} fill={WALNUT_DARK} />
  </g>
);

// A tall executive chair seen from the side, facing right, for a stickman sitting with his hip at (x, 1375).
export const BossChair: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 110} y={1100} width={84} height={370} rx={34} fill="#24160e" />
    {[1160, 1240, 1320, 1400].map((y) => (
      <circle key={y} cx={x - 68} cy={y} r={6} fill={GOLD_DARK} />
    ))}
    <rect x={x - 100} y={1385} width={250} height={66} rx={24} fill="#4a2b19" />
    <rect x={x + 6} y={1450} width={20} height={150} fill={GOLD_DARK} />
    <path d={`M${x - 70} 1648 L${x + 16} 1596 L${x + 102} 1648`} stroke={GOLD_DARK} strokeWidth={14} fill="none" strokeLinecap="round" />
  </g>
);

// Entrance foyer: a big chandelier that brightens on the clap, doors on both sides, checkered marble.
export const Foyer: React.FC<{ glow: number }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const sparkle = (i: number) => 0.5 + 0.5 * Math.sin(frame / 4 + i * 1.7);
  const Door: React.FC<{ x: number }> = ({ x }) => (
    <g>
      <rect x={x - 12} y={960} width={264} height={556} rx={120} fill={GOLD_DARK} />
      <rect x={x} y={972} width={240} height={544} rx={110} fill={WALNUT_DARK} />
      <rect x={x + 118} y={1000} width={4} height={516} fill={WALNUT} />
      <circle cx={x + 100} cy={1270} r={9} fill={GOLD} />
      <circle cx={x + 140} cy={1270} r={9} fill={GOLD} />
    </g>
  );
  return (
    <g>
      <Wall color={FOYER} />
      {/* The glow stays above y=960, so the head (filled with the wall colour) never sits on it. */}
      <defs>
        <radialGradient id="foyerGlow">
          <stop offset="0" stopColor={GOLD} stopOpacity={0.35} />
          <stop offset="1" stopColor={GOLD} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={540} cy={790} rx={300 + glow * 160} ry={140 + glow * 30} fill="url(#foyerGlow)" opacity={0.35 + glow * 0.65} />
      <Door x={50} />
      <Door x={790} />
      <MarbleFloor checker />
      {/* The chandelier hangs from the top, its lowest crystal at y=900. */}
      <rect x={536} y={560} width={8} height={130} fill={GOLD_DARK} />
      <path d="M380 760 Q540 860 700 760" stroke={GOLD} strokeWidth={14} fill="none" />
      <path d="M430 700 Q540 770 650 700" stroke={GOLD} strokeWidth={12} fill="none" />
      {[380, 445, 510, 570, 635, 700].map((x, i) => (
        <g key={x}>
          <path d={`M${x} ${i % 2 ? 790 : 770} v60`} stroke={GOLD_DARK} strokeWidth={4} />
          <path
            d={`M${x} ${i % 2 ? 850 : 830} l-12 22 l12 26 l12 -26Z`}
            fill={CREAM}
            opacity={0.55 + glow * 0.45 * sparkle(i)}
          />
          <circle cx={x} cy={i % 2 ? 784 : 764} r={12 + glow * 4} fill={GOLD} opacity={0.6 + glow * 0.4} />
        </g>
      ))}
    </g>
  );
};

// Boardroom: a long walnut table with five empty advisor chairs and a pendant light over each one.
const ADVISORS = [480, 600, 720, 840, 960];
export const Boardroom: React.FC<{ lit: number[] }> = ({ lit }) => {
  const chairs = ADVISORS;
  return (
    <g>
      <Wall color={BOARD} />
      {/* Wood panels above the wainscot. */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={440 + i * 160} y={900} width={130} height={250} rx={8} fill="none" stroke={GOLD_DARK} strokeWidth={5} opacity={0.6} />
      ))}
      {chairs.map((x, i) => (
        <g key={x}>
          <rect x={x - 2} y={560} width={4} height={200} fill={GOLD_DARK} />
          <path d={`M${x - 44} 800 L${x - 22} 760 H${x + 22} L${x + 44} 800Z`} fill={GOLD} />
          <path d={`M${x - 44} 800 L${x - 120} 1390 H${x + 120} L${x + 44} 800Z`} fill={GOLD} opacity={lit[i] * 0.16} />
          <circle cx={x} cy={806} r={14} fill={lit[i] > 0.5 ? "#fff3c9" : GOLD_DARK} />
        </g>
      ))}
      <MarbleFloor y={1560} />
      {chairs.map((x) => (
        <g key={x}>
          <rect x={x - 46} y={1170} width={92} height={240} rx={26} fill="#24160e" />
          <rect x={x - 34} y={1184} width={68} height={200} rx={20} fill="#4a2b19" />
        </g>
      ))}
    </g>
  );
};

// The table is drawn in front of him, so his knees go under it; his hands stay above the top at y=1380.
export const BoardTable: React.FC<{ card: number }> = ({ card }) => {
  const chairs = ADVISORS;
  return (
    <g>
      {/* The table top at y=1380, with blank brass nameplates. */}
      <rect x={330} y={1380} width={760} height={34} rx={8} fill={WALNUT} />
      <rect x={330} y={1414} width={760} height={18} fill={WALNUT_DARK} />
      <rect x={370} y={1430} width={26} height={220} fill={WALNUT_DARK} />
      <rect x={1000} y={1430} width={26} height={220} fill={WALNUT_DARK} />
      {chairs.map((x) => (
        <path key={x} d={`M${x - 30} 1380 L${x - 22} 1356 H${x + 22} L${x + 30} 1380Z`} fill={GOLD} />
      ))}
      {/* The service bell he taps. */}
      <g transform="translate(404 1380) scale(1.8) translate(-404 -1380)">
        <rect x={378} y={1372} width={52} height={8} rx={3} fill={GOLD_DARK} />
        <path d="M384 1372 Q404 1334 424 1372Z" fill={GOLD} />
        <circle cx={404} cy={1340} r={5} fill={GOLD} />
      </g>
      {/* The answer: a card that slides along the table from the middle advisor to him. */}
      {card > 0 ? (
        <g transform={`translate(${interpolate(card, [0, 1], [710, 520], CLAMP)} 1362)`} opacity={Math.min(1, card * 4)}>
          <rect x={-70} y={-20} width={140} height={34} rx={5} fill={SILK} />
          <rect x={-50} y={-10} width={70} height={7} fill={GOLD_DARK} />
          <rect x={-50} y={0} width={46} height={6} fill={GOLD_DARK} />
        </g>
      ) : null}
    </g>
  );
};

// The crank turns twice as fast as the big gear; the knob starts at the top. His hand follows the knob.
export const CRANK: [number, number] = [480, 1320];
export const crankKnob = (spin: number): [number, number] => {
  const a = ((spin * 2 - 90) * Math.PI) / 180;
  return [CRANK[0] + 44 * Math.cos(a), CRANK[1] + 44 * Math.sin(a)];
};

export const Gear: React.FC<{ x: number; y: number; r: number; teeth: number; angle: number }> = ({ x, y, r, teeth, angle }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    {Array.from({ length: teeth }, (_, i) => (
      <rect key={i} x={-9} y={-r - 16} width={18} height={26} rx={3} fill={GOLD} transform={`rotate(${(360 / teeth) * i})`} />
    ))}
    <circle r={r} fill={GOLD} />
    <circle r={r * 0.62} fill={GOLD_DARK} />
    <circle r={r * 0.2} fill={GOLD} />
    <rect x={-4} y={-r * 0.6} width={8} height={r * 1.2} fill={GOLD} />
  </g>
);

// Private gallery: a brass machine in a glass case on a marble pedestal, with a crank and a plaque that names the command.
export const Gallery: React.FC<{ spin: number; glowOn: number }> = ({ spin, glowOn }) => {
  const piston = Math.sin((spin * Math.PI) / 90) * 40;
  return (
    <g>
      <Wall color={GALLERY} />
      {[640, 920].map((x) => (
        <path key={x} d={`M${x - 20} 640 L${x - 200} 1600 H${x + 160} L${x + 20} 640Z`} fill={CREAM} opacity={0.05} />
      ))}
      <MarbleFloor />
      {/* Pedestal. */}
      <rect x={500} y={1360} width={470} height={290} fill="#e9e3d6" />
      <rect x={480} y={1340} width={510} height={30} fill="#d8d0c0" />
      <rect x={640} y={1460} width={190} height={70} rx={8} fill={GOLD} />
      <text x={735} y={1508} textAnchor="middle" fontSize={34} fill={INK} {...text}>
        /anatomy
      </text>
      {/* The crank on the pedestal's left side, which his right hand turns. */}
      <circle cx={CRANK[0]} cy={CRANK[1]} r={16} fill={GOLD_DARK} />
      <path d={`M${CRANK[0]} ${CRANK[1]} L${crankKnob(spin)[0]} ${crankKnob(spin)[1]}`} stroke={GOLD_DARK} strokeWidth={14} strokeLinecap="round" />
      <circle cx={crankKnob(spin)[0]} cy={crankKnob(spin)[1]} r={16} fill={GOLD} />
      {/* The machine. */}
      <g>
        <Gear x={640} y={1190} r={86} teeth={12} angle={spin} />
        <Gear x={790} y={1060} r={58} teeth={9} angle={-spin * 1.48 + 20} />
        <Gear x={850} y={1240} r={66} teeth={10} angle={-spin * 1.3} />
        <rect x={570} y={960 + piston} width={34} height={110} rx={8} fill={GOLD_DARK} />
        <rect x={556} y={940 + piston} width={62} height={26} rx={6} fill={GOLD} />
        <path d="M900 1120 Q940 1000 870 960" stroke="#c46f3e" strokeWidth={16} fill="none" strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={700 + i * 70} cy={960} r={14} fill={GOLD} opacity={0.3 + glowOn * (0.7 * (0.5 + 0.5 * Math.sin(spin / 20 + i * 2)))} />
        ))}
      </g>
      {/* Glass case. */}
      <rect x={520} y={880} width={430} height={460} fill={CREAM} opacity={0.08} stroke={CREAM} strokeOpacity={0.5} strokeWidth={6} />
      <path d="M560 900 L620 900 L540 1060 L520 1060Z" fill={CREAM} opacity={0.12} />
    </g>
  );
};

const SHELF_BOOKS = ["#7a3b2e", "#2f5a48", "#c99a45", "#3a4d6e", "#6e2f45", "#8a6a3a", "#2b4a3c"];
// Two-storey library: shelves full of books, a brass ladder, a chalkboard that lists the lessons.
export const Library: React.FC<{ taken: boolean; ticks: number[] }> = ({ taken, ticks }) => (
  <g>
    <Wall color={LIBRARY} />
    <rect x={450} y={660} width={640} height={960} fill={WALNUT_DARK} />
    {[820, 1000, 1180, 1360].map((y, r) => (
      <g key={y}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = 470 + i * 44;
          // The green book at the start of the third shelf is the one he takes.
          if (r === 2 && i === 0 && taken) return null;
          const h = 120 + ((i * 37 + r * 13) % 40);
          return <rect key={i} x={x} y={y + 160 - h} width={38} height={h} rx={4} fill={r === 2 && i === 0 ? "#2f8a5e" : SHELF_BOOKS[(i + r * 3) % 7]} />;
        })}
        <rect x={450} y={y + 160} width={640} height={20} fill={WALNUT} />
      </g>
    ))}
    {/* Brass ladder leaning on the shelves. */}
    <path d="M880 660 L800 1620 M960 660 L880 1620" stroke={GOLD} strokeWidth={12} />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M${875 - i * 8.4} ${720 + i * 104} h${80}`} stroke={GOLD} strokeWidth={9} />
    ))}
    <MarbleFloor y={1620} />
    {/* Chalkboard on an easel. */}
    <g>
      <path d="M720 1650 L780 1380 M1000 1650 L940 1380" stroke={WALNUT} strokeWidth={14} />
      <rect x={680} y={1250} width={360} height={260} rx={10} fill="#22352b" stroke={WALNUT} strokeWidth={14} />
      <text x={710} y={1310} fontSize={44} fill={CREAM} {...text}>
        /teach
      </text>
      {["LESSON 1", "LESSON 2", "LESSON 3"].map((l, i) => (
        <g key={l}>
          <text x={710} y={1370 + i * 46} fontSize={30} fill={CREAM} opacity={0.75} {...text}>
            {l}
          </text>
          {ticks[i] > 0 ? (
            <path
              d={`M880 ${1356 + i * 46} l14 14 l28 -30`}
              stroke={GREEN}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(894 ${1356 + i * 46}) scale(${ticks[i]}) translate(-894 ${-(1356 + i * 46)})`}
            />
          ) : null}
        </g>
      ))}
    </g>
  </g>
);

// The book in his hand: closed while it comes off the shelf, open once he holds it, with a red ribbon on "lessons".
export const Book: React.FC<{ hand: [number, number]; open: number; ribbon: number }> = ({ hand, open, ribbon }) => (
  <g transform={`translate(${hand[0]} ${hand[1] - 40})`}>
    {open < 0.5 ? (
      <rect x={-20} y={-70} width={40} height={130} rx={5} fill="#2f8a5e" />
    ) : (
      <g>
        <path d="M0 -40 L-90 -54 V46 L0 60Z" fill={SILK} stroke="#2f8a5e" strokeWidth={8} />
        <path d="M0 -40 L90 -54 V46 L0 60Z" fill={SILK} stroke="#2f8a5e" strokeWidth={8} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M-72 ${-24 + i * 22} L-16 ${-16 + i * 22} M16 ${-16 + i * 22} L72 ${-24 + i * 22}`} stroke="#9a937f" strokeWidth={5} />
        ))}
        {ribbon > 0 ? <path d={`M4 -40 V${-40 + ribbon * 150} l-10 16 M4 ${-40 + ribbon * 150} l10 16`} stroke="#c9483f" strokeWidth={10} fill="none" /> : null}
      </g>
    )}
  </g>
);

const Watch: React.FC<{ x: number; y: number; ring: number; tag: string }> = ({ x, y, ring, tag }) => (
  <g transform={`translate(${x} ${y}) scale(1.4) translate(${-x} ${-y})`}>
    {ring > 0 ? <circle cx={x} cy={y - 20} r={70 * ring} fill="none" stroke={GOLD} strokeWidth={8} opacity={1.4 - ring} /> : null}
    <rect x={x - 54} y={y - 10} width={108} height={22} rx={10} fill={GOLD_DARK} />
    <circle cx={x} cy={y - 20} r={38} fill={GOLD} />
    <circle cx={x} cy={y - 20} r={28} fill={SILK} />
    <path d={`M${x} ${y - 20} v-18 M${x} ${y - 20} h12`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <path d={`M${x + 40} ${y} l40 40`} stroke={CREAM} strokeWidth={3} />
    <rect x={x + 64} y={y + 34} width={70} height={40} rx={6} fill={CREAM} />
    <text x={x + 99} y={y + 64} textAnchor="middle" fontSize={26} fill={INK} {...text}>
      {tag}
    </text>
  </g>
);

// Private boutique: backlit glass shelves with bags and shoes, two watches on a velvet tray.
export const Boutique: React.FC<{ pick: number }> = ({ pick }) => (
  <g>
    <Wall color={BOUTIQUE} />
    <rect x={520} y={700} width={560} height={620} fill="#4e3242" />
    {[880, 1080, 1280].map((y) => (
      <g key={y}>
        <rect x={520} y={y - 170} width={560} height={170} fill={GOLD} opacity={0.08} />
        <rect x={520} y={y} width={560} height={12} fill={CREAM} opacity={0.5} />
      </g>
    ))}
    {/* Bags and shoes. */}
    <path d="M560 880 h110 l-12 -100 h-86Z" fill="#a8453c" />
    <path d="M585 780 q30 -50 60 0" stroke={GOLD} strokeWidth={8} fill="none" />
    <path d="M760 880 h120 l-10 -90 h-100Z" fill={VELVET} />
    <path d="M790 790 q30 -40 60 0" stroke={GOLD} strokeWidth={8} fill="none" />
    <path d="M940 880 h100 v-60 q-50 -10 -70 -60 h-30Z" fill={SILK} />
    <path d="M560 1080 h90 v-50 q-40 -10 -56 -50 h-34Z" fill={INK} />
    <path d="M700 1080 h90 v-50 q-40 -10 -56 -50 h-34Z" fill={INK} />
    <path d="M860 1080 h140 l-14 -120 h-112Z" fill={GOLD} />
    <path d="M560 1280 h120 l-10 -110 h-100Z" fill="#6e2f45" />
    <path d="M760 1280 h90 v-50 q-40 -10 -56 -50 h-34Z" fill="#a8453c" />
    <MarbleFloor y={1560} />
    {/* Counter and the velvet tray. */}
    <rect x={480} y={1390} width={620} height={260} fill={MARBLE} />
    <rect x={470} y={1380} width={640} height={24} fill="#2a2d33" />
    <rect x={480} y={1404} width={620} height={6} fill={GOLD} />
    <rect x={540} y={1350} width={480} height={30} rx={10} fill={VELVET} />
    <Watch x={620} y={1350} ring={0} tag="$$$" />
    <Watch x={850} y={1350} ring={pick} tag="$$" />
  </g>
);

// A stack of newspapers. `spread` 0 is a neat stack, 1 the papers slid apart after landing.
export const Papers: React.FC<{ x: number; y: number; spread: number; rot?: number }> = ({ x, y, spread, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: 7 }, (_, i) => (
      <g key={i} transform={`translate(${(i - 3) * spread * 26} ${-i * 18 * (1 - spread * 0.8)}) rotate(${(i - 3) * spread * 7})`}>
        <rect x={-110} y={-18} width={220} height={20} rx={3} fill={i % 2 ? SILK : "#ddd5c5"} stroke="#9a937f" strokeWidth={3} />
      </g>
    ))}
  </g>
);

// The one cited brief he holds up: a short page with lines and source marks.
export const Brief: React.FC<{ hand: [number, number]; s: number }> = ({ hand, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${hand[0] + 20} ${hand[1] - 110}) scale(${s})`}>
      <rect x={-80} y={-100} width={160} height={210} rx={8} fill={SILK} stroke={GOLD} strokeWidth={6} />
      <rect x={-56} y={-76} width={112} height={14} fill={INK} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={-56} y={-40 + i * 34} width={78} height={9} fill="#9a937f" />
          <rect x={30} y={-44 + i * 34} width={26} height={17} rx={4} fill={GOLD} />
        </g>
      ))}
    </g>
  );

// Media room: a wall of screens that light up one by one, the command on the middle one, a marble coffee table.
export const MediaRoom: React.FC<{ screens: number }> = ({ screens }) => {
  const frame = useCurrentFrame();
  const tiles = Array.from({ length: 9 }, (_, i) => ({ x: 480 + (i % 3) * 190, y: 690 + Math.floor(i / 3) * 150, i }));
  return (
    <g>
      <Wall color={MEDIA} />
      <rect x={460} y={672} width={600} height={470} rx={12} fill="#0a0f18" />
      {tiles.map(({ x, y, i }) => {
        const on = screens * 9 > i;
        return (
          <g key={i}>
            <rect x={x} y={y} width={170} height={130} rx={8} fill={on ? "#1f3550" : "#121a26"} />
            {on && i !== 4
              ? [0, 1, 2, 3].map((k) => {
                  const h = 20 + ((i * 17 + k * 23 + Math.floor(frame / 8)) % 60);
                  return <rect key={k} x={x + 22 + k * 34} y={y + 112 - h} width={22} height={h} fill={k % 2 ? GOLD : GREEN} opacity={0.85} />;
                })
              : null}
          </g>
        );
      })}
      {screens > 4 / 9 ? (
        <text x={765} y={915} textAnchor="middle" fontSize={26} fill={CREAM} {...text}>
          /last30days
        </text>
      ) : null}
      {/* Framed front pages, blurred on purpose: there is nothing to read. */}
      {[[60, 690]].map(([x, y]) => (
        <g key={x}>
          <rect x={x} y={y} width={170} height={220} fill={SILK} stroke={GOLD} strokeWidth={10} />
          <rect x={x + 20} y={y + 22} width={130} height={22} fill={INK} />
          {[0, 1, 2, 3, 4].map((k) => (
            <rect key={k} x={x + 20} y={y + 64 + k * 28} width={k % 2 ? 90 : 130} height={10} fill="#9a937f" />
          ))}
        </g>
      ))}
      <MarbleFloor y={1560} />
      {/* Velvet sofa against the wall and the coffee table. */}
      <rect x={620} y={1300} width={460} height={200} rx={40} fill={VELVET} />
      <rect x={600} y={1420} width={480} height={110} rx={30} fill="#3b6c57" />
      <rect x={400} y={1470} width={500} height={28} rx={8} fill="#e9e3d6" />
      <rect x={440} y={1498} width={20} height={152} fill={GOLD} />
      <rect x={840} y={1498} width={20} height={152} fill={GOLD} />
    </g>
  );
};

// Half the plaque width: room for the name (about 31 px a letter at size 40 with spacing) and the two diamonds.
const plaque = (room: string) => 80 + room.length * 15.5;

// The property-tour frame: a thin gold border and the room's name on a plaque at the bottom.
export const TourFrame: React.FC<{ room: string }> = ({ room }) => (
  <g>
    <rect x={22} y={22} width={1036} height={1876} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.7} />
    <g>
      <rect x={540 - plaque(room)} y={1752} width={plaque(room) * 2} height={78} rx={39} fill={INK} stroke={GOLD} strokeWidth={4} />
      <path
        d={`M${540 - plaque(room) + 28} 1791 l12 -12 l12 12 l-12 12Z M${540 + plaque(room) - 52} 1791 l12 -12 l12 12 l-12 12Z`}
        fill={GOLD}
      />
      <text x={540} y={1805} textAnchor="middle" fontSize={40} fill={GOLD} letterSpacing={4} {...text}>
        {room}
      </text>
    </g>
  </g>
);
