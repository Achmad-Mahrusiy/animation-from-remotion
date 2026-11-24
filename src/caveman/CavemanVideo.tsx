import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLAMP, Caption, Sfx, cameraTransform, enter } from "../Composition";
import { Panel } from "../Screens";
import { SIT, SIT_SCRATCH, Stickman, blendPoses, type Pose } from "../Stickman";
import { AMBER, CREAM, FPS, GREEN, RED, fontFamily } from "../theme";
import { CAVE_WALL, Cave } from "./Cave";

const END = 44.5 * FPS;
// shortcut: timings from pauses and syllable peaks in voice-caveman.mp3, re-measure if the voice file changes.
const at = (voiceSecond: number) => Math.round(voiceSecond * FPS);

const T = {
  tokens: at(1.3),
  oneFix: at(3.15),
  talk: at(5.0),
  smash: at(6.0),
  step1: at(7.07),
  terminal: at(8.15),
  run: at(9.78),
  slabOut: at(14.85),
  step2: at(15.12),
  inside: at(16.11),
  type: at(17.6),
  typed: at(18.8),
  look: at(19.23),
  sameBug: at(20.3),
  sameFix: at(21.2),
  twenty: at(22.21),
  code: at(23.42),
  commands: at(24.21),
  errors: at(25.22),
  noTouch: at(26.47),
  every: at(28.39),
  character: at(28.85),
  stays: at(29.4),
  exact: at(29.65),
  shorter: at(30.58),
  ultra: at(31.81),
  done: at(33.44),
  stop: at(34.45),
  by: at(36.25),
  julius: at(37.0),
  link: at(38.32),
  follow: at(39.72),
  meTest: at(41.12),
  youSave: at(42.38),
};

const text = { fontFamily, fontWeight: 900 } as const;
const BOUNCY = { damping: 11, stiffness: 190 };

// The install command is shown in its real case, because viewers copy it.
const CHUNKS = [
  { text: "npx", line: 0, at: at(9.85), sx: 470, sy: 905 },
  { text: " skills add", line: 0, at: at(10.78), sx: 730, sy: 905 },
  { text: "JuliusBrussee/", line: 1, at: at(11.9), sx: 660, sy: 1010 },
  { text: "caveman", line: 2, at: at(13.2), sx: 540, sy: 1115 },
  { text: " -g", line: 2, at: at(14.07), sx: 760, sy: 1115 },
];
const TILES = [
  { label: "CODE", icon: "</>", at: T.code },
  { label: "COMMANDS", icon: ">_", at: T.commands },
  { label: "ERRORS", icon: "!", at: T.errors },
];
const BARS = [
  { label: "NORMAL", value: 63, color: RED, name: T.look + 6, grow: T.look + 10 },
  { label: "/caveman", value: 20, color: GREEN, name: T.sameBug, grow: T.twenty },
  { label: "/ultracave", value: 14, color: AMBER, name: T.shorter + 4, grow: T.ultra },
];
const NODS = [T.every, T.character, T.stays, T.exact];
const COMMAND = "/caveman";
const KEYS = Array.from({ length: COMMAND.length }, (_, i) =>
  Math.round(T.type + (i * (T.typed - T.type)) / COMMAND.length),
);

const stand = (o: Partial<Pose>): Pose => ({
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
const WINDUP = stand({ head: [165, 1048], sh: [172, 1134], eR: [250, 1020], hR: [190, 900], eL: [250, 1200], hL: [330, 1150], smile: -1 });
const SMASH = stand({ head: [255, 1052], sh: [228, 1136], eR: [330, 1050], hR: [430, 960], eL: [120, 1220], hL: [70, 1300], smile: -0.6 });
const REST = stand({ eR: [270, 1210], hR: [330, 1130], smile: 1 });
// Club poses keep the club tip left of x=400, so it never covers the slab text.
const CARVE = stand({ head: [215, 1040], sh: [200, 1130], eR: [262, 1215], hR: [285, 1150], smile: 0.6 });
const POINT = stand({ head: [215, 1040], sh: [200, 1130], eR: [280, 1120], hR: [310, 1040], smile: 0.8 });
const CHEER = stand({ look: 0, head: [192, 1030], eL: [100, 1040], hL: [70, 910], eR: [300, 1090], hR: [330, 1000], smile: 1.6 });
const GUARD = stand({ look: 0, eL: [80, 1150], hL: [30, 1240], eR: [270, 1200], hR: [300, 1300], smile: -0.3 });
const SHRUG = stand({ look: 0, eL: [90, 1210], hL: [30, 1150], eR: [290, 1210], hR: [350, 1150], smile: 0.2 });
const SHOUT = stand({ head: [232, 1036], sh: [206, 1130], eL: [272, 1140], hL: [300, 1052], smile: 1.3 });
const WAVE = stand({ look: 0, eL: [90, 1050], hL: [60, 920], smile: 1.2 });
const THUMB_UP = stand({ look: 0, eL: [95, 1200], hL: [72, 1085], smile: 1.6 });

const POSES = [
  { at: 0, pose: SIT },
  { at: T.tokens, pose: SIT_SCRATCH },
  { at: T.talk - 2, pose: WINDUP },
  { at: T.smash - 10, pose: SMASH },
  { at: T.step1, pose: REST },
  { at: T.terminal + 4, pose: CARVE },
  { at: T.step2 - 4, pose: SIT },
  { at: T.look - 2, pose: POINT },
  { at: T.twenty, pose: CHEER },
  { at: T.code - 2, pose: GUARD },
  { at: T.shorter - 2, pose: POINT },
  { at: T.done - 2, pose: SHRUG },
  { at: T.stop - 2, pose: SHOUT },
  { at: T.by - 2, pose: WAVE },
  { at: T.link - 2, pose: { ...REST, look: 0 } },
  { at: T.follow - 2, pose: THUMB_UP },
];

// Loose spring, so every move overshoots and settles.
const LOOSE = { damping: 9, stiffness: 120, mass: 0.8 };

const animatePose = (frame: number): Pose => {
  // Elbows and head trail the body, hands trail the elbows.
  const body = blendPoses(frame, POSES, LOOSE);
  const mid = blendPoses(frame - 1.5, POSES, LOOSE);
  const tip = blendPoses(frame - 3.5, POSES, LOOSE);
  const within = (a: number, b: number) => frame >= a && frame < b;
  const breathe = Math.sin(frame / 14) * 4;
  const sway = Math.sin(frame / 19) * 7;
  const drag = Math.sin((frame - 6) / 19) * 10;
  const p: Pose = {
    ...body,
    head: [mid.head[0] + sway, mid.head[1] + breathe],
    sh: [body.sh[0] + sway * 0.7, body.sh[1] + breathe * 0.6],
    hip: [body.hip[0] + sway * 0.2, body.hip[1]],
    eL: [mid.eL[0] + sway * 0.8, mid.eL[1]],
    eR: [mid.eR[0] + sway * 0.8, mid.eR[1]],
    hL: [tip.hL[0] + drag, tip.hL[1] + Math.sin(frame / 11) * 5],
    hR: [tip.hR[0] + drag, tip.hR[1] + Math.cos(frame / 11) * 5],
  };

  if (within(4, T.tokens) || within(T.type, T.typed + 4)) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 18];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 18];
  }
  if (within(T.tokens + 8, T.talk - 2)) {
    p.hR = [p.hR[0] + Math.sin(frame / 1.8) * 10, p.hR[1]];
  }
  for (const chunk of CHUNKS) {
    if (within(chunk.at - 5, chunk.at + 5)) {
      const hit = 5 - Math.abs(frame - chunk.at);
      p.hR = [p.hR[0] + hit * 6, p.hR[1] - hit * 9];
    }
  }
  for (const nod of NODS) {
    if (within(nod - 4, nod + 5)) {
      p.head = [p.head[0], p.head[1] + (5 - Math.abs(frame - nod)) * 5];
    }
  }
  if (within(T.by + 8, T.link - 2)) {
    p.hL = [p.hL[0] + Math.sin(frame / 2.6) * 30, p.hL[1]];
  }
  return p;
};

// Crouch, jump with stretch, land with squash.
const hop = (frame: number, start: number, len: number, height: number) => {
  const u = (frame - start) / len;
  if (u < -0.35 || u > 1.4) return { dy: 0, sy: 1 };
  if (u < 0) return { dy: 0, sy: 1 - 0.1 * Math.sin((Math.PI * (u + 0.35)) / 0.35) };
  if (u <= 1) return { dy: -height * Math.sin(Math.PI * u), sy: 1 + 0.09 * Math.sin(Math.PI * u) };
  return { dy: 0, sy: 1 - 0.12 * Math.sin((Math.PI * (u - 1)) / 0.4) };
};
const HOPS: [number, number, number][] = [
  [T.smash - 9, 14, 95],
  [T.twenty, 15, 110],
  [T.youSave, 13, 70],
];

const SX = 470;
const SY = 905;
const SW = 400;

const MonitorScreens: React.FC = () => {
  const frame = useCurrentFrame();
  const count = Math.round(interpolate(frame, [4, T.tokens + 10], [0, 63], CLAMP));
  const cursor = frame % 20 < 12 ? "_" : "";
  const typed = COMMAND.slice(0, KEYS.filter((k) => frame >= k).length);
  const stop = "stop caveman".slice(0, Math.max(0, Math.floor((frame - T.stop) / 1.6)));

  return (
    <g>
      <Panel from={0} to={T.smash}>
        <text x={SX + SW / 2} y={SY + 160} textAnchor="middle" fontSize={140} fill={RED} {...text}>
          {count}
        </text>
        <text x={SX + SW / 2} y={SY + 232} textAnchor="middle" fontSize={50} fill={RED} {...text}>
          TOKENS
        </text>
      </Panel>
      <Panel from={T.smash + 6} to={T.step2}>
        <text x={SX + 40} y={SY + 150} fontSize={96} fill={GREEN} {...text}>
          {`>${cursor}`}
        </text>
      </Panel>
      <Panel from={T.step2} to={T.done}>
        <text x={SX + 30} y={SY + 135} fontSize={62} fill={GREEN} {...text}>
          {typed + (frame < T.typed ? cursor : "")}
        </text>
        {frame >= T.typed + 4 ? (
          <text x={SX + 30} y={SY + 218} fontSize={36} fill={AMBER} {...text}>
            ME SHORT NOW.
          </text>
        ) : null}
      </Panel>
      <Panel from={T.done} to={END + 1}>
        <text x={SX + 30} y={SY + 135} fontSize={46} fill={CREAM} {...text}>
          {stop + (frame < T.stop + 22 ? cursor : "")}
        </text>
        {frame >= T.stop + 24 ? (
          <text x={SX + 30} y={SY + 218} fontSize={36} fill={GREEN} {...text}>
            NORMAL MODE
          </text>
        ) : null}
      </Panel>
    </g>
  );
};

// The long AI answer that grows out of the monitor until the club hits it.
const Scroll: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame - T.smash;
  const h = interpolate(frame, [4, T.oneFix + 20], [0, 190], CLAMP);

  if (t < 0) {
    return (
      <g transform={`translate(0 879) skewX(${Math.sin(frame / 6) * 3}) translate(0 -879)`}>
        <rect x={520} y={879 - h} width={300} height={h} fill="#ece4d3" />
        {Array.from({ length: Math.floor(h / 28) }, (_, r) => (
          <rect
            key={r}
            x={545}
            y={879 - h + 12 + r * 28}
            width={[220, 160, 250, 190, 230, 140][r % 6]}
            height={12}
            rx={6}
            fill="#8f8676"
          />
        ))}
      </g>
    );
  }
  if (t > 34) return null;
  return (
    <g>
      <g opacity={interpolate(t, [18, 34], [1, 0], CLAMP)}>
        {Array.from({ length: 12 }, (_, i) => {
          const x = 540 + (i % 4) * 75 + ((i % 4) - 1.5) * 13 * t;
          const y = 700 + Math.floor(i / 4) * 65 + (-16 - ((i * 7) % 11)) * t + 1.2 * t * t;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={64}
              height={40}
              fill="#ece4d3"
              transform={`rotate(${t * (i % 2 ? 13 : -13)} ${x + 32} ${y + 20})`}
            />
          );
        })}
      </g>
      {t < 8
        ? Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            const r = 40 + t * 16;
            return (
              <path
                key={i}
                d={`M${640 + Math.cos(a) * r} ${800 + Math.sin(a) * r} L${640 + Math.cos(a) * (r + 54)} ${800 + Math.sin(a) * (r + 54)}`}
                stroke={AMBER}
                strokeWidth={13}
                strokeLinecap="round"
                opacity={1 - t / 8}
              />
            );
          })
        : null}
    </g>
  );
};

const Command: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <text x={412} y={812} fontSize={34} fill={AMBER} {...text}>
        TERMINAL
      </text>
      {[0, 1, 2].map((line) => (
        <text key={line} x={412} y={925 + line * 105} fontSize={66} fill={CREAM} fontFamily={fontFamily} fontWeight={700}>
          {CHUNKS.filter((c) => c.line === line).map((c) => (
            <tspan key={c.text} fillOpacity={Math.min(enter(frame - c.at, BOUNCY), 1)}>
              {c.text}
            </tspan>
          ))}
        </text>
      ))}
      {CHUNKS.map((c) => {
        const t = frame - c.at;
        if (t < 0 || t > 6) return null;
        return [0, 1, 2, 3, 4].map((i) => {
          const a = -2.4 + i * 0.5;
          const r = 16 + t * 11;
          return (
            <path
              key={`${c.text}${i}`}
              d={`M${c.sx + Math.cos(a) * r} ${c.sy + Math.sin(a) * r} l${Math.cos(a) * 22} ${Math.sin(a) * 22}`}
              stroke={AMBER}
              strokeWidth={8}
              strokeLinecap="round"
              opacity={1 - t / 6}
            />
          );
        });
      })}
    </g>
  );
};

const Chart: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      {BARS.map((bar, i) => {
        const y = 790 + i * 138;
        const named = Math.min(enter(frame - bar.name), 1);
        const grown = enter(frame - bar.grow, BOUNCY);
        const width = (520 * bar.value * grown) / 63;
        return (
          <g key={bar.label} opacity={named}>
            <text x={412} y={y} fontSize={40} fill={CREAM} fontFamily={fontFamily} fontWeight={700}>
              {bar.label}
            </text>
            <rect x={412} y={y + 16} width={Math.max(width, 0)} height={58} rx={10} fill={bar.color} />
            <text
              x={428 + Math.max(width, 0)}
              y={y + 64}
              fontSize={58}
              fill={bar.color}
              opacity={Math.min(Math.max(grown, 0), 1)}
              {...text}
            >
              {bar.value}
            </text>
          </g>
        );
      })}
      <text x={412} y={1222} fontSize={30} fill={CREAM} opacity={0.75} {...text}>
        TOKENS, ONE README EXAMPLE
      </text>
    </g>
  );
};

const Tiles: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1;
  return (
    <g>
      {TILES.map((tile, i) => {
        const y = 768 + i * 156;
        const s = enter(frame - tile.at, BOUNCY);
        const safe = Math.min(enter(frame - T.noTouch - i * 5, BOUNCY), 1);
        return (
          <g
            key={tile.label}
            opacity={Math.min(s, 1)}
            transform={`translate(710 ${y + 66 - (1 - s) * 220}) scale(${pulse}) translate(-710 ${-66})`}
          >
            <rect x={410} y={0} width={600} height={132} rx={18} fill="#6d6672" />
            <rect
              x={410}
              y={0}
              width={600}
              height={132}
              rx={18}
              fill="none"
              stroke={GREEN}
              strokeWidth={9}
              opacity={safe}
            />
            <text x={440} y={88} fontSize={60} fill={AMBER} {...text}>
              {tile.icon}
            </text>
            <text x={585} y={86} fontSize={50} fill={CREAM} {...text}>
              {tile.label}
            </text>
            <path
              d="M930 66 l20 24 l40 -52"
              fill="none"
              stroke={GREEN}
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={safe}
            />
          </g>
        );
      })}
    </g>
  );
};

const slabUp = (frame: number) =>
  Math.max(
    enter(frame - T.terminal, BOUNCY) * (1 - enter(frame - T.slabOut)),
    enter(frame - T.look, BOUNCY) * (1 - enter(frame - T.done + 6)),
  );

const Slab: React.FC = () => {
  const frame = useCurrentFrame();
  const up = slabUp(frame);
  if (up < 0.01) return null;
  return (
    <g transform={`translate(0 ${(1 - up) * 1300})`}>
      <path d="M372 760 Q380 722 430 726 L1000 722 Q1052 724 1050 776 L1046 1210 Q1044 1252 996 1250 L424 1254 Q374 1252 376 1204Z" fill="#514b57" />
      <path d="M392 772 Q398 744 436 746 L994 742 Q1030 744 1030 782 L1026 1200 Q1024 1232 990 1230 L430 1234 Q394 1232 396 1198Z" fill="#3f3a45" />
      <Panel from={T.terminal + 4} to={T.slabOut}>
        <Command />
      </Panel>
      <Panel from={T.look + 4} to={T.code}>
        <Chart />
      </Panel>
      <Panel from={T.code} to={T.shorter}>
        <Tiles />
      </Panel>
      <Panel from={T.shorter} to={T.done}>
        <Chart />
      </Panel>
    </g>
  );
};

const Club: React.FC<{ pose: Pose; opacity: number }> = ({ pose, opacity }) => {
  if (opacity < 0.01) return null;
  const dx = pose.hR[0] - pose.eR[0];
  const dy = pose.hR[1] - pose.eR[1];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  const [hx, hy] = pose.hR;
  return (
    <g opacity={opacity} strokeLinecap="round">
      <path d={`M${hx - ux * 34} ${hy - uy * 34} L${hx + ux * 150} ${hy + uy * 150}`} stroke="#8a6a48" strokeWidth={30} />
      <path d={`M${hx + ux * 110} ${hy + uy * 110} L${hx + ux * 190} ${hy + uy * 190}`} stroke="#9a7854" strokeWidth={56} />
      <circle cx={hx + ux * 150 - uy * 14} cy={hy + uy * 150 + ux * 14} r={9} fill="#6b4f35" />
    </g>
  );
};

const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice-caveman.mp3")} />
    <Audio
      src={staticFile("sfx/bgm-caveman.wav")}
      volume={(f) => interpolate(f, [0, 8, END - 30, END], [0.09, 0.15, 0.15, 0], CLAMP)}
    />
    <Sfx name="sweep" from={T.smash - 28} volume={0.3} />
    <Sfx name="impact" from={T.smash} volume={0.55} />
    <Sfx name="pop" from={T.step1} volume={0.5} />
    <Sfx name="thud0" from={T.terminal + 5} volume={0.5} />
    {CHUNKS.map((c, i) => (
      <Sfx key={c.text} name={`key${i % 4}`} from={c.at} volume={0.5} />
    ))}
    <Sfx name="pop" from={T.step2} volume={0.5} />
    {KEYS.map((from, i) => (
      <Sfx key={from} name={`key${(i + 2) % 4}`} from={from} volume={0.42} />
    ))}
    <Sfx name="sparkle" from={T.typed + 3} volume={0.4} />
    <Sfx name="whoosh" from={T.look} volume={0.3} />
    <Sfx name="ding" from={T.twenty} volume={0.44} />
    {TILES.map((tile, i) => (
      <Sfx key={tile.label} name={`thud${i + 1}`} from={tile.at + 3} volume={0.46} />
    ))}
    <Sfx name="check" from={T.noTouch + 4} />
    <Sfx name="stamp" from={T.exact} volume={0.5} />
    <Sfx name="click" from={T.ultra} volume={0.55} />
    <Sfx name="womp" from={T.stop + 8} volume={0.34} />
    <Sfx name="whoosh" from={T.by} volume={0.26} />
    <Sfx name="chime" from={T.youSave} volume={0.42} />
  </>
);

const PUNCHES = [0, T.step1, T.step2, T.look, T.by];
const SHAKES = [T.smash, T.exact];

export const CavemanVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = animatePose(frame);
  const jump = HOPS.map(([start, len, height]) => hop(frame, start, len, height));
  const dy = jump.reduce((sum, j) => sum + j.dy, 0);
  const sy = jump.reduce((product, j) => product * j.sy, 1);
  const fire = Math.max(
    0.2,
    1 + 0.6 * enter(frame - T.typed, BOUNCY) - 1.25 * enter(frame - T.stop - 6) + 0.5 * enter(frame - T.by),
  );
  const club = Math.max(
    Math.min(enter(frame - T.talk, BOUNCY), interpolate(frame, [T.slabOut - 6, T.slabOut], [1, 0], CLAMP)),
    frame >= T.look - 2 ? Math.min(enter(frame - T.look + 2, BOUNCY), 1) : 0,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: CAVE_WALL }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, END)}>
          <Cave fire={fire} />
          <MonitorScreens />
          <Scroll />
          <rect x={-40} y={-40} width={1160} height={2000} fill="#0d0b10" opacity={Math.min(slabUp(frame), 1) * 0.35} />
          <Slab />
          <g transform={`translate(190 ${1650 + dy}) scale(${2 - sy} ${sy}) translate(-190 -1650)`}>
            <Stickman
              pose={pose}
              thumb={Math.min(enter(frame - T.follow - 3), 1)}
              headFill={CAVE_WALL}
              bendy
            />
            <Club pose={pose} opacity={Math.min(club, 1)} />
          </g>
        </g>
      </svg>

      <Caption
        plain
        from={0}
        to={T.talk - 2}
        lines={[
          { text: "YOUR AI JUST USED", at: 2, size: 84 },
          { text: "63 TOKENS", at: T.tokens, size: 148, boxes: { "63": RED, TOKENS: RED } },
          { text: "TO TELL YOU ONE FIX", at: T.oneFix, size: 76 },
        ]}
      />
      <Caption
        plain
        from={T.talk - 4}
        to={T.step1 - 2}
        lines={[
          { text: "MAKE IT TALK LIKE A", at: T.talk - 4, size: 78 },
          { text: "CAVEMAN", at: T.smash - 2, size: 184, boxes: { CAVEMAN: AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.step1 - 4}
        to={T.step2 - 2}
        lines={[
          { text: "STEP 1", at: T.step1 - 4, size: 150, boxes: { STEP: AMBER, "1": AMBER } },
          { text: "OPEN YOUR TERMINAL", at: T.terminal, size: 78 },
          { text: "RUN THIS", at: T.run, size: 84, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.step2 - 4}
        to={T.look - 2}
        lines={[
          { text: "STEP 2", at: T.step2 - 4, size: 150, boxes: { STEP: AMBER, "2": AMBER } },
          { text: "INSIDE CLAUDE CODE", at: T.inside, size: 78 },
          { text: "TYPE /CAVEMAN", at: T.type, size: 96, boxes: { "/CAVEMAN": GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.look - 4}
        to={T.code - 2}
        lines={[
          { text: "NOW LOOK", at: T.look - 4, size: 80, color: AMBER },
          { text: "SAME BUG. SAME FIX.", at: T.look, ats: [T.sameBug, T.sameBug + 9, T.sameFix, T.sameFix + 9], size: 86 },
          { text: "20 TOKENS", at: T.twenty, size: 150, boxes: { "20": GREEN, TOKENS: GREEN } },
          { text: "ONE EXAMPLE FROM THE README", at: T.twenty + 12, size: 34 },
        ]}
      />
      <Caption
        plain
        from={T.code - 4}
        to={T.every - 3}
        lines={[
          { text: "YOUR CODE", at: T.code - 4, size: 92 },
          { text: "YOUR COMMANDS", at: T.commands, size: 92 },
          { text: "YOUR ERRORS", at: T.errors, size: 92 },
          { text: "CAVEMAN DOES NOT TOUCH", at: T.noTouch, size: 66, color: GREEN },
        ]}
      />
      <Caption
        plain
        from={T.every - 3}
        to={T.shorter - 2}
        lines={[
          { text: "EVERY CHARACTER", at: T.every, ats: [T.every - 2, T.character - 2], size: 100 },
          { text: "STAYS EXACT", at: T.stays, ats: [T.stays - 2, T.exact - 2], size: 116, boxes: { STAYS: GREEN, EXACT: GREEN } },
        ]}
      />
      <Caption
        plain
        from={T.shorter - 4}
        to={T.done - 2}
        lines={[
          { text: "EVEN SHORTER?", at: T.shorter - 4, size: 110 },
          { text: "/ULTRACAVE", at: T.ultra - 2, size: 128, boxes: { "/ULTRACAVE": AMBER } },
        ]}
      />
      <Caption
        plain
        from={T.done - 4}
        to={T.by - 2}
        lines={[
          { text: "DONE GRUNTING?", at: T.done - 4, size: 100 },
          { text: "SAY: STOP CAVEMAN", at: T.stop - 2, size: 80, boxes: { STOP: RED, CAVEMAN: RED } },
        ]}
      />
      <Caption
        plain
        from={T.by - 4}
        to={T.follow - 2}
        lines={[
          { text: "SKILL BY", at: T.by - 4, size: 80 },
          { text: "JULIUSBRUSSEE", at: T.julius, size: 100, color: AMBER },
          { text: "LINK IN THE CAPTION", at: T.link, size: 72 },
        ]}
      />
      <Caption
        plain
        from={T.follow - 4}
        to={END + 1}
        lines={[
          { text: "FOLLOW", at: T.follow - 4, size: 80 },
          { text: "STICKMAN SHIPS", at: T.follow + 4, size: 92, boxes: { STICKMAN: AMBER, SHIPS: AMBER } },
          { text: "ME TEST TOOLS.", at: T.meTest, size: 64 },
          { text: "YOU SAVE TOKENS.", at: T.youSave, size: 64, color: GREEN },
        ]}
      />
    </AbsoluteFill>
  );
};

export const CavemanComposition = () => (
  <Composition
    id="CavemanTutorial"
    component={CavemanVideo}
    durationInFrames={END}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
