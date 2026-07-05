import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import SubirMaterial from "./SubirMaterial";
import MisPublicaciones from "./MisPublicaciones";

export default function Admin() {

  const [auth, setAuth] = useState(
    localStorage.getItem("admin") === "true"
  );

  const [password, setPassword] = useState("");
  const [view, setView] = useState("cargar");

  const login = () => {
    if (password === "1234") {
      localStorage.setItem("admin", "true");
      setAuth(true);
    } else {
      alert("Clave incorrecta");
      setPassword("");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin");
    setAuth(false);
  };

  // ==========================================
  // LOGIN
  // ==========================================

  if (!auth) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center">

        {/* FONDO */}

        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute top-16 left-16 w-40 h-40 border border-cyan-500/20 rotate-45 animate-pulse"></div>

          <div className="absolute top-40 right-24 w-28 h-28 border border-red-500/20 rotate-12 animate-pulse"></div>

          <div
            className="absolute bottom-24 left-1/3 w-52 h-52 border border-white/10 rotate-45 animate-spin"
            style={{ animationDuration: "25s" }}
          ></div>

          <div
            className="absolute bottom-20 right-20 w-32 h-32 border border-blue-500/20 rotate-12 animate-spin"
            style={{ animationDuration: "18s" }}
          ></div>

          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black"></div>

        </div>

        {/* TARJETA */}

        <div className="relative z-10">

          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5">

            <div className="flex overflow-hidden rounded-xl border border-white/20">

              <input
                type="password"
                placeholder="Ingrese la clave..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
                className="w-80 bg-transparent px-5 py-4 text-white placeholder-gray-400 outline-none"
              />

              <button
                onClick={login}
                className="bg-red-600 hover:bg-red-700 transition px-6 flex items-center justify-center text-white text-2xl"
              >
                ➜
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PANEL ADMIN
  // ==========================================

  return (
    <AdminLayout
      view={view}
      setView={setView}
      logout={logout}
    >

      {view === "cargar" && <SubirMaterial />}

      {view === "ver" && <MisPublicaciones />}

    </AdminLayout>
  );
}