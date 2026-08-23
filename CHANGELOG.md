# Changelog

## 2026-08-23

### Added

- **🐢 Slow button** on partner message tool row (`js/main.js`) — replays that
  line at a fixed slow rate (`SLOW_RATE = 0.6`, well inside speech.js's
  [0.5–2.0] clamp) without touching the global voice-speed slider.
  `speakLine()` now accepts an optional rate, defaulting to `settings.rate`;
  the regular 🔊 Play button is unchanged. Styling reuses `.tool-btn`, so no
  CSS was added.

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
