import { useState, useEffect } from "react";
import ButtonPanel from "../components/button/Button";
import VoiceAssistant from "../components/VoiceAssistant";
import TypeWriter from "../components/TypeWriter";
import Loader from "../components/Loader";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [aiData, setAiData] = useState(null);
  
  // Estado para controlar qué sección del panel cuadrado está expandida en Mobile
  const [seccionAbierta, setSeccionAbierta] = useState(null);
  
  // VISOR DE IMANES
  const [selectedImage, setSelectedImage] = useState(null);
  
  const cleanUrl = (url) => {
    if (!url) return "";
    return url.replace(/\[|\]|\(.*?\)/g, "").trim();
  };

  const API_URL = "https://micontenidodidactico.onrender.com/api/materials";

  const fetchMaterials = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data;
  };

  const [micEnabled, setMicEnabled] = useState(false);

  const realSearch = (materials, value) => {
    return materials.filter((item) =>
      item.titulo.toLowerCase().includes(value.toLowerCase())
    );
  };

  const handleSearch = async (forcedQuery) => {
    const textoABuscar = typeof forcedQuery === "string" ? forcedQuery : query;
    if (!textoABuscar.trim()) return;

    setLoading(true);
    setSearched(true);

    setSearchHistory((prev) => {
      const updated = [textoABuscar, ...prev];
      return updated.slice(0, 10);
    });

    try {
      const materials = await fetchMaterials();
      const filtered = realSearch(materials, textoABuscar);

      if (filtered.length > 0) {
        setResults([filtered[0]]);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const isCompact = searched || query.length > 0;

  const getImagesArray = (item) => {
    if (!item) return [];
    if (Array.isArray(item.imagenes)) return item.imagenes;
    return item.imagen ? [item.imagen] : [];
  };

  const handleVoiceCommand = (cmd) => {
    console.log("Comando de voz recibido en Home:", cmd);

    if (cmd.type === "SEARCH") {
      const valorLimpio = cmd.value && typeof cmd.value === "string"
        ? cmd.value.replace(/[\.,]+/g, "").trim()
        : cmd.value;

      setQuery(valorLimpio);
      handleSearch(valorLimpio);
    }
  
    if (cmd.type === "OPEN_PANEL") setSearched(true);
    if (cmd.type === "CLOSE_PANEL") {
      setSearched(false);
      setQuery("");
      setResults([]);
      setSelectedImage(null);
      setSeccionAbierta(null);
    }

    if (cmd.type === "OPEN_IMAGES" || cmd.type === "VIEW_IMAGES") {
      if (results.length > 0) {
        const imagenes = getImagesArray(results[0]);
        if (imagenes.length > 0) {
          setSelectedImage(imagenes[0]);
        }
      }
    }

    if (cmd.type === "CLOSE_IMAGES") {
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const manejarBusquedaVoz = (e) => {
      const palabraClave = e.detail;
      setQuery(palabraClave);
      handleSearch(palabraClave);
    };

    const manejarImagenesVoz = (e) => {
      const { accion, numero } = e.detail || {};
      const accionReal = typeof e.detail === "string" ? e.detail : accion;

      if (accionReal === "ABRIR" && results.length > 0) {
        const imagenes = getImagesArray(results[0]);
        if (imagenes.length > 0) {
          if (numero && imagenes[numero - 1]) {
            setSelectedImage(imagenes[numero - 1]);
          } else {
            setSelectedImage(imagenes[0]); 
          }
        }
      } else if (accionReal === "CERRAR") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("voz-buscar-titulo", manejarBusquedaVoz);
    window.addEventListener("voz-control-imagenes", manejarImagenesVoz);

    return () => {
      window.removeEventListener("voz-buscar-titulo", manejarBusquedaVoz);
      window.removeEventListener("voz-control-imagenes", manejarImagenesVoz);
    };
  }, [results]);

  if (showIntro) {
    return <Loader />;
  }

  // Alternar acordeón móvil
  const toggleSeccionMobile = (seccion) => {
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  };

  // Función dummy para simular descarga de PDF o integrarla con tu librería
  const handleDescargarPDF = () => {
    alert("Generando y descargando PDF del material...");
  };

  return (
    <div className="relative flex h-screen bg-slate-950 text-white overflow-hidden select-none">
      
      <style>{`
        @keyframes expandLine {
          from { width: 0%; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        .animate-loading-line {
          animation: expandLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .text-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .text-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .text-scroll::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.3);
          border-radius: 4px;
        }
        /* Ocultar barra de scroll en el footer horizontal móvil */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <VoiceAssistant
        enabled={micEnabled}
        onToggleMic={setMicEnabled}
        onCommand={handleVoiceCommand}
      />

      {searched && results[0]?.portada && (
        <>
          <div
            className="fixed inset-0 z-1 bg-cover bg-center bg-no-repeat transition-all duration-700"
            style={{ backgroundImage: `url(${results[0].portada})` }}
          />
          <div className="fixed inset-0 z-1 bg-black/60 pointer-events-none" />
        </>
      )}

      {/* ========================================== */}
      {/* 📱 INTERFAZ EXCLUSIVA PARA DISPOSITIVOS MÓVILES */}
      {/* ========================================== */}
      <div className="flex md:hidden flex-1 flex-col relative w-full h-full z-10 overflow-hidden">
        
        {/* Barra de búsqueda móvil reactiva (Arriba cuando busca / Al centro al inicio) */}
        <div className={`transition-all duration-500 ease-in-out left-0 w-full px-4 z-30 ${
          isCompact ? "absolute top-4" : "absolute top-1/3 -translate-y-1/2"
        }`}>
          {!isCompact && (
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">Biblioteca Digital</h1>
              <p className="text-xs text-slate-400 mt-1">Escribe tu tema de estudio</p>
            </div>
          )}
          <div className="relative max-w-sm mx-auto shadow-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar temas..."
              className="w-full py-3.5 pl-5 pr-12 rounded-full bg-white text-black text-sm focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2.5 rounded-full"
            >
              🔍
            </button>
          </div>
          {loading && (
            <div className="flex justify-center mt-3">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Bloque principal móvil con scroll (Dejando espacio para el buscador y footer) */}
        {searched && results.length > 0 && (
          <div className="w-full flex-1 overflow-y-auto px-4 pt-24 pb-28 space-y-6">
            
            {/* Título Dinámico Principal */}
            <div className="text-center pt-2">
              <h2 className="text-3xl font-bold text-center text-white tracking-wide" style={{ fontFamily: '"Times New Roman", serif', textShadow: "0 0 10px rgba(234, 179, 8, 0.7)" }}>
                {results[0].titulo}
              </h2>
              <div className="h-[2px] bg-cyan-400 max-w-[150px] mx-auto mt-2 opacity-80" />
            </div>

            {/* 📥 CONTENEDORES DESPLEGABLES (Se abren arriba de la caja de contenido) */}
            <div className="max-w-sm mx-auto w-full">
              {seccionAbierta === "historial" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs space-y-2 mb-4">
                  <p className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">Búsquedas Recientes</p>
                  {searchHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {searchHistory.map((h, idx) => (
                        <span key={idx} onClick={() => { setQuery(h); handleSearch(h); }} className="bg-slate-950 text-cyan-400 px-2.5 py-1 rounded border border-white/5 text-[11px] font-medium cursor-pointer">{h}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-1">Historial vacío.</p>
                  )}
                </div>
              )}

              {seccionAbierta === "keywords" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs space-y-1 mb-4">
                  <p className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">Palabras Clave del Tema</p>
                  <p className="text-slate-300 pt-1">Aquí van las palabras clave extraídas automáticamente de: <span className="text-white italic">"{results[0].titulo}"</span>.</p>
                </div>
              )}

              {seccionAbierta === "gramatica" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs space-y-1 mb-4">
                  <p className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">Análisis Gramatical</p>
                  <p className="text-slate-300 pt-1">Módulo interactivo para analizar las estructuras sintácticas y tiempos verbales del texto actual.</p>
                </div>
              )}

              {seccionAbierta === "narrador" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs text-center space-y-2 mb-4">
                  <p className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">Texto a Voz (TTS)</p>
                  <button className="bg-cyan-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider shadow-md">▶️ Escuchar Contenido</button>
                </div>
              )}

              {seccionAbierta === "juego" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs space-y-1.5 mb-4">
                  <p className="text-cyan-400 font-bold font-mono text-[10px] uppercase tracking-wider border-b border-white/5 pb-1">Desafío Matemático (Cálculos)</p>
                  <p className="text-slate-300">¡Hora de agilizar la mente! Resolvé el siguiente cálculo basado en el contenido didáctico.</p>
                </div>
              )}

              {seccionAbierta === "micro" && (
                <div className="bg-slate-900/90 border border-red-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs text-center space-y-1 mb-4">
                  <p className="text-red-400 font-bold font-mono text-[10px] uppercase tracking-wider">Asistente por Voz</p>
                  <p className="text-slate-300">Micrófono {micEnabled ? "ACTIVADO" : "DESACTIVADO"}. Comandos de control listos para escuchar.</p>
                </div>
              )}

              {seccionAbierta === "pdf" && (
                <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-xl animate-fadeIn shadow-xl text-xs text-center space-y-1 mb-4">
                  <p className="text-emerald-400 font-bold font-mono text-[10px] uppercase tracking-wider">Documento Exportado</p>
                  <p className="text-slate-300">El PDF se ha estructurado con éxito para su lectura offline.</p>
                </div>
              )}
            </div>

            {/* CAJA PRINCIPAL DE CONTENIDO */}
            <div className="w-full bg-slate-950/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl">
              <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                <TypeWriter text={results[0].contenido} />
              </div>
            </div>

            {/* IMÁGENES ABAJO DEL CONTENIDO */}
            {getImagesArray(results[0]).length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest pl-1">Imágenes Adjuntas</p>
                <div className="grid grid-cols-1 gap-3">
                  {getImagesArray(results[0]).slice(0, 4).map((imgUrl, index) => (
                    <div key={index} onClick={() => setSelectedImage(imgUrl)} className="relative aspect-[16/10] bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                      <div className="absolute top-2 left-2 bg-cyan-400 text-slate-950 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs z-10">{index + 1}</div>
                      <img src={imgUrl} alt={`Móvil ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <p className="text-center text-xs text-slate-400 mt-20">No se encontraron resultados disponibles.</p>
        )}

        {/* 🎛️ FOOTER FIJO CON SCROLL HORIZONTAL (Acá inyectaremos tu ButtonPanel Móvil) */}
        {searched && (
          <div className="fixed bottom-0 left-0 w-full bg-slate-900/85 backdrop-blur-md border-t border-white/10 px-4 py-3 z-40 overflow-x-auto no-scrollbar flex items-center gap-5">
            {/* Llamamos a tu panel para que renderice los 7 botones reales */}
            <ButtonPanel
              searchHistory={searchHistory}
              material={results[0]}
              onToggleMic={setMicEnabled}
              seccionAbierta={seccionAbierta}
              setSeccionAbierta={setSeccionAbierta}
              isMobile={true}
            />
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 🖥️ INTERFAZ EXCLUSIVA PARA ESCRITORIO (MD Y SUPERIOR) */}
      {/* ========================================== */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-12 overflow-hidden z-10">
        
        <div className={`fixed transition-all duration-500 ease-in-out z-20 ${
          isCompact ? "top-6 left-6 w-[280px] scale-95" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
        }`}>
          {!isCompact && (
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold">Biblioteca Digital</h1>
              <p className="text-gray-400 mt-2">Buscá materiales de estudio</p>
            </div>
          )}

          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar temas..."
              className="w-full py-4 pl-5 pr-14 rounded-full bg-white text-black focus:outline-none"
            />
            <button
              onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-full"
            >
              🔍
            </button>
          </div>

          {loading && (
            <div className="flex justify-center mt-4">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {searched && results.length > 0 && (
          <div className="w-full flex-1 flex flex-col mt-16 justify-between overflow-hidden">
            {results.map((item, i) => (
              <div key={i} className="w-full flex flex-col flex-1 overflow-hidden justify-between">
                
                <div className="w-full mb-2 flex-shrink-0">
                  <h2 className="text-left text-white tracking-wide" style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: "56px", fontWeight: "bold", textShadow: "0 0 15px rgba(234, 179, 8, 0.6), 0 0 2px rgba(234, 179, 8, 0.9)" }}>
                    {item.titulo}
                  </h2>
                  <div className="h-[2px] bg-white mt-3 opacity-90 animate-loading-line origin-left" />
                </div>

                <div className="w-full flex-1 bg-sky-500/10 backdrop-blur-md border border-sky-400/20 rounded-none p-6 shadow-2xl overflow-y-auto text-scroll my-4 max-h-[44vh]">
                  <div className="text-gray-100 leading-9 whitespace-pre-wrap pr-2" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "20px" }}>
                    <TypeWriter text={item.contenido} />
                  </div>
                </div>

                {getImagesArray(item).length > 0 && (
                  <div className="w-full mb-2 flex-shrink-0">
                    <p className="text-xs text-sky-300 mb-2 font-semibold uppercase tracking-widest">Imágenes Adjuntas</p>
                    <div className="grid grid-cols-4 gap-4">
                      {getImagesArray(item).slice(0, 4).map((imgUrl, index) => (
                        <div key={index} onClick={() => setSelectedImage(imgUrl)} className="group relative aspect-[16/10] bg-black/40 rounded-lg overflow-hidden border border-white/10 shadow-md cursor-pointer hover:scale-[1.02] hover:border-sky-400 transition-all duration-300">
                          <div className="absolute top-2 left-2 bg-cyan-400 text-slate-950 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">{index + 1}</div>
                          <img src={imgUrl} alt={`Galería ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL FIJO A LA DERECHA (SÓLO ESCRITORIO) */}
      {searched && (
        <div className="hidden md:block z-20 relative flex-shrink-0 bg-slate-950/30 backdrop-blur-2xl">
          <ButtonPanel
            searchHistory={searchHistory}
            material={results[0]}
            onToggleMic={setMicEnabled}
          />
        </div>
      )}

      {/* VISOR GLOBAL DE IMÁGENES */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white text-4xl font-light hover:text-sky-400 transition" onClick={() => setSelectedImage(null)}>✕</button>
          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center p-2 bg-white/5 border border-white/10 shadow-2xl rounded-sm" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Visualización ampliada" className="max-w-full max-h-[80vh] object-contain shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
