/*export const parseVoiceCommand = (text) => {
  if (text.includes("abrir panel")) {
    return { type: "OPEN_PANEL" };
  }

  if (text.includes("cerrar panel")) {
    return { type: "CLOSE_PANEL" };
  }

  if (text.includes("buscar")) {
    return {
      type: "SEARCH",
      value: text.replace("buscar", "").trim(),
    };
  }

  if (text.includes("zoom más")) {
    return { type: "ZOOM_IN" };
  }

  if (text.includes("quita imagen")) {
    return { type: "HIDE_IMAGE" };
  }

  return null;
};*/

// Mapa auxiliar para convertir números expresados en palabras a dígitos
const PALABRAS_A_NUMEROS = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
  seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15,
  dieciseis: 16, dieciséis: 16, diecisiete: 17, dieciocho: 18, 
  diecinueve: 19, veinte: 20, treinta: 30, cuarenta: 40, cincuenta: 50
};

export const parseVoiceCommand = (text) => {
  const cleanText = text.replace(/[\.,]+/g, "").trim().toLowerCase();

  /* ---------------- 1. TUS COMANDOS ORIGINALES ---------------- */
  if (cleanText.includes("abrir panel")) {
    return { type: "OPEN_PANEL" };
  }

  if (cleanText.includes("cerrar panel")) {
    return { type: "CLOSE_PANEL" };
  }

  if (cleanText.includes("zoom más") || cleanText.includes("zoom mas")) {
    return { type: "ZOOM_IN" };
  }

  if (cleanText.includes("quita imagen")) {
    return { type: "HIDE_IMAGE" };
  }

  if (cleanText.includes("buscar")) {
    return {
      type: "SEARCH",
      value: cleanText.replace("buscar", "").trim(),
    };
  }

  /* ---------------- 2. COMANDOS PARA EL NARRADOR ---------------- */
  if (["reproducir", "reproduce", "leer", "escuchar", "play"].some((k) => cleanText.includes(k))) {
    window.dispatchEvent(new CustomEvent("voz-control-narrador", { detail: { accion: "PLAY" } }));
    return { type: "NARRATOR_PLAY" };
  }

  if (["pausa", "pausar", "pause"].some((k) => cleanText.includes(k))) {
    window.dispatchEvent(new CustomEvent("voz-control-narrador", { detail: { accion: "PAUSE" } }));
    return { type: "NARRATOR_PAUSE" };
  }

  if (["continuar", "reanudar", "seguir", "resume"].some((k) => cleanText.includes(k))) {
    window.dispatchEvent(new CustomEvent("voz-control-narrador", { detail: { accion: "RESUME" } }));
    return { type: "NARRATOR_RESUME" };
  }

  if (["stop", "parar", "detener"].some((k) => cleanText.includes(k))) {
    window.dispatchEvent(new CustomEvent("voz-control-narrador", { detail: { accion: "STOP" } }));
    return { type: "NARRATOR_STOP" };
  }

  /* ---------------- 3. RESPUESTAS PARA EL JUEGO DE MATEMÁTICAS ---------------- */
  const coincidenciaDigitos = cleanText.match(/\d+/);
  let numeroRespuesta = null;

  if (coincidenciaDigitos) {
    numeroRespuesta = parseInt(coincidenciaDigitos[0], 10);
  } else {
    // Si la API transcribió "cinco" en lugar de "5"
    for (const [palabra, valor] of Object.entries(PALABRAS_A_NUMEROS)) {
      if (cleanText.includes(palabra)) {
        numeroRespuesta = valor;
        break;
      }
    }
  }

  if (numeroRespuesta !== null) {
    window.dispatchEvent(new CustomEvent("voz-control-juego", { detail: { respuesta: numeroRespuesta } }));
    return { type: "GAME_ANSWER", value: numeroRespuesta };
  }

  return null;
};