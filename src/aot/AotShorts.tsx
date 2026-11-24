import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CLAMP, Sfx, cameraTransform, enter } from "../Composition";
import { blendPoses, type Pose } from "../Stickman";
import { CREAM, FPS, RED } from "../theme";
import { AotCaption, MOTIONS, STYLES, type CaptionLine, type Style } from "./AotCaption";
import { COLOR, Character, SPECS, buildPose, type Look, type Spec, type SpecName, type Who } from "./Cast";
import { LINES } from "./lines";
import { CafeTable, CourtTable, Plant, SetBackdrop, SnackTable, Sofa, WALLS, type SetName } from "./Sets";

const GAP = 7; // frames between two lines
const END_SECONDS = 2.8;
const BLEEP = "bla-bla";

type Cast = Partial<Record<Who, { x: number; f: number; base: SpecName; look?: Look }>>;
type Change = {
  poses?: Partial<Record<Who, SpecName>>;
  looks?: Partial<Record<Who, number>>;
  set?: Partial<Record<Who, { x?: number; base?: SpecName; look?: Look }>>;
};
type Beat = Change & {
  line?: string | string[];
  pause?: number;
  tag?: string;
  later?: (Change & { off: number })[];
  sfx?: { name: string; off?: number; volume?: number }[];
  card?: string;
  end?: string;
  punch?: boolean;
  shake?: number[];
};
type Ctx = { frame: number; tags: Record<string, number>; poses: Partial<Record<Who, Pose>> };
type Episode = {
  id: string;
  set: SetName;
  style: Style;
  cast: Cast;
  beats: Beat[];
  endBoxes: Record<string, string>;
  back?: React.FC<Ctx>;
  front?: React.FC<Ctx>;
  propUp?: (who: Who, ctx: Ctx) => boolean;
  glassesDrop?: (ctx: Ctx) => number;
  darkFrom?: string;
};

// shortcut: bleep position is estimated from where "bla-bla" sits in the text, nudge BLEEP_NUDGE if it misses.
const BLEEP_NUDGE: Record<string, number> = {};
const bleepsOf = (id: string) => {
  const { t, d } = LINES[id];
  const out: number[] = [];
  for (let i = t.indexOf(BLEEP); i >= 0; i = t.indexOf(BLEEP, i + 1)) {
    out.push(Math.round((0.06 + (i / t.length) * (d - 0.12) + (BLEEP_NUDGE[id] ?? 0)) * FPS));
  }
  return out;
};

const sizeFor = (text: string) => (text.length <= 22 ? 104 : text.length <= 48 ? 88 : text.length <= 85 ? 74 : 64);

const compile = (ep: Episode) => {
  const who = Object.keys(ep.cast) as Who[];
  const state = Object.fromEntries(who.map((w) => [w, { ...ep.cast[w]! }])) as Record<
    Who,
    { x: number; f: number; base: SpecName; look?: Look }
  >;
  const lookNow = Object.fromEntries(who.map((w) => [w, 0])) as Record<Who, number>;
  const keys = Object.fromEntries(who.map((w) => [w, [] as { at: number; pose: Pose; spec: Spec }[]])) as Record<
    Who,
    { at: number; pose: Pose; spec: Spec }[]
  >;
  const outfits = Object.fromEntries(who.map((w) => [w, [{ at: 0, look: state[w].look ?? {} }]])) as Record<
    Who,
    { at: number; look: Look }[]
  >;
  const speech: { id: string; who: Who; start: number; frames: number }[] = [];
  const captions: { from: number; to: number; lines: CaptionLine[] }[] = [];
  const sfx: { name: string; from: number; volume: number }[] = [];
  const cards: { from: number; to: number; text: string }[] = [];
  const tags: Record<string, number> = {};
  const punches: number[] = [0];
  const shakes: number[] = [];
  let endCard = { from: 0, text: "" };
  let t = 0;

  const apply = (at: number, c: Change, speakers: Who[]) => {
    for (const w of who) {
      const s = c.set?.[w];
      if (s?.x !== undefined) state[w].x = s.x;
      if (s?.base) state[w].base = s.base;
      if (s?.look) {
        state[w].look = { ...state[w].look, ...s.look };
        outfits[w].push({ at, look: state[w].look! });
      }
    }
    for (const w of who) {
      const speaking = speakers.includes(w);
      const others = who.filter((o) => o !== w);
      const target = speaking
        ? others.reduce((a, b) => (Math.abs(state[a].x - state[w].x) < Math.abs(state[b].x - state[w].x) ? a : b), others[0])
        : speakers.find((s) => s !== w);
      if (c.looks?.[w] !== undefined) lookNow[w] = c.looks[w]!;
      else if (target) lookNow[w] = Math.sign(state[target].x - state[w].x);
      const base = SPECS[state[w].base];
      const named = c.poses?.[w];
      const prev = keys[w][keys[w].length - 1]?.spec;
      // Silent beats hold the last pose unless a pose or a new base is given.
      const hold = speakers.length === 0 && prev && !c.set?.[w]?.base;
      const spec: Spec = named
        ? SPECS[named]
        : speaking
          ? { ...base, front: "gesture", smile: state[w].base === "idle" ? 0.5 : base.smile }
          : hold
            ? prev
            : base;
      keys[w].push({ at, spec, pose: buildPose(state[w].x, state[w].f, lookNow[w] * 0.85, spec) });
    }
  };

  for (const beat of ep.beats) {
    const start = t;
    if (beat.tag) tags[beat.tag] = start;
    if (beat.punch) punches.push(start);
    for (const s of beat.shake ?? []) shakes.push(start + s);
    for (const s of beat.sfx ?? []) sfx.push({ name: s.name, from: start + (s.off ?? 0), volume: s.volume ?? 0.45 });
    const ids = beat.line === undefined ? [] : Array.isArray(beat.line) ? beat.line : [beat.line];
    const speakers = ids.map((id) => LINES[id].c);
    apply(start, beat, speakers);
    for (const l of beat.later ?? []) apply(start + l.off, l, []);

    if (ids.length) {
      const frames = Math.max(...ids.map((id) => Math.ceil(LINES[id].d * FPS)));
      for (const id of ids) {
        speech.push({ id, who: LINES[id].c, start, frames: Math.ceil(LINES[id].d * FPS) });
        for (const b of bleepsOf(id)) sfx.push({ name: "beep", from: start + b - 1, volume: 0.32 });
      }
      const name = speakers.map((s) => s.toUpperCase()).join(" & ");
      const text = LINES[ids[0]].t.split(BLEEP).join("BIIIP");
      const words = text.split(" ");
      let chars = 0;
      const ats = words.map((w) => {
        const at = start + Math.round((chars / text.length) * frames * 0.9);
        chars += w.length + 1;
        return at;
      });
      captions.push({
        from: start - 3,
        to: start + frames + GAP - 1,
        lines: [
          {
            text: name,
            at: start - 3,
            size: 54,
            boxes: Object.fromEntries(speakers.map((s) => [s.toUpperCase(), COLOR[s]])),
          },
          { text, at: start, ats, size: sizeFor(text), boxes: { "BIIIP": RED, "BIIIP!": RED, "BIIIP.": RED } },
        ],
      });
      t += frames + GAP;
    } else if (beat.end) {
      endCard = { from: start, text: beat.end };
      sfx.push({ name: "chime", from: start, volume: 0.4 });
      punches.push(start);
      t += Math.round(END_SECONDS * FPS);
    } else {
      const frames = Math.round((beat.pause ?? 0.5) * FPS);
      if (beat.card) cards.push({ from: start, to: start + frames, text: beat.card });
      t += frames;
    }
  }
  return { who, keys, outfits, speech, captions, sfx, cards, tags, punches, shakes, endCard, end: t };
};

const Card: React.FC<{ from: number; to: number; text: string; font: string }> = ({ from, to, text, font }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const o = Math.min(interpolate(frame, [from, from + 6], [0, 1], CLAMP), interpolate(frame, [to - 6, to], [1, 0], CLAMP));
  return (
    <AbsoluteFill style={{ background: "#0b0d12", opacity: o, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: font, fontSize: 110, color: CREAM, textAlign: "center", lineHeight: 1.1 }}>{text}</div>
    </AbsoluteFill>
  );
};

const makeShort = (ep: Episode) => {
  const plan = compile(ep);
  const wall = WALLS[ep.set];

  const Short: React.FC = () => {
    const frame = useCurrentFrame();
    const poses: Partial<Record<Who, Pose>> = {};
    for (const w of plan.who) {
      const k = plan.keys[w];
      const p = blendPoses(frame, k);
      const breathe = Math.sin(frame / 14 + w.length) * 3;
      p.head = [p.head[0], p.head[1] + breathe];
      p.sh = [p.sh[0], p.sh[1] + breathe * 0.6];
      const talking = plan.speech.find((s) => s.who === w && frame >= s.start && frame < s.start + s.frames);
      const current = [...k].reverse().find((x) => x.at <= frame);
      if (talking && current?.spec.front === "gesture") {
        p.hR = [p.hR[0], p.hR[1] + Math.sin(frame / 4) * 16];
      }
      poses[w] = p;
    }
    const ctx: Ctx = { frame, tags: plan.tags, poses };
    const dark = ep.darkFrom ? interpolate(frame, [plan.tags[ep.darkFrom] + 10, plan.tags[ep.darkFrom] + 16], [0, 0.85], CLAMP) : 0;
    const Back = ep.back;
    const Front = ep.front;

    return (
      <AbsoluteFill style={{ backgroundColor: wall }}>
        {plan.speech.map((s) => {
          const bleeps = bleepsOf(s.id);
          return (
            <Sequence key={s.id} from={s.start} layout="none">
              <Audio
                src={staticFile(`aot/${s.who}/${s.id}.mp3`)}
                volume={(f) => (bleeps.some((b) => f >= b - 2 && f < b + 13) ? 0 : 1)}
              />
            </Sequence>
          );
        })}
        <Audio
          src={staticFile("sfx/bgm-aot.wav")}
          volume={(f) => interpolate(f, [0, 10, plan.end - 30, plan.end], [0.03, 0.07, 0.07, 0], CLAMP)}
        />
        {plan.sfx.map((s, i) => (
          <Sfx key={`${s.name}${i}`} name={s.name} from={s.from} volume={s.volume} />
        ))}
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <g transform={cameraTransform(frame, plan.punches, plan.shakes, plan.end)}>
            <SetBackdrop name={ep.set} tv={Math.sin(frame / 5) * 0.5 + 0.5} />
            {Back ? <Back {...ctx} /> : null}
            {plan.who.map((w) => {
              const talk = plan.speech.find((s) => s.who === w && frame >= s.start && frame < s.start + s.frames);
              const look = [...plan.outfits[w]].reverse().find((o) => o.at <= frame)?.look ?? {};
              return (
                <Character
                  key={w}
                  who={w}
                  pose={poses[w]!}
                  headFill={wall}
                  mouth={talk ? (LINES[talk.id].m[frame - talk.start] ?? 0) : 0}
                  look={w === "ucup" && ep.glassesDrop ? { ...look, glassesDrop: ep.glassesDrop(ctx) } : look}
                  propUp={ep.propUp?.(w, ctx)}
                />
              );
            })}
            {Front ? <Front {...ctx} /> : null}
          </g>
          <rect x={0} y={0} width={1080} height={1920} fill="#05070a" opacity={dark} />
        </svg>
        {plan.captions.map((c, i) => (
          <AotCaption
            key={c.from}
            from={c.from}
            to={c.to}
            lines={c.lines}
            style={ep.style}
            motion={MOTIONS[(i + ep.id.length) % MOTIONS.length]}
          />
        ))}
        {plan.cards.map((c) => (
          <Card key={c.from} {...c} font={ep.style.font} />
        ))}
        <AotCaption
          from={plan.endCard.from}
          to={plan.end + 1}
          style={ep.style}
          motion="grow"
          lines={[{ text: plan.endCard.text, at: plan.endCard.from + 2, size: 100, boxes: ep.endBoxes }]}
        />
      </AbsoluteFill>
    );
  };

  return { Short, end: plan.end };
};

const Falling: React.FC<{ from: number; frame: number; x: number; y: number }> = ({ from, frame, x, y }) => {
  if (frame < from) return null;
  const t = (frame - from) / FPS;
  const fall = Math.min(y + 900 * t * t, 1632);
  return <circle cx={x + t * 40} cy={fall} r={17} fill="#fff4cf" stroke="#e6c46a" strokeWidth={4} />;
};

const EP1: Episode = {
  id: "AotBootsApa",
  set: "bedroom",
  style: STYLES.bangers,
  cast: {
    raka: { x: 330, f: 1, base: "idle" },
    ucup: { x: 760, f: -1, base: "holdIdle", look: { prop: "popcorn" } },
  },
  endBoxes: { RAKA: COLOR.raka, UCUP: COLOR.ucup, "UCUP?": COLOR.ucup },
  beats: [
    { pause: 0.8, tag: "hook", poses: { ucup: "holdIdle" }, looks: { ucup: 0, raka: 1 }, sfx: [{ name: "pop", off: 10 }] },
    { line: "R01", poses: { raka: "excited" }, punch: true },
    { line: "U01", poses: { ucup: "holdIdle" } },
    { line: "R02" },
    { pause: 0.9, tag: "drop", poses: { raka: "talk" }, sfx: [{ name: "pop", off: 12, volume: 0.5 }] },
    { line: "R03", poses: { raka: "excited" }, punch: true },
    { line: "U02", poses: { ucup: "holdIdle" } },
    { line: "R04" },
    { line: "U03", poses: { ucup: "dreamy" }, looks: { ucup: 0 } },
    { pause: 1.5, tag: "crickets", poses: { raka: "idle", ucup: "holdIdle" }, sfx: [{ name: "crickets", volume: 0.5 }] },
    { line: "R05", poses: { raka: "facepalm" } },
    { line: "U04", poses: { ucup: "eat" } },
    { pause: 1.0, poses: { raka: "collapse", ucup: "eat" }, looks: { ucup: 0 }, sfx: [{ name: "womp", off: 4 }], shake: [12] },
    { end: "KAMU TIM RAKA ATAU TIM UCUP?" },
  ],
  front: ({ frame, tags, poses }) => {
    const u = poses.ucup!;
    return (
      <g>
        <Falling from={tags.hook + 8} frame={frame} x={u.head[0] - 30} y={u.head[1] + 40} />
        <Falling from={tags.drop + 10} frame={frame} x={u.head[0] - 20} y={u.head[1] + 40} />
      </g>
    );
  },
};

const EP2: Episode = {
  id: "AotSidangEren",
  set: "court",
  style: STYLES.alfaSlab,
  cast: {
    raka: { x: 180, f: 1, base: "idle" },
    sinta: { x: 540, f: 1, base: "gavelDown", look: { wig: true, prop: "gavel" } },
    ucup: { x: 900, f: -1, base: "idle" },
  },
  endBoxes: { HAKIMNYA: COLOR.sinta, "APA?": COLOR.sinta },
  beats: [
    {
      pause: 0.7,
      tag: "gavel0",
      poses: { sinta: "gavelUp" },
      looks: { sinta: 0, raka: 1, ucup: -1 },
      later: [{ off: 9, poses: { sinta: "gavelDown" } }],
      sfx: [{ name: "stamp", off: 13, volume: 0.6 }],
      shake: [13],
    },
    { line: "S01", punch: true },
    { line: "R06", poses: { raka: "excited" } },
    { line: "S02", looks: { sinta: 1 } },
    { line: "U05" },
    { line: "R07", poses: { raka: "excited" } },
    { line: "U06", poses: { ucup: "point" } },
    { line: "R08" },
    { line: "U07", poses: { ucup: "hip" } },
    { pause: 0.7, looks: { sinta: 0 }, poses: { sinta: "gavelDown" } },
    { line: "S03", looks: { sinta: 0 } },
    { line: "R09", poses: { raka: "panic" } },
    { line: "S04", poses: { sinta: "sad" }, looks: { sinta: -1 } },
    {
      pause: 1.0,
      tag: "gavel1",
      poses: { sinta: "gavelUp" },
      looks: { sinta: 0 },
      later: [{ off: 9, poses: { sinta: "gavelDown" } }],
      sfx: [{ name: "stamp", off: 13, volume: 0.6 }, { name: "click", off: 20, volume: 0.6 }],
      shake: [13],
    },
    { end: "KALAU KAMU HAKIMNYA, PUTUSANNYA APA?" },
  ],
  front: () => <CourtTable />,
  propUp: (w, { frame, tags }) =>
    w === "sinta" && [tags.gavel0, tags.gavel1].some((g) => frame >= g && frame < g + 11),
  darkFrom: "gavel1",
};

const EP3: Episode = {
  id: "AotBelumMoveOn",
  set: "community",
  style: STYLES.fredoka,
  cast: {
    raka: { x: 250, f: 1, base: "sad" },
    sinta: { x: 520, f: -1, base: "idle" },
    ucup: { x: 780, f: -1, base: "idle" },
  },
  endBoxes: { "MOVE": COLOR.raka, "ON": COLOR.raka },
  beats: [
    { line: "R10", looks: { raka: 0 }, punch: true },
    { line: "S05" },
    { line: "R11" },
    { line: "S06" },
    { line: "R12", poses: { raka: "cry" }, looks: { raka: 0 } },
    { pause: 0.5, poses: { ucup: "raise" }, looks: { raka: 1, sinta: 1, ucup: -1 }, sfx: [{ name: "pop" }] },
    { line: "U08", poses: { ucup: "raise" } },
    { line: "S07" },
    { line: "U09", poses: { ucup: "highfive" } },
    {
      pause: 1.2,
      tag: "snack",
      looks: { raka: 1, sinta: 1, ucup: 1 },
      poses: { ucup: "eat" },
      sfx: [{ name: "whoosh", volume: 0.3 }, { name: "womp", off: 12 }],
      punch: true,
    },
    { line: "R13", looks: { raka: 0 } },
    { end: "KAMU UDAH MOVE ON BELUM?" },
  ],
  front: () => <SnackTable />,
};

const EP4: Episode = {
  id: "AotSokPinter",
  set: "cafe",
  style: STYLES.spaceMono,
  cast: {
    ucup: { x: 230, f: 1, base: "idle", look: { glasses: true } },
    sinta: { x: 680, f: -1, base: "idle" },
    raka: { x: 1000, f: -1, base: "idle", look: { glasses: false } },
  },
  endBoxes: { AOT: COLOR.ucup, "APA?": COLOR.ucup },
  beats: [
    { line: "U10", poses: { ucup: "facepalm" }, looks: { ucup: 0 }, punch: true },
    { line: "S08", looks: { raka: -1 } },
    { line: "U11", poses: { ucup: "hip" } },
    { pause: 0.6, poses: { raka: "facepalm" }, sfx: [{ name: "thud1", off: 4, volume: 0.5 }] },
    { line: "S09" },
    { line: "U12" },
    { line: "S10", poses: { sinta: "hip" } },
    { line: "U13", poses: { ucup: "panic" } },
    { pause: 0.9, tag: "slip", poses: { ucup: "idle" }, looks: { ucup: 0 }, sfx: [{ name: "womp", off: 6 }] },
    { line: "U14", poses: { ucup: "sad" } },
    { line: "S11", poses: { sinta: "excited" } },
    {
      pause: 0.8,
      tag: "tos",
      poses: { ucup: "highfive", sinta: "highfive" },
      later: [{ off: 12, set: { raka: { x: 840 } }, poses: { raka: "idle" }, looks: { raka: -1 } }],
      sfx: [{ name: "stamp", off: 5, volume: 0.45 }, { name: "sparkle", off: 6, volume: 0.35 }],
      shake: [5],
    },
    { line: "R14", poses: { raka: "sad" }, looks: { raka: 0 } },
    { end: "JUJUR AJA, KAMU NONTON AOT BUAT APA?" },
  ],
  front: () => (
    <g>
      <CafeTable />
      <Plant />
    </g>
  ),
  glassesDrop: ({ frame, tags }) => Math.min(enter(frame - tags.slip - 4, { damping: 20, stiffness: 60 }), 1),
};

const EP5: Episode = {
  id: "AotZonaSpoiler",
  set: "living",
  style: STYLES.bungee,
  cast: {
    raka: { x: 210, f: 1, base: "idle" },
    sinta: { x: 540, f: 1, base: "remote", look: { prop: "remote" } },
    ucup: { x: 870, f: -1, base: "idle" },
  },
  endBoxes: { SPOILER: RED, "SPOILER.": RED },
  beats: [
    { line: "S12", poses: { sinta: "remoteUp" }, looks: { sinta: 0, raka: 0, ucup: 0 }, punch: true },
    {
      pause: 0.6,
      looks: { raka: 1, ucup: -1, sinta: 0 },
      poses: { raka: "panic", ucup: "panic" },
      sfx: [{ name: "whoosh", volume: 0.35 }],
      punch: true,
    },
    { line: "R15", poses: { raka: "talk" } },
    { line: "S13", looks: { sinta: -1 } },
    { line: "U15", poses: { ucup: "panic" } },
    { line: "R16", poses: { raka: "point" } },
    { line: "U16", poses: { ucup: "point" } },
    { line: "S14", poses: { sinta: "hip" }, looks: { sinta: 0 } },
    { pause: 0.5, poses: { raka: "cover", ucup: "cover" }, looks: { raka: 0, ucup: 0 } },
    { line: "R17", poses: { raka: "cover" } },
    {
      pause: 2.0,
      card: "3 BULAN KEMUDIAN",
      sfx: [{ name: "whoosh", volume: 0.35 }],
      later: [{ off: 20, set: { sinta: { base: "collapse", look: { prop: null } } }, looks: { sinta: 0 } }],
    },
    { line: "S15", poses: { sinta: "cry" }, looks: { sinta: 0 }, punch: true, shake: [2] },
    { line: ["R18", "U17"], poses: { raka: "excited", ucup: "excited" } },
    { end: "TAG TEMEN KAMU YANG SUKA SPOILER." },
  ],
  back: () => <Sofa />,
};

const SHORTS = [EP1, EP2, EP3, EP4, EP5].map((ep) => ({ id: ep.id, ...makeShort(ep) }));

export const AotCompositions: React.FC = () => (
  <>
    {SHORTS.map(({ id, Short, end }) => (
      <Composition key={id} id={id} component={Short} durationInFrames={end} fps={FPS} width={1080} height={1920} />
    ))}
  </>
);
