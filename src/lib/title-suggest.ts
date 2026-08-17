// Heuristic clean-up for messy audio filenames at upload time — this is a
// *suggestion* shown in an editable field, never applied silently. Detects
// (and strips) track numbers, "by <name>" attributions, rip-site junk words,
// and stray numeric IDs, while deliberately leaving version qualifiers like
// "Remix" or "En vivo" alone since those are real information, not noise.

const JUNK_WORDS = [
  "official",
  "audio",
  "video",
  "lyric",
  "lyrics",
  "hd",
  "hq",
  "mv",
  "clip",
  "oficial",
];

// Version qualifiers must never be stripped by the generic junk/number
// cleanup below, even though words like "remix" get *detected* as meaningful
// structure per the spec.
const KEEP_PHRASES = [
  "remix",
  "en vivo",
  "live",
  "acustico",
  "acústico",
  "acoustic",
  "versión extendida",
  "version extendida",
  "extended version",
  "instrumental",
  "cover",
  "demo",
];

const CONNECTORS = new Set(["de", "del", "la", "las", "el", "los", "en", "y", "a", "con", "por", "para", "un", "una"]);

function titleCase(str: string): string {
  return str
    .split(" ")
    .map((word, i) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      if (i > 0 && CONNECTORS.has(lower)) return lower;
      // keep short all-caps acronyms as-is isn't attempted here — inputs are
      // already lowercased before this runs, so every word gets capitalized
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export type TitleSuggestion = {
  title: string;
  artist?: string;
  trackNumber?: number;
  feat?: string;
  original: string;
};

// A letters-only marker (no spaces/brackets/digits) so it survives every
// cleanup step below untouched, whatever whitespace ends up around it — an
// earlier version used a bare numeric placeholder padded with spaces, and
// the whitespace-collapse step below could eat its trailing space, which
// silently dropped "Remix" and friends from the final title.
function placeholderToken(i: number): string {
  return `keepphrasemarker${i}z`;
}

export function suggestTitleFromFilename(filename: string): TitleSuggestion {
  const original = filename;
  let name = filename.replace(/\.[a-z0-9]{2,5}$/i, ""); // strip extension

  // 1. leading track number: "01 - ", "002 ", "03) "
  let trackNumber: number | undefined;
  const trackMatch = name.match(/^\s*(\d{1,4})\s*[.\-)]*\s*(.*)$/);
  if (trackMatch && trackMatch[2].trim().length > 0) {
    trackNumber = parseInt(trackMatch[1], 10);
    name = trackMatch[2];
  }

  name = name.replace(/_/g, " ").trim();

  // 2. "Artist - Title" split, only when there's a clear " - " separator and
  // what's on both sides looks like real text (avoids mangling titles that
  // just happen to contain a hyphen mid-phrase, e.g. "Auto-Retrato").
  let artist: string | undefined;
  const dashParts = name.split(/\s+-\s+/);
  if (dashParts.length === 2 && dashParts[0].split(" ").length <= 4) {
    artist = dashParts[0].trim();
    name = dashParts[1].trim();
  }

  // 3. "feat./ft./featuring X" — normalized separately, pulled out of the
  // running title text so it doesn't get title-cased/mangled with the rest.
  let feat: string | undefined;
  const featMatch = name.match(/[([]?\s*(?:feat\.?|ft\.?|featuring)\s+([^)\]]+?)\s*[)\]]?$/i);
  if (featMatch) {
    feat = featMatch[1].trim();
    name = name.slice(0, featMatch.index).trim();
  }

  // 4. "by <name>" attribution — redundant once we already have an artist
  // field, so it's dropped from the title text.
  name = name.replace(/\bby\s+[a-z0-9._]+(\s+[a-z0-9._]+){0,2}\b/gi, " ");

  // 5. Protect version qualifiers before the generic junk-word/number sweep
  // strips anything that looks like noise — swap them for placeholders,
  // clean everything else, then restore.
  const placeholders: string[] = [];
  KEEP_PHRASES.forEach((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\(?\\b${escaped}\\b\\)?`, "gi");
    name = name.replace(re, (m) => {
      placeholders.push(m.replace(/[()]/g, "").trim());
      return ` ${placeholderToken(placeholders.length - 1)} `;
    });
  });

  // 6. strip pure junk words (whole-word only) and stray numeric IDs (bare
  // runs of 3+ digits not already consumed as the track number)
  const junkRe = new RegExp(`\\b(${JUNK_WORDS.join("|")})\\b`, "gi");
  name = name.replace(junkRe, " ");
  name = name.replace(/\b\d{3,}\b/g, " ");

  // 7. drop separator characters, collapse whitespace
  name = name.replace(/[[\]{}]/g, " ").replace(/\s*[-–—]\s*/g, " ").replace(/\s{2,}/g, " ").trim();

  // Title-case first, *then* restore the protected phrases as "(Phrase)" —
  // titleCase capitalizes each space-delimited word's first character, and
  // "(remix)" starts with "(" rather than a letter, so restoring before
  // this step let the final pass silently re-lowercase what it had just put
  // back (a real, previously-shipped bug: "Remix" came out as "(remix)").
  let cleanedTitle = titleCase(name.toLowerCase()).trim();
  placeholders.forEach((phrase, i) => {
    cleanedTitle = cleanedTitle.replace(new RegExp(placeholderToken(i), "i"), `(${titleCase(phrase)})`);
  });
  cleanedTitle = cleanedTitle || filename.replace(/\.[a-z0-9]{2,5}$/i, "");

  return {
    title: cleanedTitle,
    artist: artist ? titleCase(artist.toLowerCase()) : undefined,
    trackNumber,
    feat: feat ? titleCase(feat.toLowerCase()) : undefined,
    original,
  };
}
