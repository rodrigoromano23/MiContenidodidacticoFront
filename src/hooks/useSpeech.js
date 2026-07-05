import { useEffect, useState } from "react";
import speechService from "../services/speechService";

export default function useSpeech() {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(speechService.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text, options = {}) => {
    if (!text || typeof text !== "string") {
      console.warn("⚠️ speak() recibió texto vacío");
      return;
    }

    speechService.speak(text, {
      volume: options.volume ?? 1,   // 🔊 FIX VOLUMEN
      rate: options.rate ?? 1,
      pitch: options.pitch ?? 1,

      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        options.onEnd?.();
      },
      onError: () => setIsSpeaking(false),
    });
  };

  const pause = () => {
    speechService.pause();
  };

  const resume = () => {
    speechService.resume();
  };

  const stop = () => {
    speechService.stop();
    setIsSpeaking(false);
  };

  return {
    speak,
    pause,
    resume,
    stop,
    voices,
    isSpeaking,
  };
}