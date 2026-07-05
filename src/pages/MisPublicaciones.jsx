import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Loader2, Eraser, Edit3, Trash2, Search, User, BookOpen, ChevronLeft, Save, UploadCloud } from "lucide-react";
import { getMaterials, deleteMaterial } from "../services/api";

export default function MisPublicaciones() {
  const [docente, setDocente] = useState("");
  const [resultados, setResultados] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para el Modo Edición Integrado
  const [editandoItem, setEditandoItem] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editContenido, setEditContenido] = useState("");
  const [editDocente, setEditDocente] = useState("");
  const [editPortada, setEditPortada] = useState(null);
  const [editPreviewPortada, setEditPreviewPortada] = useState("");

  // Cargar base inicial de materiales
  const cargarMateriales = async () => {
    try {
      const data = await getMaterials();
      setTodos(data);
      return data;
    } catch (error) {
      console.error("Error al cargar materiales:", error);
    }
  };

  useEffect(() => {
    cargarMateriales();
  }, []);

  // Filtrar sugerencias únicas de docentes para evitar repeticiones en la lista
  const docentesUnicos = Array.from(new Set(todos.map((m) => m.docente).filter(Boolean)));
  
  const sugerencias = docente.trim()
    ? docentesUnicos.filter((d) => d.toLowerCase().includes(docente.toLowerCase()) && d.toLowerCase() !== docente.toLowerCase())
    : [];

  const ejecutarBusqueda = (nombre) => {
    const busqueda = nombre || docente;
    if (!busqueda.trim()) return;

    setDocente(busqueda);
    const filtrados = todos.filter(
      (m) => m.docente?.toLowerCase() === busqueda.toLowerCase()
    );
    setResultados(filtrados);

    if (filtrados.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin resultados",
        text: `No se encontraron materiales cargados por el docente "${busqueda}".`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      ejecutarBusqueda();
    }
  };

  // Eliminar elemento de MongoDB y Cloudinary
  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar este material?",
      text: "Esta acción borrará el registro de la base de datos y sus archivos de Cloudinary de forma permanente.",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, borrar permanentemente",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`https://micontenidodidactico.onrender.com/api/materials/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": "admin123"
        }
      });

      if (!res.ok) throw new Error("No se pudo eliminar el material");

      Swal.fire({
        icon: "success",
        title: "Eliminado con éxito",
        text: "El contenido ha sido removido del servidor.",
        timer: 2000,
        showConfirmButton: false
      });

      const dataActualizada = await cargarMateriales();
      setResultados(dataActualizada.filter(m => m.docente?.toLowerCase() === docente.toLowerCase()));
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el archivo del servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Activar Vista de Edición cargando los datos en los estados
  const iniciarEdicion = (item) => {
    setEditandoItem(item);
    setEditTitulo(item.titulo);
    setEditContenido(item.contenido || "");
    setEditDocente(item.docente);
    setEditPreviewPortada(item.portada || "");
    setEditPortada(null);
  };

  const handleCambioPortadaEdicion = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditPortada(file);
    setEditPreviewPortada(URL.createObjectURL(file));
  };

  // Enviar Cambios de Actualización (PUT)
  const guardarCambios = async () => {
    if (!editTitulo || !editContenido || !editDocente) {
      Swal.fire("Atención", "Todos los campos de texto son requeridos.", "warning");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("titulo", editTitulo);
      formData.append("contenido", editContenido);
      formData.append("docente", editDocente);
      
      if (editPortada) {
        formData.append("portada", editPortada);
      }

      const res = await fetch(`https://micontenidodidactico.onrender.com/api/materials/${editandoItem._id}`, {
        method: "PUT",
        headers: {
          "x-admin-password": "admin123"
        },
        body: formData
      });

      if (!res.ok) throw new Error("Error en la solicitud de actualización");

      Swal.fire({
        icon: "success",
        title: "¡Material Actualizado!",
        text: "Los cambios se guardaron y sincronizarices con éxito.",
        timer: 2000,
        showConfirmButton: false
      });

      setEditandoItem(null); // Volver al listado principal
      const dataActualizada = await cargarMateriales();
      setResultados(dataActualizada.filter(m => m.docente?.toLowerCase() === docente.toLowerCase()));
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron actualizar los datos en el servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100">
      
      {/* MODO FORMULARIO COMPLETO DE EDICIÓN INTEGRADO */}
      {editandoItem ? (
        <div className="bg-slate-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button 
              onClick={() => setEditandoItem(null)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Volver a mis publicaciones
            </button>
            <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-mono">Modo Editor</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Título del Material</label>
                <input 
                  value={editTitulo} 
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Contenido/Lectura Completa</label>
                <textarea 
                  value={editContenido} 
                  onChange={(e) => setEditContenido(e.target.value)}
                  className="w-full h-72 p-4 bg-slate-950/80 border border-white/10 rounded-lg text-white resize-none leading-relaxed focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Docente Responsable</label>
                <input 
                  value={editDocente} 
                  onChange={(e) => setEditDocente(e.target.value)}
                  className="w-full p-3 bg-slate-950/80 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-2">Imagen de Portada (Fondo)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 hover:border-cyan-400/40 bg-slate-950/40 rounded-lg cursor-pointer transition group mb-3">
                  <div className="flex flex-col items-center justify-center pt-1">
                    <UploadCloud className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1" />
                    <p className="text-xs text-slate-400">Reemplazar foto de portada</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleCambioPortadaEdicion} className="hidden" />
                </label>

                {editPreviewPortada && (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border border-white/10 shadow-md">
                    <img src={editPreviewPortada} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button 
              onClick={() => setEditandoItem(null)}
              className="px-5 py-2.5 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition"
            >
              Cancelar
            </button>
            <button 
              onClick={guardarCambios}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/10 hover:opacity-95 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        
        // MODO CONSULTA PRINCIPAL Y REJILLA DE CONTENIDOS
        <div className="space-y-6">
          <div className="flex flex-col gap-1 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold tracking-wide flex items-center gap-2"><User className="w-5 h-5 text-cyan-400" /> Control de Publicaciones</h2>
            <p className="text-xs text-slate-400">Busca por docente para corregir lecturas o depurar el almacenamiento multimedia</p>
          </div>

          {/* 🔎 BUSCADOR DINÁMICO */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              placeholder="Escribe el nombre del docente y presiona Enter..."
              value={docente}
              onKeyDown={handleKeyDown}
              onChange={(e) => setDocente(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-slate-950/40 text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:bg-slate-950/60 transition"
            />

            {/* SUGERENCIAS UNIFICADAS */}
            {sugerencias.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-slate-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                {sugerencias.map((itemDocente, i) => (
                  <div
                    key={i}
                    onClick={() => ejecutarBusqueda(itemDocente)}
                    className="px-4 py-3 text-sm text-slate-300 hover:bg-cyan-500 hover:text-slate-950 cursor-pointer transition font-medium flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 opacity-60" /> {itemDocente}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 📦 RESULTADOS ESTILO TARJETAS CINEMÁTICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {resultados.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-white/20 transition shadow-xl"
              >
                {/* CONTENEDOR MINIATURA CON TÍTULO SUPERPUESTO */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  {item.portada ? (
                    <img 
                      src={item.portada} 
                      alt={item.titulo} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900"><BookOpen className="w-8 h-8" /></div>
                  )}
                  {/* Degradado para legibilidad del título */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  
                  {/* Título sobre la portada */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white tracking-wide leading-snug drop-shadow-md">
                      {item.titulo}
                    </h3>
                  </div>
                </div>

                {/* CUERPO INFERIOR DE LA TARJETA */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-slate-950/20">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {item.contenido || "Sin contenido descriptivo."}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-3">
                    <span>Docente: <strong className="text-cyan-400/80">{item.docente}</strong></span>
                    <span>Anexos: <strong>{item.imagenes?.length || 0} fotos</strong></span>
                  </div>

                  {/* ⚙ ACCIONES */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => iniciarEdicion(item)}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-slate-200 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => eliminar(item._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {resultados.length === 0 && docente && (
            <div className="text-center py-12 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
              <p className="text-sm text-slate-500">Presiona Enter para buscar las publicaciones del docente escrito.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}