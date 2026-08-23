# JP Conversation — N5 Conversation Practice

A zero-dependency web app for practicing Japanese conversation at the JLPT N5
level. You work through scripted dialogues (konbini, café, directions, self-
introduction): the app speaks the other person's lines with text-to-speech,
and you answer each turn by voice (Chrome/Edge mic) or by typing. Answers are
checked with fuzzy matching that forgives punctuation, spacing, katakana vs
hiragana, and small typos.

GitHub deployed [Link](https://tommystus.github.io/jpConversation/)

## Quick start

```bash
npm start          # serves http://localhost:5173
```

Simple Python alternate (if installed)
```powershell
python -m http.server 5173
```

(Any static file server works too, e.g. `npx serve .` — the app is plain
HTML/CSS/JS with ES modules, no build step.)

Then open **http://localhost:5173** in Chrome or Edge.

Note:  Need to **Clear browser cache** with `(Ctrl+Shift+R)` after any code change.

## How to use

1. Pick a scenario from the home screen.
2. The other speaker's lines play automatically — use **🔊 Play** to replay,
   **Aa** for romaji, **EN** for the translation.
3. On **your turn**, type an answer or click **🎤** and speak. Hint chips
   reveal the English meaning, romaji, or the full model answer (using the
   model answer costs you a "first try").
4. After two misses you can reveal the model answer and continue.
5. Finish the dialogue to get a star score (first-try lines / total lines),
   saved per scenario.

**Settings (⚙️)** — choose a Japanese voice, slow the speech down to 0.5×,
toggle furigana, switch to kana-only mode, or hide translations.

**Browser notes**
- Microphone input uses the Web Speech Recognition API: Chrome or Edge only,
  and it needs an internet connection (recognition runs server-side at
  Google).
- Text-to-speech quality depends on the Japanese voices installed on your
  system (Windows: Settings → Time & Language → Speech). The app lists every
  Japanese voice it finds in the settings dialog.

## Adding scenarios

All dialogue lives in `js/data.js`. Append an object to the `scenarios`
array — no other code changes needed:

```js
{
  id: "hospital",            // unique slug
  title: "病院で",           // Japanese title
  titleEn: "At the Clinic",
  icon: "🏥",
  description: "Tell a doctor how you feel.",
  lines: [
    { role: "partner",       // spoken by the app
      text: "どうしましたか。",        // furigana markup: 漢字[かんじ]
      romaji: "Dou shimashita ka.",
      english: "What's wrong?" },
    { role: "user",          // answered by the learner
      text: "あたまが痛いです。",
      romaji: "Atama ga itai desu.",
      english: "My head hurts.",
      task: "Tell the doctor your head hurts.",
      answers: [                    // accepted responses; fuzzy-matched
        "あたまが痛いです。",
        "頭が痛いです。",
        "あたまがいたいです。",
      ], },
  ],
}
```

Conventions:
- Furigana markup in `text`: write `漢字[かんじ]`; a kana-only version is
  derived automatically.
- `〇〇` in an `answers` entry is a wildcard matching any text (use it for
  personal answers like names or countries).
- Matching normalizes punctuation, whitespace, full/half-width forms,
  katakana→hiragana, and long-vowel marks (`コーヒー` ≈ `こーひー`), then
  accepts ≥75% Levenshtein similarity.

## Project structure

```
index.html          app shell + settings dialog
css/styles.css      styling (light/dark aware)
js/main.js          screens, session flow, answer UI
js/data.js          scenario content (edit this to add dialogues)
js/match.js         answer normalization + fuzzy matching
js/speech.js        speechSynthesis (TTS) + SpeechRecognition (STT) wrappers
js/store.js         settings + progress in localStorage
server.mjs          tiny static server for `npm start`
```

## Ideas for later

- **Free-talk mode** — an LLM conversation partner (e.g. Claude API behind a
  small serverless function) constrained to N5 grammar, reusing the same
  voice/UI components.
- **Listening mode** — hide partner text until after the audio plays.
- **Spaced repetition** — feed missed lines back in future sessions.
- More scenarios: hospital, post office, phone calls, small talk, shopping
  for clothes.
