import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Room } from "./Room";
import { Screens } from "./Screens";
import {
  INSPECT,
  REPORT,
  SIT,
  SIT_HAPPY,
  SIT_SCRATCH,
  SIT_WAVE,
  STAND_BUILD,
  Stickman,
  THUMB,
  blendPoses,
  type Pose,
} from "./Stickman";
import {
  AMBER,
  CREAM,
  FPS,
  GREEN,
  RED,
  T,
  VOICE_RATE,
  at,
  fontFamily,
} from "./theme";

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const enter = (frame: number, config = { damping: 15, stiffness: 130 }) =>
  spring({ frame: Math.max(0, frame), fps: FPS, config });

type Line = {
  text: string;
  at: number;
  size: number;
  color?: string;
  ats?: number[]; // per-word start frames when words follow the voice
  boxes?: Record<string, string>;
  small?: string[];
};

const DARK = "#11181c";

const Word: React.FC<{
  word: string;
  at: number;
  color: string;
  box?: string;
  small?: boolean;
  plain?: boolean;
}> = ({ word, at: start, color, box, small, plain }) => {
  const frame = useCurrentFrame();
  // plain: fade and a short slide only, no overshoot, zoom or pulse.
  const s = enter(
    frame - start,
    plain ? { damping: 20, stiffness: 170 } : { damping: 11, stiffness: 170 },
  );
  const wipe = plain ? 1 : enter(frame - start - 2, { damping: 18, stiffness: 190 });
  const scale = plain
    ? 1
    : interpolate(s, [0, 1], [1.3, 1]) +
      (box ? Math.sin((frame - start) / 7) * 0.012 : 0);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: box ? "0 0.14em" : 0,
        fontSize: small ? "0.5em" : undefined,
        color: box ? DARK : small ? AMBER : color,
        opacity: Math.min(s, 1),
        transform: `translateY(${(1 - s) * (plain ? 28 : 90)}px) scale(${scale})`,
        transformOrigin: "left center",
        textShadow: box ? "none" : "0 7px 0 rgba(6,12,16,0.6)",
      }}
    >
      {box ? (
        <span
          style={{
            position: "absolute",
            inset: "0.04em 0",
            background: box,
            borderRadius: "0.08em",
            transform: `scaleX(${wipe})`,
            transformOrigin: "left",
          }}
        />
      ) : null}
      <span style={{ position: "relative" }}>{word}</span>
    </span>
  );
};

export const Caption: React.FC<{
  from: number;
  to: number;
  lines: Line[];
  plain?: boolean;
}> = ({ from, to, lines, plain }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const exit = interpolate(frame, [to - 7, to], [1, 0], CLAMP);

  return (
    <div
      style={{
        position: "absolute",
        top: 190,
        left: 64,
        right: 64,
        opacity: exit,
        fontFamily,
        fontWeight: 900,
        color: CREAM,
      }}
    >
      {lines.map((line) => (
        <div
          key={line.text}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            columnGap: "0.24em",
            fontSize: line.size,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            marginBottom: 10,
          }}
        >
          {line.text.split(" ").map((word, i) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              at={line.ats?.[i] ?? line.at + i * 3}
              color={line.color ?? CREAM}
              box={line.boxes?.[word]}
              small={line.small?.includes(word)}
              plain={plain}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const POSES = [
  { at: 0, pose: SIT },
  { at: at(0.5), pose: SIT_WAVE },
  { at: at(4.6), pose: SIT },
  { at: T.generic + 6, pose: SIT_SCRATCH },
  { at: T.filter + 8, pose: SIT_HAPPY },
  { at: T.terminal, pose: SIT },
  { at: T.stand, pose: STAND_BUILD },
  { at: T.after, pose: INSPECT },
  { at: T.report, pose: REPORT },
  { at: T.yours, pose: THUMB },
];

const animatePose = (frame: number): Pose => {
  const pose = blendPoses(frame, POSES);
  const within = (a: number, b: number) => frame >= a && frame < b;
  const breathe = Math.sin(frame / 14) * 3;
  const p: Pose = {
    ...pose,
    head: [pose.head[0], pose.head[1] + breathe],
    sh: [pose.sh[0], pose.sh[1] + breathe * 0.6],
  };

  if (within(at(0.9), at(4.4))) {
    p.hR = [p.hR[0] + Math.sin(frame / 2.6) * 26, p.hR[1]];
  }
  if (within(T.generic + 12, T.filter)) {
    p.hR = [p.hR[0] + Math.sin(frame / 1.8) * 10, p.hR[1]];
  }
  if (within(T.type, T.typeEnd) || within(T.terminal, T.terminal + 45)) {
    p.hL = [p.hL[0], p.hL[1] - Math.abs(Math.sin(frame / 1.5)) * 18];
    p.hR = [p.hR[0], p.hR[1] - Math.abs(Math.cos(frame / 1.5)) * 18];
  }
  for (const tap of [T.pick + 6, T.tick2, T.tick3, T.session]) {
    if (within(tap - 5, tap + 5)) {
      p.hR = [p.hR[0], p.hR[1] - (5 - Math.abs(frame - tap)) * 7];
    }
  }
  if (within(T.after, T.after + 22)) {
    const swing = Math.sin((frame - T.after) / 2) * 30;
    p.kL = [p.kL[0] + swing, p.kL[1]];
    p.fL = [p.fL[0] + swing * 1.8, p.fL[1]];
    p.kR = [p.kR[0] - swing, p.kR[1]];
    p.fR = [p.fR[0] - swing * 1.8, p.fR[1]];
  }
  if (within(T.after + 20, T.fixBlock)) {
    p.hR = [p.hR[0], p.hR[1] + Math.sin(frame / 6) * 30];
  }
  return p;
};

const BLOCK_H = 80;
const FLOOR = 1650;
const BLOCK_COLORS = ["#4f8a8b", "#e0b04a", "#c9734a", "#7fb6d9"];
const PLACE_GAP = (T.after - T.during - 8) / 4;
const THUDS = BLOCK_COLORS.map((_, i) =>
  Math.round(T.during + i * PLACE_GAP + 5),
);
const STAMP_PASS = at(27.0);
const STAMP_FAIL = at(27.8);
const WORD_ANTISLOP = at(1.05);
const WORD_GENERIC = at(6.1);
const COMMAND = "NPX ANTISLOP-AI";
const KEYS = Array.from({ length: COMMAND.length }, (_, i) =>
  Math.round(T.type + (i * (T.typeEnd - T.type)) / COMMAND.length),
);

export const Sfx: React.FC<{ name: string; from: number; volume?: number }> = ({
  name,
  from,
  volume = 0.5,
}) => (
  <Sequence from={from} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);

const WHOOSHES = [
  T.by - 2,
  T.generic - 4,
  T.terminal - 4,
  T.pick - 4,
  T.stand,
  T.after - 3,
  T.report - 4,
];

const Soundtrack: React.FC = () => (
  <>
    <Audio src={staticFile("voice.mp3")} playbackRate={VOICE_RATE} />
    <Audio
      src={staticFile("sfx/bgm.wav")}
      volume={(f) =>
        interpolate(f, [0, 8, T.end - 30, T.end], [0.1, 0.17, 0.17, 0], CLAMP)
      }
    />
    <Sfx name="impact" from={0} volume={0.6} />
    <Sfx name="pop" from={WORD_ANTISLOP} volume={0.55} />
    {WHOOSHES.map((from) => (
      <Sfx key={from} name="whoosh" from={from} volume={0.3} />
    ))}
    <Sfx name="womp" from={WORD_GENERIC} volume={0.4} />
    <Sfx name="sweep" from={T.filter} volume={0.34} />
    <Sfx name="sparkle" from={T.filter + 24} volume={0.42} />
    {KEYS.map((from, i) => (
      <Sfx key={from} name={`key${i % 4}`} from={from} volume={0.48} />
    ))}
    <Sfx name="check" from={T.pick + 6} />
    <Sfx name="check" from={T.tick2} />
    <Sfx name="check" from={T.tick3} />
    <Sfx name="click" from={T.session} volume={0.6} />
    {THUDS.map((from, i) => (
      <Sfx key={from} name={`thud${i}`} from={from} volume={0.55} />
    ))}
    <Sfx name="error" from={T.after + 18} volume={0.26} />
    <Sfx name="ding" from={T.fixBlock} volume={0.44} />
    <Sfx name="paper" from={T.report + 4} volume={0.4} />
    <Sfx name="stamp" from={STAMP_PASS} volume={0.55} />
    <Sfx name="ding" from={STAMP_PASS + 2} volume={0.36} />
    <Sfx name="stamp" from={STAMP_FAIL} volume={0.55} />
    <Sfx name="error" from={STAMP_FAIL + 2} volume={0.22} />
    <Sfx name="chime" from={T.yours} volume={0.42} />
  </>
);

// Scene cuts punch the camera in, physical hits shake it.
const PUNCHES = [0, T.generic, T.terminal, T.pick, T.during, T.report, T.yours];
const SHAKES = [WORD_GENERIC, ...THUDS, STAMP_PASS, STAMP_FAIL];

export const cameraTransform = (
  frame: number,
  punches: number[],
  shakes: number[],
  end: number,
) => {
  const punch = punches.reduce(
    (sum, cut) =>
      frame >= cut
        ? sum + (1 - enter(frame - cut, { damping: 16, stiffness: 150 })) * 0.04
        : sum,
    0,
  );
  const shake = shakes.reduce(
    (sum, hit) =>
      frame >= hit && frame < hit + 10
        ? sum + Math.sin((frame - hit) * 2.4) * (10 - (frame - hit)) * 0.8
        : sum,
    0,
  );
  const zoom = 1.025 + (frame / end) * 0.025 + punch;
  return `translate(540 1100) scale(${zoom}) translate(-540 -1100) translate(${shake} ${shake * 0.5})`;
};

const Towers: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = Math.min(
    enter(frame - T.during),
    interpolate(frame, [T.report, T.report + 10], [1, 0], CLAMP),
  );
  if (fade <= 0) return null;
  const fixed = enter(frame - T.fixBlock);

  return (
    <g opacity={fade}>
      {BLOCK_COLORS.map((color, i) => {
        const s = enter(frame - T.during - i * PLACE_GAP);
        return (
          <rect
            key={color}
            x={120}
            y={FLOOR - BLOCK_H * (i + 1) - (1 - s) * 180}
            width={220}
            height={BLOCK_H - 6}
            rx={8}
            fill={color}
            opacity={Math.min(s, 1)}
          />
        );
      })}
      {BLOCK_COLORS.map((color, i) => {
        const bad = i === 2;
        const x = 775;
        const y = FLOOR - BLOCK_H * (i + 1);
        const angle = bad ? 14 * (1 - fixed) : 0;
        return (
          <rect
            key={color}
            x={x}
            y={y}
            width={220}
            height={BLOCK_H - 6}
            rx={8}
            fill={bad && fixed < 0.5 ? RED : color}
            transform={`rotate(${angle} ${x + 110} ${y + 37})`}
          />
        );
      })}
    </g>
  );
};

export const Magnifier: React.FC<{ hand: [number, number]; opacity: number }> = ({
  hand: [x, y],
  opacity,
}) => (
  <g opacity={opacity}>
    <path
      d={`M${x} ${y} L${x + 50} ${y - 50}`}
      stroke="#c9a56e"
      strokeWidth={18}
      strokeLinecap="round"
    />
    <circle
      cx={x + 100}
      cy={y - 100}
      r={72}
      fill={CREAM}
      fillOpacity={0.18}
      stroke={AMBER}
      strokeWidth={16}
    />
  </g>
);

const ReportSheet: React.FC<{ hand: [number, number] }> = ({
  hand: [x, y],
}) => {
  const frame = useCurrentFrame();
  const s = enter(frame - T.report - 4);
  if (s <= 0) return null;
  const left = x - 40;
  const top = y - 320;
  const stampPass = enter(frame - STAMP_PASS);
  const stampFail = enter(frame - STAMP_FAIL);
  const label = { fontFamily, fontWeight: 900, fontSize: 56 };

  return (
    <g
      opacity={Math.min(s, 1)}
      transform={`translate(${(1 - s) * 80} ${(1 - s) * 120})`}
    >
      <rect x={left} y={top} width={330} height={340} rx={10} fill={CREAM} />
      <rect x={left + 34} y={top + 36} width={262} height={18} rx={9} fill="#b9ad97" />
      <g opacity={Math.min(stampPass, 1)}>
        <path
          d={`M${left + 36} ${top + 142} l22 26 l40 -56`}
          fill="none"
          stroke="#2f9a5a"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={left + 118} y={top + 166} fill="#1d6b3d" {...label}>
          PASS
        </text>
      </g>
      <g opacity={Math.min(stampFail, 1)}>
        <path
          d={`M${left + 40} ${top + 228} l48 48 M${left + 88} ${top + 228} l-48 48`}
          fill="none"
          stroke={RED}
          strokeWidth={18}
          strokeLinecap="round"
        />
        <text x={left + 118} y={top + 274} fill="#a83526" {...label}>
          FAIL
        </text>
      </g>
    </g>
  );
};

export const AntislopTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const pose = animatePose(frame);
  const dim = interpolate(frame, [T.stand, T.during], [0, 0.62], CLAMP);
  const magnifier =
    Math.min(
      enter(frame - T.after - 14),
      interpolate(frame, [T.report - 6, T.report], [1, 0], CLAMP),
    ) || 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#20323a" }}>
      <Soundtrack />
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g transform={cameraTransform(frame, PUNCHES, SHAKES, T.end)}>
          <Room />
          <Screens />
          <rect x={-40} y={-40} width={1160} height={2000} fill="#0b1418" opacity={dim} />
          <Towers />
          <ReportSheet hand={pose.hR} />
          <Stickman
            pose={pose}
            thumb={Math.min(enter(frame - T.yours - 5), 1)}
          />
          <Magnifier hand={pose.hR} opacity={Math.min(magnifier, 1)} />
        </g>
      </svg>

      <Caption
        from={0}
        to={T.generic - 2}
        lines={[
          { text: "HOW TO USE THE", at: 2, size: 104 },
          { text: "ANTISLOP", at: WORD_ANTISLOP, size: 160, boxes: { ANTISLOP: AMBER } },
          {
            text: "SKILL BY MIQDADBADJUBER",
            at: at(1.6),
            ats: [at(1.6), T.by, T.by + 3],
            size: 104,
            small: ["BY", "MIQDADBADJUBER"],
          },
        ]}
      />
      <Caption
        from={T.generic - 4}
        to={T.terminal - 2}
        lines={[
          { text: "AI OUTPUT IS", at: T.generic - 4, size: 104 },
          { text: "GENERIC", at: WORD_GENERIC, size: 176, boxes: { GENERIC: RED } },
          { text: "ANTISLOP FILTERS IT OUT", at: T.filter - 3, size: 70, color: GREEN },
        ]}
      />
      <Caption
        from={T.terminal - 4}
        to={T.pick - 2}
        lines={[
          { text: "OPEN A TERMINAL", at: T.terminal - 4, size: 96 },
          {
            text: COMMAND,
            at: T.type - 3,
            ats: [T.type - 3, at(13.2)],
            size: 118,
            boxes: { NPX: AMBER, "ANTISLOP-AI": AMBER },
          },
        ]}
      />
      <Caption
        from={T.pick - 4}
        to={T.during - 2}
        lines={[
          { text: "PICK SKILLS,", at: T.pick - 4, ats: [T.pick - 4, T.pick + 4], size: 112 },
          { text: "LOCATION, AGENT", at: T.tick2, ats: [T.tick2 - 3, T.tick3 - 3], size: 100 },
          { text: "START A NEW SESSION", at: T.session - 3, size: 76, color: GREEN },
        ]}
      />
      <Caption
        from={T.during - 4}
        to={T.report - 2}
        lines={[
          { text: "DURING", at: T.during - 4, size: 124, boxes: { DURING: AMBER } },
          { text: "WHILE YOU BUILD", at: T.during + 12, size: 68 },
          { text: "AFTER", at: T.after - 3, size: 124, boxes: { AFTER: GREEN } },
          { text: "AUDIT YOUR WORK", at: T.after + 12, size: 68 },
        ]}
      />
      <Caption
        from={T.report - 4}
        to={T.end + 1}
        lines={[
          { text: "PASS / FAIL", at: T.report - 4, size: 124, boxes: { PASS: GREEN, FAIL: RED } },
          { text: "REPORT", at: T.report + 8, size: 124 },
          { text: "THE DESIGN DIRECTION STAYS YOURS", at: T.yours - 3, size: 70, boxes: { YOURS: AMBER } },
        ]}
      />
    </AbsoluteFill>
  );
};

export const MyComposition = () => (
  <Composition
    id="AntislopTutorial"
    component={AntislopTutorial}
    durationInFrames={T.end}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
