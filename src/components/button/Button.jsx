import { useState, useEffect, useRef } from "react";
import { History, KeyRound, Brain, Volume2, Mic, Play, Pause, Square, FileDown, Gamepad2 } from "lucide-react";
import TypeWriter from "../TypeWriter";
import CalcGame from "../CalcGame";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
// 1. IMPORTANTE: Importamos tu hook propio
import { useNarradorPropio } from '../hooks/useNarradorPropio';

const SECTIONS = {
  history: "Historial",
  keywords: "Palabras clave",
  grammar: "Gramática",
  speech: "Narrador",
  dictionary: "Diccionario",
};

export default function ButtonPanel({
  searchHistory = [],
  material,
  onToggleMic,
}) {
  const [active, setActive] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const micOnRef = useRef(micOn);
  const reconocimientoRef = useRef(null);

  // 2. CONECTAMOS EL HOOK DEL NARRADOR PROPIO
  const { estado: estadoNarrador, reproducir, pausar, continuar, detener } = useNarradorPropio();

  useEffect(() => {
    micOnRef.current = micOn;
  }, [micOn]);

  const [grammar, setGrammar] = useState(null);
  const lastMaterialRef = useRef(null);

  const isOpen = active !== null;
  const procesarComandoRef = useRef(null);

  const notificarComando = (mensaje) => {
    console.log(`🎙️ Comando ejecutado: ${mensaje}`);
  };

  /* ---------------- 🔊 FUNCIONES DE CONTROL ADAPTADAS AL HOOK ---------------- */
  const iniciarNarracion = () => {
    const text = material?.contenido || "";
    if (!text) {
      notificarComando("No hay contenido disponible para leer.");
      return;
    }
    reproducir(text);
    notificarComando("Reproduciendo narración");
  };

  const pausarNarracion = () => {
    pausar();
    notificarComando("Narrador pausado");
  };

  const continuarNarracion = () => {
    continuar();
    notificarComando("Continuando narración");
  };

  const detenerNarracion = () => {
    detener();
    notificarComando("Narración detenida");
  };

  /* ---------------- 🎙️ PROCESAMIENTO DE COMANDOS DE VOZ ---------------- */
  const procesarComandoVozGlobal = (frase) => {
    const fraseLimpia = frase
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?¿¡!]/g, "")
      .trim();

    console.log("Procesando frase limpia en Panel:", fraseLimpia);

    const lanzarNotificacion = (mensaje, icon = "success") => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: icon,
        title: mensaje,
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        background: "#0f172a",
        color: "#fff",
        iconColor: "#22d3ee",
      });
    };

    /* --- 🎮 1. RESPUESTAS PARA EL JUEGO MATEMÁTICO --- */
    const textoANumeros = {
      cero: 0, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
      once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20
    };

    const matchNumero = fraseLimpia.match(/\d+/);
    let numeroRespuesta = matchNumero ? parseInt(matchNumero[0], 10) : null;

    if (numeroRespuesta === null) {
      for (const [palabra, valor] of Object.entries(textoANumeros)) {
        if (fraseLimpia.includes(palabra)) {
          numeroRespuesta = valor;
          break;
        }
      }
    }

    if (numeroRespuesta !== null || fraseLimpia.includes("es") || fraseLimpia.includes("resultado")) {
      window.dispatchEvent(
        new CustomEvent("voz-respuesta-matematica", {
          detail: { respuesta: numeroRespuesta, fraseOriginal: fraseLimpia },
        })
      );
    }

    /* --- 🔊 2. COMANDOS DEL NARRADOR --- */
    const comandosPausar = ["pausar", "pausa", "espera", "pausa el texto"];
    const comandosContinuar = ["continuar", "reanudar", "sigue leyendo", "sigue", "continuar narracion"];
    const comandosReproducir = ["reproducir", "leer", "reproduce", "iniciar narrador"];
    const comandosDetener = ["detener", "parar", "cancelar narracion", "deten narracion"];

    const coincide = (lista) => lista.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(fraseLimpia));

    if (coincide(comandosPausar)) {
      pausarNarracion();
      return;
    }

    if (coincide(comandosContinuar)) {
      continuarNarracion();
      return;
    }

    if (coincide(comandosReproducir)) {
      iniciarNarracion();
      return;
    }

    if (coincide(comandosDetener)) {
      detenerNarracion();
      return;
    }

    /* --- PDF --- */
    const comandosPDF = ["descargar pdf", "exportar pdf", "guardar pdf", "bajar pdf"];
    if (comandosPDF.some((kw) => fraseLimpia.includes(kw))) {
      exportarAPDF();
      return;
    }

    /* --- BÚSQUEDA --- */
    if (fraseLimpia.startsWith("buscar ") || fraseLimpia.startsWith("filtrar ")) {
      let terminoBusqueda = fraseLimpia.replace(/^(buscar|filtrar)\s+/, "").trim();
      window.dispatchEvent(new CustomEvent("voz-buscar-titulo", { detail: terminoBusqueda }));
      notificarComando(`Buscando: "${terminoBusqueda}"`);
      return;
    }

    /* --- VISOR DE IMÁGENES --- */
    const abrirVisorKeywords = ["galeria", "galería", "ampliar", "expandir", "ver fotos", "ver imagenes", "ver imágenes", "abrir imagen", "abrir foto"];
    const cerrarVisorKeywords = ["cerrar foto", "quitar foto", "ocultar foto", "ocultar galeria", "ocultar galería", "cerrar imagen"];

    if (abrirVisorKeywords.some((kw) => fraseLimpia.includes(kw))) {
      let numeroDetectado = null;
      const numerosEnLetras = { uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6 };
      const coincidenciaDigito = fraseLimpia.match(/\d+/);

      if (coincidenciaDigito) {
        numeroDetectado = parseInt(coincidenciaDigito[0], 10);
      } else {
        for (const [palabra, valor] of Object.entries(numerosEnLetras)) {
          if (fraseLimpia.includes(palabra)) {
            numeroDetectado = valor;
            break;
          }
        }
      }

      window.dispatchEvent(
        new CustomEvent("voz-control-imagenes", {
          detail: { accion: "ABRIR", numero: numeroDetectado },
        })
      );
      return;
    }

    if (cerrarVisorKeywords.some((kw) => fraseLimpia.includes(kw))) {
      window.dispatchEvent(
        new CustomEvent("voz-control-imagenes", {
          detail: { accion: "CERRAR" },
        })
      );
      return;
    }

    /* --- NAVEGACIÓN Y PANELES --- */
    const comandosCerrarPanel = ["cerrar panel", "ocultar panel", "cerrar menu", "cerrar menú", "ocultar menu", "ocultar menú", "quitar panel", "salir del panel"];
    if (comandosCerrarPanel.some((kw) => fraseLimpia.includes(kw))) {
      setActive(null);
      lanzarNotificacion("Panel cerrado", "info");
      return;
    }

    if (fraseLimpia.includes("historial")) {
      setActive("history");
      return;
    }
    
    if (fraseLimpia.includes("palabras clave") || fraseLimpia.includes("palabras claves")) {
      setActive("keywords");
      return;
    }
    
    if (fraseLimpia.includes("gramatica") || fraseLimpia.includes("gramática")) {
      setActive("grammar");
      return;
    }
    
    if (fraseLimpia.includes("narrador") || fraseLimpia.includes("reproductor")) {
      setActive("speech");
      return;
    }
    
    if (fraseLimpia.includes("juego") || fraseLimpia.includes("calculos") || fraseLimpia.includes("cálculos")) {
      setActive("Calculos");
      return;
    }
  };

  useEffect(() => {
    procesarComandoRef.current = procesarComandoVozGlobal;
  });

  /* ---------------- 🎙️ MOTOR DE VOZ GLOBAL ---------------- */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const frase = event.results[event.results.length - 1][0].transcript;
      console.log("Asistente de voz entendió:", frase);

      if (procesarComandoRef.current) {
        procesarComandoRef.current(frase);
      }
    };

    recognition.onerror = (event) => {
      console.error("Error en Speech Recognition:", event.error);
      if (event.error === "no-speech") return;
      setMicOn(false);
    };

    recognition.onend = () => {
      if (micOnRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 300);
      }
    };

    reconocimientoRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  /* ---------------- ⌨️ CONTROL BARRA ESPACIADORA ---------------- */
  useEffect(() => {
    const manejarEspaciador = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleMic();
      }
    };
    window.addEventListener("keydown", manejarEspaciador);
    return () => window.removeEventListener("keydown", manejarEspaciador);
  }, []);

  const handleMic = () => {
    setMicOn((prev) => {
      const nuevoEstado = !prev;
      if (reconocimientoRef.current) {
        if (nuevoEstado) {
          try {
            reconocimientoRef.current.start();
          } catch (e) {}
        } else {
          try {
            reconocimientoRef.current.stop();
          } catch (e) {}
        }
      }
      onToggleMic?.(nuevoEstado);
      return nuevoEstado;
    });
  };

  /* ---------------- 📄 EXPORTAR A PDF CON jspdf ---------------- */
  const exportarAPDF = () => {
    if (!material || !material.contenido) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "No hay contenido disponible para exportar.",
        background: "#0f172a",
        color: "#f59e0b",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const margenIzquierdo = 20;
      const anchoMaximoTexto = 170;
      let ejeY = 20;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const titulo = material.titulo || "Material de Estudio";
      doc.text(titulo, margenIzquierdo, ejeY);
      ejeY += 15;

      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.5);
      doc.line(margenIzquierdo, ejeY, 60, ejeY);
      ejeY += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      const textoDividido = doc.splitTextToSize(material.contenido, anchoMaximoTexto);

      textoDividido.forEach((linea) => {
        if (ejeY > 275) {
          doc.addPage();
          ejeY = 20;
        }
        doc.text(linea, margenIzquierdo, ejeY);
        ejeY += 7;
      });

      const nombreArchivo = `${titulo.toLowerCase().replace(/\s+/g, "_")}.pdf`;
      doc.save(nombreArchivo);

      Swal.fire({
        icon: "success",
        title: "¡PDF Descargado!",
        text: `Se guardó correctamente como ${nombreArchivo}`,
        timer: 2000,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#22d3ee",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  useEffect(() => {
    if (!material?.contenido) {
      setGrammar(null);
      return;
    }
    if (lastMaterialRef.current === material.contenido) return;
    lastMaterialRef.current = material.contenido;

    const fetchGrammar = async () => {
      try {
        const res = await fetch("https://micontenidodidactico.onrender.com/api/materials/grammar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: material.contenido }),
        });
        const data = await res.json();
        setGrammar(data);
      } catch (err) {
        console.error(err);
        setGrammar(null);
      }
    };
    fetchGrammar();
  }, [material]);

  const toggleSection = (section) => {
    setActive((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    return () => {
      detener(); // Detiene la voz del hook al desmontar
      if (reconocimientoRef.current) reconocimientoRef.current.stop();
    };
  }, []);

  const renderSection = () => {
    switch (active) {
      case "history":
        return (
          <>
            <h2 className="text-white text-xl mb-4">{SECTIONS.history}</h2>
            {searchHistory.map((item, i) => (
              <div key={i} className="text-gray-300 bg-white/5 p-2 rounded mb-2">
                {item}
              </div>
            ))}
          </>
        );
      case "keywords":
        return (
          <>
            <h2 className="text-white text-xl mb-4">{SECTIONS.keywords}</h2>
            <div className="flex flex-wrap gap-2">
              {(grammar?.sustantivos || []).map((p, i) => (
                <span key={i} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                  {p}
                </span>
              ))}
            </div>
          </>
        );
      case "grammar":
        return (
          <div className="space-y-6 text-white">
            <div>
              <h3 className="text-cyan-400 mb-2">Sustantivos</h3>
              <TypeWriter text={grammar?.panel?.sustantivos || ""} speed={10} />
            </div>
            <div>
              <h3 className="text-green-400 mb-2">Verbos</h3>
              <TypeWriter text={grammar?.panel?.verbos || ""} speed={10} />
            </div>
            <div>
              <h3 className="text-pink-400 mb-2">Adjetivos</h3>
              <TypeWriter text={grammar?.panel?.adjetivos || ""} speed={10} />
            </div>
          </div>
        );
      case "speech":
        return (
          <div className="space-y-6 text-white">
            <h2 className="text-xl flex items-center gap-2">
              <Volume2 className="text-purple-400" /> Narrador
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              
              {/* BOTÓN PRINCIPAL ADAPTADO AL ESTADO DEL HOOK */}
              <div className="flex justify-center py-3">
                {estadoNarrador === 'reproduciendo' ? (
                  <button
                    onClick={pausarNarracion}
                    className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg hover:scale-105 transition"
                    title="Pausar"
                  >
                    <Pause className="w-8 h-8 text-slate-950" />
                  </button>
                ) : estadoNarrador === 'pausado' ? (
                  <button
                    onClick={continuarNarracion}
                    className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:scale-105 transition"
                    title="Continuar"
                  >
                    <Play className="w-8 h-8 text-slate-950 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={iniciarNarracion}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg hover:scale-105 transition"
                    title="Reproducir"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </button>
                )}
              </div>

              {/* BOTONES SECUNDARIOS */}
              <div className="flex justify-center gap-6 text-slate-400">
                <button 
                  onClick={pausarNarracion} 
                  className={`hover:text-white transition ${estadoNarrador === 'pausado' ? "text-yellow-400" : ""}`}
                  title="Pausar"
                >
                  <Pause />
                </button>
                <button 
                  onClick={continuarNarracion} 
                  className={`hover:text-white transition ${estadoNarrador === 'reproduciendo' ? "text-green-400" : ""}`}
                  title="Continuar"
                >
                  <Play />
                </button>
                <button 
                  onClick={detenerNarracion} 
                  className="hover:text-white transition"
                  title="Detener"
                >
                  <Square />
                </button>
              </div>

            </div>
          </div>
        );
      case "Calculos":
        return <CalcGame />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:h-screen overflow-visible">
      <div
        className={`overflow-hidden transition-all duration-300 bg-slate-950/95 md:bg-slate-950/20 backdrop-blur-xl border-white/10 ${
          isOpen
            ? "fixed inset-x-4 bottom-24 h-[45vh] rounded-2xl border z-[100] md:relative md:inset-auto md:w-[380px] md:h-full md:rounded-none md:border-t-0 md:border-l opacity-100 pointer-events-auto"
            : "fixed inset-x-4 bottom-0 h-0 opacity-0 pointer-events-none md:relative md:w-0 md:h-full md:opacity-0 md:pointer-events-none"
        }`}
      >
        <div className={`h-full p-5 overflow-y-auto transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
          <div className="flex justify-end md:hidden mb-2">
            <button onClick={() => toggleSection(active)} className="text-slate-400 text-xs bg-white/5 px-2 py-1 rounded-md border border-white/10 active:bg-white/10">
              ✕ Cerrar
            </button>
          </div>
          {renderSection()}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-20 bg-[#1e293b]/95 backdrop-blur-md border-t border-white/10 flex flex-row items-center justify-start px-5 gap-4 overflow-x-auto no-scrollbar z-[100] md:relative md:bottom-auto md:left-auto md:w-20 md:h-full md:flex-col md:py-10 md:gap-8 md:overflow-x-visible md:border-t-0 md:border-l">
        <button
          onClick={() => toggleSection("history")}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition ${
            active === "history" ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg" : "text-white border-white/10 bg-slate-950/40 hover:text-cyan-400"
          }`}
        >
          <History className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleSection("keywords")}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition ${
            active === "keywords" ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg" : "text-white border-white/10 bg-slate-950/40 hover:text-cyan-400"
          }`}
        >
          <KeyRound className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleSection("grammar")}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition ${
            active === "grammar" ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg" : "text-white border-white/10 bg-slate-950/40 hover:text-cyan-400"
          }`}
        >
          <Brain className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleSection("speech")}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border transition ${
            active === "speech" ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg" : "text-white border-white/10 bg-slate-950/40 hover:text-cyan-400"
          }`}
        >
          <Volume2 className="w-5 h-5" />
        </button>

        <button
          onClick={() => toggleSection("Calculos")}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border text-xl transition ${
            active === "Calculos" ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg" : "border-white/10 bg-slate-950/40 hover:scale-110"
          }`}
        >
          <Gamepad2 className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={handleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition shadow-lg relative ${
            micOn ? "bg-green-500 text-white animate-pulse" : "bg-red-500 text-white"
          }`}
        >
          <Mic className="w-5 h-5" />
          {micOn && <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />}
        </button>

        <button
          onClick={exportarAPDF}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 bg-slate-950/40 text-white hover:text-red-400 transition"
          title="Exportar PDF"
        >
          <FileDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}