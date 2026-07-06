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
  
  // VISOR DE IMANES
  const [selectedImage, setSelectedImage] = useState(null);
  
  const cleanUrl = (url) => {
    if (!url) return "";
    return url.replace(/\[|\]|\(.*?\)/g, "").trim();
  };

  const API_URL = "https://micenidodidactico.onrender.com/api/materials";

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
      loading(false);
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

      console.log("🚀 Buscando en BD valor 100% limpio:", valorLimpio);

      setQuery(valorLimpio);
      handleSearch(valorLimpio);
    }
  
    if (cmd.type === "OPEN_PANEL") setSearched(true);
    if (cmd.type === "CLOSE_PANEL") {
      setSearched(false);
      setQuery("");
      setResults([]);
      setSelectedImage(null);
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

  return (
    // 📱 CAMBIO: En celulares usa "flex-col overflow-y-auto h-auto", en pantallas grandes "md:flex-row md:h-screen md:overflow-hidden"
    <div className="relative flex flex-col md:flex-row h-auto md:h-screen bg-slate-950 text-white overflow-y-auto md:overflow-hidden select-none">
      
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
        .text-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.5);
          border-radius: 4px;
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
          <div className="fixed inset-0 z-1 bg-black/50 pointer-events-none" />
        </>
      )}

      {/* 📌 MAIN CONTENT (IZQUIERDA) */}
      {/* 📱 CAMBIO: Relleno adaptable "p-6 md:p-12" */}
      <div className="flex-1 relative flex flex-col justify-between p-6 md:p-12 overflow-hidden z-10 w-full">
        
        {/* SEARCH BAR */}
        {/* 📱 CAMBIO: En celulares se posiciona de forma estática o fluida según si buscó, evitando "fixed" estricto que tapa cosas */}
        <div
          className={`transition-all duration-500 ease-in-out z-20 ${
            isCompact
              ? "md:fixed md:top-6 md:left-6 w-full md:w-[280px] scale-95 mb-6 md:mb-0"
              : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6"
          }`}
        >
          {!isCompact && (
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold">Biblioteca Digital</h1>
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
              onClick={handleSearch}
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

          {!loading && searched && results.length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              No se encontraron resultados de la búsqueda...
            </p>
          )}
        </div>

        {/* CONTENEDOR DE RESULTADOS */}
        {/* 📱 CAMBIO: Ajuste de márgenes superiores según el dispositivo "mt-4 md:mt-16" */}
        {searched && results.length > 0 && (
          <div className="w-full flex-1 flex flex-col mt-4 md:mt-16 justify-between overflow-hidden">
            {results.map((item, i) => (
              <div key={i} className="w-full flex flex-col flex-1 overflow-hidden justify-between">
                
                {/* 🏷️ TÍTULO */}
                <div className="w-full mb-2 flex-shrink-0">
                  {/* 📱 CAMBIO: El texto ahora mide 32px en celular y 56px en pantallas grandes gracias a "text-3xl md:text-[56px]" */}
                  <h2
                    className="text-left text-white tracking-wide text-3xl md:text-[56px] font-bold"
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      textShadow: "0 0 15px rgba(234, 179, 8, 0.6), 0 0 2px rgba(234, 179, 8, 0.9)",
                    }}
                  >
                    {item.titulo}
                  </h2>
                  <div className="h-[2px] bg-white mt-3 opacity-90 animate-loading-line origin-left" />
                </div>

                {/* 📄 TARJETA DE CONTENIDO */}
                {/* 📱 CAMBIO: Altura máxima flexible. En celu "max-h-[50vh]", en PC "md:max-h-[44vh]" e interlineado adaptable */}
                <div className="w-full flex-1 bg-sky-500/10 backdrop-blur-md border border-sky-400/20 rounded-none p-4 md:p-6 shadow-2xl overflow-y-auto text-scroll my-4 max-h-[50vh] md:max-h-[44vh]">
                  <div
                    className="text-gray-100 leading-7 md:leading-9 whitespace-pre-wrap pr-2 text-base md:text-[20px]"
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                  >
                    <TypeWriter text={item.contenido} />
                  </div>
                </div>

                {/* 🖼️ CUADRÍCULA DE IMÁGENES AL PIE */}
                {getImagesArray(item).length > 0 && (
                  <div className="w-full mb-4 md:mb-2 flex-shrink-0">
                    <p className="text-xs text-sky-300 mb-2 font-semibold uppercase tracking-widest">Imágenes Adjuntas</p>
                    {/* 📱 CAMBIO: En celular se acomoda a 2 columnas fijas y en PC pasa a 4 "grid-cols-2 md:grid-cols-4" */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {getImagesArray(item).slice(0, 4).map((imgUrl, index) => (
                        <div 
                          key={index} 
                          onClick={() => setSelectedImage(imgUrl)}
                          className="group relative aspect-[16/10] bg-black/40 rounded-lg overflow-hidden border border-white/10 shadow-md cursor-pointer hover:scale-[1.02] hover:border-sky-400 transition-all duration-300"
                        >
                          <div className="absolute top-2 left-2 bg-cyan-400 text-slate-950 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shadow-lg select-none">
                            {index + 1}
                          </div>

                          <img 
                            src={imgUrl} 
                            alt={`Galería ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
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

      {/* 📌 PANEL FIJO A LA DERECHA */}
      {/* 📱 CAMBIO: En móviles se pone abajo del todo ocupando el 100% del ancho "w-full md:w-auto" */}
      {searched && (
        <div className="z-20 relative flex-shrink-0 bg-slate-950/30 backdrop-blur-2xl w-full md:w-auto">
          <ButtonPanel
            searchHistory={searchHistory}
            material={results[0]}
            onToggleMic={setMicEnabled}
          />
        </div>
      )}

      {/* 🖼️ VISOR DE IMÁGENES ESTILO PICASA 3 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl font-light hover:text-sky-400 transition z-50"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <div 
            className="max-w-full md:max-w-[85vw] max-h-[85vh] flex items-center justify-center p-2 bg-white/5 border border-white/10 shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Visualización ampliada" 
              className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}