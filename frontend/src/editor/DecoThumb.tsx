import { getDecoration } from "../lib/decorations";

/** Renders a decoration motif as an inline SVG preview. */
export function DecoThumb({ asset, color = "#7a1226", size = 44 }: { asset: string; color?: string; size?: number }) {
  const deco = getDecoration(asset);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={deco.label}>
      {deco.paths.map((p, i) => (
        <path key={i} d={p.d} fill={color} opacity={p.opacity ?? 1} fillRule={p.fillRule ?? "nonzero"} />
      ))}
    </svg>
  );
}
