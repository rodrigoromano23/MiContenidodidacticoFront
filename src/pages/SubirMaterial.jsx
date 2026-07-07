import { useState } from "react";
import Swal from "sweetalert2";
import { Loader2, Eraser, UploadCloud, BookOpen, User, Image as ImageIcon, Layers } from "lucide-react";

export default function SubirMaterial() {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [docente, setDocente] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [previewImagenes, setPreviewImagenes] = useState([]); // 🖼️ Estado para previsualizar las fotos múltiples

  const [portada, setPortada] = useState(null);
  const [previewPortada, setPreviewPortada] = useState("");

  const [fontTitulo, setFontTitulo] = useState("arial");
  const [fontContenido, setFontContenido] = useState("arial");
  const [loading, setLoading] = useState(false); // Estética de carga para el botón animado

  // Manejo de la Portada Única
  const handlePortada = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPortada(file);
    setPreviewPortada(URL.createObjectURL(file));
  };

  // Manejo de Múltiples Imágenes Adjuntas
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);

    // Generar previews para todas las imágenes seleccionadas
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImagenes(previews);
  };

  // Limpieza absoluta de estados y revocación de URLs de memoria
  const limpiar = () => {
    // Revocar referencias de memoria
    if (previewPortada) URL.revokeObjectURL(previewPortada);
    previewImagenes.forEach((url) => URL.revokeObjectURL(url));

    setTitulo("");
    setContenido("");
    setDocente("");
    setImagenes([]);
    setPreviewImagenes([]);
    setPortada(null);
    setPreviewPortada("");
    setFontTitulo("arial");
    setFontContenido("arial");
    setLoading(false);
  };

  const subir = async () => {
    if (!titulo || !contenido || !docente) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa el título, contenido y docente antes de continuar.",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("contenido", contenido);
      formData.append("docente", docente);

      if (imagenes.length > 0) {
        imagenes.forEach((file) => {
          formData.append("image", file);
        });
      }

      if (portada) {
        formData.append("portada", portada);
      }

      // 🔥 ENVIAMOS LA CONTRASEÑA DIRECTAMENTE EN LA URL
      // Esto previene cualquier problema con Multer o filtros de CORS en Render
      const res = await fetch("https://micontenidodidactico.onrender.com/api/materials?adminPassword=1234", {
        method: "POST",
        body: formData
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.message || "Error al subir material");
      }

      Swal.fire({
        icon: "success",
        title: "¡Publicado con éxito!",
        text: "El material pedagógico ya está disponible.",
        timer: 2500,
        showConfirmButton: false
      });

      limpiar(); // Mantiene todo limpio después del éxito automáticamente
      
    } catch (error) {
      console.error(error);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error al subir material",
        text: error.message
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      
      {/* CABECERA ESTILO EDUCATIVO */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-wide">Creador de Contenido Pedagógico</h2>
          <p className="text-xs text-slate-400">Publica lecciones, lecturas y galerías visuales para tus alumnos</p>
        </div>
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQUIERDA: TEXTOS Y GALERÍA AL PIE */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* BLOQUE TÍTULO */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Título de la Lección / Tema
            </div>
            <div className="flex gap-3">
              <input
                placeholder="Ej. Wolverine: Orígenes del Mutante..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="flex-1 p-3 bg-slate-950/60 text-white placeholder-slate-500 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 transition font-medium"
                style={{ fontFamily: fontTitulo }}
              />
              <select
                value={fontTitulo}
                onChange={(e) => setFontTitulo(e.target.value)}
                className="p-3 bg-slate-950 text-slate-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer text-sm"
              >
                <option value="arial">Arial (Moderno)</option>
                <option value="times new roman">Times (Académico)</option>
                <option value="calibri">Calibri (Limpio)</option>
              </select>
            </div>
          </div>

          {/* BLOQUE CONTENIDO LITERARIO */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Cuerpo de la Lectura / Desarrollo
            </div>
            <textarea
              placeholder="Escribe o pega aquí el desarrollo del material didáctico..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className="w-full h-64 p-4 bg-slate-950/60 text-white placeholder-slate-500 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
              style={{ fontFamily: fontContenido }}
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-slate-500">Formato enriquecido estándar de lectura</span>
              <select
                value={fontContenido}
                onChange={(e) => setFontContenido(e.target.value)}
                className="p-2 bg-slate-950 text-slate-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer text-sm"
              >
                <option value="arial">Arial</option>
                <option value="times new roman">Times New Roman</option>
                <option value="calibri">Calibri</option>
              </select>
            </div>
          </div>

          {/* 🖼️ INTERACTIVO: PREVISUALIZACIÓN DE FOTOS COMPLEMENTARIAS AL PIE DEL TEXTO */}
          {previewImagenes.length > 0 && (
            <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Imágenes de Apoyo en la Lectura ({previewImagenes.length})
              </div>
              <p className="text-[11px] text-slate-400 -mt-1">Así es cómo se ordenará la cuadrícula visual debajo de tu texto:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                {previewImagenes.map((src, idx) => (
                  <div key={idx} className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/10 bg-slate-950 shadow-inner group">
                    <img src={src} alt={`Adjunto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: CONFIGURACIÓN, DOCENTE Y PORTADA */}
        <div className="space-y-5">
          
          {/* BLOQUE METADATOS: DOCENTE */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <User className="w-4 h-4" /> Profesor Responsable
            </div>
            <input
              placeholder="Nombre del Docente..."
              value={docente}
              onChange={(e) => setDocente(e.target.value)}
              className="w-full p-3 bg-slate-950/60 text-white placeholder-slate-500 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* BLOQUE CARGA IMAGEN DE PORTADA */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" /> Portada Cinemática (Fondo)
            </div>
            
            {/* INPUT DE PORTADA ESTILIZADO */}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 hover:border-cyan-500/50 bg-slate-950/40 rounded-lg cursor-pointer transition group">
              <div className="flex flex-col items-center justify-center pt-2">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition mb-1" />
                <p className="text-xs text-slate-400 group-hover:text-slate-200 transition">Haz clic para buscar portada</p>
              </div>
              <input type="file" accept="image/*" onChange={handlePortada} className="hidden" />
            </label>

            {/* VISTA PREVIA PORTADA */}
            {previewPortada && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Miniatura de portada:</p>
                <div className="relative h-40 w-full rounded-lg overflow-hidden border border-white/10 shadow-lg">
                  <img src={previewPortada} alt="Vista previa portada" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <span className="absolute bottom-2 left-2 text-[10px] bg-cyan-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">Fondo de Pantalla</span>
                </div>
              </div>
            )}
          </div>

          {/* BLOQUE CARGA IMÁGENES SECUNDARIAS */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" /> Fotos Adicionales (Hasta 20)
            </div>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 hover:border-emerald-500/50 bg-slate-950/40 rounded-lg cursor-pointer transition group">
              <div className="flex flex-col items-center justify-center pt-2">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition mb-1" />
                <p className="text-xs text-slate-400 group-hover:text-slate-200 transition">Seleccionar múltiples imágenes</p>
              </div>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
          </div>

        </div>
      </div>

      {/* SECCIÓN INFERIOR: ACCIONES / BOTONES FLOTANTES */}
      <div className="flex justify-center gap-6 mt-8 pt-4 border-t border-white/5">
        
        {/* BOTÓN SUBIR / PUBLICAR */}
        <button
          onClick={subir}
          disabled={loading}
          className={`w-14 h-14 rounded-full border border-cyan-500/40 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/20 transition duration-300 transform hover:scale-110 disabled:opacity-50 disabled:scale-100`}
          title="Publicar Material"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </button>

        {/* BOTÓN LIMPIAR TODO */}
        <button
          onClick={limpiar}
          disabled={loading}
          className="w-14 h-14 rounded-full border border-red-500/30 bg-slate-900/80 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-400 shadow-xl transition duration-300 transform hover:scale-110 disabled:opacity-50 disabled:scale-100"
          title="Borrar Todo"
        >
          <Eraser className="w-6 h-6" />
        </button>

      </div>

    </div>
  );
}