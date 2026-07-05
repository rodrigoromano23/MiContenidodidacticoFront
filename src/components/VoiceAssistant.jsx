import { useEffect, useRef } from "react";
import { parseVoiceCommand } from "../services/VoiceCommands";

export default function VoiceAssistant({ enabled, onCommand }) {
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("SpeechRecognition no soportado en este navegador");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript
          .trim()
          .toLowerCase();

      console.log("🎙 VOZ:", transcript);

      const command = parseVoiceCommand(transcript);

      if (command) {
        console.log("🧠 COMMAND:", command);
        onCommand(command);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (enabled) {
      recognitionRef.current.start();
      console.log("🎤 Microfono ACTIVO");
    } else {
      recognitionRef.current.stop();
      console.log("🔇 Microfono OFF");
    }
  }, [enabled]);

  return null;
}