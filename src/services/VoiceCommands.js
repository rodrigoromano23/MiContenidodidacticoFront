export const parseVoiceCommand = (text) => {
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
};