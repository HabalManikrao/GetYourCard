let counter = 0;
/** Monotonic, collision-resistant element id (avoids Date.now determinism issues). */
export function newId(prefix = "el"): string {
  counter += 1;
  return `${prefix}_${Math.floor(performance.now())}_${counter}`;
}
