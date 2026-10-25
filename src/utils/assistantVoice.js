/** Browser Web Speech helpers for Leaguease Assistant (STT + TTS). */

export function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionCtor());
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function speakText(text, { lang = "en-US", rate = 1 } = {}) {
  if (!isSpeechSynthesisSupported()) return false;
  const content = String(text || "").trim();
  if (!content) return false;

  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(content);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Create a one-shot speech recognizer.
 * Calls onResult(finalTranscript) when speech ends / result received.
 */
export function createSpeechRecognizer({
  lang = "en-US",
  onResult,
  onError,
  onStart,
  onEnd,
} = {}) {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    onError?.("Speech recognition is not supported in this browser.");
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStart?.();
  recognition.onend = () => onEnd?.();
  recognition.onerror = (event) => {
    const code = event?.error || "unknown";
    if (code === "aborted" || code === "no-speech") {
      onEnd?.();
      return;
    }
    const messages = {
      "not-allowed": "Microphone permission denied.",
      "service-not-allowed": "Microphone permission denied.",
      network: "Voice service network error. Try again.",
      "audio-capture": "No microphone found.",
    };
    onError?.(messages[code] || `Voice error: ${code}`);
    onEnd?.();
  };

  recognition.onresult = (event) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = result?.[0]?.transcript || "";
      if (result.isFinal) finalText += transcript;
      else interim += transcript;
    }
    const text = (finalText || interim).trim();
    if (finalText.trim()) {
      onResult?.(finalText.trim(), { isFinal: true });
    } else if (interim.trim()) {
      onResult?.(text, { isFinal: false });
    }
  };

  return recognition;
}
