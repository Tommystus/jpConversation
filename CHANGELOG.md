# Changelog

## 2026-08-23

### Added

- **🐢 Slow button** on partner message tool row (`js/main.js`) — replays that
  line at a fixed slow rate (`SLOW_RATE = 0.6`, well inside speech.js's
  [0.5–2.0] clamp) without touching the global voice-speed slider.
  `speakLine()` now accepts an optional rate, defaulting to `settings.rate`;
  the regular 🔊 Play button is unchanged. Styling reuses `.tool-btn`, so no
  CSS was added.
- **🔊 Play button on user bubbles** (`js/main.js`, `css/styles.css`) — when an
  answer is accepted, the learner's `.bubble.user` gets a compact 🔊 button
  that speaks back exactly what was submitted or recognized (`speak(value, …)`
  with the app's voice/rate settings), so they can hear how their own sentence
  sounds and check what the recognizer captured on mic answers. Hover needed
  its own tint (`.bubble.user .tool-btn:hover` uses `var(--surface)`),
  because the default `--accent-soft` hover is invisible against the user
  bubble's background.

### Changed

- **Pause before next line** (`js/main.js`) — after a correct answer, the app
  now waits 5 s instead of 1.2 s before advancing, giving the spoken replay of
  the model answer time to finish (the next partner line's `speak()` cancels
  any in-flight speech, so the old 1.2 s cut it off almost immediately).
  Hardcoded `1200` replaced with `NEXT_LINE_DELAY_MS = 5000` beside
  `SLOW_RATE`. Wrong-answer flow, reveal-continue path, and mic flow are
  untouched; the existing `session &&` guard still covers leaving mid-wait.

### Fixed

- **Furigana rendered over the wrong text** (`js/main.js`) — the base group of
  `FURIGANA_RE` (`[^[\]<>]+`) was greedy, so for mid-sentence markup like
  `メキシコから来[き]ました` it matched all the way back to the start of the
  string, wrapping `メキシコから来` in `<ruby>` and floating the reading き
  above the wrong spot. The base is now kanji-only (`[一-鿿々ヶ]+`), so ruby
  wraps just `来`. This fixes every mid-sentence line in `data.js`
  (`いいえ、近[ちか]い`, `220円[えん]`, `この道[みち]を…行[い]きます`, …);
  lines whose markup started the string were unaffected, which is why it went
  unnoticed.
  - Side fix: kana-only mode (`toKana`) shared the regex and was deleting the
    text before the bracket (`メキシコから来[き]ました` → `きました`). Now
    correct (`メキシコからきました`). `toPlain` output was correct before and
    after.
- **Furigana size** (`css/styles.css`) — `rt` font-size `0.55em` → `0.62em`
  (user request: slightly larger).

### Verification

- New regex tested in Node against all furigana patterns in `data.js`
  (mid-sentence, digits-before-base, multi-kanji base, multiple ruby per
  line): ruby placement, `toPlain`, and `toKana` output all correct.
- `node --check` passes on `main.js`.

### Notes

- Browsers cache ES modules aggressively; after JS/CSS edits use a hard
  refresh (Ctrl+Shift+R). Also noted in `README.md`.
