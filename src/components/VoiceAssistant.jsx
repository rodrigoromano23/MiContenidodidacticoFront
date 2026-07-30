/*import { useEffect, useRef } from "react";
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
}*/

import { useEffect, useRef } from "react";
import { parseVoiceCommand } from "../services/VoiceCommands";

export default function VoiceAssistant({ enabled, onCommand }) {
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Para controlar el estado interno sin errores de estado

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
        onCommand?.(command);
      }
    };

    // Al iniciar la captura
    recognition.onstart = () => {
      isListeningRef.current = true;
      console.log("🎤 Micrófono ACTIVO");
    };

    // Al detenerse la captura
    recognition.onend = () => {
      isListeningRef.current = false;
      console.log("🔇 Micrófono OFF");

      // Si sigue habilitado pero se cortó por tiempo límite de WebSpeech API, reiniciamos automáticamente
      if (enabled) {
        try {
          recognition.start();
        } catch (e) {
          console.warn("Reintento de start omitido:", e);
        }
      }
    };

    recognition.onerror = (event) => {
      // Ignoramos 'no-speech' y 'aborted' ya que son habituales
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.error(" Error de reconocimiento de voz:", event.error);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup al desmontar el componente
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // Se ejecuta una sola vez al montar

  // Manejador del toggle encendido/apagado (enabled)
  useEffect(() => {
    const rec = recognitionRef.current;
    if (!rec) return;

    if (enabled) {
      if (!isListeningRef.current) {
        try {
          rec.start();
        } catch (err) {
          console.warn("El micrófono ya estaba intentando iniciar:", err);
        }
      }
    } else {
      if (isListeningRef.current) {
        rec.stop();
      }
    }
  }, [enabled]);

  return null;
}