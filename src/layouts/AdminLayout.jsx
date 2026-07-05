import { useNavigate } from "react-router-dom";

export default function AdminLayout({
  children,
  view,
  setView,
}) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin");
    navigate("/admin");
    window.location.reload(); // vuelve a mostrar el login
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-slate-900 border-b border-white/10 px-8 py-4 flex justify-between items-center z-50">

        <h1 className="text-2xl font-bold">
          Carga de Contenido
        </h1>

        <div className="flex gap-4">

          <button
            onClick={() => setView("cargar")}
            className={`px-6 py-3 rounded-lg border transition ${
              view === "cargar"
                ? "bg-white/20 border-white"
                : "border-white hover:bg-white/10"
            }`}
          >
            Cargar material
          </button>

          <button
            onClick={() => setView("ver")}
            className={`px-6 py-3 rounded-lg border transition ${
              view === "ver"
                ? "bg-white/20 border-white"
                : "border-white hover:bg-white/10"
            }`}
          >
            Mis publicaciones
          </button>

          <button
            onClick={logout}
            className="px-6 py-3 rounded-lg border border-red-500 text-red-400 hover:bg-red-500/20 transition"
          >
            Salir
          </button>

        </div>

      </header>

      {/* CONTENIDO */}
      <main className="pt-28 px-8 pb-8">
        {children}
      </main>

    </div>
  );
}