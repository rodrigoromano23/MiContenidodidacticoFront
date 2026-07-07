import { useState, useEffect, useRef } from "react";
import { History, KeyRound, Brain, Volume2, Mic, Play, Pause, Square, FileDown, Gamepad2 } from "lucide-react";
import TypeWriter from "../TypeWriter";
import useSpeech from "../../hooks/useSpeech";
import CalcGame from "../CalcGame";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf"; 

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
  const procesarComandoRef = useRef(null);

  const notificarComando = (mensaje) => {
    console.log(`🎙️ Comando ejecutado: ${mensaje}`);
  };

  const procesarComandoVozGlobal = (frase) => {
    const fraseLimpia = frase.replace(/[\.,]+/g, "").trim();
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
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });
    };

    const comandosPDF = ["descargar pdf", "exportar pdf", "guardar pdf", "bajar pdf"];
    if (comandosPDF.some(keyword => fraseLimpia.includes(keyword))) {
      exportarAPDF(); 
      return;
    }

    if (fraseLimpia.startsWith("buscar ") || fraseLimpia.startsWith("filtrar ")) {
      let terminoBusqueda = fraseLimpia.replace(/^(buscar|filtrar)\s+/, "").trim();
      window.dispatchEvent(new CustomEvent("voz-buscar-titulo", { detail: terminoBusqueda }));
      notificarComando(`Buscando: "${terminoBusqueda}"`);
      return;
    }

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

    if (fraseLimpia.includes("bajar a") || fraseLimpia.includes("ir a las fotos") || fraseLimpia.includes("desplazar a")) {
      window.dispatchEvent(new CustomEvent("comando-hacer-scroll-imagenes"));
      notificarComando("Desplazando a las imágenes");
      return;
    } 

    const comandosCerrarPanel = ["cerrar panel", "ocultar panel", "cerrar menú", "cerrar menu", "ocultar menú", "quitar panel", "salir del panel"];
    if (comandosCerrarPanel.some(keyword => fraseLimpia === keyword || fraseLimpia.includes(keyword))) {
      setActive(null);
      lanzarNotificacion("Panel cerrado", "info");
      return;
    }

    const palabrasCierre = ["cerrar", "ocultar", "quitar", "salir"];
    const palabrasObjetivo = ["panel", "menú", "menu", "pestaña", "pestana", "lateral"];

    const quiereCerrarPanel = palabrasCierre.some(c => fraseLimpia.includes(c)) && 
                               palabrasObjetivo.some(o => fraseLimpia.includes(o));

    if (quiereCerrarPanel) {
      setActive(null);
      lanzarNotificacion("Panel cerrado", "info");
      return; 
    }
    if (fraseLimpia.includes("historial") || fraseLimpia.includes("abrir historial")) {
      setActive("history");
      notificarComando("Mostrando Historial");
    } 
    else if (fraseLimpia.includes("palabras clave") || fraseLimpia.includes("ver palabras")) {
      setActive("keywords");
      notificarComando("Mostrando Palabras Clave");
    } 
    else if (fraseLimpia.includes("gramática") || fraseLimpia.includes("ver gramática")) {
      setActive("grammar");
      notificarComando("Análisis Gramatical");
    } 
    else if (fraseLimpia.includes("narrador") || fraseLimpia.includes("abrir narrador")) {
      setActive("speech");
      notificarComando("Panel del Narrador");
    } 
    else if (fraseLimpia.includes("juego") || fraseLimpia.includes("cálculos")) {
      setActive("Calculos");
      notificarComando("Abriendo juego");
    } 
  };

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
            <h2 className="text-white text-xl mb-4">{SECTIONS.history}</h2>
            {searchHistory.map((item, i) => (
              <div key={i} className="text-gray-300 bg-white/5 p-2 rounded mb-2">{item}</div>
            ))}
          </>
        );
      case "keywords":
        return (
          <>
            <h2 className="text-white text-xl mb-4">{SECTIONS.keywords}</h2>
            <div className="flex flex-wrap gap-2">
              {(grammar?.sustantivos || []).map((p, i) => (
                <span key={i} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">{p}</span>
              ))}
            </div>
          </>
        );
      case "grammar":
        return (
          <div className="space-y-6 text-white">
            <div><h3 className="text-cyan-400 mb-2">Sustantivos</h3><TypeWriter text={grammar?.panel?.sustantivos || ""} speed={10} /></div>
            <div><h3 className="text-green-400 mb-2">Verbos</h3><TypeWriter text={grammar?.panel?.verbos || ""} speed={10} /></div>
            <div><h3 className="text-pink-400 mb-2">Adjetivos</h3><TypeWriter text={grammar?.panel?.adjetivos || ""} speed={10} /></div>
          </div>
        );
      case "speech":
        return (
          <div className="space-y-6 text-white">
            <h2 className="text-xl flex items-center gap-2"><Volume2 className="text-purple-400" /> Narrador</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
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
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
              <div className="flex justify-center gap-6 text-slate-400">
                <button onClick={() => { pause(); setIsSpeaking(false); }}><Pause /></button>
                <button onClick={() => { resume(); setIsSpeaking(true); }}><Play /></button>
                <button onClick={() => { stop(); setIsSpeaking(false); setProgress(0); }}><Square /></button>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        );
      case "Calculos": return <CalcGame />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:h-screen overflow-visible">
      
      {/* PANEL FLOTANTE DESPLEGABLE */}
      <div className={`overflow-hidden transition-all duration-500 bg-slate-950/95 md:bg-slate-950/20 backdrop-blur-xl border-white/10 ${
        isOpen 
          ? "fixed inset-x-0 bottom-24 top-20 z-40 md:relative md:inset-auto md:w-[380px] md:h-full border-t md:border-t-0 md:border-l" 
          : "w-0 h-0 md:w-0 md:h-full"
      }`}>
        <div className={`h-full p-6 overflow-y-auto transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
          {renderSection()}
        </div>
      </div>

      {/* 🎛️ CONTENEDOR DE BOTONES (Corregido con h-20 para centrar botones verticales en móvil) */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-[#1e293b]/95 backdrop-blur-md border-t border-white/10 flex flex-row items-center justify-start px-5 gap-4 overflow-x-auto no-scrollbar z-50 md:relative md:bottom-auto md:left-auto md:w-20 md:h-full md:flex-col md:py-10 md:gap-8 md:overflow-x-visible md:border-t-0 md:border-l">
        
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
  )};