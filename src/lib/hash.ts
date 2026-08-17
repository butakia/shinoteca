// Deterministic string hash (djb2) — used to pick a stable visual variant
// from an id/title so the same song always renders the same fallback cover.
export function stableHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}
