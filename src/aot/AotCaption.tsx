import { Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CREAM } from "../theme";

// Each short gets its own font. Fonts are OFL files in public/fonts/aot.
// Smooth entrances, mixed line by line so the eye keeps following the text.
export type Motion = "rise" | "grow" | "fromLeft" | "fromRight" | "focus" | "settle";
export const MOTIONS: Motion[] = ["rise", "grow", "fromLeft", "focus", "fromRight", "settle"];
export type Style = { font: string; file: string; weight: number; scale: number; upper: boolean };

export const STYLES = {
  bangers: { font: "AotBangers", file: "bangers.woff2", weight: 400, scale: 1.12, upper: true },
  alfaSlab: { font: "AotAlfaSlab", file: "alfa-slab-one.woff2", weight: 400, scale: 0.92, upper: true },
  fredoka: { font: "AotFredoka", file: "fredoka-700.woff2", weight: 700, scale: 1, upper: false },
  spaceMono: { font: "AotSpaceMono", file: "space-mono-700.woff2", weight: 700, scale: 0.86, upper: false },
  bungee: { font: "AotBungee", file: "bungee.woff2", weight: 400, scale: 0.86, upper: true },
} satisfies Record<string, Style>;

for (const s of Object.values(STYLES)) {
  if (typeof FontFace === "undefined") break;
  const handle = delayRender(`Loading ${s.font}`);
  const face = new FontFace(s.font, `url(${staticFile(`fonts/aot/${s.file}`)}) format("woff2")`, {
    weight: String(s.weight),
  });
  face
    .load()
    .then(() => {
      document.fonts.add(face);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

const DARK = "#11181c";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Word: React.FC<{ word: string; start: number; motion: Motion; box?: string; color: string }> = ({
  word,
  start,
  motion,
  box,
  color,
}) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  const t = interpolate(f, [0, 12], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const opacity = f < 0 ? 0 : t;
  const filter = motion === "focus" ? `blur(${(1 - t) * 6}px)` : undefined;
  const transform =
    motion === "rise"
      ? `translateY(${(1 - t) * 22}px)`
      : motion === "grow"
        ? `scale(${0.88 + t * 0.12})`
        : motion === "fromLeft"
          ? `translateX(${(1 - t) * -26}px)`
          : motion === "fromRight"
            ? `translateX(${(1 - t) * 26}px)`
            : motion === "settle"
              ? `scale(${1.1 - t * 0.1})`
              : `translateY(${(1 - t) * 8}px)`;
  const shadow = "0 7px 0 rgba(6,12,16,0.6)";

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        padding: box ? "0 0.14em" : 0,
        color: box ? DARK : color,
        opacity,
        transform,
        filter,
        transformOrigin: "center bottom",
        textShadow: box ? "none" : shadow,
        whiteSpace: "pre",
      }}
    >
      {box ? <span style={{ position: "absolute", inset: "0.02em 0", background: box, borderRadius: "0.1em" }} /> : null}
      <span style={{ position: "relative" }}>{word}</span>
    </span>
  );
};

export type CaptionLine = { text: string; at: number; ats?: number[]; size: number; boxes?: Record<string, string> };

export const AotCaption: React.FC<{
  from: number;
  to: number;
  lines: CaptionLine[];
  style: Style;
  motion: Motion;
  top?: number;
}> = ({ from, to, lines, style, motion, top = 190 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const exit = interpolate(frame, [to - 7, to], [1, 0], CLAMP);

  return (
    <div style={{ position: "absolute", top, left: 64, right: 64, opacity: exit, fontFamily: style.font, color: CREAM }}>
      {lines.map((line) => (
        <div
          key={line.text}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            columnGap: "0.26em",
            fontSize: line.size * style.scale,
            lineHeight: 1.12,
            marginBottom: 12,
          }}
        >
          {line.text.split(" ").map((w, i) => {
            const word = style.upper ? w.toUpperCase() : w;
            const at = line.ats?.[i] ?? line.at + i * 3;
            return (
              <Word
                key={`${w}-${i}`}
                word={word}
                start={at}
                motion={motion}
                box={line.boxes?.[w.toUpperCase()]}
                color={CREAM}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};
