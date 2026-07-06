/*import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  BookOpen, 
  BarChart3, 
  ArrowRight, 
  Lock,
  Search,
  CheckCircle2
} from "lucide-react";
import { getMaterials } from "../services/api";
import Loader from "../components/Loader";

export default function SuperAdmin() {
  const [clave, setClave] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState([]);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  const CLAVE_SUPERADMIN = import.meta.env.VITE_CLAVE_SUPERADMIN ||  "9999";

  // LOGIN CON ALERTAS ELEGANTES
  const handleLogin = () => {
    if (clave === CLAVE_SUPERADMIN) {
      setIsAuth(true);
      Swal.fire({
        icon: "success",
        title: "Acceso Concedido",
        text: "Bienvenido al Panel de Control Global",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Clave Incorrecta",
        text: "Verifica las credenciales de seguridad de SuperAdmin.",
        confirmButtonColor: "#ef4444"
      });
    }
  };

  const handleKeyDownLogin = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // PROCESAR Y AGRUPAR MÉTRICAS AVANZADAS
  const fetchData = async () => {
    setLoading(true);
    try {
      const materials = await getMaterials();
      setTotalPublicaciones(materials.length);

      const grouped = materials.reduce((acc, item) => {
        const docente = item.docente || "Sin docente";
        acc[docente] = (acc[docente] || 0) + 1;
        return acc;
      }, {});

      const result = Object.entries(grouped).map(
        ([docente, cantidad]) => ({
          docente,
          cantidad,
        })
      ).sort((a, b) => b.cantidad - a.cantidad); // Ordenar de mayor a menor cantidad de publicaciones

      setData(result);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron compilar las estadísticas globales.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);

  const logout = () => {
    setIsAuth(false);
    setClave("");
    setData([]);
    setTotalPublicaciones(0);
  };

  // Filtrar docentes en la tabla según la búsqueda
  const datosFiltrados = data.filter(item => 
    item.docente.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Valor máximo para calcular el porcentaje de la barra de progreso de cada docente
  const maxPublicaciones = data.length > 0 ? data[0].cantidad : 1;

  // 🔐 FORMULARIO DE ACCESO PREMIUM (LOGIN)
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        {/* Fondo animado sutil */
        /*<div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,#06b6d4_0px,transparent_40%),radial-gradient(circle_at_70%_60%,#3b82f6_0px,transparent_50%)]" />
        </div>

        <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[380px] text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>

          <div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Acceso Consola</h1>
            <p className="text-xs text-slate-400 mt-1">Introduce la clave maestra de SuperAdmin</p>
          </div>

          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-cyan-500 transition duration-300">
            <input
              type="password"
              placeholder="••••"
              value={clave}
              onKeyDown={handleKeyDownLogin}
              onChange={(e) => setClave(e.target.value)}
              className="flex-1 p-3.5 bg-transparent text-white text-center font-mono outline-none placeholder-slate-600 tracking-widest"
            />
            <button
              onClick={handleLogin}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-5 flex items-center justify-center transition font-bold"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 📊 PANEL DE CONTROL ANALÍTICO
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER PREMIUM */
      /*<header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-none">Console SuperAdmin</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Auditoría Global</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-slate-950 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition duration-300"
        >
          <LogOut className="w-3.5 h-3.5" /> Salir del Panel
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */
      /*<main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {/* TITULACIÓN DE LA SECCIÓN */
        /*<div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Métricas de Actividad Docente</h2>
          <p className="text-xs text-slate-400">Monitoreo en tiempo real de contenidos y volumen de aportes pedagógicos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            {/* 📈 TARJETAS DE MÉTRICAS GLOBALES (KPIs) */
            /*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Lecciones subidas</p>
                  <div className="text-3xl font-extrabold text-cyan-400 tracking-tight">{totalPublicaciones}</div>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Profesores Activos</p>
                  <div className="text-3xl font-extrabold text-blue-400 tracking-tight">{data.length}</div>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* 🔎 FILTRO INTEGRADO */
            /*<div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Distribución de Contenido
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Filtrar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950/60 border border-white/5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            {/* 📊 TABLA ANALÍTICA PREMIUM CON BARRAS DE PROGRESO */
            /*<div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Docente</th>
                      <th className="px-6 py-4">Volumen / Rendimiento Visual</th>
                      <th className="px-6 py-4 text-right">Publicaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {datosFiltrados.map((item, index) => {
                      // Calcular el porcentaje de participación visual en base al profesor con más contenido
                      const porcentaje = Math.round((item.cantidad / maxPublicaciones) * 100);
                      
                      return (
                        <tr key={index} className="hover:bg-white/[0.02] transition duration-200 group">
                          {/* Columna Nombre */
                          /*<td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-slate-950 border border-white/10 text-slate-400 text-xs font-bold flex items-center justify-center rounded-lg uppercase group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition">
                              {item.docente.substring(0, 2)}
                            </div>
                            <span className="truncate">{item.docente}</span>
                          </td>
                          {/* Columna de Barra de Progreso */
                          /*<td className="px-6 py-4 hidden sm:table-cell w-1/2">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 w-7 font-mono text-right">{porcentaje}%</span>
                            </div>
                          </td>
                          {/* Columna Número de Publicaciones */
                          /*<td className="px-6 py-4 text-right font-mono font-bold text-base text-cyan-400">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.cantidad}
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {datosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 bg-slate-950/20">
                          No se encontraron docentes con ese criterio de búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}*/

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  BookOpen, 
  BarChart3, 
  ArrowRight, 
  Lock,
  Search,
  CheckCircle2
} from "lucide-react";
import Loader from "../components/Loader";

// Traemos la URL base de tu backend (ej: https://tu-backend.onrender.com)
const API_URL = import.meta.env.VITE_API_URL;

export default function SuperAdmin() {
  const [clave, setClave] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState([]);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN SEGURO POR BACKEND
  const handleLogin = async () => {
    if (!clave.trim()) {
      Swal.fire("Atención", "Por favor, introduce la clave maestra.", "warning");
      return;
    }

    setLoading(true);
    try {
      // Reemplaza esta ruta si tu endpoint de login en Express usa otra URL (ej: /api/superadmin/login)
      const respuesta = await fetch(`${API_URL}/api/superadmin/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: clave })
      });

      const datos = await respuesta.json();

      if (respuesta.ok && datos.role === "superadmin") {
        setIsAuth(true);
        Swal.fire({
          icon: "success",
          title: "Acceso Concedido",
          text: "Bienvenido al Panel de Control Global",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Clave Incorrecta", datos.message || "Verifica las credenciales de seguridad.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error de Conexión", "No se pudo conectar con el servidor backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDownLogin = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  // 📊 TRAER ESTADÍSTICAS PROCESADAS DESDE EL BACKEND
  const fetchData = async () => {
    setLoading(true);
    try {
      // Reemplaza esta ruta por la URL exacta que use tu router para activar 'getSuperAdminStats'
      const respuesta = await fetch(`${API_URL}/api/superadmin/stats`);
      const stats = await respuesta.json();

      if (respuesta.ok) {
        // Ordenamos de mayor a menor según el total de publicaciones
        const result = stats.sort((a, b) => b.total - a.total);
        setData(result);

        // Sumamos el total de todas las publicaciones globales
        const total = result.reduce((acc, item) => acc + item.total, 0);
        setTotalPublicaciones(total);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron compilar las estadísticas globales del backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);

  const logout = () => {
    setIsAuth(false);
    setClave("");
    setData([]);
    setTotalPublicaciones(0);
  };

  const datosFiltrados = data.filter(item => 
    item.docente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const maxPublicaciones = data.length > 0 ? data[0].total : 1;

  // 🔐 FORMULARIO DE ACCESO (LOGIN)
  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="relative z-10 bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[380px] text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Acceso Consola</h1>
            <p className="text-xs text-slate-400 mt-1">Introduce la clave maestra de SuperAdmin</p>
          </div>
          <div className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 focus-within:border-cyan-500 transition duration-300">
            <input
              type="password"
              placeholder="••••"
              value={clave}
              onKeyDown={handleKeyDownLogin}
              onChange={(e) => setClave(e.target.value)}
              className="flex-1 p-3.5 bg-transparent text-white text-center font-mono outline-none placeholder-slate-600 tracking-widest"
            />
            <button
              onClick={handleLogin}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 px-5 flex items-center justify-center transition font-bold"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 📊 PANEL DE CONTROL ANALÍTICO
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-none">Console SuperAdmin</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Auditoría Global</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-slate-950 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition duration-300"
        >
          <LogOut className="w-3.5 h-3.5" /> Salir del Panel
        </button>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Métricas de Actividad Docente</h2>
          <p className="text-xs text-slate-400">Monitoreo en tiempo real de contenidos y volumen de aportes pedagógicos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Lecciones subidas</p>
                  <div className="text-3xl font-extrabold text-cyan-400 tracking-tight">{totalPublicaciones}</div>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Profesores Activos</p>
                  <div className="text-3xl font-extrabold text-blue-400 tracking-tight">{data.length}</div>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Distribución de Contenido
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="Filtrar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950/60 border border-white/5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div className="bg-slate-900/20 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Docente</th>
                      <th className="px-6 py-4">Volumen / Rendimiento Visual</th>
                      <th className="px-6 py-4 text-right">Publicaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {datosFiltrados.map((item, index) => {
                      const porcentaje = Math.round((item.total / maxPublicaciones) * 100);
                      
                      return (
                        <tr key={index} className="hover:bg-white/[0.02] transition duration-200 group">
                          <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-slate-950 border border-white/10 text-slate-400 text-xs font-bold flex items-center justify-center rounded-lg uppercase group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition">
                              {item.docente.substring(0, 2)}
                            </div>
                            <span className="truncate">{item.docente}</span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell w-1/2">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 w-7 font-mono text-right">{porcentaje}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-base text-cyan-400">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.total}
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {datosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-slate-500 bg-slate-950/20">
                          No se encontraron docentes con ese criterio de búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}