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


# Added Play button on user bubbles (hear your recognized answer)

- Total cost:  $1.13 (costs may be inaccurate due to usage of unknown models)
- Total duration (API):  18m 54s
- Total duration (wall): 54m 6s
- Total code changes:    70 lines added, 1 line removed
- Usage by model:
  - stealth/ox-alpha:  46.4k input, 6.3k output, 396.9k cache read, 0 cache write ($0.59)
  - nvidia/nemotron-3-ultra-550b-a55b:free:  86.1k input, 4.4k output, 4.3k cache read, 0 cache write ($0.54)

## Context

In jpconv, the user answers each line by typing or speaking (mic → STT). When the answer is accepted, exactly what the app recognized/typed is shown as a `.bubble.user` chat bubble — but there's no way to hear it back, so the user can't verify how the recognition sounds or practice listening to their own sentence. Goal: add a small play button inside every user bubble that speaks that bubble's text with the app's existing Japanese TTS.

Everything needed already exists and is reused:

- **TTS**: `speak(text, { voiceURI, rate })` in `js/speech.js:23` — already imported into `js/main.js`.
- **Styling**: `.bubble-tools` + `.tool-btn` classes in `css/styles.css:237-255` (hover states included). Icon convention is emoji glyphs (`🔊 Play`, `🐢 Slow`, `Aa`, `EN`) — no SVGs.
- **Creation site**: user bubbles are inserted in exactly ONE place — the success branch of `submitAnswerInner()` at `js/main.js:290-294`. (`bubbleHtml()`'s "no tools for user" branch at `js/main.js:182` is dead code; only partner lines flow through it.)

## Changes

### 1. `js/main.js` — add button when inserting the user bubble (~line 290)

Extend the inserted HTML with a compact single-button tools row, then wire it:

```js
transcript.insertAdjacentHTML(
  "beforeend",
  `<div class="bubble user"><div class="jp">${escapeHtml(value)}</div>
     <div class="bubble-tools"><button class="tool-btn user-play-btn" title="Play my answer">🔊</button></div>
   </div>`
);
transcript.lastElementChild
  .querySelector(".user-play-btn")
  .addEventListener("click", () => {
    if (!ttsSupported) return;
    speak(value, { voiceURI: settings.voiceURI, rate: settings.rate });
  });
```

Notes:
- `value` is the raw submitted text (plain, no furigana markup), so no `toPlain()` needed.
- Same voice/rate settings as partner playback (`speakLine` uses `settings.rate`; guard with `ttsSupported` like `speakLine` does).
- Icon-only 🔊 (not "🔊 Play") keeps the learner's own bubble compact while matching the existing emoji-glyph convention.

### 2. `css/styles.css` — make hover visible on user bubbles (one rule after `.tool-btn:hover`, ~line 255)

`.tool-btn:hover` uses `background: var(--accent-soft)` — identical to the user bubble's own background, so the hover feedback would be invisible there. Add:

```css
.bubble.user .tool-btn:hover {
  background: var(--surface);
}
```

(`--surface` exists for light and dark themes in `:root` / dark override.)

## Verification

1. `npm start` → open the served URL.
2. Start any scenario, answer one line correctly by typing → the user bubble appears with a 🔊 button below its text; click it → Japanese TTS reads back exactly what was submitted.
3. Answer another line via 🎤 mic → click 🔊 on that bubble to hear what the recognizer heard.
4. Confirm the button's hover highlight is visible against the pink/red user-bubble background (light + dark mode).
