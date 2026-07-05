import { useEffect, useRef, useState } from "react";

export default function useSpeechRecognition({ onResult }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition no soportado");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text =
        event.results[event.results.length - 1][0].transcript;

      if (onResult) onResult(text);
    };

    recognitionRef.current = recognition;
  }, []);

  const start = () => {
    recognitionRef.current?.start();
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const toggle = () => {
    if (listening) stop();
    else start();
  };

  return { listening, start, stop, toggle };
}