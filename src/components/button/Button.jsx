import { useState, useEffect, useRef } from "react";
import { History, KeyRound, Brain, Volume2, Mic, Play, Pause, Square, FileDown } from "lucide-react";
import TypeWriter from "../TypeWriter";
import useSpeech from "../../hooks/useSpeech";
import CalcGame from "../CalcGame";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf"; // 📄 Importamos jsPDF para generar el documento

const SECTIONS = {
  history: "Historial",
  keywords: "Palabras clave",
  grammar: "Gramática",
  speech: "Narrador",
  Calculos: "Juego (Cálculos)"
};

export default function ButtonPanel({
  searchHistory = [],
  material,
  onToggleMic,
}) {
  const [active, setActive] = useState(null);
  const [micOn, setMicOn] = useState(false);
  const reconocimientoRef = useRef(null);

  // Audio / Narrador estados
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const intervalRefAudio = useRef(null);

  const [grammar, setGrammar] = useState(null);
  const lastMaterialRef = useRef(null);
  const { speak, pause, resume, stop } = useSpeech();

  const isOpen = active !== null;

  // Creamos una referencia persistente para que el motor de voz siempre ejecute la lógica actualizada
  const procesarComandoRef = useRef(null);

  const notificarComando = (mensaje) => {
    console.log(`🎙️ Comando ejecutado: ${mensaje}`);
  };

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
      iconColor: "#22d3ee", // Cyan combinado con tu UI
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  };

  const procesarComandoVozGlobal = (frase) => {
    // 🎯 LIMPIEZA INICIAL
    const fraseLimpia = frase.replace(/[\.,]+/g, "").trim();
    console.log("Procesando frase limpia en Panel:", fraseLimpia);

    // 📄 1. CONTROL DE DESCARGA DE PDF POR VOZ
    const comandosPDF = ["descargar pdf", "exportar pdf", "guardar pdf", "bajar pdf"];
    if (comandosPDF.some(keyword => fraseLimpia.includes(keyword))) {
      exportarAPDF(); 
      return;
    }

    // 🔍 2. CONTROL DE BUSCADOR DE TÍTULOS EXTERNO (HOME)
    if (fraseLimpia.startsWith("buscar ") || fraseLimpia.startsWith("filtrar ")) {
      let terminoBusqueda = fraseLimpia.replace(/^(buscar|filtrar)\s+/, "").trim();
      window.dispatchEvent(new CustomEvent("voz-buscar-titulo", { detail: terminoBusqueda }));
      notificarComando(`Buscando: "${terminoBusqueda}"`);
      return;
    }

    // 🖼️ 3. CONTROL DEL VISOR DE IMÁGENES
    const abrirVisorKeywords = ["galería", "galeria", "ampliar", "expandir", "ver fotos", "ver imagenes", "ver imágenes", "abrir imagen", "abrir foto", "abrir la imagen"];
    const cerrarVisorKeywords = ["cerrar", "quitar", "ocultar foto", "ocultar galería", "salir de la imagen", "cerrar imagen"];

    const quiereAbrir = abrirVisorKeywords.some(keyword => fraseLimpia.includes(keyword));
    const quiereCerrar = cerrarVisorKeywords.some(keyword => fraseLimpia.includes(keyword));

    if (quiereAbrir) {
      let numeroDetectado = null;
      const numerosEnLetras = { "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6 };
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

      window.dispatchEvent(new CustomEvent("voz-control-imagenes", { 
        detail: { accion: "ABRIR", numero: numeroDetectado } 
      }));
      
      if (numeroDetectado) {
        notificarComando(`Abriendo imagen número ${numeroDetectado}`);
      } else {
        notificarComando("Abriendo galería de imágenes");
      }
      return;
    }

    if (quiereCerrar) {
      window.dispatchEvent(new CustomEvent("voz-control-imagenes", { 
        detail: { accion: "CERRAR" } 
      }));
      notificarComando("Imagen cerrada");
      return;
    }

    // 🖼️ 4. CONTROL DE SCROLL DE IMÁGENES
    if (fraseLimpia.includes("bajar a") || fraseLimpia.includes("ir a las fotos") || fraseLimpia.includes("desplazar a")) {
      window.dispatchEvent(new CustomEvent("comando-hacer-scroll-imagenes"));
      notificarComando("Desplazando a las imágenes");
      return;
    } 

    // 🎛️ 5. COMANDO GENERAL PARA CERRAR CUALQUIER PANEL
    const comandosCerrarPanel = ["cerrar panel", "ocultar panel", "cerrar menú", "cerrar menu", "ocultar menú", "quitar panel", "salir del panel", "cerrar pestaña", "cerrar pestana"];
    if (comandosCerrarPanel.some(keyword => fraseLimpia === keyword || fraseLimpia.includes(keyword))) {
      setActive(null);
      lanzarNotificacion("Panel cerrado", "info");
      return;
    }

    // 🎛️ 6. MANIPULACIÓN LOCAL DEL PANEL LATERAL (APERTURAS)
    if (fraseLimpia.includes("historial") || fraseLimpia.includes("abrir historial")) {
      setActive("history");
      lanzarNotificacion("Mostrando Historial", "success");
    } 
    else if (fraseLimpia.includes("palabras clave") || fraseLimpia.includes("ver palabras") || fraseLimpia.includes("palabras claves")) {
      setActive("keywords");
      lanzarNotificacion("Mostrando Palabras Clave", "success");
    } 
    else if (fraseLimpia.includes("gramática") || fraseLimpia.includes("ver gramática") || fraseLimpia.includes("gramatica")) {
      setActive("grammar");
      lanzarNotificacion("Análisis Gramatical", "success");
    } 
    else if (fraseLimpia.includes("narrador") || fraseLimpia.includes("abrir narrador")) {
      setActive("speech");
      lanzarNotificacion("Panel del Narrador", "success");
    } 
    else if (fraseLimpia.includes("juego") || fraseLimpia.includes("cálculos") || fraseLimpia.includes("calculos")) {
      setActive("Calculos");
      lanzarNotificacion("Abriendo juego", "success");
    } 
  };

  // Mantenemos la referencia siempre al día con los últimos estados
  useEffect(() => {
    procesarComandoRef.current = procesarComandoVozGlobal;
  });

  /* ---------------- 🎙️ MOTOR DE VOZ GLOBAL ---------------- */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Este navegador no soporta el reconocimiento de voz nativo.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const frase = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
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
      if (micOn) {
        setTimeout(() => {
          try { 
            recognition.start(); 
            console.log("🎙️ Micrófono reconectado automáticamente.");
          } catch (e) {}
        }, 300);
      }
    };
    reconocimientoRef.current = recognition;
  }, [micOn]);

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
  }, [micOn]);

  const handleMic = () => {
    setMicOn((prev) => {
      const nuevoEstado = !prev;
      if (reconocimientoRef.current) {
        if (nuevoEstado) { 
          try { reconocimientoRef.current.start(); } catch(e) {} 
        } else { 
          try { reconocimientoRef.current.stop(); } catch(e) {} 
        }
      }
      onToggleMic?.(nuevoEstado);
      return nuevoEstado;
    });
  };

  const handleFinish = () => {
    clearInterval(intervalRefAudio.current);
    setIsSpeaking(false);
    setProgress(100);
    Swal.fire({ icon: "success", title: "Narración finalizada", timer: 2000, showConfirmButton: false });
  };

  /* ---------------- 📄 EXPORTAR A PDF CON jspdf ---------------- */
  const exportarAPDF = () => {
    if (!material || !material.contenido) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "No hay contenido disponible para exportar en este momento.",
        background: "#0f172a",
        color: "#f59e0b"
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
        color: "#22d3ee"
      });

    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al intentar compilar el PDF.",
        background: "#0f172a",
        color: "#ef4444"
      });
    }
  };

  useEffect(() => {
    if (!material?.contenido) { setGrammar(null); return; }
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
      } catch (err) { console.error(err); setGrammar(null); }
    };
    fetchGrammar();
  }, [material]);

  const toggleSection = (section) => { setActive((prev) => (prev === section ? null : section)); };

  useEffect(() => {
    return () => {
      clearInterval(intervalRefAudio.current);
      if (reconocimientoRef.current) reconocimientoRef.current.stop();
    };
  }, []);

  const renderSection = () => {
    switch (active) {
      case "history":
        return (
          <>
            <h2 className="text-white text-xl mb-4 font-bold border-b border-white/10 pb-2">{SECTIONS.history}</h2>
            <div className="space-y-2">
              {searchHistory.length > 0 ? (
                searchHistory.map((item, i) => (
                  <div key={i} className="text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 text-sm">{item}</div>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">Sin búsquedas recientes.</p>
              )}
            </div>
          </>
        );
      case "keywords":
        return (
          <>
            <h2 className="text-white text-xl mb-4 font-bold border-b border-white/10 pb-2">{SECTIONS.keywords}</h2>
            <div className="flex flex-wrap gap-2">
              {(grammar?.sustantivos || []).length > 0 ? (
                (grammar.sustantivos).map((p, i) => (
                  <span key={i} className="bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-medium border border-cyan-500/30">{p}</span>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">No se han extraído palabras clave.</p>
              )}
            </div>
          </>
        );
      case "grammar":
        return (
          <div className="space-y-6 text-white">
            <h2 className="text-white text-xl mb-2 font-bold border-b border-white/10 pb-2">{SECTIONS.grammar}</h2>
            <div><h3 className="text-cyan-400 font-semibold mb-1 text-sm uppercase tracking-wider">Sustantivos</h3><TypeWriter text={grammar?.panel?.sustantivos || "Cargando análisis..."} speed={10} /></div>
            <div><h3 className="text-green-400 font-semibold mb-1 text-sm uppercase tracking-wider">Verbos</h3><TypeWriter text={grammar?.panel?.verbos || "Cargando análisis..."} speed={10} /></div>
            <div><h3 className="text-pink-400 font-semibold mb-1 text-sm uppercase tracking-wider">Adjetivos</h3><TypeWriter text={grammar?.panel?.adjetivos || "Cargando análisis..."} speed={10} /></div>
          </div>
        );
      case "speech":
        return (
          <div className="space-y-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-2"><Volume2 className="text-purple-400" /> {SECTIONS.speech}</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-center py-3">
                <button
                  onClick={() => {
                    const text = material?.contenido || "";
                    if (!text) return;
                    stop(); setProgress(0); setIsSpeaking(true);
                    let i = 0; const total = text.length;
                    speak(text, { volume, onEnd: handleFinish });
                    clearInterval(intervalRefAudio.current);
                    intervalRefAudio.current = setInterval(() => { i++; setProgress(Math.min((i / total) * 100, 100)); }, 100);
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg hover:scale-105 transition transform"
                >
                  <Play className="w-7 h-7 text-white ml-1" />
                </button>
              </div>
              <div className="flex justify-center gap-6 text-slate-400 border-t border-white/5 pt-3">
                <button className="hover:text-white transition" onClick={() => { pause(); setIsSpeaking(false); }}><Pause className="w-5 h-5" /></button>
                <button className="hover:text-white transition" onClick={() => { resume(); setIsSpeaking(true); }}><Play className="w-5 h-5" /></button>
                <button className="hover:text-red-400 transition" onClick={() => { stop(); setIsSpeaking(false); setProgress(0); }}><Square className="w-5 h-5" /></button>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        );
      case "Calculos": 
        return (
          <div className="text-white animate-fadeIn">
            <h2 className="text-white text-xl mb-4 font-bold border-b border-white/10 pb-2">{SECTIONS.Calculos}</h2>
            <CalcGame />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-visible">
      {/* Contenedor dinámico del contenido de la pestaña */}
      <div className={`border-l border-white/10 overflow-hidden transition-all duration-500 bg-slate-950/40 backdrop-blur-xl ${isOpen ? "w-[380px]" : "w-0"}`}>
        <div className={`h-full p-6 overflow-y-auto text-scroll transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>{renderSection()}</div>
      </div>

      {/* Barra de Íconos Vertical Fija */}
      <div className="w-20 bg-slate-900/60 backdrop-blur-md border-l border-white/10 flex flex-col items-center py-10 justify-between h-full z-10">
        
        {/* Bloque superior de botones */}
        <div className="flex flex-col items-center gap-7 w-full">
          <button 
            onClick={() => toggleSection("history")} 
            className={`transition p-2 rounded-xl ${active === "history" ? "text-cyan-400 bg-white/5" : "text-slate-400 hover:text-white"}`}
            title="Historial"
          >
            <History className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleSection("keywords")} 
            className={`transition p-2 rounded-xl ${active === "keywords" ? "text-cyan-400 bg-white/5" : "text-slate-400 hover:text-white"}`}
            title="Palabras clave"
          >
            <KeyRound className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleSection("grammar")} 
            className={`transition p-2 rounded-xl ${active === "grammar" ? "text-cyan-400 bg-white/5" : "text-slate-400 hover:text-white"}`}
            title="Gramática"
          >
            <Brain className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleSection("speech")} 
            className={`transition p-2 rounded-xl ${active === "speech" ? "text-cyan-400 bg-white/5" : "text-slate-400 hover:text-white"}`}
            title="Narrador"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => toggleSection("Calculos")} 
            className={`text-xl p-1.5 rounded-xl transition ${active === "Calculos" ? "bg-white/5 scale-110" : "opacity-60 hover:opacity-100 hover:scale-110"}`}
            title="Juego de Cálculos"
          >
            🎮
          </button>
        </div>
        
        {/* Bloque inferior (Micrófono y PDF) */}
        <div className="flex flex-col items-center gap-6 w-full">
          <button 
            onClick={handleMic} 
            className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-lg relative ${micOn ? "bg-green-500 text-white animate-pulse" : "bg-red-500/80 hover:bg-red-500 text-white"}`}
            title={micOn ? "Desactivar Micrófono" : "Activar Micrófono"}
          >
            <Mic className="w-5 h-5" />
            {micOn && <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />}
          </button>

          <button 
            onClick={exportarAPDF} 
            className="text-slate-400 hover:text-red-400 transition flex flex-col items-center gap-1 group"
            title="Exportar PDF"
          >
            <FileDown className="w-5 h-5 group-hover:scale-105 transition" />
            <span className="text-[9px] font-medium tracking-wider text-slate-500 group-hover:text-slate-300">PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}