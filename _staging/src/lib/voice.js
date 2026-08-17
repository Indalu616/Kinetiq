/**
 * Thin wrapper around the Web Speech Synthesis API, tuned for short, frequent
 * form-feedback utterances (one per completed rep).
 *
 * Two browser quirks this works around, both of which can make speech
 * silently never play with a naive `speechSynthesis.speak()` call:
 *
 *  - Voices load asynchronously and `getVoices()` often returns an empty
 *    list on the very first call. We "warm up" the voice list as soon as
 *    the app starts and re-pick a concrete voice once the browser's
 *    `voiceschanged` event fires.
 *  - Calling `cancel()` immediately followed by `speak()` in the same tick
 *    is a known Chrome bug that can drop the new utterance entirely
 *    (https://crbug.com/679437 and similar). We only cancel when the synth
 *    is actually mid-utterance, instead of unconditionally on every call.
 */

let warmedUp = false;
let preferredVoice = null;

export function isSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice() {
  if (!isSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => v.lang?.startsWith('en') && /Google|Microsoft|Natural|Online/i.test(v.name)) ??
    voices.find((v) => v.lang?.startsWith('en')) ??
    voices[0]
  );
}

/** Call once, early (e.g. on app mount), so the first real utterance isn't the one priming the voice list. */
export function warmUpVoices() {
  if (!isSupported() || warmedUp) return;
  warmedUp = true;
  preferredVoice = pickVoice();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    preferredVoice = pickVoice();
  });
  window.speechSynthesis.getVoices();
}

export function speakText(text, { rate = 1.05, volume = 0.85, pitch = 1 } = {}) {
  if (!isSupported() || !text) return false;
  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = pitch;
    if (preferredVoice) utterance.voice = preferredVoice;

    // Only interrupt if something is genuinely in flight — unconditionally
    // calling cancel() right before speak() is what triggers the Chrome bug
    // where the new utterance is silently dropped.
    if (synth.speaking || synth.pending) {
      synth.cancel();
    }
    synth.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis failed', err);
    return false;
  }
}
