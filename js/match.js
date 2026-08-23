// Answer checking: normalization + fuzzy matching.
//
// Normalization makes matching forgiving of punctuation, spacing, full/half
// width characters, katakana vs hiragana, and latin case. Fuzzy matching is
// Levenshtein-based with a similarity threshold, plus 〇〇 wildcards in the
// scenario data for personal answers (names, countries, ...).

const SIMILARITY_THRESHOLD = 0.75;

// Full-width latin/digit/space -> ASCII, strip punctuation & whitespace,
// katakana -> hiragana, lowercase.
export function normalize(text) {
  return String(text)
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[　]/g, " ")
    .toLowerCase()
    // whitespace and CJK/latin punctuation
    .replace(/[\s、。「」『』〈-】〔〕・〜!,.:;?"'()\[\]{}]/g, "")
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    // expand the long-vowel mark to its vowel so コーヒー == こーひー == こうひい
    .replace(/(.)ー/g, "$1$1");
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1, // deletion
        curr[j - 1] + 1, // insertion
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

function similarity(a, b) {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

// Turn an expected answer into a regex: 〇 (and runs of 〇) become wildcards
// matching any run of characters.
function wildcardRegex(expected) {
  const escaped = expected
    .split(/〇+/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".+");
  return new RegExp(`^${escaped}$`);
}

export function checkAnswer(input, answers) {
  const got = normalize(input);
  if (got.length === 0) return false;

  for (const answer of answers) {
    const want = normalize(answer);
    if (want.includes("〇")) {
      if (wildcardRegex(want).test(got)) return true;
    } else if (got === want) {
      return true;
    } else if (similarity(got, want) >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }
  return false;
}

// Highest similarity between the input and any accepted variant, ignoring
// wildcard segments. Used for encouragement feedback ("you're close!").
export function bestMatchScore(input, answers) {
  const got = normalize(input);
  if (!got.length) return 0;
  let best = 0;
  for (const answer of answers) {
    const want = normalize(answer).replaceAll("〇", "");
    best = Math.max(best, similarity(got, want));
  }
  return best;
}
