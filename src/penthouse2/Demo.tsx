import { interpolate } from "remotion";
import { CLAMP, enter } from "../Composition";
import { CREAM, GREEN, RED } from "../theme";
import { GOLD, Gear, INK, text } from "../penthouse/Sets";

// The demo panel of the split-screen version: the top 960 px show each skill at work as an animated card.
// Our own look (dark green cards, gold lines, Noto Sans), not the cream-and-terracotta cards of the TikTok it is modelled on.
export const PANEL = "#10201b";
const CARD = "#1c2e29";
const LINE = "#3c5a51";
const MUTED = "#8fa59d";

const pop = (frame: number, from: number, cfg = { damping: 12, stiffness: 180 }) => (frame >= from ? enter(frame - from, cfg) : 0);
const fade = (frame: number, from: number, len = 8) => interpolate(frame, [from, from + len], [0, 1], CLAMP);
const scaleAt = (x: number, y: number, s: number) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;

const Card: React.FC<{ x: number; y: number; w: number; h: number; s?: number; glow?: boolean; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  s = 1,
  glow = false,
  children,
}) =>
  s <= 0 ? null : (
    <g transform={scaleAt(x + w / 2, y + h / 2, s)} opacity={Math.min(1, s * 1.5)}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={CARD} stroke={glow ? GOLD : LINE} strokeWidth={glow ? 5 : 3} />
      {children}
    </g>
  );

// The command as typed: characters appear over `type` (0 to 1), with a blinking caret.
const CommandBar: React.FC<{ frame: number; cmd: string; type: number }> = ({ frame, cmd, type }) => {
  const shown = cmd.slice(0, Math.round(cmd.length * type));
  return (
    <g>
      <rect x={90} y={180} width={900} height={96} rx={20} fill={INK} stroke={LINE} strokeWidth={3} />
      <text x={128} y={243} fontSize={40} fill={GOLD} {...text}>
        {">"}
      </text>
      <text x={170} y={243} fontSize={40} fill={CREAM} {...text}>
        {shown}
        {type < 1 || Math.floor(frame / 12) % 2 ? "|" : ""}
      </text>
    </g>
  );
};

// Top of the panel: "n/5 name" and five dashes, the current one gold.
export const Stepper: React.FC<{ n: number; name: string; y?: number }> = ({ n, name, y = 70 }) => (
  <g>
    <rect x={90} y={y} width={90 + name.length * 22} height={60} rx={14} fill={INK} stroke={GOLD} strokeWidth={3} />
    <text x={112} y={y + 42} fontSize={32} fill={GOLD} {...text}>
      {`${n}/5`}
    </text>
    <text x={182} y={y + 42} fontSize={32} fill={CREAM} {...text}>
      {name}
    </text>
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={760 + i * 48} y={y + 26} width={38} height={8} rx={4} fill={i < n ? GOLD : LINE} />
    ))}
  </g>
);

const Check: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) =>
  s <= 0 ? null : (
    <g transform={scaleAt(x, y, s)}>
      <circle cx={x} cy={y} r={26} fill={GREEN} />
      <path d={`M${x - 12} ${y} l8 9 l16 -18`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

// Hook: three people you could pay, each with a price tag that gets struck out once the skills come up.
const Hook: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const roles = [
    { name: "TUTOR", icon: "book", from: at.teachW },
    { name: "ADVISOR", icon: "tie", from: at.advise },
    { name: "RESEARCHER", icon: "cal", from: at.readW },
  ];
  const strike = fade(frame, at.read, 8);
  return (
    <g>
      <text x={540} y={250} textAnchor="middle" fontSize={96} fill={GOLD} {...text} opacity={1 - fade(frame, 60, 8)}>
        HOLD THE HIRE
      </text>
      <text x={540} y={250} textAnchor="middle" fontSize={64} fill={CREAM} {...text} opacity={fade(frame, 62, 8)}>
        WHO WOULD YOU PAY?
      </text>
      {roles.map((r, i) => {
        const x = 90 + i * 310;
        return (
          <Card key={r.name} x={x} y={360} w={280} h={420} s={pop(frame, r.from)}>
            <circle cx={x + 140} cy={480} r={70} fill={INK} stroke={GOLD} strokeWidth={6} />
            {r.icon === "book" ? <path d={`M${x + 100} 462 q20 -10 40 2 q20 -12 40 -2 v52 q-20 -10 -40 2 q-20 -12 -40 -2z M${x + 140} 464 v52`} stroke={CREAM} strokeWidth={7} fill="none" /> : null}
            {r.icon === "tie" ? <path d={`M${x + 126} 444 h28 l-7 16 h-14z M${x + 133} 462 h14 l12 46 l-19 18 l-19 -18z`} fill={CREAM} /> : null}
            {r.icon === "cal" ? (
              <g>
                <rect x={x + 102} y={446} width={76} height={70} rx={8} fill="none" stroke={CREAM} strokeWidth={7} />
                <rect x={x + 102} y={446} width={76} height={18} fill={CREAM} />
              </g>
            ) : null}
            <text x={x + 140} y={610} textAnchor="middle" fontSize={r.name.length > 8 ? 36 : 44} fill={CREAM} {...text}>
              {r.name}
            </text>
            <text x={x + 140} y={700} textAnchor="middle" fontSize={48} fill={GOLD} {...text}>
              $$$
            </text>
            <path d={`M${x + 80} 686 h${120 * strike}`} stroke={RED} strokeWidth={10} strokeLinecap="round" />
          </Card>
        );
      })}
    </g>
  );
};

// "These five Claude skills": five numbered tiles.
const Five: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => (
  <g>
    <text x={540} y={300} textAnchor="middle" fontSize={84} fill={CREAM} {...text} opacity={fade(frame, at.five - 2)}>
      5 CLAUDE SKILLS
    </text>
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 105 + i * 180;
      const s = pop(frame, at.clap - 6 + i * 3, { damping: 10, stiffness: 220 });
      return s <= 0 ? null : (
        <g key={i} transform={scaleAt(x + 75, 520, s)}>
          <rect x={x} y={445} width={150} height={150} rx={24} fill={i % 2 ? CARD : INK} stroke={GOLD} strokeWidth={5} />
          <text x={x + 75} y={548} textAnchor="middle" fontSize={84} fill={GOLD} {...text}>
            {i + 1}
          </text>
        </g>
      );
    })}
  </g>
);

// chief-of-staff: one question goes to the CFO and the CEO, their views come back as one answer.
const Chief: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const route = fade(frame, at.right, 10);
  const merge = fade(frame, at.answers - 4, 10);
  return (
    <g>
      <CommandBar frame={frame} cmd="chief-of-staff" type={fade(frame, at.one, 14)} />
      <Card x={190} y={320} w={700} h={130} s={pop(frame, at.ask)}>
        <text x={540} y={402} textAnchor="middle" fontSize={50} fill={CREAM} {...text}>
          Raise money or cut costs?
        </text>
      </Card>
      <path d={`M540 450 L300 ${450 + 90 * route} M540 450 L780 ${450 + 90 * route}`} stroke={GOLD} strokeWidth={5} opacity={route} />
      {["CFO", "CEO"].map((r, i) => (
        <Card key={r} x={i ? 650 : 170} y={540} w={260} h={120} s={pop(frame, at.right + 4 + i * 5)}>
          <text x={(i ? 650 : 170) + 130} y={616} textAnchor="middle" fontSize={54} fill={GOLD} {...text}>
            {r}
          </text>
        </Card>
      ))}
      <path d={`M300 660 L540 ${660 + 70 * merge} M780 660 L540 ${660 + 70 * merge}`} stroke={GREEN} strokeWidth={5} opacity={merge} />
      <Card x={260} y={740} w={560} h={120} s={pop(frame, at.answers)} glow>
        <text x={500} y={816} textAnchor="middle" fontSize={50} fill={CREAM} {...text}>
          ONE ANSWER
        </text>
        <Check x={740} y={800} s={pop(frame, at.answers + 6)} />
      </Card>
    </g>
  );
};

// anatomy: the question is typed, then it turns into an isometric machine: gears turn and tokens drop into a bucket.
const Anatomy: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const s = pop(frame, at.machine - 4, { damping: 11, stiffness: 160 });
  const spin = Math.max(0, frame - at.machine) * 5;
  return (
    <g>
      <CommandBar frame={frame} cmd="/anatomy how a rate limiter works" type={fade(frame, at.idea - 6, 34)} />
      {s > 0 ? (
        <g transform={scaleAt(540, 600, s)}>
          {/* Isometric block: top, left and right faces. */}
          <path d="M540 380 L800 520 L540 660 L280 520Z" fill="#2a4a40" stroke={GOLD} strokeWidth={4} />
          <path d="M280 520 L540 660 L540 860 L280 720Z" fill="#1b332c" stroke={GOLD} strokeWidth={4} />
          <path d="M800 520 L540 660 L540 860 L800 720Z" fill="#234038" stroke={GOLD} strokeWidth={4} />
          <g transform="translate(410 690) scale(0.7) translate(-410 -690)">
            <Gear x={410} y={690} r={70} teeth={11} angle={spin} />
          </g>
          <g transform="translate(670 690) scale(0.55) translate(-670 -690)">
            <Gear x={670} y={690} r={70} teeth={9} angle={-spin * 1.3} />
          </g>
          {/* The bucket on top and the tokens falling in. */}
          <path d="M490 470 h100 l-14 56 h-72z" fill={INK} stroke={CREAM} strokeWidth={4} />
          {[0, 1, 2].map((i) => {
            const t = ((frame - at.machine + i * 9) % 27) / 27;
            return frame >= at.machine ? <circle key={i} cx={540} cy={330 + t * 150} r={14} fill={GOLD} opacity={t < 0.95 ? 1 : 0} /> : null;
          })}
        </g>
      ) : null}
    </g>
  );
};

// teach: the topic is typed, the folder becomes the class, and a pin marks where you stopped.
const Teach: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const nodes = [160, 350, 540, 730, 920];
  const pin = pop(frame, at.lessons + 6, { damping: 9, stiffness: 200 });
  return (
    <g>
      <CommandBar frame={frame} cmd="/teach SQL" type={fade(frame, at.folder - 4, 12)} />
      <Card x={90} y={320} w={460} h={250} s={pop(frame, at.folder + 8)}>
        <path d="M130 360 h90 l20 20 h170 v40 h-280z" fill={GOLD} />
        <text x={250} y={406} fontSize={34} fill={INK} {...text}>
          sql/
        </text>
        {["MISSION.md", "NOTES.md", "lessons/"].map((f, i) => (
          <text key={f} x={140} y={466 + i * 40} fontSize={32} fill={CREAM} {...text}>
            {f}
          </text>
        ))}
      </Card>
      <Card x={590} y={320} w={400} h={250} s={pop(frame, at.folder + 14)}>
        <text x={790} y={420} textAnchor="middle" fontSize={40} fill={MUTED} {...text}>
          SESSION 2
        </text>
        <text x={790} y={490} textAnchor="middle" fontSize={44} fill={CREAM} {...text}>
          picks up here
        </text>
      </Card>
      {/* The learning path: two lessons done, the pin on the third. */}
      <path d="M160 760 H920" stroke={LINE} strokeWidth={10} strokeLinecap="round" />
      <path d={`M160 760 H${160 + 380 * fade(frame, at.lessons, 12)}`} stroke={GREEN} strokeWidth={10} strokeLinecap="round" />
      {nodes.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={760} r={34} fill={i < 2 && frame >= at.lessons + i * 6 ? GREEN : CARD} stroke={i === 2 ? GOLD : LINE} strokeWidth={5} />
          <text x={x} y={774} textAnchor="middle" fontSize={34} fill={i < 2 && frame >= at.lessons + i * 6 ? INK : CREAM} {...text}>
            {i + 1}
          </text>
        </g>
      ))}
      {pin > 0 ? (
        <g transform={`translate(0 ${(1 - Math.min(pin, 1)) * -80})`} opacity={Math.min(1, pin * 2)}>
          <path d="M540 714 c-30 -34 -30 -70 0 -84 c30 14 30 50 0 84z" fill={RED} />
          <circle cx={540} cy={660} r={12} fill={CREAM} />
          <text x={540} y={860} textAnchor="middle" fontSize={40} fill={GOLD} {...text}>
            YOU ARE HERE
          </text>
        </g>
      ) : null}
    </g>
  );
};

// marketing-psychology: a product page, the cursor stalls over the button, then the biases get named.
const Psych: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const move = interpolate(frame, [at.why, at.why + 24], [0, 1], { ...CLAMP, easing: (u) => 1 - (1 - u) * (1 - u) });
  const cx = interpolate(move, [0, 1], [900, 640]);
  const cy = interpolate(move, [0, 1], [880, 690]);
  const tags = [
    { label: "NO ANCHOR PRICE", x: 640, y: 480, from: at.page },
    { label: "NO SOCIAL PROOF", x: 640, y: 566, from: at.page + 8 },
  ];
  return (
    <g>
      <CommandBar frame={frame} cmd="marketing-psychology" type={fade(frame, at.four, 16)} />
      <Card x={130} y={320} w={820} h={540} s={pop(frame, at.psych)}>
        <rect x={170} y={360} width={300} height={190} rx={16} fill={LINE} />
        <rect x={500} y={370} width={380} height={30} rx={8} fill={CREAM} />
        <rect x={500} y={418} width={260} height={20} rx={6} fill={MUTED} />
        <text x={500} y={510} fontSize={60} fill={CREAM} {...text}>
          $49
        </text>
        <rect x={500} y={540} width={380} height={44} rx={10} fill="none" stroke={MUTED} strokeWidth={3} strokeDasharray="10 10" />
        <rect x={500} y={640} width={260} height={90} rx={20} fill={GOLD} />
        <text x={630} y={700} textAnchor="middle" fontSize={44} fill={INK} {...text}>
          BUY
        </text>
        <rect x={170} y={600} width={280} height={18} rx={6} fill={MUTED} />
        <rect x={170} y={636} width={220} height={18} rx={6} fill={MUTED} />
      </Card>
      {/* The cursor that stops short of the button. */}
      {frame >= at.why ? (
        <g transform={`translate(${cx} ${cy})`}>
          <path d="M0 0 L0 64 L16 48 L28 76 L40 70 L28 44 L50 44Z" fill={CREAM} stroke={INK} strokeWidth={4} />
        </g>
      ) : null}
      {frame >= at.hesitate ? (
        <text x={cx + 60} y={cy - 10} fontSize={90} fill={GOLD} {...text} opacity={1 - fade(frame, at.page, 6)}>
          ?
        </text>
      ) : null}
      {tags.map((t) => {
        const s = pop(frame, t.from, { damping: 10, stiffness: 200 });
        return s <= 0 ? null : (
          <g key={t.label} transform={scaleAt(t.x + 190, t.y, s)}>
            <rect x={t.x} y={t.y - 36} width={380} height={64} rx={32} fill={RED} />
            <text x={t.x + 190} y={t.y + 10} textAnchor="middle" fontSize={32} fill={CREAM} {...text}>
              {t.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// last30days: a 30-day grid fills in, sources appear, and it folds into one brief with numbered sources.
const Days: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => {
  const filled = interpolate(frame, [at.days, at.days + 30], [0, 30], CLAMP);
  const fold = fade(frame, at.brief - 4, 10);
  return (
    <g>
      <CommandBar frame={frame} cmd="/last30days AI agents" type={fade(frame, at.fiveL, 16)} />
      <g opacity={1 - fold} transform={scaleAt(540, 540, 1 - fold * 0.4)}>
        {Array.from({ length: 30 }, (_, i) => {
          const x = 150 + (i % 6) * 130;
          const y = 330 + Math.floor(i / 6) * 84;
          return <rect key={i} x={x} y={y} width={110} height={68} rx={12} fill={i < filled ? GOLD : CARD} stroke={LINE} strokeWidth={2} />;
        })}
      </g>
      {["Reddit", "Hacker News"].map((src, i) => {
        const s = pop(frame, at.topic + 4 + i * 6);
        return s <= 0 ? null : (
          <g key={src} transform={scaleAt(300 + i * 400, 800, s)} opacity={1 - fold}>
            <rect x={150 + i * 400} y={766} width={i ? 360 : 300} height={68} rx={34} fill={INK} stroke={GOLD} strokeWidth={4} />
            <text x={(i ? 330 : 300) + i * 400} y={812} textAnchor="middle" fontSize={36} fill={CREAM} {...text}>
              {src}
            </text>
          </g>
        );
      })}
      <Card x={250} y={330} w={580} h={520} s={pop(frame, at.brief)} glow>
        <text x={290} y={410} fontSize={46} fill={GOLD} {...text}>
          THE BRIEF
        </text>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={290} y={460 + i * 90} width={330 - (i % 2) * 80} height={22} rx={8} fill={MUTED} />
            <rect x={670} y={448 + i * 90} width={110} height={46} rx={12} fill={GOLD} />
            <text x={725} y={482 + i * 90} textAnchor="middle" fontSize={30} fill={INK} {...text}>
              {`[${i + 1}]`}
            </text>
          </g>
        ))}
      </Card>
    </g>
  );
};

// The close: the five commands, waiting in the caption.
const Outro: React.FC<{ frame: number; at: Record<string, number> }> = ({ frame, at }) => (
  <g>
    <text x={540} y={250} textAnchor="middle" fontSize={72} fill={GOLD} {...text}>
      IN THE CAPTION
    </text>
    {["chief-of-staff", "anatomy", "teach", "marketing-psychology", "last30days"].map((name, i) => (
      <Card key={name} x={190} y={320 + i * 110} w={700} h={90} s={pop(frame, at.cmds - 2 + i * 4)}>
        <text x={230} y={380 + i * 110} fontSize={40} fill={GOLD} {...text}>
          {`${i + 1}`}
        </text>
        <text x={290} y={380 + i * 110} fontSize={40} fill={CREAM} {...text}>
          {name}
        </text>
      </Card>
    ))}
  </g>
);

export type Segment = "suite" | "foyer" | "board" | "gallery" | "library" | "boutique" | "media" | "outro";
export const STEP: Partial<Record<Segment, [number, string]>> = {
  board: [1, "chief-of-staff"],
  gallery: [2, "anatomy"],
  library: [3, "teach"],
  boutique: [4, "marketing-psychology"],
  media: [5, "last30days"],
};

export const DemoPanel: React.FC<{ frame: number; seg: Segment; at: Record<string, number> }> = ({ frame, seg, at }) => {
  const step = STEP[seg];
  return (
    <g>
      <rect x={0} y={0} width={1080} height={960} fill={PANEL} />
      {Array.from({ length: 12 }, (_, i) =>
        Array.from({ length: 11 }, (__, j) => <circle key={`${i}-${j}`} cx={45 + i * 90} cy={45 + j * 90} r={3} fill={LINE} opacity={0.5} />),
      )}
      {step ? <Stepper n={step[0]} name={step[1]} /> : null}
      {seg === "suite" ? <Hook frame={frame} at={at} /> : null}
      {seg === "foyer" ? <Five frame={frame} at={at} /> : null}
      {seg === "board" ? <Chief frame={frame} at={at} /> : null}
      {seg === "gallery" ? <Anatomy frame={frame} at={at} /> : null}
      {seg === "library" ? <Teach frame={frame} at={at} /> : null}
      {seg === "boutique" ? <Psych frame={frame} at={at} /> : null}
      {seg === "media" ? <Days frame={frame} at={at} /> : null}
      {seg === "outro" ? <Outro frame={frame} at={at} /> : null}
      <rect x={0} y={952} width={1080} height={8} fill={GOLD} />
    </g>
  );
};
