class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
  }

  speak(text, options = {}) {
    if (!("speechSynthesis" in window)) {
      throw new Error("Este navegador no soporta síntesis de voz.");
    }

    if (!text || typeof text !== "string") return;

    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);

    this.utterance.lang = options.lang || "es-AR";
    this.utterance.rate = options.rate || 1;
    this.utterance.pitch = options.pitch || 1;
    this.utterance.volume = options.volume || 1;

    // 🔥 ESTO ES LO QUE TE FALTABA
    if (options.onStart) {
      this.utterance.onstart = options.onStart;
    }

    if (options.onEnd) {
      this.utterance.onend = options.onEnd;
    }

    if (options.onError) {
      this.utterance.onerror = options.onError;
    }

    if (options.voice) {
      this.utterance.voice = options.voice;
    }

    this.synth.speak(this.utterance);
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  stop() {
    this.synth.cancel();
  }

  getVoices() {
    return this.synth.getVoices();
  }
}

export default new SpeechService();