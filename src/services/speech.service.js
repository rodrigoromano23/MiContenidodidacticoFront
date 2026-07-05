let recognition = null;
let isListening = false;

export const initSpeechRecognition = (onResult, onStatusChange) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz");
    return;
  }

  recognition = new SpeechRecognition();

  recognition.lang = "es-AR";
  recognition.continuous = true; // importante para toggle real
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript;
    onResult(text);
  };

  recognition.onstart = () => {
    isListening = true;
    onStatusChange?.(true);
  };

  recognition.onend = () => {
    isListening = false;
    onStatusChange?.(false);
  };

  recognition.onerror = () => {
    isListening = false;
    onStatusChange?.(false);
  };
};

export const toggleSpeech = () => {
  if (!recognition) return;

  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
};

export const getSpeechStatus = () => isListening;