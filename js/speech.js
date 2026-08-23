// Browser speech: text-to-speech (speechSynthesis) and
// speech-to-text (SpeechRecognition, Chrome/Edge).

// ---------- Text to speech ----------

const synth = window.speechSynthesis ?? null;

export const ttsSupported = synth !== null;

export function listJapaneseVoices() {
  if (!synth) return [];
  return synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ja"));
}

// Voices load asynchronously in most browsers; call once at startup and
// whenever the app needs a fresh list.
export function onVoicesChanged(cb) {
  if (!synth) return;
  cb(); // may already be populated
  synth.addEventListener("voiceschanged", cb);
}

export function speak(text, { voiceURI = null, rate = 1.0 } = {}) {
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = clampRate(rate);
  const voice =
    (voiceURI && synth.getVoices().find((v) => v.voiceURI === voiceURI)) ||
    listJapaneseVoices()[0] ||
    null;
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking() {
  synth?.cancel();
}

function clampRate(r) {
  return Math.min(2, Math.max(0.5, Number(r) || 1));
}

// ---------- Speech recognition ----------

const RecognitionCtor =
  window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;

export const sttSupported = RecognitionCtor !== null;

let activeRecognition = null;

// Abort any in-flight recognition (e.g. when leaving a session).
export function cancelListen() {
  try {
    activeRecognition?.abort();
  } catch {
    // ignore — recognition may already be finished
  }
  activeRecognition = null;
}

// Starts one-shot recognition; resolves with the transcript or rejects with
// an Error. `onDone` is always called exactly once afterwards so the UI can
// reset its mic button state.
export function listenOnce({ lang = "ja-JP", onDone } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done = () => {
      if (!settled && typeof onDone === "function") {
        settled = true;
        onDone();
      }
    };

    if (!RecognitionCtor) {
      done();
      reject(new Error("Speech recognition not supported in this browser."));
      return;
    }

    const rec = new RecognitionCtor();
    activeRecognition = rec;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;

    let heard = false;

    rec.onresult = (event) => {
      const transcripts = [...event.results[0]]
        .map((alt) => alt.transcript.trim())
        .filter(Boolean);
      if (transcripts.length > 0) {
        heard = true;
        resolve(transcripts[0]);
      }
    };
    rec.onerror = (event) => {
      if (!heard) reject(new Error(`Mic error: ${event.error}`));
    };
    rec.onend = () => {
      activeRecognition = null;
      if (!heard) reject(new Error("Didn't catch that — try again."));
      done();
    };

    try {
      rec.start();
    } catch (err) {
      done();
      reject(err);
    }
  });
}
