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
  
  // VISOR DE IMAGENES
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

  // REFACTORIZADO: Acepta opcionalmente un string directo para que los comandos de voz no dependan del estado asíncrono
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

  // Capturador y ejecutor de comandos por voz globales
  const handleVoiceCommand = (cmd) => {
    console.log("Comando de voz recibido en Home:", cmd);

    // 🔍 COMANDO: BUSCAR CONTENIDO EN TIEMPO REAL
    if (cmd.type === "SEARCH") {
      const valorLimpio = cmd.value && typeof cmd.value === "string"
        ? cmd.value.replace(/[\.,]+/g, "").trim()
        : cmd.value;

      console.log("🚀 Buscando en BD valor 100% limpio:", valorLimpio);

      setQuery(valorLimpio);
      handleSearch(valorLimpio); // Dispara la búsqueda inmediata en base de datos sin puntos molestos
    }
  

    // 🎛️ COMANDOS: CONTROL DE VISTAS
    if (cmd.type === "OPEN_PANEL") setSearched(true);
    if (cmd.type === "CLOSE_PANEL") {
      setSearched(false);
      setQuery("");
      setResults([]);
      setSelectedImage(null);
    }

    // 🖼️ COMANDOS: SECCIÓN DE IMÁGENES
    if (cmd.type === "OPEN_IMAGES" || cmd.type === "VIEW_IMAGES") {
      // Si hay un resultado cargado y contiene imágenes, abre la primera en el visor Picasa
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
  // 👈 3. Añade este useEffect para apagar la intro a los 8 segundos exactos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 8000); // 8000 milisegundos = 8 segundos

    return () => clearTimeout(timer);
  }, []);


  // 🎙️ ESCUCHADORES DE COMANDOS DE VOZ DESDE EL PANEL DE BOTONES
  useEffect(() => {
    // Escuchar cuando se pida buscar algo
    const manejarBusquedaVoz = (e) => {
      const palabraClave = e.detail;
      setQuery(palabraClave);
      handleSearch(palabraClave); // Ejecuta la búsqueda real inmediatamente
    };

    // ✨ ESCUCHA ACTUALIZADA: Recibe un objeto { accion, numero }
    const manejarImagenesVoz = (e) => {
      const { accion, numero } = e.detail || {};
      
      // Manejar la acción por si envían un string directo o el objeto estructurado
      const accionReal = typeof e.detail === "string" ? e.detail : accion;

      if (accionReal === "ABRIR" && results.length > 0) {
        const imagenes = getImagesArray(results[0]);
        if (imagenes.length > 0) {
          // Si especificó un número válido (ej: imagen 2 -> índice 1), abre esa. Si no, abre la primera [0].
          if (numero && imagenes[numero - 1]) {
            setSelectedImage(imagenes[numero - 1]);
          } else {
            setSelectedImage(imagenes[0]); 
          }
        }
      } else if (accionReal === "CERRAR") {
        setSelectedImage(null); // Cierra el visor Picasa
      }
    };

    // Registrar los eventos globales en el navegador
    window.addEventListener("voz-buscar-titulo", manejarBusquedaVoz);
    window.addEventListener("voz-control-imagenes", manejarImagenesVoz);

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener("voz-buscar-titulo", manejarBusquedaVoz);
      window.removeEventListener("voz-control-imagenes", manejarImagenesVoz);
    };
  }, [results]); // Se actualiza si cambian los resultados para poder abrir la imagen correcta
  if (showIntro) {
    return <Loader />; // Si showIntro es true, se renderiza la presentación futurista cubriendo todo
  }

  return (
    <div className="relative flex h-screen bg-slate-950 text-white overflow-hidden select-none">
      
      {/* 🎙 INYECCIÓN DE ESTILOS CSS PARA LA LÍNEA Y EL SCROLL INTERNO */}
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

      {/* 🎙 VOZ GLOBAL ENLAZADA A INTERFAZ */}
      <VoiceAssistant
        enabled={micEnabled}
        onToggleMic={setMicEnabled}
        onCommand={handleVoiceCommand}
      />

      {/* 🖼️ PORTADA DE FONDO FIJA */}
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
      <div className="flex-1 relative flex flex-col justify-between p-12 overflow-hidden z-10">
        
        {/* SEARCH BAR */}
        <div
          className={`fixed transition-all duration-500 ease-in-out z-20 ${
            isCompact
              ? "top-6 left-6 w-[280px] scale-95"
              : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
          }`}
        >
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
        {searched && results.length > 0 && (
          <div className="w-full flex-1 flex flex-col mt-16 justify-between overflow-hidden">
            {results.map((item, i) => (
              <div key={i} className="w-full flex flex-col flex-1 overflow-hidden justify-between">
                
                {/* 🏷️ TÍTULO */}
                <div className="w-full mb-2 flex-shrink-0">
                  <h2
                    className="text-left text-white tracking-wide"
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontSize: "56px",
                      fontWeight: "bold",
                      textShadow: "0 0 15px rgba(234, 179, 8, 0.6), 0 0 2px rgba(234, 179, 8, 0.9)",
                    }}
                  >
                    {item.titulo}
                  </h2>
                  <div className="h-[2px] bg-white mt-3 opacity-90 animate-loading-line origin-left" />
                </div>

                {/* 📄 TARJETA DE CONTENIDO */}
                <div className="w-full flex-1 bg-sky-500/10 backdrop-blur-md border border-sky-400/20 rounded-none p-6 shadow-2xl overflow-y-auto text-scroll my-4 max-h-[44vh]">
                  <div
                    className="text-gray-100 leading-9 whitespace-pre-wrap pr-2"
                    style={{
                      fontFamily: "Arial, Helvetica, sans-serif",
                      fontSize: "20px",
                    }}
                  >
                    <TypeWriter text={item.contenido} />
                  </div>
                </div>

                {/* 🖼️ CUADRÍCULA DE IMÁGENES AL PIE (AQUÍ VA EL HOVER ENUMERADO) */}
                {getImagesArray(item).length > 0 && (
                  <div className="w-full mb-2 flex-shrink-0">
                    <p className="text-xs text-sky-300 mb-2 font-semibold uppercase tracking-widest">Imágenes Adjuntas</p>
                    <div className="grid grid-cols-4 gap-4">
                      {getImagesArray(item).slice(0, 4).map((imgUrl, index) => (
                        <div 
                          key={index} 
                          onClick={() => setSelectedImage(imgUrl)}
                          
                          className="group relative aspect-[16/10] bg-black/40 rounded-lg overflow-hidden border border-white/10 shadow-md cursor-pointer hover:scale-[1.02] hover:border-sky-400 transition-all duration-300"
                        >
                          {/* ✨ NUEVO: Indicador flotante con el número de la imagen */}
                          <div className="absolute top-2 left-2 bg-cyan-400 text-slate-950 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg select-none">
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
      {searched && (
        <div className="z-20 relative flex-shrink-0 bg-slate-950/30 backdrop-blur-2xl">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-4xl font-light hover:text-sky-400 transition"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <div 
            className="max-w-[85vw] max-h-[85vh] flex items-center justify-center p-2 bg-white/5 border border-white/10 shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="Visualización ampliada" 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}